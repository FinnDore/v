import Link from 'next/link';

import { useUser } from '@/utils/local-user';
import { Glitch } from './glitch';
import { Pfp } from './pfp';

export const Nav = () => {
    const { user } = useUser();

    return (
        <nav className="mx-auto flex w-full min-w-max max-w-[90ch] px-6 py-4 sm:px-12">
            <Link className="flex text-2xl" href="/">
                <b>V</b>
                <Glitch text="ote" />
            </Link>
            {user && (
                <div className="text-md  ml-auto mr-4 flex align-middle">
                    <Pfp
                        image={user.image}
                        name={user.name ?? undefined}
                        pfpHash={user.pfpHash}
                        className="my-auto mr-3 ms-auto w-6"
                    />
                    <div className="my-auto h-min">{user.name}</div>
                </div>
            )}
        </nav>
    );
};
