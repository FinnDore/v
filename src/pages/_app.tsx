import { env } from '@/env.mjs';
import '@/styles/globals.css';
import { useEffect } from 'react';
import { type AppType } from 'next/app';
import { hop } from '@onehop/client';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

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
    console.log(user);
    const pictureName = encodeURIComponent(name ?? '');
    return (
        <nav className="absolute flex w-full px-4 py-4">
            {name && (
                <>
                    <div className="relative my-auto ms-auto aspect-square w-6 cursor-pointer transition-all hover:scale-110">
                        <div className="absolute z-10 h-full w-full overflow-clip rounded-full border border-white/40 ">
                            <picture className="block h-[100px] w-[100px] overflow-clip">
                                <source
                                    srcSet={'/NOISE.webp'}
                                    type="image/webp"
                                />
                                <img alt={`profile picture for ${name}`} />
                            </picture>
                        </div>
                        <picture className="absolute h-full w-full rounded-full">
                            <source
                                srcSet={`https://avatars.jakerunzer.com/${pictureName}`}
                            />
                            <img alt={`profile picture for ${name}`} />
                        </picture>
                        <picture className="block h-full w-full blur-md saturate-150">
                            <source
                                srcSet={`https://avatars.jakerunzer.com/${pictureName}`}
                            />
                            <img
                                className="h-full w-full"
                                alt={`profile picture for ${name}`}
                            />
                        </picture>
                    </div>
                    <div className="ml-3 mr-4 text-2xl">{name}</div>
                </>
            )}
        </nav>
    );
};
