import { ChannelType } from '@onehop/js';
import { TRPCError } from '@trpc/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

import { to } from '@/utils/to';
import { env } from '@/env.mjs';
import {
    anonOrUserProcedure,
    createTRPCRouter,
    publicProcedure,
} from '@/server/api/trpc';
import {
    dispatchVoteUpdateEvent,
    hop,
    selectPokerVote,
    type Vote,
} from '@/server/hop';
import { prisma } from '../../../db';
import { pokerStateRouter } from '../poker-state';
import { lobbyRouter } from './lobby';

const createAnonAccountRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.tokenBucket(20, '1h', 20),
    ephemeralCache: new Map(),
    analytics: true,
});

const createPokerRateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, '1h'),
    ephemeralCache: new Map(),
    analytics: true,
});

export const vote = createTRPCRouter({
    pokerState: pokerStateRouter,
    lobby: lobbyRouter,
    createPoker: anonOrUserProcedure
        .input(
            z.object({
                title: z.string().trim().max(20),
                votes: z
                    .array(
                        z.object({
                            title: z.string().trim().max(20),
                            description: z.string().trim().max(2000),
                        })
                    )
                    .max(15),
            })
        )
        .mutation(async ({ input, ctx }) => {
            if (env.PROD) {
                const userId = ctx.session?.user?.id ?? ctx.anonSession?.id;

                const { success, limit, reset, remaining } =
                    await createPokerRateLimit.limit(
                        `ratelimit_create_poker${userId ?? ctx.ip}}`
                    );

                if (!success) {
                    console.warn(
                        `Rate limited poker creation attempt from ${
                            userId ?? ctx.ip
                        } (limit: ${limit}, reset: ${reset}, remaining: ${remaining}, user: ${
                            ctx.session?.user?.id ??
                            ctx.anonSession?.id ??
                            'No UserId'
                        }) name: ${
                            ctx.session?.user?.name ??
                            ctx.anonSession?.name ??
                            'No Name'
                        } ${
                            !userId
                                ? 'Fell back to IP rate limiting as no userId was given'
                                : ''
                        }`
                    );
                    throw new TRPCError({
                        code: 'TOO_MANY_REQUESTS',
                        message: `You are being rate limited. Try again in ${reset} seconds.`,
                    });
                }
            }

            // Max of 50 sessions per user and 3 sessions per anon user
            const maxPokerSessions = ctx.session ? 50 : 3;
            const [voteCount, voteCountError] = await to(
                prisma.poker.count({
                    where: {
                        createdByUserId: ctx.session?.user?.id ?? null,
                        createdByAnonUserId: ctx.anonSession?.id ?? null,
                    },
                })
            );

            if (voteCountError) {
                console.error(
                    `Could not count votes ${voteCountError.message})`
                );
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            } else if (voteCount >= maxPokerSessions) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `You have reached the maximum number of poker sessions (${maxPokerSessions})`,
                });
            }

            const [vote, createVoteError] = await to(
                prisma.poker.create({
                    data: {
                        title: input.title,
                        createdByUserId: ctx?.session?.user?.id ?? null,
                        createdByAnonUserId: ctx?.anonSession?.id ?? null,
                        pokerVote: {
                            createMany: {
                                data: input.votes.map((vote, i) => ({
                                    title: vote.title,
                                    description: vote.description,
                                    active: i === 0,
                                })),
                            },
                        },
                    },
                })
            );

            if (createVoteError) {
                console.error(
                    `Could not create vote ${createVoteError.message})`
                );
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }

            const [, createChannelError] = await to(
                hop.channels.create(ChannelType.UNPROTECTED, `poker_${vote.id}`)
            );

            if (createChannelError) {
                console.error(
                    `Could not create channel poker_${vote.id} error: ${
                        createChannelError.message ?? 'no error message'
                    } ${
                        createChannelError.stack ?? 'no stack'
                    } \n ${JSON.stringify(createChannelError)}`
                );
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }

            return vote;
        }),

    deletePokerSession: anonOrUserProcedure
        .input(
            z.object({
                pokerId: z.string().cuid(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const [vote, deleteVoteError] = await to(
                prisma.poker.delete({
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
                })
            );

            if (deleteVoteError) {
                console.error(
                    `Could not delete vote ${deleteVoteError.message})`
                );
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }

            const [, deleteChannelError] = await to(
                hop.channels.delete(`poker_${vote.id}`)
            );

            if (deleteChannelError) {
                console.error(
                    `Could not delete channel poker_${vote.id}: ${
                        deleteChannelError.message ?? 'no error message'
                    } ${deleteChannelError.stack ?? 'no stack'}`
                );
                console.log(JSON.stringify(deleteChannelError));
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }

            return vote;
        }),

    createAccount: publicProcedure
        .input(
            z.object({
                name: z.string().trim().max(25).min(1),
                pfpHash: z.string().trim().min(1).max(30),
            })
        )
        .mutation(async ({ input, ctx }) => {
            if (env.PROD) {
                const { success, limit, reset, remaining } =
                    await createAnonAccountRateLimit.limit(
                        `ratelimit_anon_acc_create_${ctx.ip}`
                    );

                if (!success) {
                    console.warn(
                        `Rate limited anon account creation attempt from ${ctx.ip} (limit: ${limit}, reset: ${reset}, remaining: ${remaining}, attempted name: ${input.name})`
                    );
                    throw new TRPCError({
                        code: 'TOO_MANY_REQUESTS',
                        message: `You are being rate limited. Try again in ${reset} seconds.`,
                    });
                }
            }

            const anonUser = await prisma.anonUser.create({
                data: {
                    name: input.name,
                    pfpHash: input.pfpHash,
                },
            });

            return anonUser;
        }),

    vote: anonOrUserProcedure
        .input(
            z.object({
                choice: z.string().max(20),
                pokerVoteId: z.string().cuid(),
            })
        )
        .mutation(async ({ input, ctx }): Promise<Vote> => {
            const [vote, voteError] = await to(
                prisma.pokerVoteChoice.upsert({
                    select: selectPokerVote,
                    where: ctx.anonSession
                        ? {
                              pokerVoteId_anonUserId: {
                                  pokerVoteId: input.pokerVoteId,
                                  anonUserId: ctx.anonSession.id,
                              },
                          }
                        : {
                              pokerVoteId_userId: {
                                  pokerVoteId: input.pokerVoteId,
                                  userId: ctx.session.user.id,
                              },
                          },
                    update: {
                        choice: input.choice,
                    },
                    create: {
                        anonUserId: ctx.anonSession?.id ?? null,
                        userId: ctx.session?.user.id ?? null,
                        choice: input.choice,
                        pokerVoteId: input.pokerVoteId,
                    },
                })
            );

            if (voteError) {
                console.log(
                    `Could not upsert vote ${input.pokerVoteId} due to error: ${
                        voteError.message
                    } ${voteError.stack ?? 'no stack'}`
                );
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            } else if (!vote) {
                console.log('No vote found when upserting');
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }

            await dispatchVoteUpdateEvent({ vote });
            return vote;
        }),
});
