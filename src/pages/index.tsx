import { useEffect, useMemo, useState } from 'react';
import { type NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { signIn, signOut } from 'next-auth/react';
import Balancer, { Provider } from 'react-wrap-balancer';

import { api } from '@/utils/api';
import { formatCompactNumber } from '@/utils/format-numbers';
import { useAnonUser, useUser } from '@/utils/local-user';
import { Button } from '@/components/button';
import { VoteButton } from '@/components/vote/vote-button';
import { voteOptions } from '@/constants';
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
    const statsQuery = api.landing.landingStats.useQuery();
    const votesQuery = api.landing.landingVotes.useQuery();
    const voteMutation = api.landing.vote.useMutation({
        onSuccess: res => {
            if (res) {
                localStorage.setItem('landingVoteId', res);
                setVoteId(res);
            }
            void statsQuery.refetch();
            void votesQuery.refetch();
        },
    });

    const [voteId, setVoteId] = useState<string | null>();
    useEffect(() => {
        const voteId = localStorage.getItem('landingVoteId');
        if (voteId) setVoteId(voteId);
    }, []);

    const session = useUser();
    const { votesMap, currentVote, highestVote } = useMemo(() => {
        const currentVote = votesQuery.data?.find(
            v =>
                ((session.status === 'anon' ||
                    session.status === 'authenticated') &&
                    (v.user?.id ?? v.anonUser?.id) === session?.user?.id) ||
                (voteId && voteId === v.id)
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
    }, [session.status, session?.user?.id, voteId, votesQuery.data]);

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
                    doVote={() => {
                        voteMutation.mutate({
                            choice: vote,
                            anonUser,
                            voteId: voteId ?? undefined,
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
