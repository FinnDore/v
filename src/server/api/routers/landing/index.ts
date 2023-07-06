import { createTRPCRouter } from '../../trpc';
import { landingStats } from './stats';
import { vote } from './vote';
import { landingVotes } from './votes';

export const landingRouter = createTRPCRouter({
    landingVotes,
    vote,
    landingStats,
});
