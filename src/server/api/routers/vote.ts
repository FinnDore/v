import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { prisma } from '../../db';

export const vote = createTRPCRouter({
    getVote: publicProcedure
        .input(z.object({ voteId: z.string() }))
        .query(({ input }) => {
            return (
                prisma.vote.findUnique({
                    where: {
                        id: input.voteId,
                    },
                }) ?? null
            );
        }),

    createVote: publicProcedure.mutation(async () => {
        const vote = await prisma.vote.create({
            data: {},
        });
        return vote;
    }),
});
