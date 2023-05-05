import { useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { useChannelMessage } from '@onehop/react';
import { atom, useAtom } from 'jotai';
import { parse } from 'superjson';

import { api } from '@/utils/api';
import { cloneArray, updateArrayItem } from '@/utils/helpers';
import { useAnonUser, useUser } from '@/utils/local-user';
import { ChannelEvents } from '@/server/channel-events';
import { type Vote } from '@/server/hop';

const currentVoteIdAtom = atom<string | null>(null);

export const usePokerId = () => {
    const router = useRouter();
    return Array.isArray(router.query.voteId)
        ? router.query.voteId[0]
        : router.query.voteId;
};

export const usePokerState = () => {
    const pokerId = usePokerId();
    const anonUser = useAnonUser();
    // const [isWhiteListed, setIsWhiteListed] = useState<boolean>(true);
    const [currentVoteId, setActiveVoteId] = useAtom(currentVoteIdAtom);

    const {
        data: pokerState,
        status,
        error,
    } = api.vote.pokerState.getPokerState.useQuery(
        { pokerId: pokerId ?? '', anonUser },
        {
            enabled: !!pokerId,
            retry: false,
        }
    );

    const isWhiteListed = error?.data?.code === 'UNAUTHORIZED' ? false : true;

    const session = useUser();
    const isHost = useMemo(
        () =>
            session?.user?.id &&
            (pokerState?.createdByUser?.id === session.user?.id ||
                pokerState?.createdByAnonUser?.id === session?.user?.id),
        [
            pokerState?.createdByAnonUser?.id,
            pokerState?.createdByUser?.id,
            session.user?.id,
        ]
    );

    const activeVote = useMemo(() => {
        if (currentVoteId && !isHost) {
            return pokerState?.pokerVote?.find(x => x.id === currentVoteId);
        } else {
            return pokerState?.pokerVote?.find(x => x.active);
        }
    }, [currentVoteId, isHost, pokerState?.pokerVote]);

    const nextVote = useMemo(() => {
        if (!pokerState) return { nextVote: null, prevVote: null };
        const activeVoteIndex = pokerState.pokerVote.findIndex(
            x => activeVote?.id === x.id
        );
        return {
            prevVote: pokerState.pokerVote?.[activeVoteIndex - 1] ?? null,
            nextVote: pokerState.pokerVote?.[activeVoteIndex + 1] ?? null,
            currentIndex: activeVoteIndex,
        };
    }, [activeVote?.id, pokerState]);

    return {
        pokerState,
        status,
        activeVote,
        setActiveVoteId,
        isHost,
        isWhiteListed,
        ...nextVote,
    };
};

export const useVotes = () => {
    const pokerId = usePokerId();
    const utils = api.useContext();
    const anonUser = useAnonUser();
    const voteLastUpdated = useRef<number>(0);
    const session = useUser();

    const { pokerState, activeVote, status, isWhiteListed } = usePokerState();
    const { mutate } = api.vote.vote.useMutation({
        onMutate: ({ choice, pokerVoteId }) => {
            if (!pokerVoteId || !pokerId) return;
            void utils.vote.pokerState.getPokerState.cancel({
                pokerId,
                anonUser,
            });
            utils.vote.pokerState.getPokerState.setData(
                {
                    pokerId,
                    anonUser,
                },
                old => {
                    const userId = session.user?.id;
                    if (!userId || !old) return old;
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

                    voteLastUpdated.current = Date.now();
                    const oldItem = newVote.voteChoice.splice(itemIndex, 1)[0];
                    if (oldItem) {
                        newVote.voteChoice.push({ ...oldItem, choice });
                    }

                    return newState;
                }
            );
        },
        onError: (_err, ctx) => {
            if (!pokerId) return;
            void utils.vote.pokerState.getPokerState.refetch({
                pokerId: ctx.pokerVoteId,
                anonUser: ctx.anonUser,
            });
        },
    });

    const channelId = `poker_${pokerId ?? ''}`;
    useChannelMessage(
        channelId,
        ChannelEvents.VOTE_UPDATED,
        (e: { data: string }) => {
            const updatedVoteChoice: Vote = parse(e.data);
            if (!pokerId) return;
            const existingVote = utils.vote.pokerState.getPokerState
                .getData({
                    pokerId,
                    anonUser,
                })
                ?.pokerVote?.find(v => v.id === updatedVoteChoice.pokerVote.id)
                ?.voteChoice?.find(
                    v =>
                        v.user?.id === updatedVoteChoice.user?.id ||
                        v.anonUser?.id === updatedVoteChoice.anonUser?.id
                );
            const timeSinceLastUpdate = Date.now() - voteLastUpdated.current;

            // Ignore events from ourselves x seconds after we optimistically updated if we have our current vote client side
            const updateGracePeriod = 2000;
            if (
                existingVote &&
                timeSinceLastUpdate < updateGracePeriod &&
                (updatedVoteChoice.user?.id === session.user?.id ||
                    updatedVoteChoice.anonUser?.id === anonUser?.id)
            ) {
                return;
            }

            utils.vote.pokerState.getPokerState.setData(
                { pokerId, anonUser },
                old => {
                    if (!old) return old;
                    // TODO deep clone /shrug
                    const newState = {
                        ...old,
                        pokerVote: [
                            ...old.pokerVote.map(x => ({
                                ...x,
                                voteChoice: [...x.voteChoice],
                            })),
                        ],
                    };

                    const newVote = newState.pokerVote.find(
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

    useChannelMessage(
        channelId,
        ChannelEvents.CHANGE_VOTE,
        (e: { data: string }) => {
            const event: { currentVote: string } = parse(e.data);
            if (!pokerId) return;
            utils.vote.pokerState.getPokerState.setData(
                {
                    pokerId,
                    anonUser,
                },
                old => {
                    if (!old) return old;
                    return {
                        ...old,
                        pokerVote: [
                            ...old.pokerVote?.map(x => ({
                                ...x,
                                active: x.id === event.currentVote,
                            })),
                        ],
                    };
                }
            );
        }
    );

    useChannelMessage(
        channelId,
        ChannelEvents.TOGGLE_RESULTS,
        (e: { data: string }) => {
            const {
                showResults,
                voteId,
            }: { showResults: boolean; voteId: string } = parse(e.data);
            if (!pokerId) return;
            utils.vote.pokerState.getPokerState.setData(
                { pokerId, anonUser },
                old => {
                    if (!old) return old;
                    return {
                        ...old,
                        pokerVote: updateArrayItem(
                            cloneArray(old.pokerVote),
                            x => x.id === voteId,
                            x => ({ ...x, showResults })
                        ),
                    };
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
        const votesMap = activeVote.voteChoice.reduce(
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
                            image?: string;
                            pfpHash?: string;
                        } => !!x
                    ),
                },
            }),
            {} as Record<
                string,
                {
                    count: number;
                    users: {
                        name: string;
                        id: string;
                        image?: string;
                        pfpHash?: string;
                    }[];
                }
            >
        );

        // get the highest vote
        const highestVote = Object.entries(votesMap).reduce(
            (a, e): [string, number] =>
                e[1].count > a[1] ? [e[0], e[1].count] : a,
            ['-1', 0] as [string, number]
        );

        return { currentVote, votesMap, highestVote };
    }, [activeVote, session?.user?.id]);

    return {
        pokerState,
        votesMap,
        currentVote,
        highestVote,
        activeVote,
        doVote: (choice: number | string) => {
            if (!activeVote?.id) return;

            mutate({
                choice: choice.toString(),
                pokerVoteId: activeVote.id,
                anonUser,
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            window.navigator.vibrate([20]);
        },
        showVotes: activeVote?.showResults,
        status,
        isWhiteListed,
    };
};

export const useVoteControls = () => {
    const {
        activeVote,
        currentIndex,
        nextVote,
        pokerState,
        prevVote,
        setActiveVoteId,
        status,
        isHost,
    } = usePokerState();
    const pokerId = usePokerId();
    const utils = api.useContext();
    const anonUser = useAnonUser();

    const averages = useMemo(() => {
        if (typeof currentIndex === 'undefined') return;
        const votes = pokerState?.pokerVote[currentIndex]?.voteChoice;
        if (!votes) return null;

        const mean =
            votes
                ?.map(x => +x.choice)
                .filter(Number)
                .reduce((x, prev) => x + prev, 0) / votes.length || 0;

        const peter =
            votes.find(
                x =>
                    x.user?.name?.toLowerCase() === 'peter' ||
                    x.anonUser?.name.toLowerCase() === 'peter'
            )?.choice ?? null;

        return { mean: mean.toFixed(1), peter };
    }, [currentIndex, pokerState?.pokerVote]);

    const stats = useMemo(() => {
        if (!pokerState || !pokerState.userInVote.length) return null;

        const userCount = pokerState.userInVote.length;
        // TODO Could filter non joined votes
        const submittedVotesCount = pokerState.pokerVote.reduce(
            (prev, curr) => prev + curr.voteChoice.length,
            0
        );
        const voteCount = pokerState.pokerVote.length;

        return {
            votePercent: (submittedVotesCount !== 0
                ? (submittedVotesCount / (voteCount * userCount)) * 100
                : 0
            ).toFixed(),
            userCount,
        };
    }, [pokerState]);

    const toggleResultsMutation = api.vote.pokerState.toggleResults.useMutation(
        {
            onMutate(data) {
                utils.vote.pokerState.getPokerState.setData(
                    {
                        pokerId: data.pokerId,
                        anonUser: data.anonUser,
                    },
                    old => {
                        if (!old) return old;
                        return {
                            ...old,
                            pokerVote: updateArrayItem(
                                cloneArray(old.pokerVote),
                                x => x.id === data.voteId,
                                x => ({
                                    ...x,
                                    showResults: data.showResults,
                                })
                            ),
                        };
                    }
                );
            },
            onError(_err, ctx) {
                void utils.vote.pokerState.getPokerState.invalidate({
                    pokerId: ctx.pokerId,
                    anonUser: ctx.anonUser,
                });
            },
        }
    );
    const toggleResults = useCallback(() => {
        if (!pokerId || !activeVote) return;
        toggleResultsMutation.mutate({
            pokerId: pokerId,
            voteId: activeVote?.id,
            anonUser,
            showResults: !activeVote.showResults,
        });
    }, [activeVote, anonUser, pokerId, toggleResultsMutation]);

    const progressVoteMutation = api.vote.pokerState.progressVote.useMutation({
        onMutate(data) {
            utils.vote.pokerState.getPokerState.setData(
                {
                    pokerId: data.pokerId,
                    anonUser: data.anonUser,
                },
                old => {
                    if (!old) return old;
                    return {
                        ...old,
                        pokerVote: old.pokerVote.map(x => ({
                            ...x,
                            active: x.id === data.progressTo,
                        })),
                    };
                }
            );
        },
        onError(_err, ctx) {
            void utils.vote.pokerState.getPokerState.invalidate({
                pokerId: ctx.pokerId,
                anonUser: ctx.anonUser,
            });
        },
    });

    const progressVote = useCallback(
        (prev = false) => {
            if (!isHost) {
                const currentlyShownVoteId = pokerState?.pokerVote.find(
                    x => x.active
                )?.id;
                if (!prev && nextVote) {
                    setActiveVoteId(nextVote.id);
                    if (nextVote.id === currentlyShownVoteId) {
                        setActiveVoteId(null);
                    }
                } else if (prev && prevVote) {
                    setActiveVoteId(prevVote.id);
                    if (prevVote.id === currentlyShownVoteId) {
                        setActiveVoteId(null);
                    }
                }
            } else {
                if (prev && prevVote && pokerId) {
                    progressVoteMutation.mutate({
                        pokerId: pokerId,
                        progressTo: prevVote.id,
                        anonUser,
                    });
                } else if (!prev && nextVote && pokerId) {
                    progressVoteMutation.mutate({
                        pokerId: pokerId,
                        progressTo: nextVote.id,
                        anonUser,
                    });
                }
            }
        },
        [
            anonUser,
            isHost,
            nextVote,
            pokerId,
            pokerState?.pokerVote,
            prevVote,
            progressVoteMutation,
            setActiveVoteId,
        ]
    );

    return {
        progressVote,
        showResults: activeVote?.showResults,
        currentIndex,
        toggleResults,
        voteCount: pokerState?.pokerVote?.length ?? 0,
        activeVote,
        status,
        isEnd: !nextVote,
        isStart: !prevVote,
        isHost,
        followHost: () => setActiveVoteId(null),
        averages,
        stats,
    };
};
