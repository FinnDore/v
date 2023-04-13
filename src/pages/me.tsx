import Link from 'next/link';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { Pfp } from '@/components/pfp';

const Me = () => {
    const anonUser = useAnonUser();
    const myVotesQuery = api.me.myVotes.useQuery({
        anonUser,
    });

    return (
        <div className="mx-auto my-auto flex h-max w-max max-w-full flex-col place-items-center justify-center px-6 py-6 sm:px-12 lg:max-w-screen-lg">
            <h1 className="mb-3 text-2xl">My Votes</h1>
            <div className="flex flex-col gap-3">
                {myVotesQuery.data?.map(vote => (
                    <div
                        key={vote.id}
                        className="flex w-96 rounded-md border border-black/70 px-6 py-4 underline hover:border-black dark:border-white/60 hover:dark:border-white"
                    >
                        <Link href={`/vote/${vote.id}`}>
                            {vote.title ?? 'Unnamed Vote'}
                        </Link>
                        <div className="ms-auto flex w-min gap-1">
                            {vote.userInVote.map(userInVote => (
                                <Pfp
                                    className="w-6"
                                    key={userInVote.id}
                                    name={
                                        userInVote.user?.name ??
                                        userInVote.anonUser?.name
                                    }
                                    pfpHash={userInVote.anonUser?.pfpHash}
                                    image={userInVote.user?.image}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Me;
