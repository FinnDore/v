import { Hop, type APIAuthentication } from '@onehop/js';

import { env } from '@/env.mjs';

export const hop = new Hop(env.HOP_TOKEN as APIAuthentication);

export type Vote = {
    id: string;
    choice: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    voteId: string;
    anonUser: { name: string; id: string } | null;
    user: { name: string | null; id: string } | null;
};

export const selectPokerVote = {
    id: true,
    choice: true,
    anonUser: {
        select: {
            id: true,
            name: true,
        },
    },
    user: {
        select: {
            id: true,
            name: true,
        },
    },
    createdAt: true,
    updatedAt: true,
    voteId: true,
};
