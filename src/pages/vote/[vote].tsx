import { useRouter } from 'next/router';

import { api } from '@/utils/api';

export default function Vote() {
    const router = useRouter();
    const { vote } = router.query;
    const { data: voteData } = api.vote.getVote.useQuery(
        {
            voteId: vote as string,
        },
        {
            enabled: typeof vote !== 'undefined',
        }
    );

    return (
        <div className="grid h-screen w-screen place-items-center">
            <pre>{JSON.stringify(voteData ?? {}, null, 2)}</pre>
        </div>
    );
}
