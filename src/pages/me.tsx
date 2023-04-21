import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { TrashIcon } from '@radix-ui/react-icons';
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

export function useThrottle<T>(value: T, limit = 1000, defaultValue?: T) {
    const [throttledValue, setThrottledValue] = useState(defaultValue);
    const lastRan = useRef(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit]);

    return throttledValue;
}

const Me = () => {
    const anonUser = useAnonUser();
    const myVotesQuery = api.me.myVotes.useQuery({
        anonUser,
    });

    const deletePokerSessionMutation = api.vote.deletePokerSession.useMutation({
        onSettled: () => {
            void myVotesQuery.refetch();
        },
    });

    const status = useThrottle(myVotesQuery.status, 1000, 'success');

    const deletingVote = deletePokerSessionMutation.variables?.pokerId;

    return (
        <div className=" mx-auto flex h-max w-[95ch] max-w-full flex-col place-items-center justify-center px-6 pb-8 sm:px-12 lg:max-w-screen-lg">
            <div className="flex w-full justify-between">
                <h1 className="mb-3 text-2xl">My Votes</h1>
            </div>
            <div className="flex w-full flex-col gap-3">
                {status === 'loading' && (
                    <div className="relative flex w-full flex-col gap-3">
                        <div className="flex h-[58px] w-full animate-pulse justify-center rounded-md border border-black/25 dark:border-white/25 dark:bg-white/10"></div>
                        <div className="flex h-[58px] w-full animate-pulse justify-center rounded-md border border-black/25 dark:border-white/25 dark:bg-white/10"></div>
                        <div className="flex h-[58px] w-full animate-pulse justify-center rounded-md border border-black/25 dark:border-white/25 dark:bg-white/10"></div>
                        <div className="flex h-[58px] w-full animate-pulse justify-center rounded-md border border-black/25 dark:border-white/25 dark:bg-white/10"></div>
                        <div className="flex h-[58px] w-full animate-pulse justify-center rounded-md border border-black/25 dark:border-white/25 dark:bg-white/10"></div>
                        <div className="flex h-[58px] w-full animate-pulse justify-center rounded-md border border-black/25 dark:border-white/25 dark:bg-white/10"></div>
                        <div className="flex h-[58px] w-full animate-pulse justify-center rounded-md border border-black/25 dark:border-white/25 dark:bg-white/10"></div>
                        <div className="absolute h-full w-full bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>
                )}

                {myVotesQuery.data?.length === 0 && status !== 'loading' && (
                    <div className="flex w-full justify-center">
                        <h1>You have no votes</h1>
                    </div>
                )}
                {status === 'success' &&
                    myVotesQuery.data?.map(vote => (
                        <Link
                            href={`/vote/${vote.id}`}
                            key={vote.id}
                            className={clsx(
                                '[&>.delete]:touch-none:w-6 relative flex w-full rounded-md border border-black/50 px-6 py-4 transition-all hover:scale-105 hover:border-black dark:border-white/50  hover:dark:border-white',
                                {
                                    'opacity-75 [&>*]:pointer-events-none':
                                        deletingVote === vote.id,
                                }
                            )}
                        >
                            {deletingVote === vote.id && (
                                <div className="absolute flex w-full justify-center">
                                    <div className="mt aspect-square h-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white/50"></div>
                                </div>
                            )}

                            <h1>{vote.title || 'Unnamed Session'}</h1>
                            <div className="ms-auto text-sm !no-underline opacity-80">
                                {vote.userInVote.length} user
                                {vote.userInVote.length !== 1 && 's'}
                            </div>
                            {vote.userInVote.length > 0 && (
                                <div className="relative ml-3 flex w-min flex-row-reverse pr-[14px]">
                                    {vote.userInVote.map((user, i) => (
                                        <TooltipProvider
                                            delayDuration={300}
                                            key={user.id}
                                        >
                                            <Tooltip>
                                                <TooltipTrigger
                                                    asChild
                                                    style={{
                                                        zIndex:
                                                            vote.userInVote
                                                                .length - i,
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
                                                            user.user?.name ??
                                                            user.anonUser?.name
                                                        }
                                                        pfpHash={
                                                            user.anonUser
                                                                ?.pfpHash
                                                        }
                                                        image={user.user?.image}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    {user.user?.name ??
                                                        user.anonUser?.name ??
                                                        'Anonymous User'}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </div>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={e => {
                                                if (
                                                    deletePokerSessionMutation.isLoading
                                                )
                                                    return;
                                                deletePokerSessionMutation.mutate(
                                                    {
                                                        pokerId: vote.id,
                                                        anonUser,
                                                    }
                                                );

                                                e.preventDefault();
                                            }}
                                            className="ms-2 flex h-full w-6 justify-center overflow-hidden rounded-sm align-middle text-rose-600 transition-all dark:hover:bg-white/10"
                                        >
                                            <TrashIcon
                                                height={20}
                                                width={20}
                                                className="my-auto"
                                            />
                                        </button>
                                    </TooltipTrigger>

                                    <TooltipContent side="bottom">
                                        Delete
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Link>
                    ))}
            </div>
        </div>
    );
};
export default Me;
