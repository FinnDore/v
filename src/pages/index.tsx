import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useChannelMessage } from '@onehop/react';
import { signIn, signOut } from 'next-auth/react';
import Balancer, { Provider } from 'react-wrap-balancer';
import { parse } from 'superjson';

import { api } from '@/utils/api';
import { formatCompactNumber } from '@/utils/format-numbers';
import { useAnonUser, useUser } from '@/utils/local-user';
import { Button } from '@/components/button';
import { VoteButton } from '@/components/vote/vote-button';
import { LANDING_CHANNEL_ID, voteOptions } from '@/constants';
import { ChannelEvents } from '@/server/channel-events';
import { type LandingPageVote } from '@/server/hop';
import darkLightRays from '../../public/temp-rays-dark.png';
import lightLightRays from '../../public/temp-rays-light.png';

const randomVoteCounts = voteOptions.map(() => Math.max(1, Math.random() * 10));

const Home: NextPage = () => {
    const statsQuery = api.landing.landingStats.useQuery();

    return (
        <>
            <div className="mx-auto flex h-max w-max max-w-full flex-col place-items-center px-4 pb-6 lg:max-w-screen-lg">
                <div className="absolute left-0 top-0 -z-20 h-screen w-screen max-w-[100vw] animate-fade-in overflow-x-clip opacity-0">
                    <Image
                        width={982}
                        height={1005}
                        alt="bg image of light rays"
                        src={darkLightRays}
                        className="absolute left-1/2 hidden aspect-auto min-w-[50rem] -translate-x-1/2 -translate-y-[30%] dark:block"
                        placeholder="blur"
                    />
                    <Image
                        width={982}
                        height={1005}
                        alt="bg image of light rays"
                        src={lightLightRays}
                        className="absolute left-1/2 aspect-auto -translate-x-1/2 -translate-y-[30%] dark:hidden"
                        placeholder="blur"
                    />
                </div>
                <Provider>
                    <h1 className="w-full animate-fade-in text-center text-4xl font-bold opacity-0 [animation-delay:_200ms] md:mt-8 md:text-6xl ">
                        <Balancer>The better way to point things</Balancer>
                    </h1>
                    <h2 className="mt-4 w-full animate-fade-in text-center text-sm text-gray-700 opacity-0 [animation-delay:_300ms] dark:text-gray-300 md:mt-6 md:text-base">
                        <Balancer>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Pellentesque vitae quam ac eros malesuada
                            molestie ac sit amet tortor. Aenean vehicula
                            dignissim dui, et aliquet purus porttitor sed.
                            Nullam hendrerit orci eget aliquet tempor
                        </Balancer>
                    </h2>
                </Provider>

                <div className="mt-4 grid w-full grid-cols-3 justify-around px-4 text-center text-xl md:mt-12">
                    <Stat
                        name="Votes Cast"
                        value={statsQuery.data?.totalVoteChoices}
                    />
                    <Stat
                        name="Sessions created"
                        value={statsQuery.data?.totalSessions}
                    />
                    <Stat
                        name="Cumulative points"
                        value={statsQuery.data?.culmativeVotes}
                    />
                </div>

                <Vote />
                <Link
                    href="/create"
                    className="mx-auto mt-12 animate-fade-in opacity-0 [animation-delay:_750ms]"
                >
                    <Button
                        variant="outline"
                        className="flex rounded-md px-3 py-2 text-2xl dark:hover:border-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        <span className="my-auto flex">
                            <span className="my-auto leading-none">
                                create Vote
                            </span>
                        </span>
                    </Button>
                </Link>
                <div className="mt-12 flex w-full max-w-lg  grid-cols-1 flex-wrap items-center justify-center gap-5 px-4 md:mx-auto md:grid md:min-w-[80vw] md:grid-cols-2 md:grid-rows-2 lg:min-w-[800px] lg:grid-cols-3">
                    <div className="group relative flex h-48 w-full animate-fade-in overflow-hidden rounded border border-black/50 opacity-0 transition-colors [animation-delay:_1000ms] hover:border-black dark:border-white/50 dark:hover:border-white">
                        <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                        <Button
                            variant="outline"
                            onClick={() => void signOut()}
                            className="m-auto flex rounded-md px-3 py-2 text-2xl dark:hover:border-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                            <span className="my-auto flex">
                                <span className="my-auto leading-none">
                                    Logout
                                </span>
                            </span>
                        </Button>
                    </div>
                    <div className="group relative flex h-48 w-full animate-fade-in overflow-hidden rounded border border-black/50 opacity-0 transition-colors [animation-delay:_1150ms] hover:border-black dark:border-white/50 dark:hover:border-white md:row-span-2 md:h-full lg:col-span-2 lg:h-48 lg:[grid-row:_unset]">
                        <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                        <Button
                            variant="outline"
                            onClick={() => void signIn('github')}
                            className="m-auto flex rounded-md px-3 py-2 text-2xl dark:hover:border-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                            <span className="my-auto flex">
                                <span className="my-auto leading-none">
                                    signIn
                                </span>
                            </span>
                        </Button>
                    </div>
                    <div className="group relative h-48 w-full animate-fade-in overflow-hidden rounded border border-black/50 opacity-0 transition-colors [animation-delay:_1300ms] hover:border-black dark:border-white/50 dark:hover:border-white">
                        <div className="absolute h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                    </div>
                    <div className="group relative h-48 w-full animate-fade-in overflow-hidden rounded border border-black/50 opacity-0 transition-colors [animation-delay:_1600ms] hover:border-black dark:border-white/50 dark:hover:border-white">
                        <div className="absolute h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                    </div>
                    <div className="group relative h-48 w-full animate-fade-in overflow-hidden rounded border border-black/50 opacity-0 transition-colors [animation-delay:_1750ms] hover:border-black dark:border-white/50 dark:hover:border-white">
                        <div className="absolute h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;

const Stat = (props: { name: string; value: number | undefined }) => (
    <h3 className="flex animate-fade-in flex-col gap-1 opacity-0 [animation-delay:_500ms]">
        <div className="h-8 text-2xl font-bold">
            {props.value && formatCompactNumber(props.value)}
        </div>
        <div className="text-sm">{props.name}</div>
    </h3>
);

type VoteMap = Record<
    string,
    {
        count: number;
        users: {
            name: string;
            id: string;
        }[];
        extraUsers: number;
    }
>;

const Vote = () => {
    const anonUser = useAnonUser();
    const utils = api.useContext();
    const voteLastUpdated = useRef<number>(0);
    const session = useUser();
    const votesQuery = api.landing.landingVotes.useQuery();

    const [localVoteId, setLocalVoteIdVoteId] = useState<string | null>();
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
                    extraUsers:
                        !v.anonUser || !v.user
                            ? (acc[v.choice]?.count ?? 0) + 1
                            : acc[v.choice]?.count ?? 0,
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

                if (!existingVote) return [...prev, vote];
                const newState = [...prev];

                const indexOfVoteToUpdate = newState.findIndex(
                    v => v.id === vote.id
                );
                if (indexOfVoteToUpdate === -1) return prev;
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
                    currentVotes={
                        (typeof votesQuery.data !== 'undefined'
                            ? votesMap[vote.toString()]?.count
                            : randomVoteCounts[i]) ?? 0
                    }
                    unshownUsers={votesMap[vote.toString()]?.extraUsers}
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
