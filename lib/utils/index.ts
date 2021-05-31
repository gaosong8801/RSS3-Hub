import logger from './logger';
import storage from './storage';
import signature from './signature';
import Koa from 'koa';

export default {
    logger,
    storage,
    signature,

    parseId: (id: string) => {
        const splited = id.split('-');
        return {
            persona: splited[0],
            type: splited[1],
            index: parseInt(splited[2]),
        };
    },

    thorw: (code: number, ctx: Koa.Context) => {
        ctx.throw(400, null, {
            code,
        });
    },
};
