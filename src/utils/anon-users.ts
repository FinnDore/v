import { prisma } from '@/server/db';
import { to } from './to';

async function getAnonUserByIdSecretAndVote({
    userId,
    secret,
    voteId,
}: {
    userId: string;
    secret: string;
    voteId: string;
}): Promise<readonly [boolean, null] | readonly [null, Error]> {
    const [anonUser, error] = await to(
        prisma.anonUser.findFirst({
            where: {
                voteId: voteId,
                id: userId,
                secret: secret,
            },
        })
    );

    return error ? [null, error] : [!!anonUser, null];
}

export const AnonHelper = {
    getAnonUserByIdSecretAndVote,
} as const;
