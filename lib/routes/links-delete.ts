import type Koa from 'koa';
import storage from '../utils/storage';

export default async (ctx: Koa.Context) => {
    const lid = ctx.params.lid;

    if (!storage.exist(ctx.state.signer)) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.'
        };
        return;
    }

    let index;
    const content: RSS3Persona = JSON.parse(storage.read(ctx.state.signer));
    index = content.links.findIndex((item) => item.id === lid);
    if (index === -1) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.'
        };
        return;
    }

    if (index !== -1) {
        const link = content.links.splice(index, 1);

        storage.write(ctx.state.signer, JSON.stringify(content));
        ctx.body = link;
    }
};