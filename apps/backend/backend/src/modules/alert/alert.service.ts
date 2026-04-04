import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AlertCondition, CreateAlertDto, PriceAlert } from './alert.types';

const MAX_ALERTS = 10;

@Injectable()
export class AlertService {
    private readonly logger = new Logger(AlertService.name);
    private readonly alerts = new Map<string, PriceAlert>();

    // Injected lazily to avoid circular dependency
    private gatewayEmitter?: (event: string, data: unknown) => void;

    setGatewayEmitter(emitter: (event: string, data: unknown) => void) {
        this.gatewayEmitter = emitter;
    }

    createAlert(dto: CreateAlertDto): PriceAlert {
        if (this.alerts.size >= MAX_ALERTS) {
            throw new BadRequestException('Đã đạt giới hạn 10 alerts');
        }
        const alert: PriceAlert = {
            id: randomUUID(),
            symbol: dto.symbol,
            targetPrice: dto.targetPrice,
            condition: dto.condition,
            createdAt: new Date(),
            triggered: false,
        };
        this.alerts.set(alert.id, alert);
        this.logger.log(`Alert created: ${alert.id} — ${alert.symbol} ${alert.condition} ${alert.targetPrice}`);
        return alert;
    }

    deleteAlert(id: string): void {
        this.alerts.delete(id);
    }

    getAlerts(): PriceAlert[] {
        return Array.from(this.alerts.values()).filter(a => !a.triggered);
    }

    checkAlerts(currentPrice: number): void {
        for (const [id, alert] of this.alerts.entries()) {
            if (alert.triggered) continue;

            const triggered =
                (alert.condition === 'ABOVE' && currentPrice > alert.targetPrice) ||
                (alert.condition === 'BELOW' && currentPrice < alert.targetPrice);

            if (triggered) {
                alert.triggered = true;
                this.logger.log(`Alert triggered: ${id} — price ${currentPrice} ${alert.condition} ${alert.targetPrice}`);
                this.gatewayEmitter?.('price-alert-triggered', {
                    ...alert,
                    currentPrice,
                });
                this.alerts.delete(id);
            }
        }
    }
}
