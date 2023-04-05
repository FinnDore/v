import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { Vote } from '@/server/hop';

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
    const queryClient = useQueryClient();
    const utils = api.useContext();
    const anonUser = useAnonUser();
    const { mutate } = api.vote.vote.useMutation({
        onMutate: async ({ anonUser, choice, voteId }) => {
            console.log(pokerId);
            // utils.vote.pokerState.getVotes.setData(
            //     {
            //         pokerId: voteId,
            //     },
            //     old => {
            //         console.log('mutating');
            //         const newVotes = [...(old ?? [])];

            //         const item = newVotes.find(
            //             v => (v.user?.id ?? v.anonUser?.id) === anonUser?.id
            //         );

            //         const outputVotes = newVotes.filter(
            //             v => (v.user?.id ?? v.anonUser?.id) !== anonUser?.id
            //         );

            //         if (item) {
            //             outputVotes.push({ ...item, choice: choice });
            //         }

            //         return newVotes;
            //     }
            // );
            await queryClient.cancelQueries(
                api.vote.pokerState.getVotes.getQueryKey({
                    pokerId: voteId,
                })
            );
            console.log(
                api.vote.pokerState.getVotes.getQueryKey(
                    {
                        pokerId: voteId,
                    },
                    'query'
                )
            );
            queryClient.setQueryData(
                api.vote.pokerState.getVotes.getQueryKey(
                    {
                        pokerId: voteId,
                    },
                    'query'
                ),
                (old: Vote[]): Vote[] => {
                    console.log('mutating');
                    const newVotes = [...(old ?? [])];

                    const item = newVotes.find(
                        v => (v.user?.id ?? v.anonUser?.id) === anonUser?.id
                    );

                    const outputVotes = newVotes.filter(
                        v => (v.user?.id ?? v.anonUser?.id) !== anonUser?.id
                    );

                    if (item) {
                        outputVotes.push({ ...item, choice: choice });
                    }

                    return newVotes;
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
