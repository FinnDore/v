import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { AnonHelper, anonUserSchema } from '@/utils/anon-users';
import { RateLimitPrefix } from '@/utils/rate-limit';
import { to } from '@/utils/to';
import { ChannelEvents } from '@/server/channel-events';
import { prisma } from '@/server/db';
import { dispatchPokerStateUpdateEvent, selectPokerVote } from '@/server/hop';
import {
    createTRPCRouter,
    publicProcedure,
    rateLimitedAnonOrUserProcedure,
} from '../trpc';

export const pokerStateRouter = createTRPCRouter({
    toggleResults: rateLimitedAnonOrUserProcedure(
        RateLimitPrefix.progressVoteOrToggleResults
    )
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

    progressVote: rateLimitedAnonOrUserProcedure(
        RateLimitPrefix.progressVoteOrToggleResults
    )
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
                anonUser: anonUserSchema,
            })
        )
        .query(async ({ input, ctx }) => {
            const [votes, error] = await to(
                prisma.poker.findFirst({
                    select: {
                        title: true,
                        private: true,
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
                        userInVote: {
                            select: {
                                id: true,
                                whiteListed: true,
                                anonUserId: true,
                                userId: true,
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

            if (votes.private) {
                if (!ctx.session && !input.anonUser) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                    });
                }

                let userId = ctx.session?.user.id;
                if (input.anonUser && !userId) {
                    const [anonUser, anonUserError] =
                        await AnonHelper.getAnonUserByIdAndSecret({
                            userId: input.anonUser.id,
                            secret: input.anonUser.secret,
                        });

                    if (anonUserError) {
                        console.log(
                            `Couldn't get anon user when : ${anonUserError.message}`
                        );
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                        });
                    }

                    userId = anonUser?.id;
                }

                if (!userId) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                    });
                }

                const userInVote = votes.userInVote.find(
                    x =>
                        (userId === x.anonUserId || userId === x.userId) &&
                        x.whiteListed
                );

                const isOwner =
                    votes.createdByUser?.id === userId ||
                    votes.createdByAnonUser?.id === userId;

                console.log(votes.private, !userInVote, !isOwner);
                if (votes.private && !userInVote && !isOwner) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                    });
                }
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
