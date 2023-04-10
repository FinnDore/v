import { useMemo } from 'react';
import { GetServerSidePropsContext, PageConfig } from 'next';
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
    const { channelId } = useHopUpdates();
    const utils = api.useContext();
    const router = useRouter();

    const url = useMemo(() => {
        if (typeof window !== undefined && pokerId) {
            return `/api/qrcode/${encodeURIComponent(
                window.location.origin + '/join/' + (pokerId ?? '')
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
    const lastUser = users?.[0];
    if (!url) return null;

    return (
        <div className="mx-auto my-auto flex h-max w-max max-w-full flex-col place-items-center gap-6 px-6 py-6 sm:px-12 lg:max-w-screen-lg">
            <div className="mt-auto flex flex-col sm:flex-row">
                {url && (
                    <div>
                        <div className="relative mx-auto mb-4 aspect-square sm:mb-0 sm:w-64">
                            {lastUser && (
                                <picture>
                                    <img
                                        className="-z-1 absolute aspect-square w-full rounded-full opacity-50 blur-2xl duration-1000 motion-safe:animate-[spin_3s_linear_infinite]"
                                        src={
                                            lastUser.image ??
                                            `/api/gradient/${encodeURIComponent(
                                                lastUser.pfpHash ?? ''
                                            )}`
                                        }
                                        alt="Blurred gradient background behind the join QR code"
                                    />
                                </picture>
                            )}

                            <picture>
                                <img
                                    className=" absolute z-10 aspect-square w-full rounded-md border border-black/20 dark:border-white"
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
                                                    pokerId
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
                <div className="-ml-4 flex max-h-[285px] w-full flex-col overflow-y-auto overflow-x-visible pb-4 ps-4 text-center sm:ml-0 sm:w-64 sm:ps-8 sm:text-start">
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
                                </li>
                            ))}
                        {noUsers && userStatus !== 'loading' && (
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

export const getServerSideProps = (
    ctx: GetServerSidePropsContext<{ voteId: string }>
) => ({
    props: {
        voteId: Array.isArray(ctx.query.voteId)
            ? ctx.query.voteId[0]
            : ctx.query.voteId,
    },
});

export const config: PageConfig = {
    // runtime: 'experimental-edge',
};
