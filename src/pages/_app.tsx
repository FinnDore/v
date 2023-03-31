import { env } from '@/env.mjs';
import '@/styles/globals.css';
import { hop } from '@onehop/client';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { type AppType } from 'next/app';
import { useEffect } from 'react';

import { api } from '@/utils/api';
import { useUser } from '@/utils/local-user';

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        hop.init({
            projectId: env.NEXT_PUBLIC_HOP_PROJECT_ID,
        });
    }, []);

    return (
        <SessionProvider session={session}>
            <Nav />
            <Component {...pageProps} />
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);

const Nav = () => {
    const { status, user } = useUser();
    const name = status === 'authenticated' ? user.user.name : user?.name;

    return (
        <nav className="flex w-full px-4 py-4 absolute">
            <div className="ml-auto mr-4 text-2xl">{name}</div>
        </nav>
    );
};
