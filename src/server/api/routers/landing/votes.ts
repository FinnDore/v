import { TRPCError } from '@trpc/server';

import { RateLimitPrefix } from '@/utils/rate-limit';
import { to } from '@/utils/to';
import { prisma } from '@/server/db';
import { rateLimitedTrpcProc } from '../../trpc';

export const selectLandingVoteQuery = {
    choice: true,
    id: true,
    updatedAt: true,
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
};

export const landingVotes = rateLimitedTrpcProc(
    RateLimitPrefix.landingStats
).query(async () => {
    const [votes, votesError] = await to(
        prisma.landingPokerVoteChoice.findMany({
            select: selectLandingVoteQuery,
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

    return votes.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
});
