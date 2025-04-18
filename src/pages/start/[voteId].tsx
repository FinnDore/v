import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { CheckIcon, Cross2Icon, Link2Icon } from '@radix-ui/react-icons';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { Button } from '@/components/button';
import { Pfp } from '@/components/pfp';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tool-tip';
import { usePokerId } from '@/hooks/poker-hooks';
import { useChannelMessage, useUserJoined } from '@/hooks/use-updates';
import { ChannelEvents } from '@/server/channel-events';
import { type UsersInVote } from '@/server/hop';

const Start = () => {
    const pokerId = usePokerId();
    const { channelId } = useUserJoined();
    const utils = api.useContext();
    const router = useRouter();

    const url = useMemo(() => {
        if (typeof window !== undefined && pokerId) {
            return `/api/qrcode/${encodeURIComponent(
                window.location.origin + '/join/' + (pokerId ?? ''),
            )}`;
        }

        return null;
    }, [pokerId]);

    const { data: users, status: userStatus } =
        api.vote.lobby.listUsersInVote.useQuery(
            {
                voteId: pokerId ?? '',
            },
            {
                enabled: !!pokerId,
            },
        );

    const userJoined = useCallback(
        ({ users: incomingUsers }: { users: UsersInVote }) => {
            utils.vote.lobby.listUsersInVote.setData(
                { voteId: pokerId ?? '' },
                () => incomingUsers,
            );
        },
        [utils, pokerId],
    );
    useChannelMessage(channelId, ChannelEvents.USER_JOINED, userJoined);

    const noUsers = !users?.length;
    const lastUser = users?.[0];
    if (!url) return null;

    return (
        <div className="mx-auto my-auto flex h-max w-max max-w-full flex-col place-items-center gap-6 px-6 pb-6 sm:px-12 lg:max-w-screen-lg">
            <div className="mt-auto flex flex-col sm:flex-row">
                {url && (
                    <div>
                        <div className="relative mx-auto mb-4 aspect-square sm:mb-0 sm:w-64">
                            {lastUser && (
                                <picture>
                                    <img
                                        className="absolute -z-1 aspect-square w-full rounded-full opacity-50 blur-2xl duration-1000 motion-safe:animate-[spin_3s_linear_infinite]"
                                        src={
                                            lastUser.image ??
                                            `/api/gradient/${encodeURIComponent(
                                                lastUser.pfpHash ?? '',
                                            )}`
                                        }
                                        alt="Blurred gradient background behind the join QR code"
                                        suppressHydrationWarning
                                    />
                                </picture>
                            )}

                            <picture>
                                <img
                                    className="absolute z-10 aspect-square w-full rounded-md border border-black/20 dark:border-white"
                                    src={url}
                                    alt={`QR code to join vote ${
                                        pokerId ?? ''
                                    }`}
                                />
                            </picture>
                        </div>
                        <div className="mt-2 w-full min-w-full text-center text-sm underline transition-transform hover:scale-105">
                            <a
                                target="__blank"
                                href={'/join/' + (pokerId ?? '')}
                            >
                                {pokerId}
                            </a>
                            <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger
                                        onClick={() => {
                                            if (!pokerId) return;

                                            void navigator.clipboard.writeText(
                                                window.location.origin +
                                                    '/join/' +
                                                    pokerId,
                                            );
                                        }}
                                    >
                                        <Link2Icon className="ml-1 inline-block h-4 w-4" />
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p>Copy join link</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                )}
                <div className="-ml-4 flex max-h-[285px] w-full flex-col overflow-x-visible overflow-y-auto ps-4 pb-4 text-center sm:ml-0 sm:w-64 sm:ps-8 sm:text-start">
                    <div className="mb-3 text-2xl font-bold">
                        Users{' '}
                        {!!users?.length && (
                            <span className="mx- text-sm opacity-80">
                                <i>( {users?.length} ) </i>
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 overflow-x-visible">
                        {!noUsers &&
                            users.map(item => (
                                <li
                                    className="flex animate-[fadeIn_250ms_ease-out]"
                                    key={item.id}
                                >
                                    <Pfp
                                        image={item.image}
                                        pfpHash={item.pfpHash}
                                        name={item?.name ?? 'Unknown user'}
                                        className="mr-4 w-6"
                                    />
                                    <span>{item?.name ?? 'Unknown user'}</span>
                                    <WhiteListOrKick user={item} />
                                </li>
                            ))}
                        {noUsers && userStatus !== 'pending' && (
                            <div className="text-sm opacity-75">
                                There is no one here yet! Scan the QR code or
                                share the join link
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Button
                className="mb-auto w-full shadow-md shadow-orange-600"
                onClick={() => {
                    if (!pokerId) return;
                    void router.push(`/vote/${pokerId}`);
                }}
            >
                START
            </Button>
        </div>
    );
};

export default Start;

const WhiteListOrKick = ({ user }: { user: UsersInVote[number] }) => {
    const anonUser = useAnonUser();
    const pokerId = usePokerId();
    const utils = api.useContext();

    const kickOrWhitelistMutation =
        api.vote.lobby.kickOrWhitelistUser.useMutation({
            onSettled() {
                void utils.vote.lobby.listUsersInVote.invalidate({
                    voteId: pokerId ?? '',
                });
            },
        });

    const kickOrWhiteList = useCallback(
        (kick: boolean) =>
            void kickOrWhitelistMutation.mutate({
                pokerId: pokerId ?? '',
                userId: user.pfpHash ? undefined : user.id,
                anonUserId: user.pfpHash ? user.id : undefined,
                kick,
                anonUser,
            }),
        [kickOrWhitelistMutation, pokerId, user, anonUser],
    );

    if (user.whiteListed) {
        return (
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            className="my-auto ms-auto h-max w-max rounded-sm px-[2px] py-[2px] text-rose-500"
                            onClick={() => kickOrWhiteList(true)}
                        >
                            <Cross2Icon />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Kick user</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => {
                            kickOrWhiteList(false);
                        }}
                        className="my-auto ms-auto h-max w-max rounded-sm px-[2px] py-[2px] text-green-500"
                    >
                        <CheckIcon className="ms-auto" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">whitelist user</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
