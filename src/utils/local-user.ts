import { type AnonUser } from '@prisma/client';
import { useSession } from 'next-auth/react';

import { useRouter } from 'next/router';
import { useMemo, version } from 'react';
import { z } from 'zod';

const LocalUserStoreSchema = z.object({
    version: z.string(),
    users: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            secret: z.string().cuid(),
            voteId: z.string().cuid(),
        })
    ),
});

type LocalUserStore = z.infer<typeof LocalUserStoreSchema>;

export function useAnonUser() {
    const router = useRouter();
    const voteId = Array.isArray(router.query.voteId)
        ? router.query.voteId[0]
        : router.query.voteId;

    return useMemo(() => {
        if (typeof window === 'undefined') return null;
        const localUserStore = getLocalUserStore();

        return (
            localUserStore?.users.find(user => user.voteId === voteId) ?? null
        );
    }, [voteId]);
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
    const existingUsers = existingUsersParseResult.success
        ? existingUsersParseResult.data
        : { users: [] as LocalUserStore['users'][number][], version };

    existingUsers.users.push({
        id: user.id,
        name: user.name,
        secret: user.secret,
        voteId: user.voteId,
    });

    localStorage.setItem('users', JSON.stringify(existingUsers));
}

function getLocalUserStore() {
    const existingUsersParseResult = LocalUserStoreSchema.safeParse(
        JSON.parse(localStorage.getItem('users') ?? 'null')
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
