import { useChannelMessage } from '@onehop/react';
import { parse } from 'superjson';

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
        (e: { data: string }) => {
            const updatedVoteChoice: Vote = parse(e.data);
            const updatedPokerVoteId = updatedVoteChoice.pokerVote.id;
            const currentVote = utils.vote.pokerState.getPokerState
                .getData({
                    pokerId: pokerId ?? '',
                })
                ?.pokerVote?.find(x => x.id === updatedPokerVoteId)
                ?.voteChoice?.find(v => v.id === updatedVoteChoice.id);

            // We probably know our own vote, if we do have a current vote as its updated optimistically
            if (
                currentVote &&
                (updatedVoteChoice.anonUser?.id === user?.id ||
                    updatedVoteChoice.user?.id === user?.id)
            )
                return;

            utils.vote.pokerState.getPokerState.setData(
                { pokerId: pokerId ?? '' },
                old => {
                    if (!old) return old;
                    // TODO deep clone /shrug
                    const newState = {
                        ...old,
                        pokerVote: [
                            ...old.pokerVote?.map(x => ({
                                ...x,
                                voteChoice: [...x.voteChoice],
                            })),
                        ],
                    };

                    const newVote = newState.pokerVote?.find(
                        x => x.id === updatedPokerVoteId
                    );

                    if (!newVote) return old;
                    const itemIndex = newVote.voteChoice.findIndex(
                        v =>
                            (v.user?.id ?? v.anonUser?.id) ===
                                updatedVoteChoice.user?.id ??
                            updatedVoteChoice.anonUser?.id
                    );

                    if (itemIndex === -1) {
                        newVote.voteChoice.push(updatedVoteChoice);
                    } else if (newVote.voteChoice[itemIndex]) {
                        newVote.voteChoice[itemIndex] = updatedVoteChoice;
                    }
                    return newState;
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
