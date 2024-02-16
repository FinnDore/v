import { useEffect, useState } from 'react';

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

const users = [
    {
        name: 'Finn',
        id: '1',
        image: 'https://avatars.githubusercontent.com/u/34718806?v=4',
    },
    {
        name: 'Lois',
        id: '2',
        image: 'https://avatars.githubusercontent.com/u/79988376?s=100&v=4',
    },
    {
        name: 'Nestor',
        id: '3',
        image: 'https://avatars.githubusercontent.com/u/23436531?s=100&v=4',
    },
    {
        name: 'Dan',
        id: '4',
        image: 'https://avatars.githubusercontent.com/u/31937542?s=100&v=4',
    },
    {
        name: 'Anna',
        id: '5',
        image: '/pfp/anna_devminer.webp',
    },
    {
        name: 'Jake',
        id: '6',
        pfpHash: 'ada',
    },
];

export const VoteDemo = () => {
    const [votes, setVotes] = useState<number[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [usersByVote, setUsersByVote] = useState<
        {
            name: string;
            id: string;
            image?: string;
            pfpHash?: string;
        }[][]
    >([]);

    useEffect(() => {
        const updateVotes = () => {
            setVotes(() => voteOptions.map(() => random(100)));
            const tempUsersByVote = Array.from(
                { length: voteOptions.length },
                () => [] as typeof usersByVote[number]
            );
            users.forEach(user =>
                tempUsersByVote[random(voteOptions.length - 1)]?.push(user)
            );

            setUsersByVote(tempUsersByVote);
        };
        updateVotes();
        const timeout = setInterval(updateVotes, 3000);
        return () => clearInterval(timeout);
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
                    barHeight={votes[i] ?? 60}
                    showVotes={true}
                    users={usersByVote[i] ?? []}
                    currentVotes={1}
                    totalVotes={1}
                    currentUserId={'1'}
                    doVote={() => setSelected(i)}
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
