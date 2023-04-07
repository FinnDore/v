import { Hop, type APIAuthentication } from '@onehop/js';
import { stringify } from 'superjson';

import { to } from '@/utils/to';
import { env } from '@/env.mjs';
import { ChannelEvents } from './channel-events';

export type ChannelEvent = typeof ChannelEvents[keyof typeof ChannelEvents];

export const hop = new Hop(env.HOP_TOKEN as APIAuthentication);

export type Vote = {
    id: string;
    choice: string;
    createdAt: Date;
    updatedAt: Date;
    pokerVote: {
        id: string;
        poker: {
            id: string;
        };
    };
    anonUser: { name: string; id: string } | null;
    user: { name: string | null; id: string } | null;
};

export const selectPokerVote = {
    id: true,
    choice: true,
    anonUser: {
        select: {
            id: true,
            name: true,
        },
    },
    user: {
        select: {
            id: true,
            name: true,
        },
    },
    createdAt: true,
    updatedAt: true,
    pokerVote: {
        select: {
            id: true,
            poker: {
                select: {
                    id: true,
                },
            },
        },
    },
};

export type UsersInVote = {
    updatedAt: number;
    id: string;
    name: string;
}[];

export const dispatchVoteUpdateEvent = async ({
    pokerVote,
}: {
    pokerVote: Vote;
}) => {
    const [, updateChannelStateError] = await to(
        hop.channels.publishMessage(
            `poker_${pokerVote.pokerVote.poker.id}`,
            'VOTE_UPDATE',
            {
                data: stringify(pokerVote),
            }
        )
    );

    if (updateChannelStateError) {
        console.error(
            `Could not publish votes for poker_${
                pokerVote.pokerVote.poker.id
            } due to error: ${updateChannelStateError.message} ${
                updateChannelStateError.stack ?? 'no stack'
            }
            ${JSON.stringify(updateChannelStateError, null, 2)}
            `
        );
    } else {
        console.log(
            `Published votes for poker_${pokerVote.pokerVote.poker.id} to channel`
        );
    }
};
export const dispatchUserJoinedEvent = async ({
    pokerId,
    users,
}: {
    pokerId: string;
    users: UsersInVote;
}) => {
    const [, updateChannelStateError] = await to(
        hop.channels.publishMessage(
            `poker_${pokerId}`,
            ChannelEvents.USER_JOINED,
            {
                users,
            }
        )
    );

    if (updateChannelStateError) {
        console.error(
            `Could not publish updated users for for poker_${pokerId} due to error: ${
                updateChannelStateError.message
            } ${updateChannelStateError.stack ?? 'no stack'}
            ${JSON.stringify(updateChannelStateError, null, 2)}
            `
        );
    } else {
        console.log(`Published updated users for poker_${pokerId}`);
    }
};
