import { prisma } from '@/server/db';
import { to } from './to';

async function getAnonUserByIdSecretAndVote({
    userId,
    secret,
}: {
    userId: string;
    secret: string;
}): Promise<readonly [boolean, null] | readonly [null, Error]> {
    const [anonUser, error] = await to(
        prisma.anonUser.findFirst({
            where: {
                id: userId,
                secret: secret,
            },
        })
    );

    return error ? [null, error] : [!!anonUser, null];
}

export const AnonHelper = {
    getAnonUserByIdSecret: getAnonUserByIdSecretAndVote,
} as const;
