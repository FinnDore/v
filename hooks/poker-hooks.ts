import { useRouter } from 'next/router';

import { api } from '@/utils/api';

export const usePokerId = () => {
    const router = useRouter();
    return Array.isArray(router.query.voteId)
        ? router.query.voteId[0]
        : router.query.voteId;
};

export const useVotes = () => {
    const pokerId = usePokerId();
    const { data } = api.vote.pokerState.getVotes.useQuery(
        { pokerId: pokerId ?? '' },
        {
            enabled: !!pokerId,
        }
    );

    return data;
};
