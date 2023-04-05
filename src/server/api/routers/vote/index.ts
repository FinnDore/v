import { ChannelType } from '@onehop/js';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { to } from '@/utils/to';
import {
    anonOrUserProcedure,
    anonProcedure,
    createTRPCRouter,
    publicProcedure,
} from '@/server/api/trpc';
import {
    dispatchLobbyJoinEvent,
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

        return vote;
    }),

    createAccount: anonProcedure
        .input(
            z.object({
                voteId: z.string().cuid(),
                name: z.string().max(20).min(3),
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

    vote: anonOrUserProcedure
        .input(
            z.object({
                choice: z.string().max(20),
                voteId: z.string().cuid(),
            })
        )
        .mutation(async ({ input, ctx }): Promise<Vote> => {
            const [vote, voteError] = await to(
                prisma.pokerVote.upsert({
                    select: selectPokerVote,
                    where: ctx.anonSession
                        ? {
                              voteId_anonUserId: {
                                  voteId: input.voteId,
                                  anonUserId: ctx.anonSession.id,
                              },
                          }
                        : {
                              voteId_userId: {
                                  voteId: input.voteId,
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
                              voteId: input.voteId,
                          }
                        : {
                              userId: ctx.session.user.id,
                              choice: input.choice,
                              voteId: input.voteId,
                          },
                })
            );

            if (voteError) {
                console.log(
                    `Could not upsert vote ${input.voteId} due to error: ${
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

            await dispatchLobbyJoinEvent({ pokerVote: vote });
            return vote;
        }),
});
