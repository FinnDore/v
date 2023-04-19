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
                voteId: z.string().cuid(),
                showResults: z.boolean(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const [votes, error] = await to(
                prisma.poker.update({
                    where: {
                        id_createdByUserId: ctx.session
                            ? {
                                  createdByUserId: ctx.session.user.id,
                                  id: input.pokerId,
                              }
                            : undefined,
                        id_createdByAnonUserId: ctx.anonSession
                            ? {
                                  createdByAnonUserId: ctx.anonSession.id,
                                  id: input.pokerId,
                              }
                            : undefined,
                    },
                    data: {
                        pokerVote: {
                            update: {
                                where: {
                                    id: input.voteId,
                                },
                                data: {
                                    showResults: input.showResults,
                                },
                            },
                        },
                    },
                })
            );

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
                data: { voteId: input.voteId, showResults: input.showResults },
            });
        }),

    toggleProgressVote: anonOrUserProcedure
        .input(
            z.object({
                pokerId: z.string().cuid(),
                progressTo: z.string().cuid(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const [votes, error] = await to(
                prisma.poker.update({
                    where: {
                        id_createdByUserId: ctx.session
                            ? {
                                  createdByUserId: ctx.session.user.id,
                                  id: input.pokerId,
                              }
                            : undefined,
                        id_createdByAnonUserId: ctx.anonSession
                            ? {
                                  createdByAnonUserId: ctx.anonSession.id,
                                  id: input.pokerId,
                              }
                            : undefined,
                    },
                    data: {
                        pokerVote: {
                            updateMany: {
                                where: {
                                    active: true,
                                },
                                data: {
                                    active: false,
                                },
                            },
                            update: {
                                where: {
                                    id: input.progressTo,
                                },
                                data: {
                                    active: true,
                                },
                            },
                        },
                    },
                })
            );

            if (error) {
                console.error("Couldn't get votes: " + error.message);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            } else if (!votes) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                });
            }

            await dispatchPokerStateUpdateEvent({
                pokerId: input.pokerId,
                event: ChannelEvents.CHANGE_VOTE,
                data: { currentVote: input.progressTo },
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
                        title: true,
                        createdByAnonUser: {
                            select: {
                                id: true,
                                name: true,
                                pfpHash: true,
                            },
                        },
                        createdByUser: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                        pokerVote: {
                            select: {
                                id: true,
                                active: true,
                                showResults: true,
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
