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

    const { mutateAsync: joinVote } = api.vote.lobby.joinVote.useMutation();

    const { mutate: createAccount, isLoading } =
        api.vote.createAccount.useMutation({
            onSuccess: async user => {
                storeUser(user);
                if (!voteId) return;
                await joinVote({ voteId, anonUser: user });
                void router.push(`/vote/${user.voteId}`);
            },
        });

    if (!voteId) return <div>no voteId</div>;

    return (
        <div className="grid h-screen w-screen place-items-center">
            <input
                className="border-2 border-gray-800 bg-black text-white"
                max={20}
                min={3}
                value={name}
                onChange={e => setName(e.target.value)}
            />
            Min name length 3
            <button
                onClick={() =>
                    !isLoading &&
                    createAccount({
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
