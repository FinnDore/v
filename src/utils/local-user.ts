import { type AnonUser } from '@prisma/client';
import { type Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useEffect, useState, version } from 'react';
import { z } from 'zod';

const LocalUserStoreSchema = z.object({
    version: z.string(),
    user: z.object({
        id: z.string(),
        name: z.string(),
        secret: z.string().cuid(),
    }),
});

type LocalUserStore = z.infer<typeof LocalUserStoreSchema>;

export function useAnonUser() {
    const [user, storeUser] = useState<LocalUserStore['user'] | null>(null);
    useEffect(() => {
        const cleanup = () => storeUser(null);
        if (typeof window === 'undefined') return cleanup;
        const localUserStore = getLocalUserStore();

        storeUser(() => localUserStore?.user ?? null);
        return cleanup;
    }, []);

    return user;
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

export const useUser = ():
    | {
          status: 'authenticated';
          user: Session;
      }
    | {
          status: 'loading';
          user: null;
      }
    | {
          status: 'anon';
          user: LocalUserStore['user'];
      }
    | {
          status: 'unauthenticated';
          user: null;
      } => {
    const { data: session, status } = useSession();
    const anonUser = useAnonUser();
    const loading = status === 'loading';

    if (loading) {
        return {
            status,
            user: null,
        };
    } else if (session) {
        return {
            status: 'authenticated',
            user: session,
        };
    } else if (anonUser) {
        return {
            status: 'anon',
            user: anonUser,
        };
    } else {
        return {
            status: 'unauthenticated',
            user: null,
        };
    }
};
