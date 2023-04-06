import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { to } from '@/utils/to';
import { prisma } from '@/server/db';
import { selectPokerVote, type Vote } from '@/server/hop';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const pokerStateRouter = createTRPCRouter({
    getVotes: publicProcedure
        .input(
            z.object({
                pokerId: z.string().cuid(),
            })
        )
        .query(async ({ input }): Promise<Vote[]> => {
            const [votes, error] = await to(
                prisma.pokerVote.findMany({
                    select: selectPokerVote,
                    where: {
                        voteId: input.pokerId,
                    },
                })
            );

            if (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }

            return votes.sort(
                (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()
            );
        }),
});
