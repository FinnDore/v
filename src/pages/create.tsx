import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Cross1Icon, PlusIcon } from '@radix-ui/react-icons';

import { api } from '@/utils/api';
import { useAnonUser, useUser } from '@/utils/local-user';
import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { SignIn } from '@/components/sign-in';
import { Textarea } from '@/components/text-area';

type CreateVoteItem = {
    title: string;
    description: string;
    url: string | null;
};

const CreatePoker = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const [title, setTitle] = useState('');
    const [votes, setVotes] = useState<CreateVoteItem[]>([
        {
            title: '',
            description: '',
            url: null,
        },
    ]);

    const [privateVote, setPrivate] = useState(false);
    const anonUser = useAnonUser();
    const { status } = useUser();
    const router = useRouter();
    const createVoteMutation = api.vote.createPokerSession.useMutation({
        async onSuccess(returnVote) {
            await router.push('/start/[voteId]', `/start/${returnVote.id}`, {
                shallow: true,
            });
        },
    });

    if (status === 'unauthenticated') {
        return (
            <div className="m-auto">
                <SignIn />
            </div>
        );
    }
    return (
        <div className="mx-auto flex h-max w-[clamp(100%,95ch,100vw)] max-w-[90ch] flex-col gap-6  px-6 py-6 sm:px-12 lg:max-w-screen-lg">
            <h1 className="text-xl sm:text-2xl">Create Poker Session</h1>

            <form
                className="flex flex-col gap-2"
                ref={formRef}
                onSubmit={e => {
                    e.preventDefault();

                    createVoteMutation.mutate({
                        title,
                        votes,
                        anonUser,
                        private: privateVote,
                    });
                }}
            >
                <fieldset className="relative flex flex-col">
                    <Label>Poker Session Name</Label>
                    <Input
                        placeholder="Sprint 2 - phase 9"
                        className="mb-2"
                        maxLength={20}
                        min="1"
                        value={title}
                        onChange={e => setTitle(() => e.target.value)}
                    />
                </fieldset>

                <fieldset className="relative flex gap-2">
                    <Label>Private</Label>
                    <Checkbox
                        checked={privateVote}
                        onClick={() => setPrivate(x => !x)}
                    ></Checkbox>
                </fieldset>
                {votes.map((vote, i) => (
                    <fieldset className="relative mb-4 flex flex-col" key={i}>
                        <fieldset className="flex gap-4">
                            <div>
                                <Label className="mb-2">Vote Name</Label>
                                <Input
                                    placeholder="EFS-60"
                                    className="mb-4 !w-44"
                                    maxLength={15}
                                    min="1"
                                    value={vote.title}
                                    onChange={e => {
                                        setVotes(oldVotes => {
                                            const vote = oldVotes[i];
                                            if (vote) {
                                                vote.title = e.target.value;
                                            }
                                            return [...oldVotes];
                                        });
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <Label className="mb-2">Link</Label>
                                <Input
                                    type="url"
                                    placeholder="https://..."
                                    className="flex-1"
                                    maxLength={100}
                                    onPaste={e => {
                                        setVotes(oldVotes => {
                                            const vote = oldVotes[i];
                                            if (!vote) return [...oldVotes];

                                            const results =
                                                /[A-Z]{2,}-\d+/.exec(
                                                    e.clipboardData.getData(
                                                        'text/plain'
                                                    )
                                                );

                                            const slug =
                                                results?.[results.length - 1];

                                            if (slug) {
                                                vote.title = slug;
                                            }

                                            return [...oldVotes];
                                        });
                                    }}
                                    onChange={e => {
                                        setVotes(oldVotes => {
                                            const vote = oldVotes[i];
                                            if (!vote) return [...oldVotes];
                                            if (!e.target.value) {
                                                vote.url = null;
                                                return [...oldVotes];
                                            }
                                            vote.url = e.target.value?.trim();
                                            return [...oldVotes];
                                        });
                                    }}
                                />
                            </div>
                            <Button
                                variant="outline"
                                className="ms-auto mt-6 aspect-square !h-10"
                                disabled={votes.length === 1}
                                size="sm"
                                type="button"
                                onClick={() =>
                                    setVotes(old => [
                                        ...old.filter((_, j) => j !== i),
                                    ])
                                }
                            >
                                <Cross1Icon />
                            </Button>
                        </fieldset>
                        <Label>Vote Description</Label>
                        <Textarea
                            placeholder="A Very cool description for a very cool story"
                            minLength={1}
                            className="!h-32"
                            value={vote.description}
                            onChange={e => {
                                setVotes(oldVotes => {
                                    const vote = oldVotes[i];
                                    if (vote) {
                                        vote.description = e.target.value;
                                    }
                                    return [...oldVotes];
                                });
                            }}
                            maxLength={2000}
                        />
                    </fieldset>
                ))}
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                        setVotes(e => [
                            ...e,
                            {
                                title: '',
                                description: '',
                                url: null,
                            },
                        ]);
                    }}
                    disabled={votes.length >= 30}
                >
                    Add another vote <PlusIcon className="ml-1" />
                </Button>
                <Button type="submit" className="my-auto h-full bg-black">
                    Start session
                </Button>
            </form>
        </div>
    );
};

export default CreatePoker;
