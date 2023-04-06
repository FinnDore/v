import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useChannelMessage } from '@onehop/react';
import { Link2Icon } from '@radix-ui/react-icons';

import { api } from '@/utils/api';
import { Button } from '@/components/button';
import { Pfp } from '@/components/pfp';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tool-tip';
import { usePokerId } from '@/hooks/poker-hooks';
import { useHopUpdates } from '@/hooks/use-hop-updates';
import { ChannelEvents } from '@/server/channel-events';
import { type UsersInVote } from '@/server/hop';

const Start = () => {
    const pokerId = usePokerId();
    const url = useRef<string | null>(null);
    const { channelId } = useHopUpdates();
    const utils = api.useContext();
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== undefined && pokerId) {
            url.current = `/api/qrcode/${encodeURIComponent(
                window.location.origin + '/join/' + (pokerId ?? '')
            )}`;
        }

        return () => {
            url.current = null;
        };
    }, [pokerId]);

    const { data: users } = api.vote.lobby.listUsersInVote.useQuery(
        {
            voteId: pokerId ?? '',
        },
        {
            enabled: !!pokerId,
        }
    );

    useChannelMessage(
        channelId,
        ChannelEvents.USER_JOINED,
        ({ users: incomingUsers }: { users: UsersInVote }) => {
            utils.vote.lobby.listUsersInVote.setData(
                { voteId: pokerId ?? '' },
                () => incomingUsers
            );
        }
    );

    const noUsers = !users?.length;
    const lastUser = users?.[0]?.name;
    if (!url.current) return null;

    return (
        <div className="mx-auto flex h-full w-max max-w-full flex-col place-items-center gap-4 px-12 lg:max-w-screen-lg">
            <div className="mt-auto flex flex-col sm:flex-row">
                {url.current && (
                    <div className="relative mx-auto mb-4 aspect-square sm:mb-0 sm:w-64">
                        {lastUser && (
                            <picture>
                                <img
                                    className="-z-1 absolute aspect-square w-full animate-spin rounded-md opacity-50 blur-2xl"
                                    src={`/api/gradient/${encodeURIComponent(
                                        lastUser
                                    )}`}
                                    alt=""
                                />
                            </picture>
                        )}

                        <picture>
                            <img
                                className=" absolute z-10 aspect-square w-full rounded-md"
                                src={url.current}
                                alt={`QR code to join vote ${pokerId ?? ''}`}
                            />
                        </picture>
                        <div className="mt-2 w-full min-w-full text-center text-sm underline transition-transform hover:scale-105">
                            <a
                                target="__blank"
                                href={'/join/' + (pokerId ?? '')}
                            >
                                {pokerId}
                            </a>
                            <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <button
                                            onClick={() => {
                                                if (!pokerId) return;

                                                void navigator.clipboard.writeText(
                                                    window.location.origin +
                                                        '/join/' +
                                                        pokerId
                                                );
                                            }}
                                        >
                                            <Link2Icon className="ml-1 inline-block h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p>Copy join link</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                )}
                <div className="-ml-4 flex max-h-[285px] w-full flex-col overflow-y-auto overflow-x-visible ps-4 text-center sm:ml-0 sm:w-64 sm:ps-8 sm:text-start">
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
                                        name={item?.name ?? 'Unknown user'}
                                        className="mr-4 w-6"
                                    />
                                    <span>{item?.name ?? 'Unknown user'}</span>
                                </li>
                            ))}
                        {noUsers && (
                            <div className="text-sm opacity-75">
                                Theres no one here yet! Scan the QR code or
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
