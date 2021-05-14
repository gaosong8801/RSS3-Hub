import type Koa from 'koa';
import hash from 'object-hash';
// @ts-ignore
import unparsed from 'koa-body/unparsed.js';
import secp256k1 from 'secp256k1';

export default async (ctx: Koa.Context, next: Koa.Next) => {
    if (ctx.method !== 'GET') {
        const publicKey = ctx.params?.pid || ctx.request.body.id;

        if (ctx.request.body[unparsed] && ctx.headers.signature && publicKey) {
            const signOrigin = hash(ctx.path + ctx.request.body[unparsed], {
                algorithm: 'md5',
            });
            // console.log(signOrigin);
            let verification;
            try {
                verification = secp256k1.ecdsaVerify(Buffer.from(<string>ctx.headers.signature, 'hex'), Buffer.from(signOrigin), Buffer.from(publicKey, 'hex'));
            } catch (error) {}
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
