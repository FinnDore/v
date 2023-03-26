import { type Vote } from '@/server/hop';
import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { useChannelMessage } from '@onehop/react';
import { clsx } from 'clsx';
import { useRouter } from 'next/router';

const usePokerId = () => {
    const router = useRouter();
    return Array.isArray(router.query.voteId)
        ? router.query.voteId[0]
        : router.query.voteId;
};

const useVotes = () => {
    const pokerId = usePokerId();

    const { data } = api.vote.pokerState.getVotes.useQuery(
        { pokerId: pokerId ?? '' },
        {
            enabled: !!pokerId,
        }
    );

    return data;
};

const voteOptions = [1, 2, 4, 8, 16, 24, 48];

export default function Vote() {
    const pokerId = usePokerId();
    const utils = api.useContext();
    const a = useVotes();

    console.log('VOTES', a);
    useChannelMessage(
        `poker_${pokerId ?? ''}`,
        'VOTE_UPDATE',
        (updatedVote: Vote) => {
            console.log('VOTE_UPDATE', updatedVote);
            // // utils.vote.pokerState.getVotes.setData(
            // //     { pokerId: pokerId ?? '' },
            // //     old => {
            // //         if (!old) return [updatedVote];
            // //         const index = old.findIndex(v => v.id === updatedVote.id);

            // //         if (index === -1) return [...old, updatedVote];
            // //         const copy = [...old];
            // //         copy[index] = updatedVote;
            // //         return copy;
            // //     }
            // );
        }
    );

    return (
        <div className=" grid h-screen w-screen place-items-center text-white">
            <div className="flex gap-4">
                {voteOptions.map(vote => (
                    <VoteButton key={vote} vote={vote} />
                ))}
            </div>
        </div>
    );
}

function VoteButton({ vote }: { vote: number }) {
    const anonUser = useAnonUser();
    const pokerId = usePokerId();
    const utils = api.useContext();
    const votes = useVotes();

    const { mutate: doVote } = api.vote.vote.useMutation({
        onMutate: ({ anonUser, choice, voteId }) => {
            utils.vote.pokerState.getVotes.setData(
                {
                    pokerId: voteId,
                },
                old => {
                    const newVotes = [...(old ?? [])];
                    const item = newVotes.find(
                        v => (v.user?.id ?? v.anonUser?.id) === anonUser?.id
                    );
                    if (item) item.choice = choice;
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

    if (!pokerId) return <div>Join a vote</div>;

    const currentVote = votes?.find(
        v => (v.user?.id ?? v.anonUser?.id) === anonUser?.id
    );
    const current = currentVote?.choice === vote.toString();
    const voteCount = votes?.filter(v => v.choice === vote.toString()).length;

    return (
        <div>
            <button
                className={clsx(
                    'relative h-12 w-16 text-white transition-all',
                    {
                        'opacity-70': !current,
                    }
                )}
                onClick={() => {
                    doVote({
                        choice: vote.toString(),
                        voteId: pokerId,
                        anonUser,
                    });
                }}
            >
                <div className="-z-1 absolute -bottom-1 left-0 h-4 w-full rounded-b-sm bg-orange-600"></div>
                <div
                    className={clsx(
                        'z-1 absolute top-0 flex h-full w-full rounded-sm border-2 border-orange-400 bg-orange-600 text-white transition-all hover:bg-orange-500',
                        {
                            '-top-1 shadow-[inset_1px_1px_12px_#0000004f]':
                                current,
                        }
                    )}
                >
                    <div className="m-auto">{vote}</div>
                </div>
            </button>
            <div className="h-4 w-full py-2 text-center">{voteCount}</div>
        </div>
    );
}
