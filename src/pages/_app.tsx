import { env } from '@/env.mjs';
import '@/styles/globals.css';
import { useEffect } from 'react';
import { type AppType } from 'next/app';
import { useRouter } from 'next/router';
import { hop } from '@onehop/client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { api } from '@/utils/api';
import { Nav } from '@/components/nav';

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    const router = useRouter();
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

            <footer className="mt-auto w-full pb-4 text-center">
                Made with ❤️ by{' '}
                <a
                    href="https://github.com/FinnDore"
                    aria-label="Link to Finns Github"
                    className="underline"
                    target="_blank"
                    rel="noreferrer"
                >
                    Finn
                </a>
            </footer>
            <ReactQueryDevtools initialIsOpen={false} />

            <SpeedInsights route={router.pathname} />
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
