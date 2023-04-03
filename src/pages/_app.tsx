import { env } from '@/env.mjs';
import '@/styles/globals.css';
import { useEffect } from 'react';
import { type AppType } from 'next/app';
import { hop } from '@onehop/client';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { api } from '@/utils/api';
import { useUser } from '@/utils/local-user';
import { Glitch } from '@/components/glitch';
import { Pfp } from '@/components/pfp';

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
        <nav className="pointer-events-none mx-auto flex w-full min-w-max max-w-screen-lg px-4 py-4">
            <div className="pointer-events-auto flex text-2xl">
                <b>V</b>
                <Glitch text="ote" />
            </div>
            {name && (
                <div className="text-md pointer-events-auto ml-auto mr-4 flex align-middle">
                    <Pfp name={name} className="my-auto mr-3 ms-auto w-6" />
                    <div className="my-auto h-min">{name}</div>
                </div>
            )}
        </nav>
    );
};
