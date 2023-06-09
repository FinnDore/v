import { TRPCError } from '@trpc/server';

import { RateLimitPrefix } from '@/utils/rate-limit';
import { to } from '@/utils/to';
import { prisma } from '@/server/db';
import { rateLimitedTrpcProc } from '../../trpc';

export const landingStats = rateLimitedTrpcProc(
    RateLimitPrefix.landingStats
).query(async () => {
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
});
