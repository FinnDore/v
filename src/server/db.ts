import { PrismaClient } from '@prisma/client';

import { env } from '@/env.mjs';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log:
            env.NODE_ENV === 'development'
                ? ['query', 'error', 'warn']
                : ['error'],
    });

if (env.NODE_ENV === 'production') {
    console.log('enabling boost 🥹🥹🥹🥹🥹');
    void (async () =>
        await prisma.$queryRaw`SET @@boost_cached_queries = true`.catch(e =>
            console.error('could not enable boost', e)
        ))();
}

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
