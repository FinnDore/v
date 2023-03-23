import { z } from 'zod';

import { publicProcedure, t } from '@/server/api/trpc';
import { prisma } from '../../db';

export const vote = t.router({
    getVotes: publicProcedure.query(() => {
        return prisma.vote.findMany({
            include: {
                VoteChoice: true,
            },
        });
    }),

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
                    // userName: input.userName,
                    voteId: input.voteId,
                },
            });
            return vote;
        }),
});
