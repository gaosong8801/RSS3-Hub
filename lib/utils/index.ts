import Koa from 'koa';
import logger from './logger';
import storage from './storage';
import signature from './signature';
import check from './check';
import context from './context';
import id from './id';

export default {
    logger,
    storage,
    signature,
    check,
    context,
    id,

    thorw: (code: number, ctx: Koa.Context) => {
        ctx.throw(400, null, {
            code,
        });
    },
};
