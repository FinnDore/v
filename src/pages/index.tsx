import { useState } from 'react';
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

const FeatureDescriptions = {
    'Anonymous login': (
        <p>
            Completely Anonymous, accounts allowing you to start a vote with
            your team in seconds
        </p>
    ),
    'Linear integration': (
        <p>
            Quickly import unpointed story&apos;s via the Linear integration
            <i> ( coming soon™️ )</i>
        </p>
    ),
    'Realtime voting': (
        <p>
            Realtime voting with live updates, see the results as they come in
        </p>
    ),
} as const;

type FeatureDescription = keyof typeof FeatureDescriptions;

const Home: NextPage = () => {
    const statsQuery = api.landing.landingStats.useQuery();
    const [hoveredFeature, setHoveredFeature] =
        useState<FeatureDescription>('Linear integration');

    return (
        <>
            <div className="mx-auto flex h-max w-max max-w-full flex-col place-items-center px-4 pb-6 lg:max-w-screen-lg">
                <div className="animate-fade-in absolute top-0 left-0 -z-20 h-screen w-screen max-w-[100vw] overflow-x-clip opacity-0">
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
                    <h1 className="animate-fade-in w-full text-center text-4xl font-bold opacity-0 [animation-delay:_200ms] md:mt-8 md:text-6xl">
                        <Balancer>The better way to point things</Balancer>
                    </h1>
                    <h2 className="animate-fade-in mt-4 w-full text-center text-sm text-gray-700 opacity-0 [animation-delay:_300ms] md:mt-6 md:text-base dark:text-gray-300">
                        <Balancer>
                            Spin up pointing poker sessions for your team in
                            seconds, no sign up required allowing for
                            frictionless pointing.
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
                    className="animate-fade-in mx-auto mt-10 opacity-0 [animation-delay:_750ms]"
                >
                    <Button
                        variant="outline"
                        className="flex rounded-md px-3 py-2 text-2xl dark:hover:border-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                        <span className="my-auto flex">
                            <span className="my-auto leading-none">
                                Create Vote
                            </span>
                        </span>
                    </Button>
                </Link>

                <div className="animate-fade-in mt-10 flex flex-col justify-center gap-2 text-center opacity-0 [animation-delay:_1000ms]">
                    <h1 className="text-2xl font-extrabold">
                        {hoveredFeature}
                    </h1>
                    {FeatureDescriptions[hoveredFeature]}
                </div>

                <div className="mt-10 flex w-full max-w-lg grid-cols-1 flex-wrap items-center justify-center gap-5 px-4 md:mx-auto md:grid md:min-w-[80vw] md:grid-cols-2 md:grid-rows-2 lg:min-w-[900px] lg:grid-cols-3">
                    <div
                        className="group animate-fade-in relative h-48 w-full bg-white opacity-0 [animation-delay:_1000ms] dark:bg-black"
                        onMouseEnter={() =>
                            setHoveredFeature('Linear integration')
                        }
                    >
                        <FeatureTitle title="Linear integration" />

                        <div className="relative flex h-full w-full overflow-hidden rounded border border-black/50 transition-colors group-hover:border-black dark:border-white/50 group-hover:dark:border-white">
                            <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                            <div className="absolute -z-10 h-full w-full bg-blue-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                            <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                            <Linear />
                        </div>
                    </div>

                    <div
                        className="group animate-fade-in relative h-48 w-full bg-white opacity-0 [animation-delay:_1150ms] md:row-span-2 md:h-full lg:col-span-2 lg:[grid-row:_unset] lg:h-48 dark:bg-black"
                        onMouseEnter={() =>
                            setHoveredFeature('Realtime voting')
                        }
                    >
                        <FeatureTitle title="Realtime voting" />
                        <div className="relative flex h-full w-full overflow-hidden rounded border border-black/50 transition-colors hover:border-black dark:border-white/50 dark:hover:border-white">
                            <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                            <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>

                            <VoteDemo />
                        </div>
                    </div>

                    <div
                        className="group animate-fade-in relative h-48 w-full bg-white opacity-0 [animation-delay:_1300ms] dark:bg-black"
                        onMouseEnter={() =>
                            setHoveredFeature('Anonymous login')
                        }
                    >
                        <FeatureTitle
                            title="Anonymous login"
                            className="lg:bottom-0 lg:translate-y-1/2"
                        />

                        <div className="relative flex h-full w-full overflow-hidden rounded border border-black/50 transition-colors group-hover:border-black dark:border-white/50 group-hover:dark:border-white">
                            <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                            <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>

                            <ShowcaseAnonUsers />
                        </div>
                    </div>

                    <div className="group animate-fade-in relative grid h-48 w-full place-content-center overflow-hidden rounded border border-black/50 bg-white opacity-0 transition-colors [animation-delay:_1600ms] hover:border-black dark:border-white/50 dark:bg-black dark:hover:border-white">
                        <Tweet
                            quote="If I wanted to point something it'd be this website for how useless it is"
                            name="Samuel Gunter"
                            url="https://twitter.com/samathingamajig"
                            pfpUrl="/pfp/samuel_gunter.webp"
                        />
                        <div className="absolute -z-10 h-full w-full bg-white/50 blur-md dark:bg-black/50"></div>
                        <div className="absolute -z-10 h-full w-full bg-orange-600 opacity-10 blur-lg transition-opacity group-hover:opacity-20"></div>
                    </div>

                    <div className="group animate-fade-in relative grid h-48 w-full place-content-center overflow-hidden rounded border border-black/50 bg-white opacity-0 transition-colors [animation-delay:_1750ms] hover:border-black dark:border-white/50 dark:bg-black dark:hover:border-white">
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
    <h3 className="gap animate-fade-in flex flex-col opacity-0 [animation-delay:_500ms] md:gap-1">
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
            'user-select-none absolute left-1/2 z-10 w-max -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-black/40 px-6 py-1.5 text-sm font-bold transition-colors group-hover:border-black dark:border-white/50 group-hover:dark:border-white',
        )}
    >
        <div className="absolute top-0 left-0 -z-10 h-full w-full bg-white dark:bg-black"></div>
        <h2>{props.title}</h2>
    </div>
);
