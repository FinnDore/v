import { Main, NextScript } from 'next/document';

export default function Document({
    Html,
    Head,
    Body,
    children,
    ...props
}: DocumentProps) {
    return (
        <Html
            style={{
                background: '#000',
            }}
        >
            <title>Finn</title>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
