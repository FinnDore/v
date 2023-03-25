import { env } from '@/env.mjs';
import { Hop, type APIAuthentication } from '@onehop/js';
import { type PokerVote } from '@prisma/client';

export const hop = new Hop(env.HOP_TOKEN as APIAuthentication);

export type PokerChannelState = {
    votes: Array<
        PokerVote & {
            anonUser: { name: string; id: string };
            user: { name: string; id: string };
        }
    >;
};
