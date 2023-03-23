import {
    type CreateTRPCProxyClient,
    type TRPCUntypedClient,
} from '@trpc/client';
import { type AnyRouter } from '@trpc/server';
import { createRecursiveProxy } from '@trpc/server/shared';
import { clientCallTypeToProcedureType } from './client-call-type-to-proc-type';

type CreateTRPCNextAppRouterReactServerOptions<TRouter extends AnyRouter> = {
    getClient: () => TRPCUntypedClient<TRouter>;
};

export function createTRPCNextAppRouterReactServer<TRouter extends AnyRouter>(
    opts: CreateTRPCNextAppRouterReactServerOptions<TRouter>
) {
    return createRecursiveProxy(({ path, args }) => {
        // lazily initialize client, presumably this function is wrapped in cache()
        const client = opts.getClient();

        const pathCopy = [...path];
        const procedureType = clientCallTypeToProcedureType(
            pathCopy.pop() as string
        );
        const fullPath = pathCopy.join('.');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return (client[procedureType] as any)(fullPath, ...args);
    }) as CreateTRPCProxyClient<TRouter>;
}
