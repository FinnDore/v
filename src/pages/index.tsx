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
import { Pfp } from '@/components/pfp';
import { VoteButton } from '@/components/vote/vote-button';
import { LANDING_CHANNEL_ID, voteOptions } from '@/constants';
import { ChannelEvents } from '@/server/channel-events';
import { type LandingPageVote } from '@/server/hop';
import darkLightRays from '../../public/temp-rays-dark.png';
import lightLightRays from '../../public/temp-rays-light.png';

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
                <div className="mt-12 flex w-full max-w-lg  grid-cols-1 flex-wrap items-center justify-center gap-5 px-4 md:mx-auto md:grid md:min-w-[80vw] md:grid-cols-2 md:grid-rows-2 lg:min-w-[900px] lg:grid-cols-3">
                    <div class=" group relative h-48 w-full">
                        <div className="absolute left-1/2 z-10 w-max -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-black/40 px-6 py-1.5 text-sm font-bold transition-colors group-hover:border-black dark:border-white/50 group-hover:dark:border-white">
                            <div className="absolute left-0 top-0 -z-10 h-full w-full bg-white dark:bg-black"></div>
                            <div clas>Linear integration</div>
                        </div>
                        <div className="relative flex h-full w-full animate-fade-in overflow-hidden rounded border border-black/50 opacity-0 transition-colors [animation-delay:_1000ms] group-hover:border-black dark:border-white/50 group-hover:dark:border-white">
                            <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                            <div className="absolute -z-10 h-full w-full bg-blue-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                            <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>

                            <div className="relative m-auto aspect-square h-4/5 transition-transform group-hover:scale-110">
                                <Image
                                    className="group-hover: animate-ping blur-md saturate-150 [animation-duration:_4s] group-hover:[animation-duration:_2s]"
                                    src="/linear.png"
                                    alt="linear icon"
                                    fill={true}
                                />
                                <Image
                                    className=""
                                    src="/linear.png"
                                    alt="linear icon"
                                    fill={true}
                                />
                            </div>
                        </div>
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

                    <div className="group relative grid h-48 w-full animate-fade-in place-content-center overflow-hidden rounded border border-black/50 opacity-0 transition-colors [animation-delay:_1300ms] hover:border-black dark:border-white/50 dark:hover:border-white">
                        <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>

                        <Tweet
                            quote="If I wanted to point something it'd be this website for how useless it is"
                            name="Samuel Gunter"
                            url="https://twitter.com/samathingamajig"
                            pfpUrl="https://pbs.twimg.com/profile_images/1299465480214900739/Van7fqYL_400x400.jpg"
                        />
                    </div>

                    <div className="group relative grid h-48 w-full animate-fade-in place-content-center overflow-hidden rounded border border-black/50 opacity-0 transition-colors [animation-delay:_1600ms] hover:border-black dark:border-white/50 dark:hover:border-white">
                        <Tweet
                            quote="Works great with darkreader 👍"
                            name="anna_devminer"
                            url="https://devminer.xyz"
                            pfpUrl="https://cdn.discordapp.com/attachments/966629731086774302/1126886860094967868/unknown.png"
                        />
                        <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                    </div>

                    <div className="group relative grid h-48 w-full animate-fade-in place-content-center overflow-hidden rounded border border-black/50 opacity-0 transition-colors [animation-delay:_1750ms] hover:border-black dark:border-white/50 dark:hover:border-white">
                        <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>

                        <Tweet
                            quote="never seen this much layout shift in my life"
                            name="Julius"
                            url="https://twitter.com/jullerino"
                            pfpUrl="https://pbs.twimg.com/profile_images/1526143235067985922/DmFx1k13_400x400.jpg"
                        />
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

const Tweet = (props: {
    name: string;
    pfpUrl: string;
    url: string;
    quote: string;
}) => {
    return (
        <div className="flex h-full w-full flex-col gap-4 p-4 opacity-80 transition-opacity group-hover:opacity-100">
            <div className="text-center text-sm md:text-base">
                {props.quote}
            </div>
            <div className="mx-auto flex gap-2 leading-none">
                <Link href={props.url}>
                    <Pfp
                        className="w-8"
                        image={props.pfpUrl}
                        name={props.name}
                    />
                </Link>

                <Link href={props.url} className="my-auto font-bold">
                    <div>{props.name}</div>
                </Link>
            </div>
        </div>
    );
};

type VoteMap = Record<
    string,
    {
        count: number;
        users: {
            name: string;
            id: string;
        }[];
    }
>;

const Vote = () => {
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
