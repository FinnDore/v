import { animated } from '@react-spring/web';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { Button } from '@/components/button';
import { VoteButton } from '@/components/vote/vote-button';
import {
    useActiveVote,
    usePokerId,
    usePokerState,
    useVotes,
} from '@/hooks/poker-hooks';

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, '??'];
const Vote = () => {
    const { doVote, currentVote, highestVote, votesMap, showVotes } =
        useVotes();

    return (
        <div className="mx-auto my-auto flex h-max w-max max-w-full flex-col place-items-center justify-center px-6 py-6 sm:px-12 lg:max-w-screen-lg">
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
    const { activeVote, status } = useActiveVote();
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
        <div className="mx-auto mt-8 w-[clamp(90%,85ch,100%)] whitespace-break-spaces">
            <div className="min-h-[3.50rem] md:min-h-[4rem]">
                <h1 className="mb-2 h-7 text-base md:mb-3 md:text-2xl">
                    <b>
                        {activeVote?.title}

                        {!activeVote?.title && status !== 'loading' && (
                            <span className="italic opacity-70">No title</span>
                        )}
                    </b>
                </h1>
                <p className="text-sm md:text-base">
                    {activeVote?.description}

                    {!activeVote?.description && status !== 'loading' && (
                        <span className="italic opacity-70">
                            No description provided
                        </span>
                    )}
                </p>
            </div>
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
