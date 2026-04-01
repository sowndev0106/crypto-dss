import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SignalEntity } from './signals.entity';

@WebSocketGateway({ cors: { origin: '*' } })
export class SignalsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(SignalsGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    emitSignalChanged(signal: SignalEntity) {
        this.server.emit('signal-changed', signal);
    }

    @SubscribeMessage('subscribe')
    handleSubscribe(@MessageBody() data: { symbol: string; timeframe: string }) {
        this.logger.log(`Client subscribed to ${data.symbol} ${data.timeframe}`);
    }
}
