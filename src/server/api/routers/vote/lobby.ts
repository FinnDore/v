import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { RateLimitPrefix } from '@/utils/rate-limit';
import { to } from '@/utils/to';
import {
    createTRPCRouter,
    pokerOwnerProcedure,
    publicProcedure,
    rateLimitedAnonOrUserProcedure,
} from '@/server/api/trpc';
import { ChannelEvents } from '@/server/channel-events';
import { prisma } from '@/server/db';
import { hop, type UsersInVote } from '@/server/hop';

const usersInVoteSelect = {
    updatedAt: true,
    anonUser: {
        select: {
            id: true,
            name: true,
            pfpHash: true,
        },
    },
    user: {
        select: {
            id: true,
            name: true,
            image: true,
        },
    },
    whiteListed: true,
};

export const lobbyRouter = createTRPCRouter({
    joinVote: rateLimitedAnonOrUserProcedure(RateLimitPrefix.joinVote)
        .input(
            z.object({
                voteId: z.string().cuid(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const upsertWhere = !ctx.anonSession
                ? {
                      voteId_userId: {
                          userId: ctx?.session?.user?.id,
                          voteId: input.voteId,
                      },
                  }
                : {
                      voteId_anonUserId: {
                          anonUserId: ctx.anonSession.id,
                          voteId: input.voteId,
                      },
                  };

            const userIdAndVoteId = !ctx.anonSession
                ? {
                      userId: ctx.session.user.id,
                      voteId: input.voteId,
                  }
                : {
                      anonUserId: ctx.anonSession.id,
                      voteId: input.voteId,
                  };

            const [, joinVoteError] = await to(
                prisma.usersInVote.upsert({
                    where: upsertWhere,
                    create: userIdAndVoteId,
                    update: userIdAndVoteId,
                })
            );

            if (joinVoteError) {
                console.error(
                    `Could not join vote due to error: ${
                        joinVoteError.message
                    } ${joinVoteError.stack ?? 'no stack'}`
                );

                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }

            const [usersInVote, error] = await to(
                prisma.usersInVote.findMany({
                    where: {
                        voteId: input.voteId,
                    },
                    select: usersInVoteSelect,
                })
            );

            if (error) {
                console.error(
                    `Could dispatch updated user list in vote due to error: ${
                        error.message
                    } ${error.stack ?? 'no stack'}`
                );

                return;
            }
            await dispatchVoteUpdate({
                pokerId: input.voteId,
                users: formatUsers(
                    usersInVote.map(x => ({
                        ...x,
                        updatedAt: x.updatedAt.getTime(),
                    }))
                ),
            });
            return;
        }),

    listUsersInVote: publicProcedure
        .input(
            z.object({
                voteId: z.string().cuid(),
            })
        )
        .query(async ({ input }) => {
            const [usersInVote, error] = await to(
                prisma.usersInVote.findMany({
                    where: {
                        voteId: input.voteId,
                    },
                    select: usersInVoteSelect,
                })
            );

            if (error) {
                console.error(
                    `Could not list users in vote due to error: ${
                        error.message
                    } ${error.stack ?? 'no stack'}`
                );

                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }

            return formatUsers(
                usersInVote.map(x => ({
                    ...x,
                    updatedAt: x.updatedAt.getTime(),
                }))
            );
        }),

    kickOrWhitelistUser: pokerOwnerProcedure
        .input(
            z.object({
                anonUserId: z.string().optional(),
                userId: z.string().optional(),
                kick: z.boolean(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            if (input.kick) {
                const [kickedUser, kickError] = await to(
                    prisma.$transaction([
                        prisma.usersInVote.delete({
                            where: {
                                voteId_userId: input.userId
                                    ? {
                                          userId: input.userId,
                                          voteId: ctx.pokerId,
                                      }
                                    : undefined,
                                voteId_anonUserId: input.anonUserId
                                    ? {
                                          anonUserId: input.anonUserId,
                                          voteId: ctx.pokerId,
                                      }
                                    : undefined,
                            },
                        }),
                        prisma.pokerVoteChoice.deleteMany({
                            where: {
                                userId: input.userId,
                                pokerVote: {
                                    pokerId: ctx.pokerId,
                                },
                            },
                        }),
                    ])
                );

                if (kickError) {
                    console.error(
                        `Could not kick user from vote due to error: ${
                            kickError.message
                        } ${kickError.stack ?? 'no stack'}`
                    );

                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                }

                if (!kickedUser) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                    });
                }
            } else {
                const [updatedUserInVote, updateError] = await to(
                    prisma.usersInVote.update({
                        where: {
                            voteId_userId: input.userId
                                ? {
                                      userId: input.userId,
                                      voteId: ctx.pokerId,
                                  }
                                : undefined,
                            voteId_anonUserId: input.anonUserId
                                ? {
                                      anonUserId: input.anonUserId,
                                      voteId: ctx.pokerId,
                                  }
                                : undefined,
                        },
                        data: {
                            whiteListed: true,
                        },
                    })
                );

                if (updateError) {
                    console.error(
                        `Could not whitelist user in vote due to error: ${
                            updateError.message
                        } ${updateError.stack ?? 'no stack'}`
                    );

                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                }

                if (!updatedUserInVote) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                    });
                }
            }
        }),
});

const formatUsers = (
    users:
        | {
              updatedAt: number;
              anonUser: {
                  id: string;
                  name: string;
              } | null;
              user: {
                  id: string;
                  name: string | null;
                  image?: string | null;
              } | null;
              whiteListed: boolean;
          }[]
        | null
): UsersInVote =>
    users
        ?.map(u =>
            u.user
                ? {
                      ...u.user,
                      updatedAt: u.updatedAt,
                      whiteListed: u.whiteListed,
                  }
                : {
                      ...u.anonUser,
                      updatedAt: u.updatedAt,
                      whiteListed: u.whiteListed,
                  }
        )
        .filter((x): x is UsersInVote[number] => x !== null && x.name !== null)
        .sort((a, b) => b.updatedAt - a.updatedAt) ?? [];

const dispatchVoteUpdate = async ({
    pokerId,
    users,
}: {
    pokerId: string;
    users: UsersInVote;
}) => {
    const [, updateChannelStateError] = await to(
        hop.channels.publishMessage(
            `poker_${pokerId}`,
            ChannelEvents.USER_JOINED,
            {
                users,
            }
        )
    );

    if (updateChannelStateError) {
        console.error(
            `Could not publish updated users for for poker_${pokerId} due to error: ${
                updateChannelStateError.message
            } ${updateChannelStateError.stack ?? 'no stack'}
            ${JSON.stringify(updateChannelStateError, null, 2)}
            `
        );
    } else {
        console.log(`Published updated users for poker_${pokerId}`);
    }
};
