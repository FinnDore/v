import { type AnonUser } from '@prisma/client';
import { useSession } from 'next-auth/react';

import { useMemo, version } from 'react';
import { z } from 'zod';

const LocalUserStoreSchema = z.object({
    version: z.string(),
    user: z.object({
        id: z.string(),
        name: z.string(),
        secret: z.string().cuid(),
    }),
});

export function useAnonUser() {
    return useMemo(() => {
        if (typeof window === 'undefined') return null;
        const localUserStore = getLocalUserStore();

        return localUserStore?.user ?? null;
    }, []);
}

export function useSessionOrAnonUser() {
    const anonUser = useAnonUser();
    const sessionUser = useSession();

    if (sessionUser.status === 'loading') return null;
    if (sessionUser.status === 'authenticated') return sessionUser.data.user;
    return anonUser;
}

export function storeUser(user: AnonUser) {
    if (typeof window === 'undefined') return;

    const existingUsersParseResult = LocalUserStoreSchema.safeParse(
        JSON.parse(localStorage.getItem('users') ?? 'null')
    );
    if (!existingUsersParseResult.success) {
        console.error(
            'Failed to parse existing users, resting users store',
            existingUsersParseResult.error
        );
    }
    const existingUser = existingUsersParseResult.success
        ? existingUsersParseResult.data
        : {
              user: {
                  id: user.id,
                  name: user.name,
                  secret: user.secret,
              },
              version,
          };

    localStorage.setItem('user', JSON.stringify(existingUser));
}

function getLocalUserStore() {
    const existingUsersParseResult = LocalUserStoreSchema.safeParse(
        JSON.parse(localStorage.getItem('user') ?? 'null')
    );
    if (!existingUsersParseResult.success) {
        console.error(
            'Failed to parse existing users',
            existingUsersParseResult.error
        );
        return null;
    }
    return existingUsersParseResult.data;
}
