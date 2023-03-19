import { type NextPage } from 'next';
import { useRouter } from 'next/router';

import { api } from '../utils/api';

const Home: NextPage = () => {
    // const session = useSession();
    const router = useRouter();
    const { mutate: createVote } = api.vote.createVote.useMutation({
        async onSuccess(vote) {
            await router.push('/vote/[...vote]', `/vote/${vote.id}`, {
                shallow: true,
            });
        },
    });
    return (
        <div className="grid h-screen w-screen place-items-center">
            {/* //     {session.data && <div>Logged in as {session.data.user.email}</div>}
        //     {!session.data && (
        //         <button onClick={() => void signIn('github')}>Sign in</button>
        //     )}
        //     {session.data && (
        //         <button onClick={() => void signOut()}>Sign out</button>
        //     )} */}
            <button onClick={() => createVote()}>createVote</button>
        </div>
    );
};

export default Home;
