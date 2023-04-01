import { memo, useMemo } from 'react';
import { animated, config, useSpring } from '@react-spring/web';
import { clsx } from 'clsx';
import { usePokerId, useVotes } from 'hooks/poker-hooks';
import { useHopUpdates } from 'hooks/use-hop-updates';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { Pfp } from '@/components/pfp';

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, 86];
const useVote = () => {
    const pokerId = usePokerId();
    const utils = api.useContext();
    const anonUser = useAnonUser();
    const { mutate } = api.vote.vote.useMutation({
        onMutate: ({ anonUser, choice, voteId }) => {
            utils.vote.pokerState.getVotes.setData(
                {
                    pokerId: voteId,
                },
                old => {
                    const newVotes = [...(old ?? [])];
                    const item = newVotes.find(
                        v => (v.user?.id ?? v.anonUser?.id) === anonUser?.id
                    );
                    if (item) item.choice = choice;
                    return newVotes;
                }
            );
        },
        onError: (_err, args) => {
            void utils.vote.pokerState.getVotes.refetch({
                pokerId: args.voteId,
            });
        },
    });

    return {
        doVote: (choice: number) =>
            pokerId &&
            anonUser &&
            mutate({ choice: choice.toString(), voteId: pokerId, anonUser }),
    };
};

const Vote = () => {
    const votes = useVotes();
    const anonUser = useAnonUser();
    const { doVote } = useVote();

    useHopUpdates();

    const { votesMap, currentVote } = useMemo(() => {
        const currentVote = votes?.find(
            v => (v.user?.id ?? v.anonUser?.id) === anonUser?.id
        );

        const votesMap =
            votes?.reduce(
                (acc, v) => ({
                    ...acc,
                    [v.choice]: {
                        count: (acc[v.choice]?.count ?? 0) + 1,
                        users: [
                            ...(acc[v.choice]?.users ?? []),
                            v.user?.name ?? v.anonUser?.name ?? '',
                        ],
                    },
                }),
                {} as Record<string, { count: number; users: string[] }>
            ) ?? {};

        /// get the highest vote
        const highestVote = Object.entries(votesMap).reduce(
            (a, e): [string, number] =>
                e[1].count > a[1] ? [e[0], e[1].count] : a,
            ['-1', 0] as [string, number]
        );

        return { currentVote, votesMap, highestVote: highestVote[0] };
    }, [votes, anonUser]);

    return (
        <div className="grid h-full w-screen max-w-screen-2xl place-items-center text-white">
            <div className="mx-auto flex flex-wrap gap-4">
                {voteOptions.map(vote => (
                    <VoteButton
                        key={vote}
                        vote={vote}
                        users={votesMap[vote.toString()]?.users ?? []}
                        currentVotes={votesMap[vote.toString()]?.count ?? 0}
                        totalVotes={votes?.length ?? 0}
                        doVote={doVote}
                        current={currentVote?.choice === vote.toString()}
                    />
                ))}
            </div>
        </div>
    );
};

const VoteButton = memo(function VoteButton({
    vote,
    doVote,
    currentVotes,
    totalVotes,
    current,
    users,
}: {
    current: boolean;
    vote: number;
    doVote: (vote: number) => void;
    currentVotes: number;
    totalVotes: number;
    users: string[];
}) {
    const height = (currentVotes / totalVotes) * 100;
    const styles = useSpring({
        height: isNaN(height) ? '0%' : `${height}%`,
        config: config.wobbly,
    });

    return (
        <div className="my-2 flex flex-col">
            <div className="relative mx-auto mb-1 h-48 rotate-180 ">
                <div className="absolute z-10 h-1/3 w-full bg-gradient-to-b from-white to-transparent dark:from-black"></div>
                <animated.div
                    style={styles}
                    className="w-8 rounded-b-md border border-orange-400 bg-orange-600"
                ></animated.div>
            </div>
            <button
                className={clsx(
                    'relative h-12 w-16 text-white transition-all',
                    {
                        'opacity-70': !current,
                    }
                )}
                onClick={() => doVote(vote)}
            >
                <div className="-z-1 absolute -bottom-1 left-0 h-4 w-full rounded-b-sm bg-orange-600"></div>
                <div
                    className={clsx(
                        'z-1 absolute top-0 flex h-full w-full rounded-sm border-2 border-orange-400 bg-orange-600 text-white transition-all hover:bg-orange-500',
                        {
                            '-top-1 shadow-[inset_1px_1px_12px_#0000004f]':
                                current,
                        }
                    )}
                >
                    <div className="m-auto">{vote}</div>
                </div>
                <div className="absolute -top-2 right-0 flex">
                    {users.map((user, i) => (
                        <div
                            className="animate-[floatIn_250ms_ease-out] "
                            style={{
                                zIndex: i + 1,
                            }}
                            key={i}
                        >
                            <Pfp
                                style={{
                                    right: `${i * 0.5}rem`,
                                }}
                                name={user === '' ? 'Anonymous' : user}
                                className={clsx(`absolute h-4 `, {})}
                            />
                        </div>
                    ))}
                </div>
            </button>
        </div>
    );
});

export default Vote;
