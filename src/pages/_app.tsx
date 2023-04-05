import { env } from '@/env.mjs';
import '@/styles/globals.css';
import { useEffect } from 'react';
import { type AppType } from 'next/app';
import { hop } from '@onehop/client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { api } from '@/utils/api';
import { Nav } from '@/components/nav';

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
            <ReactQueryDevtools initialIsOpen={false} />
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
