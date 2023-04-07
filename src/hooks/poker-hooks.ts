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
    const { data } = api.vote.pokerState.getPokerState.useQuery(
        { pokerId: pokerId ?? '' },
        {
            enabled: !!pokerId,
        }
    );

    const currentVoteId = data?.pokerVote?.find(x => x.active)?.id;

    const utils = api.useContext();
    const anonUser = useAnonUser();
    const { mutate } = api.vote.vote.useMutation({
        onMutate: ({ choice, pokerVoteId }) => {
            if (!pokerVoteId || !pokerId || !anonUser) return;
            void utils.vote.pokerState.getPokerState.cancel({
                pokerId,
            });
            utils.vote.pokerState.getPokerState.setData(
                {
                    pokerId,
                },
                old => {
                    const userId = session.user?.id;
                    if (!userId || !old) return old;

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
                        x => x.id === pokerVoteId
                    );

                    if (!newVote) return old;

                    const itemIndex = newVote.voteChoice.findIndex(
                        v => (v.user?.id ?? v.anonUser?.id) === userId
                    );

                    if (itemIndex === -1) return old;

                    const oldItem = newVote.voteChoice.splice(itemIndex, 1)[0];
                    if (oldItem) {
                        newVote.voteChoice.push({ ...oldItem, choice });
                    }

                    return newState;
                }
            );
        },
        onError: _err => {
            if (!pokerId) return;
            void utils.vote.pokerState.getPokerState.refetch({
                pokerId,
            });
        },
    });

    return {
        votes: data,
        activeVote: data?.pokerVote?.find(x => x.active),
        doVote: (choice: number) => {
            if (!currentVoteId || !anonUser) return;

            mutate({
                choice: choice.toString(),
                pokerVoteId: currentVoteId,
                anonUser,
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            window.navigator.vibrate([10]);
        },
    };
};
