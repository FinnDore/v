import { TRPCUntypedClient } from '@trpc/client';
import {
    AnyProcedure,
    AnyQueryProcedure,
    AnyRouter,
    Filter,
    ProcedureArgs,
    ProtectedIntersection,
    ThenArg,
} from '@trpc/server';
import {
    createRecursiveProxy,
    inferTransformedProcedureOutput,
} from '@trpc/server/shared';

export type Resolver<TProcedure extends AnyProcedure> = (
    ...args: ProcedureArgs<TProcedure['_def']>
) => Promise<inferTransformedProcedureOutput<TProcedure>>;

/**
 * @internal
 */
export type UseProcedureRecord<TRouter extends AnyRouter> = {
    [TKey in keyof Filter<
        TRouter['_def']['record'],
        AnyRouter | AnyQueryProcedure
    >]: TRouter['_def']['record'][TKey] extends AnyRouter
        ? UseProcedureRecord<TRouter['_def']['record'][TKey]>
        : Resolver<TRouter['_def']['record'][TKey]>;
};

export function createUseProxy<TRouter extends AnyRouter>(
    client: TRPCUntypedClient<TRouter>
) {
    return createRecursiveProxy(opts => {
        const path = opts.path.join('.');

        return client.query(path, ...opts.args);
    }) as UseProcedureRecord<TRouter>;
}

type NextAppRouterUse<TRouter extends AnyRouter> = {
    <TData extends Promise<unknown>[]>(
        cb: (t: UseProcedureRecord<TRouter>) => [...TData]
    ): {
        [TKey in keyof TData]: ThenArg<TData[TKey]>;
    };
    <TData extends Promise<unknown>>(
        cb: (t: UseProcedureRecord<TRouter>) => TData
    ): ThenArg<TData>;
};
type CreateTRPCNextAppRouterBase<TRouter extends AnyRouter> = {
    use: NextAppRouterUse<TRouter>;
};
export type CreateTRPCNextAppRouter<TRouter extends AnyRouter> =
    ProtectedIntersection<
        CreateTRPCNextAppRouterBase<TRouter>,
        UseProcedureRecord<TRouter>
    >;
