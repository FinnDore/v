import { memo, useMemo, useState } from 'react';
import { animated, config, useSpring } from '@react-spring/web';
import { clsx } from 'clsx';
import { usePokerId, useVotes } from 'hooks/poker-hooks';
import { useHopUpdates } from 'hooks/use-hop-updates';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { Button } from '@/components/button';
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
        doVote: (choice: number) => {
            if (!pokerId || !anonUser) return;

            mutate({ choice: choice.toString(), voteId: pokerId, anonUser });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            window.navigator.vibrate([10]);
        },
    };
};

const Vote = () => {
    const votes = useVotes();
    const anonUser = useAnonUser();
    const { doVote } = useVote();
    const [showResults, setShowResults] = useState(false);
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
        <div className="flex h-full w-screen max-w-screen-2xl flex-col place-items-center text-white">
            <div className="mb-4 flex gap-4">
                <Button
                    onClick={() => {
                        setShowResults(x => !x);
                    }}
                >
                    {showResults ? 'Hide Results' : 'Show Results'}
                </Button>
            </div>
            <animated.div className="mx-auto flex flex-wrap gap-4">
                {voteOptions.map(vote => (
                    <VoteButton
                        key={vote}
                        vote={vote}
                        showVotes={showResults}
                        users={votesMap[vote.toString()]?.users ?? []}
                        currentVotes={votesMap[vote.toString()]?.count ?? 0}
                        totalVotes={votes?.length ?? 0}
                        doVote={doVote}
                        current={currentVote?.choice === vote.toString()}
                    />
                ))}
            </animated.div>
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
    showVotes,
}: {
    current: boolean;
    vote: number;
    doVote: (vote: number) => void;
    currentVotes: number;
    totalVotes: number;
    users: string[];
    showVotes: boolean;
}) {
    const height = (currentVotes / totalVotes) * 100;
    const styles = useSpring({
        height: !showVotes || isNaN(height) ? '0%' : `${height}%`,
        config: config.wobbly,
    });

    const outerStyles = useSpring({
        height: !showVotes ? 0 : 196,
        opacity: !showVotes ? 0 : 1,
        config: config.gentle,
    });

    return (
        <div className="my-2 flex flex-col">
            <animated.div
                className="relative mx-auto mb-1 rotate-180"
                style={outerStyles}
            >
                <div className="absolute -top-1 z-10 h-1/3 w-full bg-gradient-to-b from-white to-transparent dark:from-black"></div>
                <animated.div
                    style={styles}
                    className="w-8 rounded-b-md border border-orange-400 bg-orange-600"
                ></animated.div>
            </animated.div>
            <button
                className={clsx(
                    'relative h-12 w-16 text-white transition-all',
                    {
                        'opacity-60': !current,
                    }
                )}
                onClick={() => doVote(vote)}
            >
                <div className="-z-1 absolute -bottom-1 left-0 h-4 w-full rounded-b-sm bg-orange-600"></div>
                <div
                    className={clsx(
                        'z-1 absolute top-0 flex h-full w-full rounded-sm border-2 border-orange-400 bg-orange-600 text-white transition-all hover:bg-orange-500',
                        {
                            '-top-1 border shadow-[inset_1px_1px_12px_#0000004f]':
                                current,
                        }
                    )}
                >
                    <div className="m-auto">{vote}</div>
                </div>
                {showVotes && (
                    <div className="absolute -top-2 right-0 flex place-content-center">
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
                                    border={current ? 'border-white' : ''}
                                    name={user === '' ? 'Anonymous' : user}
                                    className={clsx(`absolute h-4 `, {})}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </button>
        </div>
    );
});

export default Vote;
