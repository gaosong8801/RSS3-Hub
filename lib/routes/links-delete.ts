import type Koa from 'koa';
import storage from '../utils/storage';

export default async (ctx: Koa.Context) => {
    const lid = ctx.params.lid;

    if (!(await storage.exist(ctx.state.signer))) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.',
        };
        return;
    }

    let index;
    const content: RSS3Persona = JSON.parse(
        await storage.read(ctx.state.signer),
    );
    index = content.links.findIndex((item) => item.id === lid);
    if (index === -1) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.',
        };
        return;
    }

    if (index !== -1) {
        const link = content.links.splice(index, 1);

        await storage.write(ctx.state.signer, JSON.stringify(content));
        ctx.body = link;
    }
};
