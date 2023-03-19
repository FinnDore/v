import { vote } from '@/server/api/routers/vote';
import { createTRPCRouter } from '@/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    vote,
});

// export type definition of API
export type AppRouter = typeof appRouter;
