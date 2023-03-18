import { type NextPage } from 'next';
import { signIn, signOut, useSession } from 'next-auth/react';

const Home: NextPage = () => {
    const session = useSession();
    return (
        <>
            {session.data && <div>Logged in as {session.data.user.email}</div>}
            {!session.data && (
                <button onClick={() => void signIn('github')}>Sign in</button>
            )}
            {session.data && (
                <button onClick={() => void signOut()}>Sign out</button>
            )}
        </>
    );
};

export default Home;
