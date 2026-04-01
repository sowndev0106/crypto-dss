import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('ohlcv')
@Unique(['symbol', 'timeframe', 'openTime'])
export class OhlcvEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 20 })
    symbol: string;

    @Column({ length: 5 })
    timeframe: string;

    @Column({ type: 'bigint' })
    openTime: number;

    @Column({ type: 'decimal', precision: 18, scale: 8 })
    open: number;

    @Column({ type: 'decimal', precision: 18, scale: 8 })
    high: number;

    @Column({ type: 'decimal', precision: 18, scale: 8 })
    low: number;

    @Column({ type: 'decimal', precision: 18, scale: 8 })
    close: number;

    @Column({ type: 'decimal', precision: 18, scale: 8 })
    volume: number;

    @Column({ type: 'bigint' })
    closeTime: number;

    @CreateDateColumn()
    createdAt: Date;
}
