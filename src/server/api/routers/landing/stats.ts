import { TRPCError } from '@trpc/server';

import { RateLimitPrefix } from '@/utils/rate-limit';
import { to } from '@/utils/to';
import { env } from '@/env.mjs';
import { prisma } from '@/server/db';
import { rateLimitedTrpcProc } from '../../trpc';

export const landingStats = rateLimitedTrpcProc(
    RateLimitPrefix.landingStats
).query(async () => {
    const querys = [
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
    ];

    if (env.PROD) {
        querys.unshift(
            prisma.$queryRaw<number>`SET @@boost_cached_queries = true`
        );
        querys.push(
            prisma.$queryRaw<number>`SET @@boost_cached_queries = true`
        );
    }

    const [stats, statsError] = await to(
        prisma.$transaction(querys) as Promise<
            | [
                  number,
                  number,
                  [{ count: typeof BigInt }],
                  [{ count: typeof BigInt }]
              ]
            | [
                  number,
                  number,
                  number,
                  [{ count: typeof BigInt }],
                  [{ count: typeof BigInt }],
                  number
              ]
        >
    );

    if (statsError) {
        console.error(`Could not get stats ${statsError.message})`);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
        });
    }

    if (typeof stats[2] !== 'number') {
        return {
            totalSessions: stats[0],
            totalVoteChoices: stats[1],
            culmativeVotes:
                parseInt(stats[2]?.[0]?.count?.toString() ?? '0', 10) +
                parseInt(stats[3]?.[0]?.count?.toString() ?? '0', 10),
        };
    } else {
        return {
            totalSessions: stats[1],
            totalVoteChoices: stats[2],
            culmativeVotes:
                parseInt(stats[3]?.[0]?.count?.toString() ?? '0', 10) +
                parseInt(stats[4]?.[0]?.count?.toString() ?? '0', 10),
        };
    }
});
