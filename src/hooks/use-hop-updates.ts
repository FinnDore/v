import { useChannelMessage } from '@onehop/react';

import { api } from '@/utils/api';
import { ChannelEvents } from '@/server/channel-events';
import { type UsersInVote, type Vote } from '@/server/hop';
import { usePokerId } from './poker-hooks';

export const useHopUpdates = () => {
    const pokerId = usePokerId();
    const utils = api.useContext();
    const channelId = `poker_${pokerId ?? ''}`;

    // This hook causes a re-render on every message
    useChannelMessage(
        channelId,
        ChannelEvents.VOTE_UPDATED,
        (updatedVote: Vote) => {
            utils.vote.pokerState.getVotes.setData(
                { pokerId: pokerId ?? '' },
                old => {
                    if (!old) return [updatedVote];
                    const index = old.findIndex(v => v.id === updatedVote.id);
                    if (index === -1) return [...old, updatedVote];
                    const copy = [...old];
                    copy[index] = updatedVote;
                    return copy;
                }
            );
        }
    );

    useChannelMessage(
        channelId,
        ChannelEvents.USER_JOINED,
        ({ users }: { users: UsersInVote }) => {
            utils.vote.lobby.listUsersInVote.setData(
                { voteId: pokerId ?? '' },
                () => users
            );
        }
    );
};
