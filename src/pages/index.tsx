import { type NextPage } from 'next';
import Balancer, { Provider } from 'react-wrap-balancer';

import { Button } from '@/components/button';
import { VoteButton } from '@/components/vote/vote-button';

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, '??'];
const Home: NextPage = () => {
    return (
        <Provider>
            <div className=" absolute -z-10 h-screen w-screen object-cover">
                <picture>
                    <img
                        src="/temp-rays.png"
                        className=" h-full w-full object-cover"
                    />
                </picture>
                <div className="noise absolute h-full w-full"></div>
            </div>
            <div className="mx-auto flex h-max w-max max-w-full flex-col place-items-center  px-12 pb-6 lg:max-w-screen-lg">
                <h1 className="text-2xl font-bold md:mt-16 md:text-6xl">
                    <Balancer>The better way to point things</Balancer>
                </h1>
                <h2 className="mt-6 text-center text-gray-400">
                    <Balancer>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Pellentesque vitae quam ac eros malesuada molestie ac
                        sit amet tortor. Aenean vehicula dignissim dui, et
                        aliquet purus porttitor sed. Nullam hendrerit orci eget
                        aliquet tempor
                    </Balancer>
                </h2>

                <div className="mt-12 flex w-full justify-around px-4 text-center text-xl">
                    <h3>
                        <div>100k</div>
                        <div className="text-sm">Votes cast</div>
                    </h3>
                    <h3>
                        <div>2.5k</div> <div className="text-sm">Sessions</div>
                    </h3>
                    <h3>
                        <div>10.5k</div>
                        <div className="text-sm">Cumulative points</div>
                    </h3>
                </div>

                <div className="relative mx-auto mt-12 flex flex-wrap justify-center gap-2 md:gap-4">
                    <div className="absolute top-1/2 h-10 w-full translate-y-1/2 bg-white blur-md dark:bg-black"></div>
                    {voteOptions.map((vote, i) => (
                        <VoteButton
                            key={vote}
                            vote={vote}
                            showVotes={true}
                            users={[]}
                            currentVotes={Math.max(1, Math.random() * 10)}
                            totalVotes={voteOptions.length - 1}
                            doVote={() => ({})}
                            current={i === 2}
                        />
                    ))}
                </div>
                <Button
                    variant="ghost"
                    className="mx-auto mt-12 flex rounded-md  px-3 py-2 text-2xl"
                >
                    <span className="my-auto flex">
                        <span className="my-auto leading-none">
                            create Vote
                        </span>
                    </span>
                </Button>
            </div>
        </Provider>
    );
};

export default Home;
