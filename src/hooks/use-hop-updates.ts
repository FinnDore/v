import { useChannelMessage } from '@onehop/react';

import { api } from '@/utils/api';
import { useUser } from '@/utils/local-user';
import { ChannelEvents } from '@/server/channel-events';
import { type UsersInVote, type Vote } from '@/server/hop';
import { usePokerId } from './poker-hooks';

export const useHopUpdates = () => {
    const pokerId = usePokerId();
    const utils = api.useContext();
    const { user } = useUser();
    const channelId = `poker_${pokerId ?? ''}`;

    useChannelMessage(
        channelId,
        ChannelEvents.VOTE_UPDATED,
        (updatedVote: Vote) => {
            utils.vote.pokerState.getVotes.setData(
                { pokerId: pokerId ?? '' },
                old => {
                    if (!old) return [updatedVote];
                    // We probably know our own vote.
                    if (updatedVote.id === user?.id) return old;

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
