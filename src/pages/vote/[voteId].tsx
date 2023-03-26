import { type PokerChannelState } from '@/server/hop';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { useReadChannelState } from '@onehop/react';
import { clsx } from 'clsx';
import { useRouter } from 'next/router';

const votes = [1, 2, 4, 8, 16, 24, 48];

export default function Vote() {
    return (
        <div className=" grid h-screen w-screen place-items-center text-white">
            <div className="flex gap-4">
                {votes.map(vote => (
                    <VoteButton key={vote} vote={vote} />
                ))}
            </div>
        </div>
    );
}

function VoteButton({ vote }: { vote: number }) {
    const anonUser = useAnonUser();
    const router = useRouter();
    const voteId = Array.isArray(router.query.voteId)
        ? router.query.voteId[0]
        : router.query.voteId;

    const { state } = useReadChannelState<PokerChannelState>(
        `poker_${voteId ?? ''}`
    );

    if (!voteId) return <div>Join a vote</div>;
    const current =
        state?.votes?.find(v => v.anonUser.id === anonUser?.id)?.choice ===
        vote.toString();
    const { mutate: doVote } = api.vote.vote.useMutation();

    return (
        <button
            className={clsx('relative h-12 w-16 text-white transition-all', {
                'opacity-70': !current,
            })}
            onClick={() => {
                doVote({
                    choice: vote.toString(),
                    voteId,
                    anonUser,
                });
            }}
        >
            <div className="-z-1 absolute -bottom-1 left-0 h-4 w-full rounded-b-sm bg-orange-600"></div>
            <div
                className={clsx(
                    'z-1 absolute top-0 flex h-full w-full rounded-sm border-2 border-orange-400 bg-orange-600 text-white transition-all hover:bg-orange-500',
                    {
                        '-top-1': current,
                    }
                )}
            >
                <div className="m-auto">{vote}</div>
            </div>
        </button>
    );
}
