import { useEffect, useRef, useState } from 'react';

import { useUser } from '@/utils/local-user';
import { voteOptions } from '@/constants';
import { VoteButton } from '../vote/vote-button';

type Vote = {
    choice: string;
    id: number;
    userId: string;
    pfpUrl?: string;
    pfpHash?: string;
    name: string;
};

const votes: Vote[] = [
    {
        choice: '1',
        id: 1,
        userId: '1',
        pfpUrl: 'https://i.imgur.com/1.jpg',
        name: 'User 1',
    },
    {
        choice: '2',
        id: 2,
        userId: '2',
        pfpUrl: 'https://i.imgur.com/2.jpg',
        name: 'User 2',
    },
    {
        choice: '3',
        id: 3,
        userId: '3',
        pfpUrl: 'https://i.imgur.com/3.jpg',
        name: 'User 3',
    },
    {
        choice: '5',
        id: 4,
        userId: '4',
        pfpUrl: 'https://i.imgur.com/4.jpg',
        name: 'User 4',
    },
];

const random = (max: number, min = 0) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

type VoteUser = {
    name: string;
    id: string;
    image?: string;
    pfpHash?: string;
    vote: typeof voteOptions[number];
};
const users: VoteUser[] = [
    {
        name: 'Finn',
        id: '1',
        image: 'https://avatars.githubusercontent.com/u/34718806?v=4',
        vote: 1,
    },
    {
        name: 'Lois',
        id: '2',
        image: 'https://avatars.githubusercontent.com/u/79988376?s=100&v=4',
        vote: 1,
    },
    {
        name: 'Nestor',
        id: '3',
        image: 'https://avatars.githubusercontent.com/u/23436531?s=100&v=4',
        vote: 1,
    },
    {
        name: 'Dan',
        id: '4',
        image: 'https://avatars.githubusercontent.com/u/31937542?s=100&v=4',
        vote: 1,
    },
    {
        name: 'Anna',
        id: '5',
        image: '/pfp/anna_devminer.webp',
        vote: 1,
    },
    {
        name: 'Jake',
        id: '6',
        pfpHash: 'ada',
        vote: 1,
    },
];

const clamp = (input: number, max: number, min = 0) => {
    if (input > max) return max;
    if (input < min) return min;
    return input;
};
const baseUsersByVote = Array.from(
    { length: voteOptions.length },
    () => [] as VoteUser[]
);

export const VoteDemo = () => {
    const user = useUser();
    const usersByVoteRef = useRef(baseUsersByVote);
    const [selected, setSelected] = useState<number | null>(null);
    const [usersByVote, setUsersByVote] = useState<VoteUser[][]>(
        usersByVoteRef.current
    );

    useEffect(() => {
        const shuffleVotes = (first?: true) => {
            const tempUsersByVote = [
                ...usersByVoteRef.current.map(x => [...x]),
            ];

            for (const currentUser of users) {
                if (random(0, 100) > 20 && !first) continue;
                const currentIndex = tempUsersByVote.findIndex(x =>
                    x.find(user => user.id === currentUser.id)
                );
                if (currentIndex !== -1) {
                    tempUsersByVote[currentIndex]?.splice(
                        tempUsersByVote[currentIndex]?.findIndex(
                            x => x.id === currentUser.id
                        ) ?? 0,
                        1
                    );
                }
                tempUsersByVote[random(voteOptions.length - 1)]?.push(
                    currentUser
                );
            }

            usersByVoteRef.current = tempUsersByVote;
            setUsersByVote(tempUsersByVote);
        };
        shuffleVotes(true);
        const interval = setInterval(shuffleVotes, 750);
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="relative m-auto flex h-[70%] items-end gap-2">
            <div className="absolute h-[150%] w-[150%] -translate-x-[25%] -translate-y-[25%] bg-gradient-to-t from-white blur-2xl dark:from-black"></div>
            <div className="absolute top-[60%] z-10 h-6 w-[105%] -translate-x-[2.5%] -translate-y-1/2 bg-gradient-to-t from-white blur-sm dark:from-black"></div>
            {voteOptions.map((vote, i) => (
                <VoteButton
                    key={vote}
                    vote={vote}
                    small={true}
                    barHeight={clamp(
                        ((usersByVote[i]?.length ?? 20) +
                            (selected === i && !user.user ? 5 : 1)) *
                            25,
                        70,
                        10
                    )}
                    showVotes={true}
                    users={usersByVote[i] ?? []}
                    currentVotes={1}
                    totalVotes={1}
                    currentUserId={user.user?.id ?? '1'}
                    doVote={() => {
                        if (selected === i) return;
                        if (!user.user) return setSelected(i);
                        if (selected !== null) {
                            const userIndex = usersByVote[selected]?.findIndex(
                                x => x.id === user.user.id
                            );
                            if (
                                userIndex !== -1 &&
                                typeof userIndex === 'number'
                            ) {
                                usersByVote[selected]?.splice(userIndex, 1);
                            }
                        }
                        usersByVote[i]?.push({
                            name: user.user.name ?? 'Me',
                            id: user.user.id,
                            image: user.user.image ?? undefined,
                            pfpHash: user.user.pfpHash ?? undefined,
                            vote,
                        });
                        setUsersByVote([...usersByVote.map(x => [...x])]);
                        setSelected(i);
                    }}
                    current={
                        selected !== null
                            ? selected === i
                            : !!usersByVote[i]?.find(y => y.name === 'Finn')
                    }
                />
            ))}
        </div>
    );
};
