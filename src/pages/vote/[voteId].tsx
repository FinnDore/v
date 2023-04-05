import { useMemo, useState } from 'react';
import { animated, config, useSpring } from '@react-spring/web';
import { clsx } from 'clsx';

import { useAnonUser } from '@/utils/local-user';
import { Button } from '@/components/button';
import { Pfp } from '@/components/pfp';
import { useVotes } from '@/hooks/poker-hooks';
import { useHopUpdates } from '@/hooks/use-hop-updates';

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, 86];
const Vote = () => {
    const anonUser = useAnonUser();
    const { doVote, votes } = useVotes();
    const [showResults, setShowResults] = useState(false);
    useHopUpdates();

    const { votesMap, currentVote, highestVote } = useMemo(() => {
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

        return { currentVote, votesMap, highestVote: highestVote };
    }, [votes, anonUser]);

    return (
        <div className="mx-auto flex h-full w-max max-w-full flex-col place-items-center px-12 lg:max-w-screen-lg">
            <animated.div className="mx-auto mt-6 flex flex-wrap gap-4">
                {voteOptions.map(vote => (
                    <VoteButton
                        key={vote}
                        vote={vote}
                        showVotes={showResults}
                        users={votesMap[vote.toString()]?.users ?? []}
                        currentVotes={votesMap[vote.toString()]?.count ?? 0}
                        totalVotes={highestVote[1]}
                        doVote={doVote}
                        current={currentVote?.choice === vote.toString()}
                    />
                ))}
            </animated.div>
            <div className="mt-8 max-w-[85ch] whitespace-break-spaces">
                <h1 className="mb-4 text-2xl">
                    <b>EUI-420</b>
                </h1>
                <p>
                    Contrary to popular belief, Lorem Ipsum is not simply random
                    text. It has roots in a piece of classical Latin literature
                    from 45 BC, making it over 2000 years old. Richard
                    McClintock, a Latin professor at Hampden-Sydney College in
                    Virginia, looked up one of the more obscure Latin words,
                    consectetur, from a Lorem Ipsum passage, and going through
                    the cites of the word in classical literature, discovered
                    the undoubtable source. Lorem Ipsum comes from sections
                    1.10.32 and 1.10.33 of de Finibus Bonorum et Malorum (The
                    Extremes of Good and Evil) by Cicero, written in 45 BC. This
                    book is a treatise on the theory of ethics, very popular
                    during the Renaissance. The first line of Lorem Ipsum, Lorem
                    ipsum dolor sit amet.., comes from a line in section
                    1.10.32.
                </p>
                <div className="mb-4 flex w-full gap-4">
                    <Button
                        size={'sm'}
                        className="ms-auto"
                        onClick={() => {
                            setShowResults(x => !x);
                        }}
                    >
                        {showResults ? 'Hide Results' : 'Show Results'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const VoteButton = function VoteButton({
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
        height: !showVotes ? 0 : 120,
        opacity: !showVotes ? 0 : 1,
        config: showVotes ? config.wobbly : config.default,
    });

    return (
        <div className="mx-auto my-2 flex flex-col">
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
};

export default Vote;
