import Link from 'next/link';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';

const Me = () => {
    const anonUser = useAnonUser();
    const myVotesQuery = api.me.myVotes.useQuery({
        anonUser,
    });

    return (
        <div className="mx-auto my-auto flex h-max w-max max-w-full flex-col place-items-center justify-center px-6 py-6 sm:px-12 lg:max-w-screen-lg">
            <h1>My Votes</h1>
            <div className="flex flex-col gap-3">
                {myVotesQuery.data?.map(vote => (
                    <Link
                        href={`/vote/${vote.id}`}
                        key={vote.id}
                        className="underline"
                    >
                        {vote.id} last updated at
                        {vote.updatedAt.toLocaleString()}
                    </Link>
                ))}
            </div>
        </div>
    );
};
export default Me;
