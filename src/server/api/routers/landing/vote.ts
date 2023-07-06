import { TRPCError } from '@trpc/server';
import cuid from 'cuid';
import { z } from 'zod';

import { RateLimitPrefix } from '@/utils/rate-limit';
import { to } from '@/utils/to';
import { voteOptionSchema } from '@/constants';
import { prisma } from '@/server/db';
import { dispatchLandingVoteUpdateEvent } from '@/server/hop';
import { rateLimitedProcedureWithUserOrAnon } from '../../trpc';
import { selectLandingVoteQuery } from './votes';

export const vote = rateLimitedProcedureWithUserOrAnon(RateLimitPrefix.vote)
    .input(
        z.object({
            voteId: z.string().cuid().optional().default(cuid),
            choice: voteOptionSchema,
        })
    )
    .mutation(async ({ ctx, input }) => {
        let voteId = null;
        if (input.voteId && !ctx.session && !ctx.anonSession) {
            const [vote, voteError] = await to(
                prisma.landingPokerVoteChoice.upsert({
                    select: selectLandingVoteQuery,
                    where: {
                        id: input.voteId,
                    },
                    update: {
                        choice: input.choice.toString(),
                    },
                    create: {
                        id: input.voteId,
                        choice: input.choice.toString(),
                    },
                })
            );

            if (voteError) {
                console.log(
                    `Could not upsert anonymus landing  vote due to error: ${
                        voteError.message
                    } ${voteError.stack ?? 'no stack'}`
                );
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
            await dispatchLandingVoteUpdateEvent({ vote });
            voteId = vote.id;
        } else {
            const [vote, voteError] = await to(
                prisma.landingPokerVoteChoice.upsert({
                    select: selectLandingVoteQuery,

                    where: {
                        anonUserId: ctx.anonSession?.id,
                        userId: ctx.session?.user.id,
                    },
                    update: {
                        choice: input.choice.toString(),
                    },
                    create: {
                        userId: ctx.session?.user.id,
                        anonUserId: ctx.anonSession?.id,
                        choice: input.choice.toString(),
                    },
                })
            );

            if (voteError) {
                console.log(
                    `Could not upsert landing  vote due to error: ${
                        voteError.message
                    } ${voteError.stack ?? 'no stack'}`
                );
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
            await dispatchLandingVoteUpdateEvent({ vote });
        }

        return voteId;
    });
