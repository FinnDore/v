import {
    NextResponse,
    type NextFetchEvent,
    type NextRequest,
} from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.cachedFixedWindow(20, '10s'),
    ephemeralCache: new Map(),
    analytics: true,
});

export default async function middleware(
    request: NextRequest,
    event: NextFetchEvent
): Promise<Response | undefined> {
    const ip = request.ip ?? '127.0.0.1';

    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
        `ratelimit_middleware_${ip}`
    );
    event.waitUntil(pending);

    if (!success) {
        return new Response('Too many requests', {
            status: 429,
            headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': reset.toString(),
            },
        });
    } else {
        const res = NextResponse.next();
        res.headers.set('X-RateLimit-Limit', limit.toString());
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());
        return res;
    }
}

export const config = {
    matcher: '/api/:path*',
};
