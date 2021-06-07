import type Koa from 'koa';
import utils from '../utils';
import STATE from '../state';

export default async (ctx: Koa.Context) => {
    const fid = ctx.params.fid;

    if (!(await utils.storage.exist(fid))) {
        utils.thorw(STATE.GET_NOT_FOUND_ERROR, ctx);
    }

    ctx.body = await utils.storage.read(fid);
};
