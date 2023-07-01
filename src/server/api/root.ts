import { vote } from '@/server/api/routers/vote';
import { createTRPCRouter } from '@/server/api/trpc';
import { meRouter } from './routers/me';
import { statsRouter } from './routers/stats';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    vote,
    me: meRouter,
    stats: statsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
