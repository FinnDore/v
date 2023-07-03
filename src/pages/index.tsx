import { type NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Balancer, { Provider } from 'react-wrap-balancer';

import { api } from '@/utils/api';
import { Button } from '@/components/button';
import { VoteButton } from '@/components/vote/vote-button';

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, '??'];
const Home: NextPage = () => {
    const statsQuery = api.stats.stats.useQuery();

    return (
        <>
            <div className="absolute  top-0 -z-10 h-screen w-screen max-w-[100vw] overflow-hidden">
                <Image
                    width={982}
                    height={1005}
                    alt="bg image of light rays"
                    src="/temp-rays-dark.png"
                    className="absolute left-1/2 hidden aspect-auto min-w-[50rem] -translate-x-1/2 -translate-y-[30%] dark:block"
                />
                <Image
                    width={982}
                    height={1005}
                    alt="bg image of light rays"
                    src="/temp-rays-light.png"
                    className="absolute left-1/2 aspect-auto -translate-x-1/2 -translate-y-[30%] dark:hidden"
                />
            </div>
            <div className="mx-auto flex h-max w-max max-w-full flex-col place-items-center px-4 pb-6  lg:max-w-screen-lg">
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

                <div className="mt-4 flex w-full justify-around px-4 text-center text-xl md:mt-12">
                    <h3>
                        <div className="text-2xl font-bold">
                            {statsQuery.data?.pokerVotes}
                        </div>
                        <div className="text-sm">Votes cast</div>
                    </h3>
                    <h3>
                        <div className="text-2xl font-bold ">
                            {statsQuery.data?.pokerSessions}
                        </div>
                        <div className="text-sm">Sessions created</div>
                    </h3>
                    <h3>
                        <div className="text-2xl font-bold">
                            {statsQuery.data?.users}
                        </div>
                        <div className="text-sm">Cumulative points</div>
                    </h3>
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
                <div className="lg:gridw mx-4 mt-12 flex w-full max-w-lg grid-cols-1 flex-wrap items-center justify-center gap-5 md:mx-auto md:grid  md:min-w-[80vw] md:grid-cols-2 md:grid-rows-2 lg:min-w-[800px] lg:grid-cols-3">
                    <div className="relative h-48 w-full rounded border border-black/70 transition-colors hover:border-black dark:border-white/70 dark:hover:border-white">
                        <div className="absolute h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute h-full w-full bg-orange-600 opacity-5 blur-lg transition-opacity hover:opacity-10"></div>
                    </div>
                    <div className="relative h-48 w-full rounded border border-black/70 transition-colors hover:border-black dark:border-white/70 dark:hover:border-white lg:col-span-2">
                        <div className="absolute h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute h-full w-full bg-orange-600 opacity-5 blur-lg transition-opacity hover:opacity-10"></div>
                    </div>
                    <div className="relative h-48 w-full rounded border border-black/70 transition-colors hover:border-black dark:border-white/70 dark:hover:border-white">
                        <div className="absolute h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>

                        <div className="absolute h-full w-full bg-orange-600 opacity-5 blur-lg transition-opacity hover:opacity-10"></div>
                    </div>
                    <div className="relative h-48 w-full rounded border border-black/70 transition-colors hover:border-black dark:border-white/70 dark:hover:border-white">
                        <div className="absolute h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute h-full w-full bg-orange-600 opacity-5 blur-lg transition-opacity hover:opacity-10"></div>
                    </div>
                    <div className="relative h-48 w-full rounded border border-black/70 transition-colors hover:border-black dark:border-white/70 dark:hover:border-white">
                        <div className="absolute h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute h-full w-full bg-orange-600 opacity-5 blur-lg transition-opacity hover:opacity-10"></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
