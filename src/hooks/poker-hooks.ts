import { useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { useChannelMessage } from '@onehop/react';
import { parse } from 'superjson';

import { api } from '@/utils/api';
import { useAnonUser, useUser } from '@/utils/local-user';
import { ChannelEvents } from '@/server/channel-events';
import { type Vote } from '@/server/hop';

export const usePokerId = () => {
    const router = useRouter();
    return Array.isArray(router.query.voteId)
        ? router.query.voteId[0]
        : router.query.voteId;
};

export const useVotes = () => {
    const pokerId = usePokerId();
    const utils = api.useContext();
    const anonUser = useAnonUser();
    const lastUpdated = useRef<number>(0);

    const session = useUser();
    const { data: votes } = api.vote.pokerState.getPokerState.useQuery(
        { pokerId: pokerId ?? '' },
        {
            enabled: !!pokerId,
        }
    );

    const activeVote = votes?.pokerVote?.find(x => x.active);
    const currentVoteId = votes?.pokerVote?.find(x => x.active)?.id;

    const { mutate } = api.vote.vote.useMutation({
        onMutate: ({ choice, pokerVoteId }) => {
            if (!pokerVoteId || !pokerId) return;
            void utils.vote.pokerState.getPokerState.cancel({
                pokerId,
            });
            utils.vote.pokerState.getPokerState.setData(
                {
                    pokerId,
                },
                old => {
                    const userId = session.user?.id;
                    if (!userId || !old) return old;
                    lastUpdated.current = Date.now();
                    // TODO deep clone /shrug
                    const newState = {
                        ...old,
                        pokerVote: [
                            ...old.pokerVote?.map(x => ({
                                ...x,
                                voteChoice: [...x.voteChoice],
                            })),
                        ],
                    };
                    const newVote = newState.pokerVote?.find(
                        x => x.id === pokerVoteId
                    );

                    if (!newVote) return old;

                    const itemIndex = newVote.voteChoice.findIndex(
                        v => (v.user?.id ?? v.anonUser?.id) === userId
                    );

                    if (itemIndex === -1) return old;

                    const oldItem = newVote.voteChoice.splice(itemIndex, 1)[0];
                    if (oldItem) {
                        newVote.voteChoice.push({ ...oldItem, choice });
                    }

                    return newState;
                }
            );
        },
        onError: _err => {
            if (!pokerId) return;
            void utils.vote.pokerState.getPokerState.refetch({
                pokerId,
            });
        },
    });

    const channelId = `poker_${pokerId ?? ''}`;
    useChannelMessage(
        channelId,
        ChannelEvents.VOTE_UPDATED,
        (e: { data: string }) => {
            const updatedVoteChoice: Vote = parse(e.data);

            const existingVote = utils.vote.pokerState.getPokerState
                .getData()
                ?.pokerVote?.find(v => v.id === updatedVoteChoice.pokerVote.id)
                ?.voteChoice?.find(
                    v =>
                        v.user?.id === updatedVoteChoice.user?.id ||
                        v.anonUser?.id === updatedVoteChoice.anonUser?.id
                );
            const timeSinceLastUpdate = Date.now() - lastUpdated.current;

            // Ignore events from ourselves x seconds after we optimistically updated if we have our current vote client side
            const updateGracePeriod = 2000;
            if (
                existingVote &&
                timeSinceLastUpdate < updateGracePeriod &&
                (updatedVoteChoice.user?.id === session.user?.id ||
                    updatedVoteChoice.anonUser?.id === anonUser?.id)
            ) {
                console.log(
                    'Ignoring update from self',
                    timeSinceLastUpdate < updateGracePeriod,
                    timeSinceLastUpdate
                );
                return;
            }

            utils.vote.pokerState.getPokerState.setData(
                { pokerId: pokerId ?? '' },
                old => {
                    if (!old) return old;
                    // TODO deep clone /shrug
                    const newState = {
                        ...old,
                        pokerVote: [
                            ...old.pokerVote?.map(x => ({
                                ...x,
                                voteChoice: [...x.voteChoice],
                            })),
                        ],
                    };

                    const newVote = newState.pokerVote?.find(
                        x => x.id === updatedVoteChoice.pokerVote.id
                    );

                    if (!newVote) return old;
                    const itemIndex = newVote.voteChoice.findIndex(
                        v =>
                            (v.user?.id ?? v.anonUser?.id) ===
                            (updatedVoteChoice.user?.id ??
                                updatedVoteChoice.anonUser?.id)
                    );

                    if (itemIndex === -1) {
                        newVote.voteChoice.push(updatedVoteChoice);
                    } else if (newVote.voteChoice[itemIndex]) {
                        newVote.voteChoice[itemIndex] = updatedVoteChoice;
                    }
                    return newState;
                }
            );
        }
    );

    const { votesMap, currentVote, highestVote } = useMemo(() => {
        const currentVote = activeVote?.voteChoice?.find(
            v => (v.user?.id ?? v.anonUser?.id) === session?.user?.id
        );

        if (!activeVote) {
            return {
                currentVote,
                votesMap: {} as Record<
                    string,
                    {
                        count: number;
                        users: {
                            name: string;
                            id: string;
                        }[];
                    }
                >,
                highestVote: ['-1', 0] as const,
            };
        }

        // Compute vote count, and users per vote choice
        const votesMap =
            activeVote.voteChoice.reduce(
                (acc, v) => ({
                    ...acc,
                    [v.choice]: {
                        count: (acc[v.choice]?.count ?? 0) + 1,
                        users: [
                            ...(acc[v.choice]?.users ?? []),
                            v.user ?? v.anonUser,
                        ].filter(
                            (
                                x
                            ): x is {
                                id: string;
                                name: string;
                                image: string;
                            } => !!x
                        ),
                    },
                }),
                {} as Record<
                    string,
                    {
                        count: number;
                        users: { name: string; id: string; image?: string }[];
                    }
                >
            ) ?? {};

        /// get the highest vote
        const highestVote = Object.entries(votesMap).reduce(
            (a, e): [string, number] =>
                e[1].count > a[1] ? [e[0], e[1].count] : a,
            ['-1', 0] as [string, number]
        );

        return { currentVote, votesMap, highestVote: highestVote };
    }, [activeVote, session?.user?.id]);

    return {
        votes: votes,
        votesMap,
        currentVote,
        highestVote,
        activeVote,
        doVote: (choice: number) => {
            if (!currentVoteId) return;

            mutate({
                choice: choice.toString(),
                pokerVoteId: currentVoteId,
                anonUser: anonUser ?? null,
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            window.navigator.vibrate([20]);
        },
    };
};
