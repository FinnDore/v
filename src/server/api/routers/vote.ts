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
                    include: {
                        VoteChoice: true,
                    },
                }) ?? null
            );
        }),

    createVote: publicProcedure.mutation(async ({}) => {
        const vote = await prisma.vote.create({
            data: {},
        });
        return vote;
    }),

    vote: publicProcedure
        .input(
            z.object({
                choice: z.string().max(20),
                userName: z.string().max(20),
                voteId: z.string().cuid(),
            })
        )
        .mutation(async ({ input }) => {
            const vote = await prisma.voteChoice.create({
                data: {
                    choice: input.choice,
                    userName: input.userName,
                    voteId: input.voteId,
                },
            });
            return vote;
        }),
});
