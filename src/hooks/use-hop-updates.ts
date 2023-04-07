import { useChannelMessage } from '@onehop/react';

import { api } from '@/utils/api';
import { ChannelEvents } from '@/server/channel-events';
import { type UsersInVote } from '@/server/hop';
import { usePokerId } from './poker-hooks';

export const useHopUpdates = (): { channelId: string } => {
    const pokerId = usePokerId();
    const utils = api.useContext();
    const channelId = `poker_${pokerId ?? ''}`;

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

    return { channelId };
};
