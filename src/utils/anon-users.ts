import { AnonUser } from '@prisma/client';

import { prisma } from '@/server/db';
import { to } from './to';

async function getAnonUserByIdAndSecret({
    userId,
    secret,
}: {
    userId: string;
    secret: string;
}): Promise<readonly [AnonUser | null, null] | readonly [null, Error]> {
    const [anonUser, error] = await to(
        prisma.anonUser.findFirst({
            where: {
                id: userId,
                secret: secret,
            },
        })
    );

    return error ? [null, error] : [anonUser, null];
}

export const AnonHelper = {
    getAnonUserByIdAndSecret,
} as const;
