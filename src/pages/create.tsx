import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Cross1Icon, PlusIcon } from '@radix-ui/react-icons';

import { api } from '@/utils/api';
import { useAnonUser } from '@/utils/local-user';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Textarea } from '@/components/text-area';

type CreateVoteItem = {
    title: string;
    description: string;
};

const CreatePoker = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const [title, setTitle] = useState('');
    const [votes, setVotes] = useState<CreateVoteItem[]>([
        {
            title: '',
            description: '',
        },
    ]);
    const anonUser = useAnonUser();

    const router = useRouter();
    const { mutate: createVote } = api.vote.createPoker.useMutation({
        async onSuccess(returnVote) {
            await router.push('/start/[voteId]', `/start/${returnVote.id}`, {
                shallow: true,
            });
        },
    });

    return (
        <div className="mx-auto flex h-max w-[clamp(100%,95ch,100vw)] max-w-[90ch] flex-col gap-6  px-6 py-6 sm:px-12 lg:max-w-screen-lg">
            <h1 className="text-xl sm:text-2xl">Create Poker Session</h1>

            <form
                className="flex flex-col gap-2"
                ref={formRef}
                onSubmit={e => {
                    e.preventDefault();
                    createVote({
                        title,
                        votes,
                        anonUser,
                    });
                }}
            >
                <fieldset className="relative flex flex-col">
                    <Label>Poker Session Name</Label>
                    <Input
                        placeholder="Sprint 2 - phase 9"
                        className="mb-4"
                        maxLength={20}
                        min="1"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </fieldset>
                {votes.map((vote, i) => (
                    <fieldset className="relative mb-4 flex flex-col" key={i}>
                        <Button
                            variant="outline"
                            className="absolute right-0 aspect-square"
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
                        <Label>Vote Name</Label>
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
                            },
                        ]);
                    }}
                    disabled={votes.length >= 15}
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
