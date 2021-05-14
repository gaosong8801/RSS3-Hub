import type Koa from 'koa';
import storage from '../utils/storage';

export default async (ctx: Koa.Context) => {
    const id = ctx.query.id || ctx.params.pid;

    if (!storage.exist(id)) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.'
        };
        return;
    }

    ctx.body = JSON.parse(storage.read(id)).items;
};