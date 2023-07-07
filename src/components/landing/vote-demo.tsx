import { useState } from 'react';

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

export const VoteDemo = () => {
    const votes = useState([]);

    return (
        <div className="relative m-auto flex gap-2">
            <div className="absolute h-[150%] w-[150%] -translate-x-[25%] -translate-y-[25%] bg-gradient-to-t from-white blur-2xl dark:from-black"></div>
            <div className="absolute top-1/2 z-10 h-6 w-[105%] -translate-x-[2.5%] -translate-y-1/2 bg-gradient-to-t from-white blur-sm dark:from-black"></div>
            {voteOptions.map(vote => (
                <VoteButton
                    key={vote}
                    vote={vote}
                    small={true}
                    barHeight={60}
                    showVotes={true}
                    users={[]}
                    currentVotes={1}
                    totalVotes={1}
                    currentUserId={'1'}
                    doVote={() => ({})}
                    current={'' === vote.toString()}
                />
            ))}
        </div>
    );
};
