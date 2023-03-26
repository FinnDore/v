import { type PokerChannelState } from '@/server/hop';
import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { useReadChannelState } from '@onehop/react';
import { useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const votes = [1, 2, 4, 8, 16, 24, 48];

export default function Vote() {
    const router = useRouter();
    const voteId =
        (Array.isArray(router.query.voteId)
            ? router.query.voteId[0]
            : router.query.voteId) ?? 'TODO REMOVE';

    const { state } = useReadChannelState<PokerChannelState>(`poker_${voteId}`);
    useEffect(() => {
        console.log(state);
    }, [state]);
    const queryClient = useQueryClient();
    const anonUser = useAnonUser();

    const myVote = state?.votes?.find(
        v => v.anonUser.id === anonUser?.id
    )?.choice;

    const { mutate: doVote } = api.vote.vote.useMutation({
        onSuccess: args =>
            queryClient.invalidateQueries(
                api.vote.getVote.getQueryKey({
                    voteId: args.voteId,
                })
            ),
    });
    return (
        <div className=" grid h-screen w-screen place-items-center text-white">
            <div className="flex gap-4">
                {votes.map(vote => (
                    <div key={vote}>
                        <button
                            className={clsx(
                                'relative h-12 w-16 text-white transition-all',
                                {
                                    'opacity-70': vote.toString() !== myVote,
                                }
                            )}
                            onClick={() => {
                                doVote({
                                    choice: vote.toString(),
                                    voteId,
                                    anonUser,
                                });
                            }}
                        >
                            <div className="-z-1 absolute -bottom-1 left-0 h-2 w-full rounded-b-sm bg-orange-600"></div>
                            <div className="z-1 absolute top-0 flex h-full w-full rounded-sm border-2 border-orange-400 bg-orange-600 text-white hover:bg-orange-500">
                                <div className="m-auto">{vote}</div>
                            </div>
                        </button>
                        <div className="mt-4 w-full text-center">
                            {
                                state?.votes?.filter(
                                    v => v.choice === vote.toString()
                                ).length
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
