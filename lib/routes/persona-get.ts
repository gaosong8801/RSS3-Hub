import type Koa from 'koa';
import storage from '../utils/storage';

export default async (ctx: Koa.Context) => {
    const pid = ctx.params.pid;

    if (!storage.exist(pid)) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found'
        };
        return;
    }

    ctx.body = storage.read(pid);
};