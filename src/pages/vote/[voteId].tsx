import { useChannelMessage } from '@onehop/react';
import { animated, config, useSpring } from '@react-spring/web';
import { clsx } from 'clsx';
import { useRouter } from 'next/router';
import { memo, useMemo } from 'react';

import { type Vote } from '@/server/hop';
import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, 86];

const usePokerId = () => {
    const router = useRouter();
    return Array.isArray(router.query.voteId)
        ? router.query.voteId[0]
        : router.query.voteId;
};

const useVotes = () => {
    const pokerId = usePokerId();
    const { data } = api.vote.pokerState.getVotes.useQuery(
        { pokerId: pokerId ?? '' },
        {
            enabled: !!pokerId,
        }
    );

    return data;
};

export default function Vote() {
    const pokerId = usePokerId();
    const utils = api.useContext();
    const votes = useVotes();
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

    const doVote = (vote: number) => {
        if (!pokerId || !anonUser) return;
        mutate({
            choice: vote.toString(),
            voteId: pokerId,
            anonUser,
        });
    };

    const { votesMap, currentVote } = useMemo(() => {
        const currentVote = votes?.find(
            v => (v.user?.id ?? v.anonUser?.id) === anonUser?.id
        );

        const votesMap =
            votes?.reduce(
                (acc, v) => ({
                    ...acc,
                    [v.choice]: (acc[v.choice] ?? 0) + 1,
                }),
                {} as Record<string, number>
            ) ?? {};

        /// get the highest vote
        const highestVote = Object.entries(votesMap).reduce(
            (a, e): [string, number] => (e[1] > a[1] ? e : a),
            ['-1', 0] as [string, number]
        );

        return { currentVote, votesMap, highestVote: highestVote[0] };
    }, [votes, anonUser]);

    return (
        <div className="grid h-full w-screen max-w-screen-2xl place-items-center text-white">
            <HandleUpdates />
            <div className="relative flex h-[80%] w-[90%] flex-col justify-center overflow-hidden rounded-3xl border border-[#C9C9C9]/30 bg-[#000]/60 px-4 shadow-2xl md:w-[600px] lg:w-[1200px]">
                <div className="mx-auto flex flex-wrap gap-4">
                    {voteOptions.map(vote => (
                        <VoteButton
                            key={vote}
                            vote={vote}
                            currentVotes={votesMap[vote.toString()] ?? 0}
                            totalVotes={votes?.length ?? 0}
                            doVote={doVote}
                            current={currentVote?.choice === vote.toString()}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

const VoteButton = memo(function VoteButton({
    vote,
    doVote,
    currentVotes,
    totalVotes,
    current,
}: {
    current: boolean;
    vote: number;
    doVote: (vote: number) => void;
    currentVotes: number;
    totalVotes: number;
}) {
    const height = (currentVotes / totalVotes) * 100;
    const styles = useSpring({
        height: isNaN(height) ? "0%" :`${height}%` ,
        config:  config.wobbly,
    });

    return (
        <div className="my-2 flex flex-col">
            <div className="relative mx-auto mb-1 h-24 rotate-180 ">
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
            </button>
        </div>
    );
})

const HandleUpdates = () => {
    const pokerId = usePokerId();
    const utils = api.useContext();

    // This hook causes a re-render on every message
    useChannelMessage(
        `poker_${pokerId ?? ''}`,
        'VOTE_UPDATE',
        (updatedVote: Vote) => {
            utils.vote.pokerState.getVotes.setData(
                { pokerId: pokerId ?? '' },
                old => {
                    if (!old) return [updatedVote];
                    const index = old.findIndex(v => v.id === updatedVote.id);
                    if (index === -1) return [...old, updatedVote];
                    const copy = [...old];
                    copy[index] = updatedVote;
                    return copy;
                }
            );
        }
    );
    return null;
};
