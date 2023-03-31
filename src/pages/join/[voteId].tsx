import { useState } from 'react';
import { type NextPage } from 'next';
import { useRouter } from 'next/router';

import { storeUser } from '@/utils/local-user';
import { api } from '../../utils/api';

const Home: NextPage = () => {
    const [name, setName] = useState('');
    const router = useRouter();
    const voteId = Array.isArray(router.query.voteId)
        ? router.query.voteId[0]
        : router.query.voteId;

    const { mutate: joinVote, isLoading } = api.vote.joinPoker.useMutation({
        onSuccess: user => {
            storeUser(user);
            void router.push(`/vote/${user.voteId}`);
        },
    });

    if (!voteId) {
        return <div>no voteId</div>;
    }

    return (
        <div className="grid h-screen w-screen place-items-center">
            <input
                className="border-2 border-gray-800 bg-black text-white"
                max={20}
                min={1}
                value={name}
                onChange={e => setName(e.target.value)}
            />
            <button
                onClick={() =>
                    !isLoading &&
                    joinVote({
                        voteId,
                        name,
                    })
                }
            >
                join vote
            </button>
        </div>
    );
};

export default Home;
