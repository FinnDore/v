import { useChannelMessage } from '@onehop/react';

import { api } from '@/utils/api';
import { useUser } from '@/utils/local-user';
import { ChannelEvents } from '@/server/channel-events';
import { type UsersInVote, type Vote } from '@/server/hop';
import { usePokerId } from './poker-hooks';

export const useHopUpdates = (): { channelId: string } => {
    const pokerId = usePokerId();
    const utils = api.useContext();
    const { user } = useUser();
    const channelId = `poker_${pokerId ?? ''}`;

    useChannelMessage(
        channelId,
        ChannelEvents.VOTE_UPDATED,
        (updatedVote: Vote) => {
            // We probably know our own vote.
            if (
                updatedVote.anonUser?.id === user?.id ||
                updatedVote.user?.id === user?.id
            )
                return;

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
        ({ users: incomingUsers }: { users: UsersInVote }) => {
            utils.vote.lobby.listUsersInVote.setData(
                { voteId: pokerId ?? '' },
                () => incomingUsers
            );
        }
    );

    return { channelId };
};
