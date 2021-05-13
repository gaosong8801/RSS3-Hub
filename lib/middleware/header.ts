import type Koa from 'koa';

export default async (ctx: Koa.Context, next: Koa.Next) => {
    ctx.set({
        'content-type': 'application/json; charset=utf-8',
    });

    await next();
};
