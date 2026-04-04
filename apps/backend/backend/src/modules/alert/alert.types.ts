export type AlertCondition = 'ABOVE' | 'BELOW';

export interface PriceAlert {
    id: string;
    symbol: string;
    targetPrice: number;
    condition: AlertCondition;
    createdAt: Date;
    triggered: boolean;
}

export interface CreateAlertDto {
    symbol: string;
    targetPrice: number;
    condition: AlertCondition;
}
