import { env } from '@/env.mjs';
import '@/styles/globals.css';
import { useEffect } from 'react';
import { type AppType } from 'next/app';
import Head from 'next/head';
import { hop } from '@onehop/client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Analytics } from '@vercel/analytics/react';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { api } from '@/utils/api';
import { Nav } from '@/components/nav';

const MyApp: AppType<{
    session: Session | null;

    voteId?: string | null;
}> = ({ Component, pageProps: { session, ...pageProps } }) => {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        hop.init({
            projectId: env.NEXT_PUBLIC_HOP_PROJECT_ID,
        });
    }, []);

    return (
        <SessionProvider session={session}>
            <Head>
                <title>Vote</title>
                {pageProps.voteId && (
                    <meta
                        property="og:image"
                        content={`https://v.finndore.dev/api/qrcode/${encodeURIComponent(
                            pageProps.voteId
                        )}`}
                    />
                )}
                <script
                    async
                    defer
                    data-website-id="2b7c5ed7-8f27-4b03-bdab-622ef35a1e33"
                    src="https://umami.finndore.dev/umami.js"
                ></script>
                <meta name="twitter:card" content="summary_large_image"></meta>
                <meta name="theme-color" content="#000" />
            </Head>
            <Nav />
            <Component {...pageProps} />
            <ReactQueryDevtools initialIsOpen={false} />
            <Analytics />
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
