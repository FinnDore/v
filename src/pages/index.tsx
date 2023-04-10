import { type NextPage } from 'next';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

const Home: NextPage = () => {
    return (
        <div className="mx-auto my-auto flex h-max w-max max-w-full place-items-center gap-12 px-12 py-6 lg:max-w-screen-lg">
            <Link href="/create">Create Vote</Link>

            <button onClick={() => void signOut()}>Logout</button>
        </div>
    );
};

export default Home;
