import { useCallback } from 'react';
import { type NextPage } from 'next';
import { useRouter } from 'next/router';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { signIn } from 'next-auth/react';

import { useAnonUser, useUser } from '@/utils/local-user';
import { Button } from '@/components/button';
import { Separator } from '@/components/seperator';
import { SignIn } from '@/components/sign-in';
import { usePokerId } from '@/hooks/poker-hooks';
import { api } from '../../utils/api';

const Home: NextPage = () => {
    const router = useRouter();
    const voteId = usePokerId();
    const anonUser = useAnonUser();
    const { user, status } = useUser();

    const { mutateAsync: joinVote, status: joinVoteStatus } =
        api.vote.lobby.joinVote.useMutation();

    const joinVoteAndRedirect = useCallback(async () => {
        if (!voteId || joinVoteStatus === 'loading') return;
        await joinVote({ voteId, anonUser: anonUser });
        void router.push(`/vote/${voteId}`);
    }, [anonUser, joinVote, joinVoteStatus, router, voteId]);

    if (!voteId) return null;

    return (
        <div className="grid h-screen w-screen place-items-center">
            {!user && status !== 'loading' && <SignIn />}
            {status === 'anon' && (
                <div className="flex w-48 flex-col">
                    <Button
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick={() => {
                            void joinVoteAndRedirect();
                        }}
                    >
                        join vote as {user.name}
                    </Button>
                    <div className="my-2 flex w-full content-center items-center text-xs">
                        <Separator className=" w-full" />

                        <b className="mx-2">OR</b>
                        <Separator className="w-full" />
                    </div>
                    <Button
                        variant="outline"
                        className="hover:!bg-[#00000000] dark:border-white"
                        onClick={() => void signIn('github')}
                    >
                        Sign in with Github <GitHubLogoIcon className="ml-2" />
                    </Button>
                </div>
            )}
            {status === 'authenticated' && (
                <Button
                    // variant="outline"
                    className="hover:!bg-[#00000000]  dark:border-white"
                    onClick={() => void joinVoteAndRedirect()}
                >
                    Join vote as {user.name} <GitHubLogoIcon className="ml-2" />
                </Button>
            )}
        </div>
    );
};

export default Home;
