import {
    DoubleArrowLeftIcon,
    DoubleArrowRightIcon,
    EyeOpenIcon,
} from '@radix-ui/react-icons';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { animated } from '@react-spring/web';

import { Button } from '@/components/button';
import { Pfp } from '@/components/pfp';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
} from '@/components/tool-tip';
import { VoteButton } from '@/components/vote/vote-button';
import { useVoteControls, useVotes } from '@/hooks/poker-hooks';

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, '??'];
const Vote = () => {
    const {
        doVote,
        currentVote,
        highestVote,
        votesMap,
        showVotes,
        status,
        pokerState,
        isWhiteListed,
    } = useVotes();
    if (status === 'loading') return null;
    const createdByUser =
        pokerState?.createdByUser ?? pokerState?.createdByAnonUser;

    return (
        <div className="mx-auto flex h-full w-max max-w-full flex-col px-6 pb-6 sm:px-12 lg:max-w-screen-lg">
            {!isWhiteListed && (
                <div className="flex h-full">
                    <span className="m-auto opacity-70">
                        This poker session is private the host must add you
                    </span>
                </div>
            )}
            {pokerState && isWhiteListed && (
                <>
                    <div className="flex">
                        {pokerState?.title && (
                            <h1 className="text-2xl font-bold">
                                {pokerState.title}
                            </h1>
                        )}
                        <h2 className="ms-auto flex gap-2">
                            <span className="opacity-70">hosted by</span>
                            <b>{createdByUser?.name ?? 'Unknown user'}</b>
                            <Pfp
                                className="aspect-square h-6"
                                image={pokerState.createdByUser?.image}
                                pfpHash={pokerState.createdByAnonUser?.pfpHash}
                                name={createdByUser?.name ?? 'Unknown user'}
                            />
                        </h2>
                    </div>
                    <div className="m-auto">
                        <animated.div className="mx-auto mt-auto flex flex-wrap justify-center gap-2 md:gap-4">
                            {voteOptions.map(vote => (
                                <VoteButton
                                    key={vote}
                                    vote={vote}
                                    showVotes={showVotes}
                                    users={
                                        votesMap[vote.toString()]?.users ?? []
                                    }
                                    currentVotes={
                                        votesMap[vote.toString()]?.count ?? 0
                                    }
                                    totalVotes={highestVote[1]}
                                    doVote={doVote}
                                    current={
                                        currentVote?.choice === vote.toString()
                                    }
                                />
                            ))}
                        </animated.div>
                        <VoteDescription />
                    </div>
                </>
            )}
        </div>
    );
};

export default Vote;

const VoteDescription = () => {
    const {
        status,
        activeVote,
        currentIndex,
        showResults,
        voteCount,
        progressVote,
        isStart,
        isEnd,
        toggleResults,
        isHost,
        followHost,
    } = useVoteControls();

    if (!activeVote) return null;

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
            <div className="my-4 flex w-full justify-end gap-2">
                {!isHost && !activeVote.active && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    className="fade-in ms-1 aspect-square"
                                    variant="outline"
                                    onClick={() => followHost()}
                                >
                                    <EyeOpenIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                Spectate host
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <div className="my-auto ms-1 font-mono text-xs opacity-70">
                    {(currentIndex ?? 0) + 1}/{voteCount}
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                className="ms-1 aspect-square"
                                variant="outline"
                                disabled={isStart}
                                onClick={() => progressVote(true)}
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
                                disabled={isEnd}
                                onClick={() => progressVote(false)}
                            >
                                <DoubleArrowRightIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Next vote</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                {isHost && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="ms-2 w-28"
                        onClick={() => toggleResults()}
                    >
                        {showResults ? 'Hide Results' : 'Show Results'}
                    </Button>
                )}
            </div>
        </div>
    );
};
