import { api } from '@/utils/api';
import { type NextPage } from 'next';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
    // const session = useSession();
    const router = useRouter();
    // const { mutate: createVote } = api.vote.createVote.useMutation({
    //     async onSuccess(vote) {
    //         await router.push('/vote/[...vote]', `/vote/${vote.id}`, {
    //             shallow: true,
    //         });
    //     },
    // });
    const { data } = api.vote.getVotes.useQuery();
    return (
        <div className="grid h-screen w-screen place-items-center">
            {/* <button onClick={() => createVote()}>createVote</button> */}
        </div>
    );
};

export default Home;
