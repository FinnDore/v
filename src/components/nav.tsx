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
        <nav className="mx-auto flex h-[70px] w-full min-w-max px-6 py-4 sm:px-12 lg:max-w-screen-lg">
            <Link className="flex text-2xl" href="/">
                <b>V</b>
                <Glitch text="ote" />
            </Link>
            {user && (
                <>
                    <Link href="/create" className="me-2 ms-auto">
                        <button className="rounded-md border border-transparent px-3 py-2 text-sm transition-colors hover:border-black/50 dark:hover:border-white/50 dark:hover:bg-white/10">
                            Create Vote
                        </button>
                    </Link>

                    <Link href="/me" className="me-6">
                        <button className="rounded-md border border-transparent px-3 py-2 text-sm transition-colors hover:border-black/50 dark:hover:border-white/50 dark:hover:bg-white/10">
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
                    <span className="my-auto flex">
                        <EnterIcon className="my-auto mr-2" />
                        <span className="my-auto leading-none">Login</span>
                    </span>
                </button>
            )}
        </nav>
    );
};
