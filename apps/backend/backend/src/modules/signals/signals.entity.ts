import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { AllIndicators, SignalType } from 'shared-types';

@Entity('signals')
@Index(['symbol', 'timeframe', 'createdAt'])
export class SignalEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 20 })
    symbol: string;

    @Column({ length: 5 })
    timeframe: string;

    @Column({ type: 'varchar', length: 4 })
    signal: SignalType;

    @Column({ type: 'decimal', precision: 3, scale: 2 })
    confidence: number;

    @Column({ type: 'varchar', length: 4, nullable: true })
    ruleSignal: SignalType | null;

    @Column({ type: 'varchar', length: 4, nullable: true })
    deepseekSignal: SignalType | null;

    @Column({ type: 'text', nullable: true })
    deepseekReasoning: string | null;

    @Column({ type: 'jsonb' })
    indicators: AllIndicators;

    @CreateDateColumn()
    createdAt: Date;
}
