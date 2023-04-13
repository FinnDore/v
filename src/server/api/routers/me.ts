import { TRPCError } from '@trpc/server';

import { to } from '@/utils/to';
import { prisma } from '@/server/db';
import { anonOrUserProcedure, createTRPCRouter } from '../trpc';

export const meRouter = createTRPCRouter({
    myVotes: anonOrUserProcedure.query(async ({ ctx }) => {
        const [votes, error] = await to(
            prisma.poker.findMany({
                where: {
                    createdByUserId: ctx?.session?.user.id ?? null,
                    createdByAnonUserId: ctx?.anonSession?.id ?? null,
                },
                select: {
                    userInVote: {
                        select: {
                            id: true,
                            anonUser: {
                                select: {
                                    id: true,
                                    pfpHash: true,
                                    name: true,
                                },
                            },
                            user: {
                                select: {
                                    id: true,
                                    image: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    title: true,
                    updatedAt: true,
                    id: true,
                    pokerVote: {
                        select: {
                            title: true,
                            pokerId: true,
                        },
                    },
                },
            })
        );

        if (error) {
            console.error(
                `Error fetching votes for user ${
                    ctx?.session?.user.id ?? ctx?.anonSession?.id ?? 'no user'
                }, ${error.message}`
            );
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
            });
        }

        return votes ?? [];
    }),
});
