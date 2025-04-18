import { useEffect, useMemo, useState, version } from 'react';
import { type AnonUser } from '@prisma/client';
import { type Session } from 'next-auth';
import { useSession } from 'next-auth/react';

type LocalUserStore = {
    version: string;
    user: {
        id: string;
        name: string;
        secret: string;
        pfpHash: string;
    };
};

// We dont use zod as this is used on the front page and zod is large
const parseUerStore = <T extends LocalUserStore | null>(
    userStore: T,
):
    | { success: true; data: LocalUserStore }
    | { success: false; data: null; error: string } => {
    if (typeof userStore?.version !== 'string')
        return { success: false, data: null, error: 'version not string' };
    if (typeof userStore.user !== 'object')
        return { success: false, data: null, error: 'user not object' };
    if (typeof userStore.user?.id !== 'string')
        return { success: false, data: null, error: 'user.id not string' };
    if (typeof userStore.user.name !== 'string')
        return { success: false, data: null, error: 'user.name not string' };
    if (typeof userStore.user.secret !== 'string')
        return { success: false, data: null, error: 'user.secret not string' };
    if (typeof userStore.user.pfpHash !== 'string')
        return { success: false, data: null, error: 'user.pfpHash not string' };

    return { success: true, data: userStore };
};

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
    const existingUsersParseResult = parseUerStore(
        JSON.parse(localStorage.getItem('users') || 'null'),
    );

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
    const existingUsersParseResult = parseUerStore(
        JSON.parse(localStorage.getItem('user') || 'null'),
    );
    if (!existingUsersParseResult.success) {
        console.error(
            'Failed to parse existing users',
            existingUsersParseResult.error,
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
          status: 'pending';
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
            status: status === 'loading' ? 'pending' : status,
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
