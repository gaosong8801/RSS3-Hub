import type Koa from 'koa';
import hash from 'object-hash';
// @ts-ignore
import unparsed from 'koa-body/unparsed.js';
import secp256k1 from 'secp256k1';

export default async (ctx: Koa.Context, next: Koa.Next) => {
    if (ctx.method === 'POST') {
        const body = ctx.request.body[unparsed].replace(/&sign=(.*)$/, '');
        const signOrigin = hash(ctx.path + body, {
            algorithm: 'md5',
        });
        console.log(ctx.path + body, signOrigin);
        const verify = secp256k1.ecdsaVerify(Buffer.from(ctx.request.body.sign, 'hex'), Buffer.from(signOrigin), Buffer.from(ctx.request.body.publicKey, 'hex'));
        console.log(verify);
    }

    await next();

};
