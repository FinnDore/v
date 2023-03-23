/* eslint-disable @typescript-eslint/no-unsafe-call */
import { api } from '@/utils/api';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Vote() {
    const router = useRouter();
    const { vote } = router.query;

    const [userName, setUserName] = useState('finn');
    const [choice, setChoice] = useState("I don't know");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: voteData } = api.vote.getVote.useQuery(
        {
            voteId: vote as string,
        },
        {
            enabled: typeof vote !== 'undefined',
        }
    );
    const queryClient = useQueryClient();

    // const { mutate: createVote } = api.vote.vote.useMutation({
    //     onSuccess: args =>
    //         queryClient.invalidateQueries(
    //             api.vote.getVote.getQueryKey({
    //                 voteId: args.voteId,
    //             })
    //         ),
    // });

    return (
        <div className="grid h-screen w-screen place-items-center">
            <pre>{JSON.stringify(voteData ?? {}, null, 2)}</pre>
            {voteData && (
                <div className="flex flex-col">
                    <input
                        className="border-2 border-gray-800 bg-black text-white"
                        type="text"
                        value={'finn'}
                        onChange={e => setUserName(e.target.value)}
                    />
                    <input
                        className="border-2 border-gray-800 bg-black text-white"
                        type="text"
                        value={"I don't know"}
                        onChange={e => setChoice(e.target.value)}
                    />
                    {/* <button
                        onClick={() =>
                            createVote({
                                userName,
                                choice,
                                voteId: voteData.id,
                            })
                        }
                    >
                        vote
                    </button> */}
                </div>
            )}
        </div>
    );
}
