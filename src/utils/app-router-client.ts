import {
    createTRPCUntypedClient,
    type CreateTRPCClientOptions,
} from '@trpc/client';
import { type AnyRouter } from '@trpc/server';
import { createFlatProxy, createRecursiveProxy } from '@trpc/server/shared';
import { clientCallTypeToProcedureType } from './client-call-type-to-proc-type';
import {
    createUseProxy,
    type CreateTRPCNextAppRouter,
    type UseProcedureRecord,
} from './shared';

type CreateTRPCNextAppRouterClientOptions<TRouter extends AnyRouter> = {
    config: () => CreateTRPCClientOptions<TRouter>;
};

function normalizePromiseArray<TValue>(
    promise: Promise<TValue> | Promise<TValue>[]
) {
    if (Array.isArray(promise)) {
        return Promise.all(promise);
    }
    return promise;
}

type QueryResult = {
    data?: unknown;
    error?: unknown;
    promise?: Promise<unknown>;
};

export function createTRPCNextAppRouterClient<TRouter extends AnyRouter>(
    opts: CreateTRPCNextAppRouterClientOptions<TRouter>
) {
    const client = createTRPCUntypedClient<TRouter>(opts.config());
    const useProxy = createUseProxy<TRouter>(client);

    const cache = new Map<string, QueryResult>();
    return createFlatProxy<CreateTRPCNextAppRouter<TRouter>>(key => {
        if (key === 'use') {
            return (
                cb: (
                    t: UseProcedureRecord<TRouter>
                ) => Promise<unknown> | Promise<unknown>[]
            ) => {
                const promise = normalizePromiseArray(cb(useProxy));
                throw promise;
                // const [data, setData] = useState<unknown | unknown[]>();

                // useEffect(() => {
                //   const promise = normalizePromiseArray(cb(useProxy));

                //   void promise.then(setData).catch((err) => {
                //     throw err;
                //   });
                //   // eslint-disable-next-line react-hooks/exhaustive-deps
                // }, []);

                // return data;
            };
        }

        return createRecursiveProxy(({ path, args }) => {
            const pathCopy = [key, ...path];
            const procedureType = clientCallTypeToProcedureType(
                pathCopy.pop()!
            );

            if (procedureType === 'query') {
                const queryCacheKey = JSON.stringify([path, args[0]]);
                const cached = cache.get(queryCacheKey);

                if (cached?.promise) {
                    return cached.promise;
                }
            }

            const fullPath = pathCopy.join('.');

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const promise: Promise<unknown> = (client as any)[procedureType](
                fullPath,
                ...args
            );
            if (procedureType !== 'query') {
                return promise;
            }

            const queryCacheKey = JSON.stringify([path, args[0]]);

            cache.set(queryCacheKey, {
                promise,
            });

            return promise;
        });
    });
}
