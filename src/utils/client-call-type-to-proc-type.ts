import { type TRPCClientError } from '@trpc/client';
import { type TRPCSubscriptionObserver } from '@trpc/client/dist/internals/TRPCUntypedClient';
import {
    type AnyMutationProcedure,
    type AnyProcedure,
    type AnyQueryProcedure,
    type AnyRouter,
    type AnySubscriptionProcedure,
    type ProcedureArgs,
    type ProcedureType,
} from '@trpc/server';
import { type Unsubscribable } from '@trpc/server/observable';
import {
    type inferTransformedProcedureOutput,
    type inferTransformedSubscriptionOutput,
} from '@trpc/server/shared';

export type Resolver<TProcedure extends AnyProcedure> = (
    ...args: ProcedureArgs<TProcedure['_def']>
) => Promise<inferTransformedProcedureOutput<TProcedure>>;

type SubscriptionResolver<
    TProcedure extends AnyProcedure,
    TRouter extends AnyRouter
> = (
    ...args: [
        input: ProcedureArgs<TProcedure['_def']>[0],
        opts: ProcedureArgs<TProcedure['_def']>[1] &
            Partial<
                TRPCSubscriptionObserver<
                    inferTransformedSubscriptionOutput<TProcedure>,
                    TRPCClientError<TRouter>
                >
            >
    ]
) => Unsubscribable;

type DecorateProcedure<
    TProcedure extends AnyProcedure,
    TRouter extends AnyRouter
> = TProcedure extends AnyQueryProcedure
    ? {
          query: Resolver<TProcedure>;
      }
    : TProcedure extends AnyMutationProcedure
    ? {
          mutate: Resolver<TProcedure>;
      }
    : TProcedure extends AnySubscriptionProcedure
    ? {
          subscribe: SubscriptionResolver<TProcedure, TRouter>;
      }
    : never;

const clientCallTypeMap: Record<
    keyof DecorateProcedure<any, any>,
    ProcedureType
> = {
    query: 'query',
    mutate: 'mutation',
    subscribe: 'subscription',
};

export const clientCallTypeToProcedureType = (
    clientCallType: string
): ProcedureType => {
    return clientCallTypeMap[clientCallType as keyof typeof clientCallTypeMap];
};
