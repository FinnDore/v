import Pusher from 'pusher';

import { env } from '@/env.mjs';

export const pusherClient = new Pusher({
    appId: env.SOKETI_APP_ID,
    key: env.NEXT_PUBLIC_SOKETI_APP_KEY,
    secret: env.SOKETI_TOKEN,
    useTLS: true,
    host: 'soketi-production-f7b5.up.railway.app',
    port: '443',
    cluster: 'eu',
});
