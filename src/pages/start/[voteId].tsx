import { useEffect, useRef, useState } from 'react';
import { useChannelMessage } from '@onehop/react';
import { Link2Icon } from '@radix-ui/react-icons';
import { animated, config, useSpring } from '@react-spring/web';

import { api } from '@/utils/api';
import { Pfp } from '@/components/pfp';
import { usePokerId } from '@/hooks/poker-hooks';
import { useHopUpdates } from '@/hooks/use-hop-updates';
import { ChannelEvents } from '@/server/channel-events';
import { type UsersInVote } from '@/server/hop';

const Start = () => {
    const pokerId = usePokerId();
    const url = useRef<string | null>(null);
    const [hovering, setHovering] = useState(false);

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

    const scaleSpring = useSpring({
        scale: hovering ? 1.05 : 1,
        config: config.gentle,
    });
    const { data: users } = api.vote.lobby.listUsersInVote.useQuery(
        {
            voteId: pokerId ?? '',
        },
        {
            enabled: !!pokerId,
        }
    );

    if (!url.current) return null;

    return (
        <div className="mx-auto flex h-full w-max max-w-full flex-col place-items-center px-12 lg:max-w-screen-lg">
            <div className="m-auto flex">
                <div>
                    {url.current && (
                        <animated.div
                            style={scaleSpring}
                            onMouseEnter={() => setHovering(true)}
                            onMouseLeave={() => setHovering(false)}
                        >
                            <picture>
                                <img
                                    className="aspect-square w-64 rounded-md"
                                    src={url.current}
                                    alt={`QR code to join vote ${
                                        pokerId ?? ''
                                    }`}
                                />
                            </picture>
                            <button className="mt-2 w-full text-center text-sm underline">
                                {pokerId}
                                <Link2Icon className="ml-1 inline-block h-4 w-4" />
                            </button>
                        </animated.div>
                    )}
                </div>
                <div className="flex max-h-[285px] w-64 flex-col overflow-y-auto ps-8">
                    <div className="mb-4 text-2xl font-bold">
                        Users{' '}
                        {!!users?.length && (
                            <span className="mx- text-sm opacity-80">
                                <i>( {users?.length} ) </i>
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Users />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Start;

const Users = () => {
    const pokerId = usePokerId();
    const utils = api.useContext();

    const { channelId } = useHopUpdates();
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

    return (
        <>
            {users?.map(item => (
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
        </>
    );
};
