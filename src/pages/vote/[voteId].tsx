import { useState } from 'react';
import { animated } from '@react-spring/web';

import { Button } from '@/components/button';
import { VoteButton } from '@/components/vote/vote-button';
import { useVotes } from '@/hooks/poker-hooks';

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, 86];
const Vote = () => {
    const { doVote, activeVote, currentVote, highestVote, votesMap } =
        useVotes();
    const [showResults, setShowResults] = useState(false);

    return (
        <div className="mx-auto my-auto flex h-max w-max max-w-full flex-col place-items-center justify-center px-12 py-6 lg:max-w-screen-lg">
            <animated.div className="mx-auto flex flex-wrap justify-center gap-2 md:gap-4">
                {voteOptions.map(vote => (
                    <VoteButton
                        key={vote}
                        vote={vote}
                        showVotes={showResults}
                        users={votesMap[vote.toString()]?.users ?? []}
                        currentVotes={votesMap[vote.toString()]?.count ?? 0}
                        totalVotes={highestVote[1]}
                        doVote={doVote}
                        current={currentVote?.choice === vote.toString()}
                    />
                ))}
            </animated.div>
            <div className="mt-8 max-w-[85ch] whitespace-break-spaces">
                <h1 className="mb-4 text-2xl">
                    <b>{activeVote?.title}</b>
                </h1>
                <p>
                    Contrary to popular belief, Lorem Ipsum is not simply random
                    text. It has roots in a piece of classical Latin literature
                    from 45 BC, making it over 2000 years old. Richard
                    McClintock, a Latin professor at Hampden-Sydney College in
                    Virginia, looked up one of the more obscure Latin words,
                    consectetur, from a Lorem Ipsum passage, and going through
                    the cites of the word in classical literature, discovered
                    the undoubtable source. Lorem Ipsum comes from sections
                    1.10.32 and 1.10.33 of de Finibus Bonorum et Malorum (The
                    Extremes of Good and Evil) by Cicero, written in 45 BC. This
                    book is a treatise on the theory of ethics, very popular
                    during the Renaissance. The first line of Lorem Ipsum, Lorem
                    ipsum dolor sit amet.., comes from a line in section
                    1.10.32.
                </p>
                <div className="my-4 flex w-full gap-4">
                    <Button
                        size={'sm'}
                        className="ms-auto"
                        onClick={() => {
                            setShowResults(x => !x);
                        }}
                    >
                        {showResults ? 'Hide Results' : 'Show Results'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Vote;
