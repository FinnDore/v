import { animated } from '@react-spring/web';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { Button } from '@/components/button';
import { VoteButton } from '@/components/vote/vote-button';
import { usePokerId, usePokerState, useVotes } from '@/hooks/poker-hooks';

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, '??'];
const Vote = () => {
    const { doVote, currentVote, highestVote, votesMap, showVotes } =
        useVotes();

    return (
        <div className="mx-auto my-auto flex h-max w-max max-w-full flex-col place-items-center justify-center px-12 py-6 lg:max-w-screen-lg">
            <animated.div className="mx-auto flex flex-wrap justify-center gap-2 md:gap-4">
                {voteOptions.map(vote => (
                    <VoteButton
                        key={vote}
                        vote={vote}
                        showVotes={showVotes}
                        users={votesMap[vote.toString()]?.users ?? []}
                        currentVotes={votesMap[vote.toString()]?.count ?? 0}
                        totalVotes={highestVote[1]}
                        doVote={doVote}
                        current={currentVote?.choice === vote.toString()}
                    />
                ))}
            </animated.div>
            <VoteDescription />
        </div>
    );
};

export default Vote;

const VoteDescription = () => {
    const pokerId = usePokerId();
    const { pokerState } = usePokerState();
    const { activeVote } = useVotes();
    const anonUser = useAnonUser();
    const showResults = pokerState?.showResults;

    const utils = api.useContext();

    const { mutate: toggleResults } =
        api.vote.pokerState.toggleResults.useMutation({
            onMutate() {
                utils.vote.pokerState.getPokerState.setData(
                    {
                        pokerId: pokerId ?? '',
                    },
                    old => {
                        if (!old) return old;
                        return {
                            ...old,
                            showResults: !old?.showResults,
                        };
                    }
                );
            },
            onError() {
                void utils.vote.pokerState.getPokerState.invalidate({
                    pokerId: pokerId ?? '',
                });
            },
        });

    return (
        <div className="mt-8 max-w-[85ch] whitespace-break-spaces">
            <h1 className="mb-4 text-2xl">
                <b>{activeVote?.title}</b>
            </h1>
            <p>
                Contrary to popular belief, Lorem Ipsum is not simply random
                text. It has roots in a piece of classical Latin literature from
                45 BC, making it over 2000 years old. Richard McClintock, a
                Latin professor at Hampden-Sydney College in Virginia, looked up
                one of the more obscure Latin words, consectetur, from a Lorem
                Ipsum passage, and going through the cites of the word in
                classical literature, discovered the undoubtable source. Lorem
                Ipsum comes from sections 1.10.32 and 1.10.33 of de Finibus
                Bonorum et Malorum (The Extremes of Good and Evil) by Cicero,
                written in 45 BC. This book is a treatise on the theory of
                ethics, very popular during the Renaissance. The first line of
                Lorem Ipsum, Lorem ipsum dolor sit amet.., comes from a line in
                section 1.10.32.
            </p>
            <div className="my-4 flex w-full gap-4">
                <Button
                    size={'sm'}
                    className="ms-auto"
                    onClick={() => {
                        toggleResults({
                            pokerId: pokerId ?? '',
                            showResults: !showResults,
                            anonUser,
                        });
                    }}
                >
                    {showResults ? 'Hide Results' : 'Show Results'}
                </Button>
            </div>
        </div>
    );
};
