import { vote } from '@/server/api/routers/vote';
import { createTRPCRouter } from '@/server/api/trpc';
import { landingRouter } from './routers/landing';
import { meRouter } from './routers/me';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    vote,
    me: meRouter,
    landing: landingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
