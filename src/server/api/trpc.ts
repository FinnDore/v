import { type AnonUser } from '@prisma/client';
import { TRPCError, initTRPC } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { type Session } from 'next-auth';
import superjson from 'superjson';
import { z } from 'zod';

import { AnonHelper, anonUserSchema } from '@/utils/anon-users';
import { rateLimitTrpcProc, type RateLimitPrefix } from '@/utils/rate-limit';
import { to } from '@/utils/to';
import { getServerAuthSession } from '@/server/auth';
import { prisma } from '../db';

type CreateContextOptions = {
    session: Session | null;
    ip: string;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
    return {
        session: opts.session,
        ip: opts.ip,
    };
};

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
    const { req, res } = opts;

    // Get the session from the server using the getServerSession wrapper function
    const session = await getServerAuthSession({ req, res });
    const xForwardedFor = req.headers['x-forwarded-for'];

    const requestIp = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor;

    return createInnerTRPCContext({
        session,
        ip: requestIp ?? '127.0.0.1',
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
    if (ctx.session?.user) { throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
        ctx,
    });
});

export const anonOrUserProcedure = t.procedure
    .input(
        z.object({
            anonUser: anonUserSchema,
        })
    )
    .use(async ({ ctx, input, next }) => {
        let result: {
            ctx:
                | {
                      session: Session;
                      anonSession: null;
                  }
                | {
                      session: null;
                      anonSession: AnonUser;
                  };
        } | null = null;

        if (ctx.session?.user) {
            result = {
                ctx: {
                    // infers the `session` as non-nullable
                    session: { ...ctx.session, user: ctx.session.user },
                    anonSession: null,
                },
            } as const;
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
                console.warn(
                    `anonOrUserProcedure: Could not find anon user with id: ${input.anonUser.id}`
                );
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                });
            }

            result = {
                ctx: {
                    session: null,
                    anonSession: anonUser,
                },
            } as const;
        }

        if (result) {
            return next(result);
        } else {
            throw new TRPCError({ code: 'UNAUTHORIZED' });
        }
    });

export const procedureWithUserOrAnon = t.procedure
    .input(
        z.object({
            anonUser: anonUserSchema,
        })
    )
    .use(async ({ ctx, input, next }) => {
        let result: {
            ctx:
                | {
                      session: Session;
                      anonSession: null;
                  }
                | {
                      session: null;
                      anonSession: AnonUser;
                  }
                | null;
        } | null = null;

        if (ctx.session?.user) {
            result = {
                ctx: {
                    // infers the `session` as non-nullable
                    session: { ...ctx.session, user: ctx.session.user },
                    anonSession: null,
                },
            } as const;
        } else if (input.anonUser) {
            console.log(input.anonUser);
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
                console.warn(
                    `anonOrUserProcedure: Could not find anon user with id: ${input.anonUser.id}`
                );
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                });
            }

            result = {
                ctx: {
                    session: null,
                    anonSession: anonUser,
                },
            } as const;
        } else {
            result = { ctx: null };
        }
        if (!result) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        return next(result);
    });

export const rateLimitedAnonOrUserProcedure = (
    rateLimitPrefix: RateLimitPrefix,
    byIp?: boolean
) =>
    anonOrUserProcedure.use(async ({ ctx, next }) => {
        await rateLimitTrpcProc({
            prefix: rateLimitPrefix,
            ip: ctx.ip,
            anonSession: ctx.anonSession,
            userSession: ctx.session,
            byIp: !!byIp,
        });
        return next();
    });

export const rateLimitedProcedureWithUserOrAnon = (
    rateLimitPrefix: RateLimitPrefix
) =>
    procedureWithUserOrAnon.use(async ({ ctx, next }) => {
        await rateLimitTrpcProc({
            prefix: rateLimitPrefix,
            ip: ctx.ip,
            anonSession: ctx.anonSession,
            userSession: ctx.session,
            byIp: !ctx.session?.user && !ctx.session,
        });
        return next();
    });

export const rateLimitedTrpcProc = (rateLimitPrefix: RateLimitPrefix) =>
    publicProcedure.use(async ({ ctx, next }) => {
        await rateLimitTrpcProc({
            prefix: rateLimitPrefix,
            ip: ctx.ip,
            anonSession: null,
            userSession: null,
            byIp: true,
        });
        return next();
    });

export const pokerOwnerProcedure = anonOrUserProcedure
    .input(
        z.object({
            pokerId: z.string().cuid(),
        })
    )
    .use(async ({ input, ctx, next }) => {
        const [pokerSession, getPokerSessionError] = await to(
            prisma.poker.findFirst({
                where: {
                    id: input.pokerId,
                    createdByAnonUserId: ctx.anonSession?.id ?? null,
                    createdByUserId: ctx.session?.user?.id ?? null,
                },
            })
        );

        if (getPokerSessionError) {
            console.error(
                `pokerOwnerProcedure: Could not find poker session to verify ownership: ${
                    getPokerSessionError.message
                } ${getPokerSessionError.stack ?? 'no stack'}`
            );
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
            });
        } else if (!pokerSession) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
            });
        }

        return next({
            ctx: { ...ctx, pokerId: pokerSession.id },
        });
    });
