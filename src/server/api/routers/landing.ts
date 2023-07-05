import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { RateLimitPrefix } from '@/utils/rate-limit';
import { to } from '@/utils/to';
import { voteOptionSchema } from '@/constants';
import { prisma } from '@/server/db';
import {
    createTRPCRouter,
    rateLimitedAnonOrUserProcedure,
    rateLimitedTrpcProc,
} from '../trpc';

export const voteOnLanding = rateLimitedAnonOrUserProcedure(
    RateLimitPrefix.vote
)
    .input(
        z.object({
            voteId: z.string().cuid().optional(),
            choice: voteOptionSchema,
        })
    )
    .mutation(async ({ ctx, input }) => {
        console.log(ctx);
        if (input.voteId && !ctx.session && !ctx.anonSession) {
            console.log('anonVote');
            const [vote, voteError] = await to(
                prisma.landingPokerVoteChoice.upsert({
                    where: {
                        id: input.voteId,
                    },
                    update: {
                        choice: input.choice.toString(),
                    },
                    create: {
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

            return vote.id;
        } else {
            const [vote, voteError] = await to(
                prisma.landingPokerVoteChoice.upsert({
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

            return vote.id;
        }
    });

export const landingVotes = rateLimitedTrpcProc(
    RateLimitPrefix.landingStats
).query(async () => {
    const [votes, votesError] = await to(
        prisma.landingPokerVoteChoice.findMany({
            select: {
                choice: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                anonUser: {
                    select: {
                        id: true,
                        name: true,
                        pfpHash: true,
                    },
                },
            },
        })
    );

    if (votesError) {
        console.log(
            `Could not get landing votes due to error: ${votesError.message} ${
                votesError.stack ?? 'no stack'
            }`
        );
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
        });
    }

    return votes;
});

const landingStats = rateLimitedTrpcProc(RateLimitPrefix.landingStats).query(
    async () => {
        const [stats, statsError] = await to(
            prisma.$transaction([
                prisma.poker.count(),
                prisma.pokerVoteChoice.count(),
                prisma.$queryRaw<
                    [
                        {
                            C: typeof BigInt;
                        }
                    ]
                >`SELECT CAST(SUM(choice) AS UNSIGNED) AS C FROM PokerVoteChoice WHERE choice != 0`,
                prisma.$queryRaw<
                    [
                        {
                            C: typeof BigInt;
                        }
                    ]
                >`SELECT CAST(SUM(choice) AS UNSIGNED) AS C FROM LandingPokerVoteChoice WHERE choice != 0`,
            ])
        );

        if (statsError) {
            console.error(`Could not get stats ${statsError.message})`);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
            });
        }

        return {
            totalSessions: stats[0],
            totalVoteChoices: stats[1],
            culmativeVotes:
                parseInt(stats[2]?.[0]?.C?.toString() ?? '0', 10) +
                parseInt(stats[3]?.[0]?.C?.toString() ?? '0', 10),
        };
    }
);

export const landingRouter = createTRPCRouter({
    landingVotes,
    vote: voteOnLanding,
    landingStats,
});
