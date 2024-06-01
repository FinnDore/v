import { useCallback, useEffect } from 'react';
import Pusher from 'pusher-js';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { env } from '@/env.mjs';
import { ChannelEvents } from '@/server/channel-events';
import { type ChannelEvent, type UsersInVote } from '@/server/hop';
import { usePokerId } from './poker-hooks';

const pusherClient = new Pusher(env.NEXT_PUBLIC_SOKETI_APP_KEY, {
    wsHost: 'soketi-production-f7b5.up.railway.app',
    wsPort: 443,
    forceTLS: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    cluster: 'eu',
});

const channelEventMap: {
    channelId: string;
    event: ChannelEvent;
    subs: number;
}[] = [];

export const useChannelMessage = <T>(
    channelId: string,
    event: ChannelEvent,
    callback: (data: T) => void
) => {
    useEffect(() => {
        const channel = pusherClient
            .subscribe(channelId)
            .bind(event, (message: T) => {
                callback(message);
            });
        const channelEvent = channelEventMap.find(
            item => item.channelId === channelId
        );

        if (!channelEvent) {
            channelEventMap.push({ channelId, event, subs: 1 });
        } else {
            channelEvent.subs += 1;
        }
        return () => {
            const channelEvent = channelEventMap.find(
                item => item.channelId === channelId && item.event === event
            );

            if (channelEvent) {
                channelEvent.subs -= 1;
                channel.unbind(event, callback);
            }

            if (
                !channelEventMap.find(
                    item => item.channelId === channelId && item.subs !== 0
                )
            ) {
                channel.unsubscribe();
                return;
            }
        };
    }, [channelId, event, callback]);
};

export const useUserJoined = (): { channelId: string } => {
    const pokerId = usePokerId();
    const utils = api.useContext();
    const channelId = `poker_${pokerId ?? ''}`;
    const anonUser = useAnonUser();

    const userJoined = useCallback(
        (event: { data: UsersInVote }) => {
            utils.vote.lobby.listUsersInVote.setData(
                { voteId: pokerId ?? '' },
                () => event.data
            );
            void utils.vote.pokerState.getPokerState.invalidate({
                pokerId: pokerId ?? '',
                anonUser,
            });
        },
        [utils, pokerId, anonUser]
    );
    useChannelMessage(channelId, ChannelEvents.USER_JOINED, userJoined);

    return { channelId };
};
