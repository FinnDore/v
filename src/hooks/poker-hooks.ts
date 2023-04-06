import { useRouter } from 'next/router';

import { api } from '@/utils/api';
import { useAnonUser, useUser } from '@/utils/local-user';

export const usePokerId = () => {
    const router = useRouter();
    return Array.isArray(router.query.voteId)
        ? router.query.voteId[0]
        : router.query.voteId;
};

export const useVotes = () => {
    const pokerId = usePokerId();
    const session = useUser();
    const { data } = api.vote.pokerState.getVotes.useQuery(
        { pokerId: pokerId ?? '' },
        {
            enabled: !!pokerId,
        }
    );

    const utils = api.useContext();
    const anonUser = useAnonUser();
    const { mutate } = api.vote.vote.useMutation({
        onMutate: ({ choice, voteId }) => {
            void utils.vote.pokerState.getVotes.cancel({
                pokerId: voteId,
            });
            utils.vote.pokerState.getVotes.setData(
                {
                    pokerId: voteId,
                },
                old => {
                    const userId = session.user?.id;
                    if (!userId) return old;

                    const newVotes = [...(old ?? [])];
                    const itemIndex = newVotes.findIndex(
                        v => (v.user?.id ?? v.anonUser?.id) === userId
                    );

                    if (itemIndex === -1) return old;
                    const oldItem = newVotes.splice(itemIndex, 1)[0];
                    if (oldItem) {
                        newVotes.push({ ...oldItem, choice });
                    }
                    return [...newVotes];
                }
            );
        },
        onError: (_err, args) => {
            void utils.vote.pokerState.getVotes.refetch({
                pokerId: args.voteId,
            });
        },
    });

    return {
        votes: data,
        doVote: (choice: number) => {
            if (!pokerId || !anonUser) return;

            mutate({ choice: choice.toString(), voteId: pokerId, anonUser });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            window.navigator.vibrate([10]);
        },
    };
};
