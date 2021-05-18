import type Koa from 'koa';
import storage from '../utils/storage';

export default async (ctx: Koa.Context) => {
    const fid = ctx.params.fid;

    if (!storage.exist(fid)) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.'
        };
        return;
    }

    ctx.body = storage.read(fid);
};