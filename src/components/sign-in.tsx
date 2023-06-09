import { useRef, useState } from 'react';
import { GitHubLogoIcon, ShuffleIcon } from '@radix-ui/react-icons';
import { signIn } from 'next-auth/react';

import { api } from '@/utils/api';
import { storeUser } from '@/utils/local-user';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/tool-tip';
import { Button } from './button';
import { Input } from './input';
import { Pfp } from './pfp';
import { Separator } from './seperator';

const startingHash = Math.floor(Math.random() * 200).toString();

export const SignIn = () => {
    const [pfpHash, setPfpHash] = useState<string>(startingHash);
    const { mutate: createAccount } = api.vote.createAccount.useMutation({
        onSuccess: user => storeUser(user),
    });

    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="flex flex-col justify-center">
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger className="relative mx-auto mb-6 [&>.shuffle]:opacity-0 [&>.shuffle]:hover:scale-110 [&>.shuffle]:hover:opacity-70">
                        <Pfp
                            className="h-48"
                            pfpHash={pfpHash}
                            onClick={() =>
                                setPfpHash(
                                    Math.floor(Math.random() * 10000).toString()
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
                        pfpHash,
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
    );
};
