import { type NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { signIn, signOut } from 'next-auth/react';
import Balancer, { Provider } from 'react-wrap-balancer';

import { api } from '@/utils/api';
import { formatCompactNumber } from '@/utils/format-numbers';
import { Button } from '@/components/button';
import { VoteButton } from '@/components/vote/vote-button';
import darkLightRays from '../../public/temp-rays-dark.png';
import lightLightRays from '../../public/temp-rays-light.png';

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, '??'];
const Home: NextPage = () => {
    const statsQuery = api.stats.stats.useQuery();

    return (
        <>
            <div className="relative left-0 top-0 -z-20 h-screen w-screen max-w-[100vw] overflow-x-clip">
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
            <div className="mx-auto flex h-max w-max max-w-full flex-col place-items-center px-4 pb-6 lg:max-w-screen-lg">
                <Provider>
                    <h1 className="w-full text-center text-4xl font-bold md:mt-16 md:text-6xl">
                        <Balancer>The better way to point things</Balancer>
                    </h1>
                    <h2 className="mt-4 w-full text-center text-gray-700 dark:text-gray-300 md:mt-6">
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
                        value={statsQuery.data?.totalVoteChoices}
                    />
                    <Stat
                        name="Cumulative points"
                        value={statsQuery.data?.culmativeVotes}
                    />
                </div>

                <div className="relative mx-auto mt-12 flex flex-wrap justify-center gap-2 md:gap-4">
                    {voteOptions.map((vote, i) => (
                        <VoteButton
                            key={vote}
                            vote={vote}
                            showVotes={true}
                            users={[]}
                            currentVotes={Math.max(1, Math.random() * 10)}
                            totalVotes={voteOptions.length - 1}
                            doVote={() => ({})}
                            current={true}
                        />
                    ))}
                </div>

                <Link href="/create" className="mx-auto mt-12">
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
                <div className="mt-12 flex w-full max-w-lg grid-cols-1 flex-wrap items-center justify-center gap-5 px-4 md:mx-auto md:grid  md:min-w-[80vw] md:grid-cols-2 md:grid-rows-2 lg:min-w-[800px] lg:grid-cols-3">
                    <div className="group relative flex h-48 w-full overflow-hidden rounded border border-black/70 transition-colors hover:border-black dark:border-white/70 dark:hover:border-white">
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
                    <div className="group relative flex h-48 w-full overflow-hidden rounded border border-black/70 transition-colors hover:border-black dark:border-white/70 dark:hover:border-white md:row-span-2 md:h-full lg:col-span-2 lg:h-48 lg:[grid-row:_unset]">
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
                    <div className="group relative h-48 w-full overflow-hidden rounded border border-black/70 transition-colors hover:border-black dark:border-white/70 dark:hover:border-white">
                        <div className="absolute h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                    </div>
                    <div className="group relative h-48 w-full overflow-hidden rounded border border-black/70 transition-colors hover:border-black dark:border-white/70 dark:hover:border-white">
                        <div className="absolute h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                    </div>
                    <div className="group relative h-48 w-full overflow-hidden rounded border border-black/70 transition-colors hover:border-black dark:border-white/70 dark:hover:border-white">
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
    <h3 className="flex flex-col gap-1">
        <div className="h-8 text-2xl font-bold">
            {props.value && formatCompactNumber(props.value)}
        </div>
        <div className="text-sm">{props.name}</div>
    </h3>
);
