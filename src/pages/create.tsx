import { useRouter } from 'next/router';

import { api } from '@/utils/api';
import { Button } from '@/components/button';

const CreatePoker = () => {
    const router = useRouter();
    const { mutate: createVote } = api.vote.createPoker.useMutation({
        async onSuccess(vote) {
            await router.push('/join/[voteId]', `/join/${vote.id}`, {
                shallow: true,
            });
        },
    });

    return (
        <div>
            <h1>Create Poker</h1>
            <Button
                onClick={() => createVote()}
                className="my-auto h-full bg-black"
            >
                Start Pointing Poker
            </Button>
        </div>
    );
};

export default CreatePoker;
