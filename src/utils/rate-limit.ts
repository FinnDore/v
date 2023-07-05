import { TRPCError } from '@trpc/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { env } from '@/env.mjs';

const createRateLimiterWithAlgo = (
    algo: ReturnType<typeof Ratelimit['slidingWindow']>
) =>
    new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: algo,
        ephemeralCache: new Map(),
        analytics: true,
    });

export const RateLimitPrefix = {
    createPoker: 'CREATE_POKER_',
    createAnonAccount: 'CREATE_ACCOUNT_',
    vote: 'VOTE_',
    joinVote: 'JOIN_VOTE_',
    progressVoteOrToggleResults: 'PROGRESS_VOTE_OR_TOGGLE_RESULTS_',
    landingStats: 'LANDING_STATS_',
} satisfies Record<string, `${string}_`>;

export type RateLimitPrefix =
    typeof RateLimitPrefix[keyof typeof RateLimitPrefix];

const limiters: Record<RateLimitPrefix, Ratelimit> = {
    [RateLimitPrefix.createAnonAccount]: createRateLimiterWithAlgo(
        Ratelimit.tokenBucket(20, '1h', 20)
    ),
    [RateLimitPrefix.createPoker]: createRateLimiterWithAlgo(
        Ratelimit.slidingWindow(20, '1h')
    ),
    [RateLimitPrefix.vote]: createRateLimiterWithAlgo(
        Ratelimit.slidingWindow(20, '10s')
    ),
    [RateLimitPrefix.joinVote]: createRateLimiterWithAlgo(
        Ratelimit.slidingWindow(10, '3m')
    ),
    [RateLimitPrefix.progressVoteOrToggleResults]: createRateLimiterWithAlgo(
        Ratelimit.slidingWindow(20, '20s')
    ),
    [RateLimitPrefix.landingStats]: createRateLimiterWithAlgo(
        Ratelimit.slidingWindow(15, '60s')
    ),
} as const;

export const rateLimitTrpcProc = async ({
    userSession,
    anonSession,
    prefix,
    ip,
    byIp,
}: {
    userSession: {
        user: {
            id: string;
            name?: string | null;
        };
    } | null;
    anonSession: {
        id: string;
        name: string;
    } | null;
    ip: string;
    prefix: RateLimitPrefix;
    byIp: boolean;
}) => {
    if (!env.PROD) return;
    const id = ip ? userSession?.user.id ?? anonSession?.id : ip;
    const name = userSession?.user.name ?? anonSession?.name;

    const { success, limit, reset, remaining } = await limiters[prefix].limit(
        `${prefix}${id ?? ip}`
    );

    if (!success) {
        const extraLoggingForUser = !byIp
            ? `, user: ${id ?? 'No userId'}) name: ${name ?? 'No Name'}${
                  !id
                      ? ' Fell back to IP rate limiting as no userId was given'
                      : ''
              }`
            : '';
        console.warn(
            `Rate limited ${prefix} attempt from ${
                id ?? ip
            } (limit: ${limit}, reset: ${reset}, remaining: ${remaining}${extraLoggingForUser}`
        );
        throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: `You are being rate limited. Try again in ${reset} seconds.`,
        });
    }
};
