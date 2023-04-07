import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { to } from '@/utils/to';
import { prisma } from '@/server/db';
import { selectPokerVote } from '@/server/hop';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const pokerStateRouter = createTRPCRouter({
    getPokerState: publicProcedure
        .input(
            z.object({
                pokerId: z.string().cuid(),
            })
        )
        .query(async ({ input }) => {
            const [votes, error] = await to(
                prisma.poker.findFirst({
                    select: {
                        pokerVote: {
                            select: {
                                id: true,
                                active: true,
                                title: true,
                                voteChoice: {
                                    select: selectPokerVote,
                                },
                            },
                        },
                    },
                    where: {
                        id: input.pokerId,
                    },
                })
            );

            if (error) {
                console.error("Couldn't get votes: " + error.message);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
            if (!votes?.pokerVote) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                });
            }

            const returnVotes = votes.pokerVote.map(x => ({
                ...x,
                voteChoice: x.voteChoice.sort(
                    (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()
                ),
            }));

            return {
                ...votes,
                pokerVote: returnVotes,
            };
        }),
});
