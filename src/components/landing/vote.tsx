import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChannelMessage } from '@onehop/react';
import { parse } from 'superjson';

import { api } from '@/utils/api';
import { useAnonUser, useUser } from '@/utils/local-user';
import { VoteButton } from '@/components/vote/vote-button';
import { LANDING_CHANNEL_ID, voteOptions } from '@/constants';
import { ChannelEvents } from '@/server/channel-events';
import { type LandingPageVote } from '@/server/hop';

export type VoteMap = Record<
    string,
    {
        count: number;
        users: {
            name: string;
            id: string;
        }[];
    }
>;

export const Vote = () => {
    const anonUser = useAnonUser();
    const utils = api.useContext();
    const voteLastUpdated = useRef<number>(0);
    const session = useUser();
    const votesQuery = api.landing.landingVotes.useQuery();

    const [localVoteId, setLocalVoteIdVoteId] = useState<string | null>(null);
    const updateClumativePoints = useCallback(
        (oldChoice: string, newChoice: string) => {
            let oldChoiceAsNumber = parseInt(oldChoice, 10);
            if (isNaN(oldChoiceAsNumber)) oldChoiceAsNumber = 0;
            let newChoiceAsNumber = parseInt(`${newChoice}`, 10);
            if (isNaN(newChoiceAsNumber)) newChoiceAsNumber = 0;

            utils.landing.landingStats.setData(undefined, prev => {
                if (!prev) return prev;

                const newStats = {
                    ...prev,
                    culmativeVotes:
                        oldChoiceAsNumber > newChoiceAsNumber
                            ? prev.culmativeVotes -
                              (oldChoiceAsNumber - newChoiceAsNumber)
                            : prev.culmativeVotes +
                              (newChoiceAsNumber - oldChoiceAsNumber),
                };
                return newStats;
            });
        },
        [utils.landing.landingStats]
    );

    const voteMutation = api.landing.vote.useMutation({
        onMutate: ({ choice }) => {
            void utils.landing.landingVotes.cancel();
            utils.landing.landingVotes.setData(undefined, prev => {
                if (!prev) return prev;

                const newState = [...prev];
                const newVoteIndex = newState.findIndex(
                    x =>
                        (session.user?.id &&
                            (session.user.id === x.user?.id ||
                                session.user.id === x.anonUser?.id)) ||
                        (localVoteId && localVoteId === x.id)
                );

                if (newVoteIndex === -1) return prev;
                const oldItem = newState.splice(newVoteIndex, 1)[0];
                if (!oldItem) return prev;

                newState.push({ ...oldItem, choice: `${choice}` });
                voteLastUpdated.current = Date.now();

                updateClumativePoints(oldItem.choice, `${choice}`);
                return newState;
            });
        },
        onSuccess: res => {
            if (res) {
                localStorage.setItem('landingVoteId', res);
                setLocalVoteIdVoteId(res);
            }
        },
        onError: () => votesQuery.refetch(),
    });

    useEffect(() => {
        const voteId = localStorage.getItem('landingVoteId');
        if (voteId) setLocalVoteIdVoteId(voteId);
    }, []);

    useEffect(() => {
        if (session.user) {
            localStorage.removeItem('landingVoteId');
            setLocalVoteIdVoteId(null);
        }
    }, [session.user]);

    const { votesMap, currentVote, highestVote } = useMemo(() => {
        const currentVote = votesQuery.data?.find(
            v =>
                (session?.user?.id &&
                    (session?.user?.id === v.user?.id ||
                        session.user.id === v.anonUser?.id)) ||
                (localVoteId && localVoteId === v.id)
        );

        if (!votesQuery.data) {
            return {
                currentVote,
                votesMap: {} as VoteMap,
                highestVote: ['-1', 0] as const,
            };
        }

        // Compute vote count, and users per vote choice
        const votesMap = votesQuery.data.reduce(
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
            {} as VoteMap
        );

        // get the highest vote
        const highestVote = Object.entries(votesMap).reduce(
            (a, e): [string, number] =>
                e[1].count > a[1] ? [e[0], e[1].count] : a,
            ['-1', 0] as [string, number]
        );

        return { currentVote, votesMap, highestVote };
    }, [session.user?.id, localVoteId, votesQuery.data]);

    useChannelMessage(
        LANDING_CHANNEL_ID,
        ChannelEvents.VOTE_UPDATE,
        (event: { data: string }) => {
            const vote = parse<LandingPageVote>(event.data);
            const existingVote = utils.landing.landingVotes
                .getData()
                ?.find(vote => localVoteId && vote.id === localVoteId);

            const timeSinceLastUpdate = Date.now() - voteLastUpdated.current;

            utils.landing.landingVotes.setData(undefined, prev => {
                if (!prev) return prev;
                // Ignore events from ourselves x seconds after we optimistically updated if we have our current vote client side
                const updateGracePeriod = 2000;
                if (
                    existingVote &&
                    timeSinceLastUpdate < updateGracePeriod &&
                    ((session.user?.id &&
                        (vote.user?.id === session.user.id ||
                            vote.anonUser?.id === session.user.id)) ||
                        (localVoteId && localVoteId === vote.id))
                )
                    return prev;

                const newState = [...prev];

                const indexOfVoteToUpdate = newState.findIndex(
                    v => v.id === vote.id
                );
                if (indexOfVoteToUpdate === -1) return [...prev, vote];
                const voteToUpdate = newState[indexOfVoteToUpdate];
                if (voteToUpdate) {
                    updateClumativePoints(voteToUpdate.choice, vote.choice);
                }

                newState[indexOfVoteToUpdate] = vote;
                return newState;
            });
        }
    );

    return (
        <div className="relative mx-auto mt-12 flex animate-fade-in flex-wrap justify-center gap-2 opacity-0 [animation-delay:_750ms] md:gap-4">
            {voteOptions.map((vote, i) => (
                <VoteButton
                    key={vote}
                    vote={vote}
                    showVotes={true}
                    users={votesMap[vote.toString()]?.users ?? []}
                    currentVotes={votesMap[vote.toString()]?.count ?? 0}
                    totalVotes={highestVote[1] ?? 1}
                    currentUserId={
                        session.status === 'authenticated'
                            ? session.user.id
                            : vote => !!(vote.id === localVoteId && localVoteId)
                    }
                    doVote={() => {
                        voteMutation.mutate({
                            choice: vote,
                            anonUser,
                            voteId: !session.user
                                ? localVoteId ?? undefined
                                : undefined,
                        });
                    }}
                    current={
                        currentVote?.choice === vote.toString() || !currentVote
                    }
                />
            ))}
        </div>
    );
};
