import type Koa from 'koa';
import hash from 'object-hash';
// @ts-ignore
import unparsed from 'koa-body/unparsed.js';
import secp256k1 from 'secp256k1';

export default async (ctx: Koa.Context, next: Koa.Next) => {
    const reject = () => {
        ctx.status = 401;
        ctx.body = {
            error: 'Signature authentication failed. Operation denied.',
        };
    };
    if (ctx.method !== 'GET') {
        if (ctx.request.body[unparsed] && ctx.request.body.sign && ctx.request.body.publicKey) {
            const body = ctx.request.body[unparsed]?.replace(/&sign=(.*)$/, '');
            const signOrigin = hash(ctx.path + body, {
                algorithm: 'md5',
            });
            const verification = secp256k1.ecdsaVerify(Buffer.from(ctx.request.body.sign, 'hex'), Buffer.from(signOrigin), Buffer.from(ctx.request.body.publicKey, 'hex'));
            if (!verification) {
                reject();
                return;
            }
        } else {
            reject();
            return;
        }
    }

    await next();

};
