import { z } from 'zod';

export const voteOptions = [1, 2, 3, 5, 8, 13, 21, '??'] as const;
export const voteOptionSchema = z
    .literal(1)
    .or(z.literal(2))
    .or(z.literal(3))
    .or(z.literal(5))
    .or(z.literal(8))
    .or(z.literal(13))
    .or(z.literal(21))
    .or(z.literal('??'));

export const LANDING_CHANNEL_ID = 'LANDING_CHANNEL';
