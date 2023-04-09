import { animated, config, useSpring } from '@react-spring/web';
import clsx from 'clsx';

import { Pfp } from '../pfp';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../tool-tip';

export const VoteButton = ({
    vote,
    doVote,
    currentVotes,
    totalVotes,
    current,
    users,
    showVotes,
}: {
    current: boolean;
    vote: number | string;
    doVote: (vote: number | string) => void;
    currentVotes: number;
    totalVotes: number;
    users: { name: string; id: string; image?: string; pfpHash?: string }[];
    showVotes?: boolean;
}) => {
    const height = (currentVotes / totalVotes) * 100;
    const styles = useSpring({
        height: !showVotes || isNaN(height) ? '0%' : `${height}%`,
        opacity: !showVotes || isNaN(height) || !height ? 0 : 1,
        config: config.wobbly,
    });

    const outerStyles = useSpring({
        height: !showVotes ? 0 : 120,
        opacity: !showVotes ? 0 : 1,
        config: showVotes ? config.wobbly : config.default,
    });

    return (
        <div className="my-2 flex select-none flex-col">
            <animated.div
                className="relative mx-auto mb-1 rotate-180"
                style={outerStyles}
            >
                <div className="absolute top-0 z-10 h-1/3 w-full bg-gradient-to-b from-white dark:from-black"></div>
                <animated.div
                    style={styles}
                    className="w-6 rounded-b-md border-2 border-orange-400 border-t-transparent bg-orange-600 md:w-8"
                ></animated.div>
            </animated.div>
            <div
                role="button"
                className={clsx(
                    'relative h-9 w-12 text-white transition-all md:h-12 md:w-16',
                    {
                        'opacity-60': !current,
                    }
                )}
                onClick={() => doVote(vote)}
            >
                <div className="-z-1 absolute -bottom-1 left-0 h-4 w-full rounded-b-sm bg-orange-600"></div>
                <div
                    className={clsx(
                        'z-1 absolute top-0 flex h-full w-full rounded-sm border-2 border-orange-400 bg-orange-600 text-white transition-all hover:bg-orange-500',
                        {
                            '-top-1 border shadow-[inset_1px_1px_12px_#0000004f]':
                                current,
                        }
                    )}
                >
                    <div className="m-auto select-none text-xs md:text-base">
                        {vote}
                    </div>
                </div>
                {showVotes && (
                    <div className="absolute -right-0 -top-2 h-4 w-full ">
                        <div className="relative">
                            {users.map((user, i) => (
                                <TooltipProvider
                                    delayDuration={300}
                                    key={user.id}
                                >
                                    <Tooltip>
                                        <TooltipTrigger
                                            className="absolute aspect-square h-4 animate-[floatIn_250ms_ease-out]"
                                            style={{
                                                zIndex: 10 + i,
                                                right: `${i * 0.5}rem`,
                                            }}
                                        >
                                            <Pfp
                                                image={user.image}
                                                pfpHash={user.pfpHash}
                                                border={
                                                    current
                                                        ? 'border-black dark:border-white'
                                                        : 'border-transparent'
                                                }
                                                name={
                                                    !user.name
                                                        ? 'Anonymous'
                                                        : user.name
                                                }
                                                className="absolute top-0 h-4"
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="bottom"
                                            className="text-xs"
                                        >
                                            <p>{user.name}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
