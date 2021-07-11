import Koa from 'koa';
import logger from './logger';
import storage from './storage';
import accounts from './accounts';
import check from './check';
import context from './context';
import id from './id';
import backlinks from './backlinks';

export default {
    logger,
    storage,
    accounts,
    check,
    context,
    id,
    backlinks,

    thorw: (code: number, ctx: Koa.Context) => {
        ctx.throw(400, null, {
            code,
        });
    },
};
