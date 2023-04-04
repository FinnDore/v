import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { AnonHelper } from '@/utils/anon-users';
import { to } from '@/utils/to';
import { createTRPCRouter } from '@/server/api/trpc';
import { ChannelEvents } from '@/server/channel-events';
import { prisma } from '@/server/db';
import { hop, type UsersInVote } from '@/server/hop';
import { publicProcedure } from '../../trpc';

const usersInVoteSelect = {
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
        },
    },
};

export const lobbyRouter = createTRPCRouter({
    joinVote: publicProcedure
        .input(
            z.object({
                voteId: z.string().cuid(),
                anonUser: z
                    .object({
                        id: z.string().cuid(),
                        secret: z.string().cuid(),
                    })
                    .nullable(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            if (!ctx.session?.user && !input.anonUser) {
                console.log('No session or anon user');
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                });
            }

            if (!ctx.session?.user && input.anonUser) {
                const [anonUser, getAnonUserError] =
                    await AnonHelper.getAnonUserByIdSecret({
                        userId: input.anonUser.id,
                        secret: input.anonUser.secret,
                    });

                if (getAnonUserError) {
                    console.error(
                        `Could not find anon user due to error: ${
                            getAnonUserError.message
                        } ${getAnonUserError.stack ?? 'no stack'}`
                    );

                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                } else if (!anonUser) {
                    console.log('No anon user found');
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                    });
                }

                const userIdAndVoteId = {
                    anonUserId: input.anonUser.id,
                    voteId: input.voteId,
                } as const;

                const [, joinVoteError] = await to(
                    prisma.usersInVote.upsert({
                        where: { voteId_anonUserId: userIdAndVoteId },
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
                    users: formatUsers(usersInVote),
                });
            } else if (ctx.session?.user) {
                throw new TRPCError({
                    code: 'METHOD_NOT_SUPPORTED',
                });
            }
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
            return formatUsers(usersInVote);
        }),
});

const formatUsers = (
    users:
        | {
              anonUser: {
                  id: string;
                  name: string;
              } | null;
              user: {
                  id: string;
                  name: string | null;
              } | null;
          }[]
        | null
): UsersInVote =>
    users
        ?.map(u => (u.user ? u.user : u.anonUser))
        .filter(
            (x): x is UsersInVote[number] => x !== null && x.name !== null
        ) ?? [];

async function dispatchVoteUpdate({
    pokerId,
    users,
}: {
    pokerId: string;
    users: UsersInVote;
}) {
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
}
