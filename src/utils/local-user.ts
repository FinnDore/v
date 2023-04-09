import { useEffect, useMemo, useState, version } from 'react';
import { type AnonUser } from '@prisma/client';
import { type Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { z } from 'zod';

const LocalUserStoreSchema = z.object({
    version: z.string(),
    user: z.object({
        id: z.string(),
        name: z.string(),
        secret: z.string().cuid(),
        pfpHash: z.string(),
    }),
});

type LocalUserStore = z.infer<typeof LocalUserStoreSchema>;

export function useAnonUser() {
    const [user, setUser] = useState<LocalUserStore['user'] | null>();
    useMemo(() => {
        const cleanup = () => {
            setUser(null);
        };
        if (typeof window === 'undefined') return cleanup;
        const localUserStore = getLocalUserStore();

        setUser(localUserStore?.user ?? null);
        return cleanup;
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const reloadUser = (e: StorageEvent) => {
            if (e.key === 'user') {
                console.log('Reloading user');
                const localUserStore = getLocalUserStore();
                setUser(localUserStore?.user ?? null);
            }
        };

        window.addEventListener('storage', reloadUser);
        return () => {
            window.removeEventListener('storage', reloadUser);
        };
    }, []);

    return user;
}

export function storeUser(user: AnonUser) {
    const existingUsersParseResult = LocalUserStoreSchema.safeParse(
        JSON.parse(localStorage.getItem('users') || 'null')
    );
    if (!existingUsersParseResult.success) {
        console.error(
            'Failed to parse existing users, resting users store',
            existingUsersParseResult.error
        );
    }
    const existingUser = existingUsersParseResult.success
        ? {
              ...existingUsersParseResult.data,
              user: {
                  id: user.id,
                  name: user.name,
                  secret: user.secret,
                  pfpHash: user.pfpHash,
              },
          }
        : {
              user: {
                  id: user.id,
                  name: user.name,
                  secret: user.secret,
                  pfpHash: user.pfpHash,
              },
              version,
          };

    localStorage.setItem('user', JSON.stringify(existingUser));
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', { key: 'user' }));
    }
}

function getLocalUserStore() {
    const existingUsersParseResult = LocalUserStoreSchema.safeParse(
        JSON.parse(localStorage.getItem('user') || 'null')
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
          user: {
              id: Session['user']['id'];
              name: Session['user']['name'];
              image: Session['user']['image'];
              pfpHash: undefined;
          };
      }
    | {
          status: 'loading';
          user: null;
      }
    | {
          status: 'anon';
          user: LocalUserStore['user'] & {
              image: undefined;
              pfpHash: string;
          };
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
            user: {
                id: session.user.id,
                name: session.user.name,
                image: session.user.image,
                pfpHash: undefined,
            },
        };
    } else if (anonUser) {
        return {
            status: 'anon',
            user: { ...anonUser, image: undefined },
        };
    } else {
        return {
            status: 'unauthenticated',
            user: null,
        };
    }
};
