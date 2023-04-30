import { Head, Html, Main, NextScript } from 'next/document';

import { env } from '@/env.mjs';

export default function Document() {
    return (
        <Html
            style={{
                background: '#000',
                color: 'white',
            }}
        >
            <title>Vote</title>
            <Head>
                <link rel="icon" href="/favicon.ico" />
                {env.PROD && (
                    <script
                        async
                        defer
                        data-website-id="2b7c5ed7-8f27-4b03-bdab-622ef35a1e33"
                        src="https://umami.finndore.dev/umami.js"
                    ></script>
                )}
            </Head>
            <body className="h-screen bg-white text-black dark:bg-black dark:text-white">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
