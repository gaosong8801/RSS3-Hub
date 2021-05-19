import type Koa from 'koa';
// @ts-ignore
import unparsed from 'koa-body/unparsed.js';
import EthCrypto from 'eth-crypto';

export default async (ctx: Koa.Context, next: Koa.Next) => {
    if (ctx.method !== 'GET') {
        console.log(ctx.method + ctx.path + ctx.request.body[unparsed]);
        if (ctx.headers.signature) {
            const message = ctx.method + ctx.path + ctx.request.body[unparsed];
            ctx.state.signer = EthCrypto.recover(
                <string>ctx.headers.signature,
                EthCrypto.hash.keccak256(message),
            );
        } else {
            ctx.status = 401;
            ctx.body = {
                error: 'Unauthorized. Missing signature.',
            };
            return;
        }
    }

    await next();
};
