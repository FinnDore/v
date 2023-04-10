import { useCallback, useRef, useState } from 'react';
import {
    GetServerSidePropsContext,
    type NextPage,
    type PageConfig,
} from 'next';
import { useRouter } from 'next/router';
import { GitHubLogoIcon, ShuffleIcon } from '@radix-ui/react-icons';
import { signIn } from 'next-auth/react';

import { storeUser, useAnonUser, useUser } from '@/utils/local-user';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Pfp } from '@/components/pfp';
import { Separator } from '@/components/seperator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tool-tip';
import { api } from '../../utils/api';

const Home: NextPage = () => {
    const [pfpHash, setPfpHash] = useState<string>(
        Math.floor(Math.random() * 200).toString()
    );
    const router = useRouter();
    const voteId = Array.isArray(router.query.voteId)
        ? router.query.voteId[0]
        : router.query.voteId;

    const anonUser = useAnonUser();
    const { user, status } = useUser();

    const { mutateAsync: joinVote, status: joinVoteStatus } =
        api.vote.lobby.joinVote.useMutation();

    const inputRef = useRef<HTMLInputElement>(null);

    const joinVoteAndRedirect = useCallback(async () => {
        if (!voteId || joinVoteStatus === 'loading') return;
        await joinVote({ voteId, anonUser: anonUser });
        void router.push(`/vote/${voteId}`);
    }, [anonUser, joinVote, joinVoteStatus, router, voteId]);

    const { mutate: createAccount } = api.vote.createAccount.useMutation({
        onSuccess: async user => {
            storeUser(user);
            await joinVoteAndRedirect();
        },
    });

    if (!voteId) return <div>no voteId</div>;

    return (
        <div className="grid h-screen w-screen place-items-center">
            {!user && status !== 'loading' && (
                <div className="flex flex-col justify-center">
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger className="relative mx-auto mb-6 [&>.shuffle]:opacity-0 [&>.shuffle]:hover:scale-110 [&>.shuffle]:hover:opacity-70">
                                <Pfp
                                    className="h-48"
                                    pfpHash={pfpHash}
                                    onClick={() =>
                                        setPfpHash(
                                            Math.floor(
                                                Math.random() * 10000
                                            ).toString()
                                        )
                                    }
                                />
                                <div className="shuffle pointer-events-none absolute top-0 grid h-full w-full place-items-center transition-all">
                                    <ShuffleIcon
                                        className="color-black invert dark:filter-none"
                                        width={25}
                                        height={25}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={15}>
                                Click to randomise
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <form
                        className="flex w-full flex-col"
                        onSubmit={e => {
                            e.preventDefault();
                            if (!inputRef.current?.value) return;
                            createAccount({
                                name: inputRef.current?.value,
                                pfpHash: pfpHash,
                            });
                        }}
                    >
                        <Input
                            ref={inputRef}
                            placeholder="Name"
                            min="1"
                            maxLength={20}
                            required
                            className="mb-4 w-full "
                        />
                        <Button type="submit">Create account</Button>
                    </form>
                    <div className="my-2 flex w-full content-center items-center text-xs">
                        <Separator className=" w-full" />

                        <b className="mx-2">OR</b>
                        <Separator className="w-full" />
                    </div>
                    <Button
                        variant="outline"
                        className="border-black hover:!bg-[#00000000]  dark:border-white"
                        onClick={() => void signIn('github')}
                    >
                        Sign in with Github <GitHubLogoIcon className="ml-2" />
                    </Button>
                </div>
            )}
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
                        className="hover:!bg-[#00000000]  dark:border-white"
                        onClick={() => void signIn('github')}
                    >
                        Sign in with Github <GitHubLogoIcon className="ml-2" />
                    </Button>
                </div>
            )}
            {status === 'authenticated' && (
                <Button
                    variant="outline"
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

export const getServerSideProps = (
    ctx: GetServerSidePropsContext<{ voteId: string }>
) => ({
    props: {
        voteId: Array.isArray(ctx.query.voteId)
            ? ctx.query.voteId[0]
            : ctx.query.voteId,
    },
});

export const config: PageConfig = {
    // runtime: 'experimental-edge',
};
