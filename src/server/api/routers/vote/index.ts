import { ChannelType } from '@onehop/js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { to } from '@/utils/to';
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

export const vote = createTRPCRouter({
    pokerState: pokerStateRouter,
    lobby: lobbyRouter,

    createPoker: publicProcedure
        .input(
            z.object({
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
        .mutation(async ({ input }) => {
            const vote = await prisma.poker.create({
                data: {
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

    createAccount: publicProcedure
        .input(
            z.object({
                name: z.string().trim().max(25).min(1),
                pfpHash: z.string().trim().min(1).max(30),
            })
        )
        .mutation(async ({ input }) => {
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
                    create: ctx.anonSession
                        ? {
                              anonUserId: ctx.anonSession.id,
                              choice: input.choice,
                              pokerVoteId: input.pokerVoteId,
                          }
                        : {
                              userId: ctx.session.user.id,
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
