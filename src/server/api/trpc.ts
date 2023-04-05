import { AnonUser } from '@prisma/client';
import { TRPCError, initTRPC } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { type Session } from 'next-auth';
import superjson from 'superjson';
import { z } from 'zod';

import { AnonHelper } from '@/utils/anon-users';
import { getServerAuthSession } from '@/server/auth';

type CreateContextOptions = {
    session: Session | null;
    anonSession: AnonUser | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
    return {
        session: opts.session,
        anonSession: opts.anonSession,
    };
};

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
    const { req, res } = opts;

    // Get the session from the server using the getServerSession wrapper function
    const session = await getServerAuthSession({ req, res });

    return createInnerTRPCContext({
        session,
        anonSession: null,
    });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape }) {
        return shape;
    },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
        ctx: {
            // infers the `session` as non-nullable
            session: { ...ctx.session, user: ctx.session.user },
        },
    });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

export const anonProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (ctx.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
        ctx,
    });
});

export const anonOrUserProcedure = t.procedure
    .input(
        z.object({
            anonUser: z
                .object({
                    id: z.string().cuid(),
                    secret: z.string().cuid(),
                })
                .optional(),
        })
    )
    .use(async ({ ctx, input, next }) => {
        if (ctx.session?.user) {
            return next({
                ctx: {
                    // infers the `session` as non-nullable
                    session: { ...ctx.session, user: ctx.session.user },
                },
            });
        } else if (input.anonUser) {
            const [anonUser, getAnonUserError] =
                await AnonHelper.getAnonUserByIdAndSecret({
                    userId: input.anonUser.id,
                    secret: input.anonUser.secret,
                } as const);

            if (getAnonUserError) {
                console.error(
                    `anonOrUserProcedure: Could not find anon user due to error: ${
                        getAnonUserError.message
                    } ${getAnonUserError.stack ?? 'no stack'}`
                );
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }

            if (!anonUser) {
                console.error(
                    `anonOrUserProcedure: Could not find anon user with id: ${input.anonUser.id}`
                );
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }

            return next({
                ctx: {
                    session: null,
                    anonSession: anonUser,
                },
            } as { ctx: { session: null; anonSession: AnonUser } });
        } else {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
            });
        }
    });

const test = t.procedure
    .use(({ next }) => {
        const randomNumber = Math.random();
        if (randomNumber > 0.5) {
            return next({
                ctx: {
                    session: {} as Session,
                    anonSession: null,
                },
            });
        } else if (randomNumber > 0.5) {
            return next({
                ctx: {
                    session: null,
                    anonSession: {} as AnonUser,
                },
            });
        } else {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
            });
        }
    })
    .query(({ ctx }) => {
        if (ctx.session) {
            return console.log(ctx.anonSession);
            //                  ^ null :)
        }

        console.log(ctx.anonSession);
        //                  ^ null :(
    });
