import { useChannelMessage } from '@onehop/react';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { ChannelEvents } from '@/server/channel-events';
import { type UsersInVote } from '@/server/hop';
import { usePokerId } from './poker-hooks';

export const useUserJoined = (): { channelId: string } => {
    const pokerId = usePokerId();
    const utils = api.useContext();
    const channelId = `poker_${pokerId ?? ''}`;
    const anonUser = useAnonUser();

    useChannelMessage(
        channelId,
        ChannelEvents.USER_JOINED,
        (event: { users: UsersInVote }) => {
            utils.vote.lobby.listUsersInVote.setData(
                { voteId: pokerId ?? '' },
                () => event.users
            );
            void utils.vote.pokerState.getPokerState.invalidate({
                pokerId: pokerId ?? '',
                anonUser,
            });
        }
    );

    return { channelId };
};
