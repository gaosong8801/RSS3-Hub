import type Koa from 'koa';
import hash from 'object-hash';
// @ts-ignore
import unparsed from 'koa-body/unparsed.js';
import secp256k1 from 'secp256k1';

export default async (ctx: Koa.Context, next: Koa.Next) => {
    if (ctx.method !== 'GET') {
        if (ctx.request.body[unparsed] && ctx.request.body.sign && ctx.request.body.publicKey) {
            const body = ctx.request.body[unparsed]?.replace(/&sign=(.*)$/, '');
            const signOrigin = hash(ctx.path + body, {
                algorithm: 'md5',
            });
            const verification = secp256k1.ecdsaVerify(Buffer.from(ctx.request.body.sign, 'hex'), Buffer.from(signOrigin), Buffer.from(ctx.request.body.publicKey, 'hex'));
            if (!verification) {
                ctx.status = 401;
                ctx.body = {
                    error: 'Unauthorized. Signature verification failure.',
                };
                return;
            }
        } else {
            ctx.status = 401;
            ctx.body = {
                error: 'Unauthorized. Missing authentication parameters.',
            };
            return;
        }
    }

    await next();

};
