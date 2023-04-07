import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { to } from '@/utils/to';
import {
    anonOrUserProcedure,
    createTRPCRouter,
    publicProcedure,
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
        },
    },
    user: {
        select: {
            id: true,
            name: true,
            image: true,
        },
    },
};

export const lobbyRouter = createTRPCRouter({
    joinVote: anonOrUserProcedure
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
            return await dispatchVoteUpdate({
                pokerId: input.voteId,
                users: formatUsers(
                    usersInVote.map(x => ({
                        ...x,
                        updatedAt: x.updatedAt.getTime(),
                    }))
                ),
            });
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
          }[]
        | null
): UsersInVote =>
    users
        ?.map(u =>
            u.user
                ? { ...u.user, updatedAt: u.updatedAt }
                : { ...u.anonUser, updatedAt: u.updatedAt }
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
