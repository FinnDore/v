import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html
            style={{
                background: '#000',
                color: 'white',
            }}
        >
            <title>Finn</title>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <body className="h-screen">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
