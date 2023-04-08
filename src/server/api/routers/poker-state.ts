import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { to } from '@/utils/to';
import { ChannelEvents } from '@/server/channel-events';
import { prisma } from '@/server/db';
import { dispatchPokerStateUpdateEvent, selectPokerVote } from '@/server/hop';
import {
    anonOrUserProcedure,
    createTRPCRouter,
    publicProcedure,
} from '../trpc';

export const pokerStateRouter = createTRPCRouter({
    toggleResults: anonOrUserProcedure
        .input(
            z.object({
                pokerId: z.string().cuid(),
                showResults: z.boolean(),
            })
        )
        .mutation(async ({ input }) => {
            const [votes, error] = await to(
                prisma.poker.update({
                    where: {
                        id: input.pokerId,
                    },
                    data: {
                        showResults: input.showResults,
                    },
                })
            );
            console.log('votes', votes);

            if (error) {
                console.error("Couldn't get votes: " + error.message);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
            if (!votes) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                });
            }

            await dispatchPokerStateUpdateEvent({
                pokerId: input.pokerId,
                event: ChannelEvents.TOGGLE_RESULTS,
                data: { showResults: input.showResults },
            });
        }),

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
                        showResults: true,
                        pokerVote: {
                            select: {
                                id: true,
                                active: true,
                                title: true,
                                description: true,
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
