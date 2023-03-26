import {
    anonProcedure,
    createTRPCRouter,
    publicProcedure,
} from '@/server/api/trpc';
import { hop, selectPokerVote, Vote } from '@/server/hop';
import { AnonHelper } from '@/utils/anon-users';
import { to } from '@/utils/to';
import { ChannelType } from '@onehop/js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '../../db';
import { pokerState } from './poker-state';

export const vote = createTRPCRouter({
    pokerState,
    getVote: publicProcedure
        .input(z.object({ voteId: z.string() }))
        .query(({ input }) => {
            return (
                prisma.poker.findUnique({
                    where: {
                        id: input.voteId,
                    },
                    include: {
                        VoteChoice: true,
                    },
                }) ?? null
            );
        }),

    createPoker: publicProcedure.mutation(async ({}) => {
        const vote = await prisma.poker.create({
            data: {},
        });
        const [, createChannelError] = await to(
            hop.channels.create(ChannelType.UNPROTECTED, `poker_${vote.id}`)
        );

        if (createChannelError) {
            console.error(
                `Could not create channel poker_${
                    vote.id
                } ( attempting to publish anyway ): ${
                    createChannelError.message ?? 'no error message'
                } ${createChannelError.stack ?? 'no stack'}`
            );
            console.log(JSON.stringify(createChannelError));
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
            });
        }

        return vote;
    }),

    joinPoker: anonProcedure
        .input(
            z.object({
                voteId: z.string().cuid(),
                name: z.string().max(20),
            })
        )
        .mutation(async ({ input }) => {
            const anonUser = await prisma.anonUser.create({
                data: {
                    voteId: input.voteId,
                    name: input.name,
                },
            });

            return anonUser;
        }),

    vote: publicProcedure
        .input(
            z.object({
                choice: z.string().max(20),
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
                const [anonUser, error] =
                    await AnonHelper.getAnonUserByIdSecret({
                        userId: input.anonUser.id,
                        secret: input.anonUser.secret,
                    });

                if (error) {
                    console.error(
                        `Could not find anon user due to error: ${
                            error.message
                        } ${error.stack ?? 'no stack'}`
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

                const [previousVote, previousVoteError] = await to(
                    prisma.pokerVote.findFirst({
                        where: {
                            voteId: input.voteId,
                            anonUserId: input.anonUser.id,
                        },
                    })
                );

                if (previousVoteError) {
                    console.log(
                        `Could not find previous vote due to error: ${
                            previousVoteError.message
                        } ${previousVoteError.stack ?? 'no stack'}`
                    );
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                }

                let vote: Vote | null;
                let voteError;
                if (previousVote) {
                    [vote, voteError] = await to(
                        prisma.pokerVote.update({
                            select: selectPokerVote,
                            where: {
                                id: previousVote.id,
                            },
                            data: {
                                choice: input.choice,
                            },
                        })
                    );
                } else {
                    [vote, voteError] = await to(
                        prisma.pokerVote.create({
                            select: selectPokerVote,
                            data: {
                                choice: input.choice,
                                voteId: input.voteId,
                                anonUserId: input.anonUser.id,
                            },
                        })
                    );
                }

                if (voteError) {
                    console.log(
                        `Could not ${
                            previousVote ? 'update' : 'create'
                        } vote due to error: ${voteError.message} ${
                            voteError.stack ?? 'no stack'
                        }`
                    );
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                } else if (!vote) {
                    console.log('No vote found');
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                }

                await dispatchVoteUpdate({ pokerVote: vote });
                return vote;
            } else if (ctx.session?.user.id) {
                const [previousVote, previousVoteError] = await to(
                    prisma.pokerVote.findFirst({
                        where: {
                            voteId: input.voteId,
                            userId: ctx.session.user.id,
                        },
                    })
                );

                if (previousVoteError) {
                    console.log(
                        `Could not find previous vote due to error: ${
                            previousVoteError.message
                        } ${previousVoteError.stack ?? 'no stack'}`
                    );
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                }

                let vote: Vote | null;
                let voteError;
                if (previousVote) {
                    [vote, voteError] = await to(
                        prisma.pokerVote.update({
                            select: selectPokerVote,
                            where: {
                                id: previousVote.id,
                            },
                            data: {
                                choice: input.choice,
                            },
                        })
                    );
                } else {
                    [vote, voteError] = await to(
                        prisma.pokerVote.create({
                            select: selectPokerVote,
                            data: {
                                choice: input.choice,
                                voteId: input.voteId,
                                userId: ctx.session.user.id,
                            },
                        })
                    );
                }

                if (voteError) {
                    console.log(
                        `Could not ${
                            previousVote ? 'update' : 'create'
                        } vote due to error: ${voteError.message} ${
                            voteError.stack ?? 'no stack'
                        }`
                    );
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                } else if (!vote) {
                    console.log('No vote found');
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                }

                await dispatchVoteUpdate({ pokerVote: vote });
                return vote;
            }

            throw new TRPCError({
                code: 'UNAUTHORIZED',
            });
        }),
});

async function dispatchVoteUpdate({ pokerVote }: { pokerVote: Vote }) {
    const [, updateChannelStateError] = await to(
        hop.channels.publishMessage(
            `poker_${pokerVote.voteId}`,
            'VOTE_UPDATE',
            pokerVote
        )
    );

    if (updateChannelStateError) {
        console.error(
            `Could not publish votes for poker_${
                pokerVote.voteId
            } due to error: ${updateChannelStateError.message} ${
                updateChannelStateError.stack ?? 'no stack'
            }
            ${JSON.stringify(updateChannelStateError, null, 2)}
            `
        );
    } else {
        console.log(`Published votes for poker_${pokerVote.voteId} to channel`);
    }
}
