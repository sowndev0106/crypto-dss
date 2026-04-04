import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AllIndicators, SignalType } from 'shared-types';
import { buildPrompt } from './prompt-builder';
import { MarketContext } from '../market/market.types';

@Injectable()
export class DeepSeekService {
    private readonly logger = new Logger(DeepSeekService.name);
    private readonly client: OpenAI;

    constructor(private readonly configService: ConfigService) {
        this.client = new OpenAI({
            apiKey: this.configService.get<string>('DEEPSEEK_API_KEY') ?? '',
            baseURL: 'https://api.deepseek.com',
        });
    }

    async analyze(
        data: Map<string, AllIndicators>,
        marketContext?: MarketContext,
    ): Promise<{ signal: SignalType; confidence: number; reasoning: string }> {
        try {
            const prompt = buildPrompt(data, marketContext);

            const response = await this.client.chat.completions.create({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
            });

            const raw = response.choices[0]?.message?.content ?? '';
            const content = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
            const parsed = JSON.parse(content) as {
                signal: string;
                confidence: number;
                reasoning: string;
            };

            const signal =
                parsed.signal === 'BUY'
                    ? SignalType.BUY
                    : parsed.signal === 'SELL'
                        ? SignalType.SELL
                        : SignalType.HOLD;

            return {
                signal,
                confidence: Math.min(Math.max(parsed.confidence ?? 0, 0), 1),
                reasoning: parsed.reasoning ?? '',
            };
        } catch (error) {
            this.logger.error('DeepSeek API error', error);
            return { signal: SignalType.HOLD, confidence: 0, reasoning: '' };
        }
    }
}
