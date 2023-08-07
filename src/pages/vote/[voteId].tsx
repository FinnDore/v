import { useMemo } from 'react';
import {
    CheckIcon,
    DoubleArrowLeftIcon,
    DoubleArrowRightIcon,
    ExternalLinkIcon,
    EyeOpenIcon,
} from '@radix-ui/react-icons';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { animated } from '@react-spring/web';
import clsx from 'clsx';

import { pickHex } from '@/utils/pick-hex';
import { Button } from '@/components/button';
import { Pfp } from '@/components/pfp';
import { Separator } from '@/components/seperator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
} from '@/components/tool-tip';
import { VoteButton } from '@/components/vote/vote-button';
import { voteOptions } from '@/constants';
import { useVoteControls, useVotes } from '@/hooks/poker-hooks';
import { useUserJoined } from '@/hooks/use-hop-updates';

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
        currentUserId,
    } = useVotes();
    useUserJoined();
    if (status === 'loading') return null;
    const createdByUser =
        pokerState?.createdByUser ?? pokerState?.createdByAnonUser;

    return (
        <div className="mx-auto flex w-max max-w-full flex-1 flex-col px-6 pb-6 sm:px-12 lg:max-w-screen-lg">
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
                        <h2 className="ms-auto mt-auto flex gap-2">
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
                        <animated.div className="relative mx-auto mt-auto flex flex-wrap justify-center gap-2 md:gap-4">
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
                                    currentUserId={currentUserId}
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
        averages,
        stats,
        isFollowing,
    } = useVoteControls();

    const color = useMemo(() => {
        if (typeof stats?.votePercent !== 'undefined') {
            return pickHex(
                [34, 197, 94],
                [190, 18, 60],
                stats.votePercent / 100
            );
        }
    }, [stats?.votePercent]);

    const voteComplete = (stats?.votePercent ?? 0) >= 100;
    if (!activeVote) return null;

    return (
        <div className="mx-auto mt-8 w-[clamp(90%,85ch,100%)] whitespace-break-spaces">
            <div>
                <h1 className="mb-2 h-6 max-w-full text-base md:text-2xl">
                    <Title
                        title={activeVote.title}
                        url={activeVote.url}
                        loading={status === 'loading'}
                    />
                </h1>
                <p className="max-h-56 max-w-full overflow-auto break-words text-sm md:text-base">
                    {activeVote?.description}
                </p>
            </div>
            <div className="my-4 flex w-full gap-2">
                {stats && isHost && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div
                                    className="my-auto grid h-9 w-[6ch] place-items-center rounded-md border px-2 text-sm transition-colors"
                                    style={{
                                        borderColor: color,
                                        color,
                                    }}
                                >
                                    {voteComplete && (
                                        <CheckIcon
                                            className="m-auto animate-[fadeIn_250ms_ease-out] text-green-500"
                                            height={20}
                                            width={20}
                                        />
                                    )}
                                    {!voteComplete && <>{stats.votePercent}%</>}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                {voteComplete && <>Voting complete</>}
                                {!voteComplete && (
                                    <>
                                        {stats.votePercent}% of the votes are
                                        cast
                                    </>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                {showResults && averages && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="my-auto me-auto flex h-9 w-[6ch] rounded-md border border-black px-2 text-sm dark:border-white">
                                    <div className="m-auto">
                                        {averages.mean}
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="text-center"
                            >
                                <div>average</div>
                                {averages.peter && (
                                    <>
                                        <Separator className="my-1" />
                                        <div className="">
                                            peter: {averages.peter}
                                        </div>
                                    </>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <div className="ms-auto flex gap-2">
                    {!isHost && !isFollowing && (
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
                            <TooltipContent side="bottom">
                                Next vote
                            </TooltipContent>
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
        </div>
    );
};

const Title = (props: {
    url: string | null;
    title: string;
    loading: boolean;
}) => {
    if (props.loading) return null;

    return (
        <b
            className={clsx({
                'italic opacity-70': !props.title,
            })}
        >
            {props.url ? (
                <a
                    className="flex gap-1"
                    referrerPolicy="no-referrer"
                    target="_blank"
                    href={props.url}
                >
                    {props.title || 'No title'}
                    <ExternalLinkIcon className="my-auto" />
                </a>
            ) : (
                <div>{props.title || 'No title'}</div>
            )}
        </b>
    );
};
