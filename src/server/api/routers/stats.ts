import { prisma } from '@/server/db';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const statsRouter = createTRPCRouter({
    stats: publicProcedure.query(async () => {
        const tx = await prisma.$transaction([
            prisma.poker.count(),
            prisma.pokerVoteChoice.count(),
            prisma.user.count(),
        ]);

        return {
            pokerSessions: tx[0],
            pokerVotes: tx[1],
            users: tx[2],
        };
    }),
});
