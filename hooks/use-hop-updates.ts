import { useChannelMessage } from '@onehop/react';

import { api } from '@/utils/api';
import { Vote } from '@/server/hop';
import { usePokerId } from './poker-hooks';

export const useHopUpdates = () => {
    const pokerId = usePokerId();
    const utils = api.useContext();

    // This hook causes a re-render on every message
    useChannelMessage(
        `poker_${pokerId ?? ''}`,
        'VOTE_UPDATE',
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
};
