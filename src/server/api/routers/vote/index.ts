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

        const [, voteError] = await to(
            prisma.pokerVote.create({
                data: {
                    pokerId: vote.id,
                    title: 'New Vote',
                    description:
                        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of de Finibus Bonorum et Malorum (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, Lorem ipsum dolor sit amet.., comes from a line in section 1.10.32.',
                    active: true,
                },
            })
        );

        if (voteError) {
            console.error(`Could not create vote for ${vote.id}`);
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
