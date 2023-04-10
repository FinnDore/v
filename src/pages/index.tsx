import { type PropsWithChildren } from 'react';
import { type NextPage } from 'next';
import Link from 'next/link';
import { signIn, signOut } from 'next-auth/react';

const Home: NextPage = () => {
    return (
        <div className="mx-auto my-auto flex h-max w-max max-w-full place-items-center gap-12 px-12 py-6 lg:max-w-screen-lg">
            <Link href="/create">Create Vote</Link>

            <button onClick={() => void signOut()}>Logout</button>
        </div>
    );
};

export default Home;

const VoteButton = ({ children }: PropsWithChildren) => {
    return (
        <>
            <button
                className="relative aspect-[16/12] w-full text-white transition-all"
                onClick={() => void signIn('github')}
            >
                <div className="-z-1 absolute -bottom-1 left-0 h-4 w-full rounded-b-sm bg-orange-600"></div>
                <div
                    className={
                        'z-1 absolute top-0 flex h-full w-full rounded-sm  border-2 border-orange-400 bg-orange-600 text-white shadow-[inset_1px_1px_12px_#0000004f] transition-all hover:bg-orange-500'
                    }
                >
                    <div className="m-auto">{children}</div>
                </div>
            </button>
        </>
    );
};
