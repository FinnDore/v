import { useChannelMessage } from '@onehop/react';
import { animated, config, useSpring } from '@react-spring/web';
import { clsx } from 'clsx';
import { useRouter } from 'next/router';

import { type Vote } from '@/server/hop';
import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';

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

const voteOptions = [1, 2, 3, 5, 8, 13, 21, 34, 55, 86];
export default function Vote() {
    const pokerId = usePokerId();
    const utils = api.useContext();

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

    return (
        <div className="grid h-screen w-screen max-w-screen-2xl place-items-center text-white">
            <div className="mx-6 flex flex-wrap gap-4">
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
    const currentVote = votes?.find(
        v => (v.user?.id ?? v.anonUser?.id) === anonUser?.id
    );

    const current = currentVote?.choice === vote.toString();
    const voteCount = votes?.filter(v => v.choice === vote.toString()).length;
    const styles = useSpring({
        height: ((voteCount ?? 0) / (votes?.length ?? 0)) * 100,
        config: current ? config.default : config.wobbly,
    });

    if (!pokerId) return null;

    return (
        <div className="my-2 flex flex-col">
            <div className="relative mx-auto mb-1 h-24 rotate-180 ">
                <div className="absolute z-10 h-1/3 w-full bg-gradient-to-b from-white to-transparent dark:from-black"></div>
                <animated.div
                    style={styles}
                    className="w-8 rounded-b-md border border-orange-400 bg-orange-600"
                ></animated.div>
            </div>
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
