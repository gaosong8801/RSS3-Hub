import type Koa from 'koa';
import STATE from '../state';
import utils from '../utils';

export default async (ctx: Koa.Context, next: Koa.Next) => {
    try {
        await next();
    } catch (error) {
        utils.logger.error('Error: ', error);
        ctx.status = error.status || 500;
        const code = error.code || STATE.UNKNOWN_ERROR;
        ctx.body = {
            code: code,
            message:
                (<any>STATE.ERROR_MESSAGES)[code] ||
                STATE.ERROR_MESSAGES[STATE.UNKNOWN_ERROR],
        };
    }
};
