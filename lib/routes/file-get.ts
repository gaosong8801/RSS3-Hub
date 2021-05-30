import type Koa from 'koa';
import utils from '../utils/index';

export default async (ctx: Koa.Context) => {
    const fid = ctx.params.fid;

    if (!(await utils.storage.exist(fid))) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.',
        };
        return;
    }

    ctx.body = await utils.storage.read(fid);
};
