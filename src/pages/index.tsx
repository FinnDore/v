import { type NextPage } from 'next';
import { useRouter } from 'next/router';

import { api } from '../utils/api';

const Home: NextPage = () => {
    // const session = useSession();
    const router = useRouter();
    const { mutate: createVote } = api.vote.upsertVote.useMutation({
        async onSuccess(vote) {
            await router.push('/vote/[...vote]', `/vote/${vote.id}`, {
                shallow: true,
            });
        },
    });
    return (
        <div className="grid h-screen w-screen place-items-center">
            <button onClick={() => createVote()}>createVote</button>
        </div>
    );
};

export default Home;
