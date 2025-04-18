import { useMemo } from 'react';
import { a, config, useSpring } from '@react-spring/web';
import clsx from 'clsx';

import { Pfp } from '../pfp';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../tool-tip';

type Users = { name: string; id: string; image?: string; pfpHash?: string }[];

const animated = a as any;

export const VoteButton = ({
    vote,
    doVote,
    currentVotes,
    totalVotes,
    current,
    users,
    showVotes,
    currentUserId,
    small,
    barHeight = 120,
}: {
    current: boolean;
    vote: number | string;
    doVote: (vote: number | string) => void;
    currentVotes: number;
    totalVotes: number;
    users: Users;
    showVotes?: boolean;
    currentUserId: string | ((v: { id: string }) => boolean) | undefined;
    small?: boolean;
    barHeight?: number;
}) => {
    const height = (currentVotes / totalVotes) * 100;
    const styles = useSpring({
        height:
            !showVotes || isNaN(height) || !isFinite(height)
                ? '0%'
                : `${height}%`,
        opacity:
            !showVotes || isNaN(height) || !isFinite(height) || !height ? 0 : 1,
        config: config.wobbly,
    });

    const outerStyles = useSpring({
        height: !showVotes ? 0 : barHeight,
        opacity: !showVotes ? 0 : 1,
        config: showVotes ? config.wobbly : config.default,
    });

    const { firstUsers } = useMemo(() => {
        const splitUsers = {
            firstUsers: users.slice(0, 4),
            extraUsers: users.slice(4, users.length),
        };

        // We allways want to show the pfp of the current user even if were overflowing
        if (
            currentUserId &&
            splitUsers.extraUsers.length &&
            splitUsers.extraUsers.find(user => user.id === currentUserId)
        ) {
            const index = splitUsers.extraUsers.findIndex(
                typeof currentUserId === 'function'
                    ? currentUserId
                    : user => user.id === currentUserId,
            );
            const currentUser = splitUsers.extraUsers.splice(index, 1)[0];
            const firstUserToSwitch = splitUsers.firstUsers.splice(
                splitUsers.firstUsers.length - 1,
                1,
            )[0];
            if (currentUser && firstUserToSwitch) {
                splitUsers.firstUsers.push(currentUser);
                splitUsers.extraUsers.push(firstUserToSwitch);
            }
        }

        return { firstUsers: splitUsers.firstUsers };
    }, [currentUserId, users]);

    return (
        <TooltipProvider delayDuration={300}>
            <div className="my-2 flex flex-col select-none">
                <animated.div
                    className="relative mx-auto mb-1 rotate-180"
                    style={outerStyles}
                >
                    <div className="absolute top-0 z-10 h-1/3 w-full bg-gradient-to-b from-white dark:from-black"></div>
                    <animated.div
                        style={styles}
                        className={clsx(
                            {
                                '!w-[1.45rem]': small,
                            },
                            'w-[1.45rem] rounded-b-md border-2 border-orange-400 border-t-transparent bg-orange-600 md:w-8',
                        )}
                    ></animated.div>
                </animated.div>
                <button
                    role="button"
                    className={clsx(
                        'btn-shadow relative z-20 h-9 w-12 text-white transition-all md:h-12 md:w-16 dark:shadow-none',
                        {
                            'opacity-60': !current,
                            '!h-9 !w-12': small,
                        },
                    )}
                    onClick={() => doVote(vote)}
                >
                    <div className="absolute -bottom-1 left-0 -z-1 h-4 w-full rounded-b-sm bg-orange-600"></div>
                    <div
                        className={clsx(
                            'absolute top-0 z-1 flex h-full w-full rounded-sm border-2 border-orange-400 bg-orange-600 text-white transition-all hover:bg-orange-500',
                            {
                                '-top-1 border shadow-[inset_1px_1px_12px_#0000004f]':
                                    current,
                            },
                        )}
                    >
                        <div className="m-auto text-xs select-none md:text-base">
                            {vote}
                        </div>
                    </div>
                    {showVotes && firstUsers?.length && (
                        <div className="absolute -top-2 -right-0 h-4 w-full">
                            <div className="relative">
                                {firstUsers.map((user, i) => (
                                    <Tooltip key={user.id}>
                                        <TooltipTrigger
                                            asChild
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
                                                name={user.name}
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
                                ))}
                            </div>
                        </div>
                    )}
                </button>
            </div>
        </TooltipProvider>
    );
};
