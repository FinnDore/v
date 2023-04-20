import Link from 'next/link';
import clsx from 'clsx';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { Pfp } from '@/components/pfp';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tool-tip';

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
                        className="flex w-96 rounded-md border border-black/70 px-6 py-4 hover:border-black dark:border-white/60 hover:dark:border-white"
                    >
                        <Link href={`/vote/${vote.id}`}>
                            {vote.title || 'Unnamed Poker Session'}
                        </Link>
                        <div className="mr-3 ms-auto text-sm !no-underline opacity-80">
                            {vote.userInVote.length} users
                        </div>
                        {vote.userInVote.length > 0 && (
                            <div className="relative flex w-min flex-row-reverse pr-[14px]">
                                {vote.userInVote.map((userInVote, i) => (
                                    <TooltipProvider
                                        delayDuration={300}
                                        key={userInVote.id}
                                    >
                                        <Tooltip>
                                            <TooltipTrigger
                                                asChild
                                                style={{
                                                    zIndex:
                                                        vote.userInVote.length -
                                                        i,
                                                }}
                                            >
                                                <Pfp
                                                    className={clsx(
                                                        'mr-[-14px] w-6',
                                                        {}
                                                    )}
                                                    style={{
                                                        zIndex: i,
                                                    }}
                                                    name={
                                                        userInVote.user?.name ??
                                                        userInVote.anonUser
                                                            ?.name
                                                    }
                                                    pfpHash={
                                                        userInVote.anonUser
                                                            ?.pfpHash
                                                    }
                                                    image={
                                                        userInVote.user?.image
                                                    }
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                {userInVote.user?.name ??
                                                    'Anonymous User'}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Me;
