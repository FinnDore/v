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
                        count: typeof BigInt;
                    }
                ]
            >`SELECT SUM(CAST(choice AS UNSIGNED)) AS count FROM PokerVoteChoice`,
            prisma.$queryRaw<
                [
                    {
                        count: typeof BigInt;
                    }
                ]
            >`SELECT SUM(CAST(choice AS UNSIGNED)) AS count FROM LandingPokerVoteChoice`,
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
            parseInt(stats[2]?.[0]?.count?.toString() ?? '0', 10) +
            parseInt(stats[3]?.[0]?.count?.toString() ?? '0', 10),
    };
});
