import {
    DoubleArrowLeftIcon,
    DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { animated } from '@react-spring/web';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { Button } from '@/components/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
} from '@/components/tool-tip';
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
    const { pokerState, nextVote, prevVote, currentIndex } = usePokerState();
    const { activeVote, status } = useActiveVote();
    const anonUser = useAnonUser();
    const showResults = pokerState?.showResults;

    const { mutate: progressVote } =
        api.vote.pokerState.toggleResultsAndProgress.useMutation({});

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
                <h1 className="mb-2 h-7 max-w-full text-base md:mb-3 md:text-2xl">
                    <b>
                        {activeVote?.title}

                        {!activeVote?.title && status !== 'loading' && (
                            <span className="italic opacity-70">No title</span>
                        )}
                    </b>
                </h1>
                <p className="max-h-56 max-w-full overflow-auto break-words text-sm md:text-base">
                    {activeVote?.description}

                    {!activeVote?.description && status !== 'loading' && (
                        <span className="italic opacity-70">
                            No description provided
                        </span>
                    )}
                </p>
            </div>
            <div className="my-4 flex w-full gap-2">
                <div className="my-auto ms-auto text-xs opacity-70">
                    {(currentIndex ?? 0) + 1} /{' '}
                    {pokerState?.pokerVote?.length ?? 0}
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                className="ms-1 aspect-square"
                                variant="outline"
                                disabled={!prevVote}
                                onClick={() => {
                                    if (!prevVote) return;
                                    progressVote({
                                        pokerId: pokerId ?? '',
                                        progressTo: prevVote.id,
                                        anonUser,
                                    });
                                }}
                            >
                                <DoubleArrowLeftIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            Previous vote
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                className="ms-0 aspect-square"
                                disabled={!nextVote}
                                onClick={() => {
                                    if (!nextVote) return;
                                    progressVote({
                                        pokerId: pokerId ?? '',
                                        progressTo: nextVote.id,
                                        anonUser,
                                    });
                                }}
                            >
                                <DoubleArrowRightIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Next vote</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Button
                    size="sm"
                    variant="outline"
                    className="ms-2 w-28"
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
