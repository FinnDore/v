import { type NextPage } from 'next';
import Link from 'next/link';
import clsx from 'clsx';
import Balancer, { Provider } from 'react-wrap-balancer';

import { api } from '@/utils/api';
import { formatCompactNumber } from '@/utils/format-numbers';
import { Button } from '@/components/button';
import { ShowcaseAnonUsers } from '@/components/landing/anon-users';
import { Linear } from '@/components/landing/linear';
import { Vote } from '@/components/landing/vote';
import { VoteDemo } from '@/components/landing/vote-demo';
import { Pfp } from '@/components/pfp';

const Home: NextPage = () => {
    const statsQuery = api.landing.landingStats.useQuery();

    return (
        <>
            <div className="mx-auto flex h-max w-max max-w-full flex-col place-items-center px-4 pb-6 lg:max-w-screen-lg">
                <div className="absolute left-0 top-0 -z-20 h-screen w-screen max-w-[100vw] animate-fade-in overflow-x-clip opacity-0 ">
                    <picture>
                        <source
                            media="(prefers-color-scheme: dark)"
                            srcSet="/rays-dark.webp"
                        />
                        <img
                            src="/rays-light.webp"
                            height={982}
                            width={1005}
                            className="absolute left-1/2 aspect-auto min-w-[50rem] -translate-x-1/2 -translate-y-[30%]"
                            alt="background image of light rays"
                        />
                    </picture>
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

                <div className="mt-4 grid w-full grid-cols-3 justify-around text-center">
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
                    <div className="group relative h-48 w-full ">
                        <div className="group h-full w-full animate-fade-in opacity-0 [animation-delay:_1000ms]">
                            <FeatureTitle title="Linear integration" />

                            <div className="relative flex h-full w-full overflow-hidden rounded border border-black/50 transition-colors group-hover:border-black dark:border-white/50 group-hover:dark:border-white">
                                <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                                <div className="absolute -z-10 h-full w-full bg-blue-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                                <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                                <Linear />
                            </div>
                        </div>
                    </div>
                    <div className="group relative h-48 w-full md:row-span-2 md:h-full lg:col-span-2 lg:h-48 lg:[grid-row:_unset]">
                        <div className="h-full w-full animate-fade-in opacity-0 [animation-delay:_1150ms]">
                            <FeatureTitle title="Realtime voting" />
                            <div className="relative flex h-full w-full overflow-hidden rounded border border-black/50 transition-colors hover:border-black dark:border-white/50 dark:hover:border-white ">
                                <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                                <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>

                                <VoteDemo />
                            </div>
                        </div>
                    </div>

                    <div className="group relative h-48 w-full ">
                        <div className="group h-full w-full animate-fade-in opacity-0 [animation-delay:_1300ms]">
                            <FeatureTitle
                                title="Anonymous login"
                                className="bottom-0 translate-y-1/2"
                            />

                            <div className="relative flex h-full w-full overflow-hidden rounded border border-black/50 transition-colors group-hover:border-black dark:border-white/50 group-hover:dark:border-white">
                                <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                                <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>

                                <ShowcaseAnonUsers />
                                {/* <Tweet
                                    quote="If I wanted to point something it'd be this website for how useless it is"
                                    name="Samuel Gunter"
                                    url="https://twitter.com/samathingamajig"
                                    pfpUrl="/pfp/samuel_gunter.webp"
                                /> */}
                            </div>
                        </div>
                    </div>

                    <div className="group relative grid h-48 w-full animate-fade-in place-content-center overflow-hidden rounded border border-black/50 opacity-0 transition-colors [animation-delay:_1600ms] hover:border-black dark:border-white/50 dark:hover:border-white">
                        <Tweet
                            quote="Works great with darkreader 👍"
                            name="anna_devminer"
                            url="https://devminer.xyz"
                            pfpUrl="/pfp/anna_devminer.webp"
                        />
                        <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                    </div>

                    <div className="group relative grid h-48 w-full animate-fade-in place-content-center overflow-hidden rounded border border-black/50 opacity-0 transition-colors [animation-delay:_1750ms] hover:border-black dark:border-white/50 dark:hover:border-white">
                        <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>

                        <Tweet
                            quote="I've never seen this much layout shift in my life"
                            name="Julius"
                            url="https://twitter.com/jullerino"
                            pfpUrl="/pfp/julius.webp"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;

const Stat = (props: { name: string; value: number | undefined }) => (
    <h3 className="gap flex animate-fade-in flex-col opacity-0 [animation-delay:_500ms] md:gap-1">
        <div className="h-8 text-xl font-bold sm:text-2xl">
            {props.value && formatCompactNumber(props.value)}
        </div>
        <div className="text-xs sm:text-sm">{props.name}</div>
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

const FeatureTitle = (props: { title: string; className?: string }) => (
    <div
        className={clsx(
            props.className,
            'user-select-none absolute left-1/2 z-10 w-max -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-black/40 px-6 py-1.5 text-sm font-bold transition-colors group-hover:border-black dark:border-white/50 group-hover:dark:border-white'
        )}
    >
        <div className="absolute left-0 top-0 -z-10 h-full w-full bg-white dark:bg-black"></div>
        <h2>{props.title}</h2>
    </div>
);
