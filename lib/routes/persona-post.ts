import type Koa from 'koa';
import utils from '../utils';

export default async (ctx: Koa.Context) => {
    const body = ctx.request.body;

    if (await utils.storage.exist(ctx.state.signer)) {
        ctx.status = 400;
        ctx.body = {
            error: 'Persona already exists.',
        };
        return;
    }
    const nowDate = new Date().toISOString();

    const persona: IRSS3 = {
        id: ctx.state.signer,
        '@version': 'rss3.io/version/v0.1.0',
        date_created: nowDate,
        date_updated: nowDate,
        signature: body.fileSig,
    };

    const content = JSON.stringify(persona);
    await utils.storage.write(ctx.state.signer, content);
    ctx.body = content;
};
