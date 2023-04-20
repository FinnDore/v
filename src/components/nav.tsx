import Link from 'next/link';
import { useRouter } from 'next/router';
import { EnterIcon } from '@radix-ui/react-icons';

import { useUser } from '@/utils/local-user';
import { Glitch } from './glitch';
import { Pfp } from './pfp';

export const Nav = () => {
    const router = useRouter();
    const { user, status } = useUser();

    return (
        <nav className="mx-auto flex w-full min-w-max px-6 py-4 sm:px-12 lg:max-w-screen-lg">
            <Link className="flex text-2xl" href="/">
                <b>V</b>
                <Glitch text="ote" />
            </Link>
            {user && (
                <>
                    <Link href="/me" className="me-6 ms-auto">
                        <button className="rounded-md border border-transparent px-3 py-2 transition-colors hover:border-black/50 dark:hover:border-white/50 dark:hover:bg-white/10">
                            My Votes
                        </button>
                    </Link>
                    <Pfp
                        image={user.image}
                        name={user.name ?? undefined}
                        pfpHash={user.pfpHash}
                        className="my-auto mr-3 w-6"
                    />
                    <div className="my-auto h-min">{user.name}</div>
                </>
            )}
            {status === 'unauthenticated' && (
                <button
                    onClick={() => void router.push(`/login`)}
                    className="ms-auto flex rounded-md border border-transparent px-3 py-2 transition-colors hover:border-black/50 dark:hover:border-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                >
                    <EnterIcon className="my-auto mr-2" />
                    Login
                </button>
            )}
        </nav>
    );
};
