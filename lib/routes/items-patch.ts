import type Koa from 'koa';
import storage from '../utils/storage';
import itemsVerification from './verifications/items';

export default async (ctx: Koa.Context) => {
    const body = ctx.request.body;
    let id = ctx.query.id || ctx.state.signer;
    const tid = ctx.params.tid;

    if (!await storage.exist(id)) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.'
        };
        return;
    }

    const verification = itemsVerification(body);
    if (verification.error) {
        ctx.status = 400;
        ctx.body = {
            error: `Bad Request. Parameter ${verification.error}not legal.`
        };
        return;
    }

    let index;
    let content: RSS3Base;
    do {
        content = JSON.parse(await storage.read(id));
        index = content.items.findIndex((item) => item.id === tid);
        if (index === -1) {
            if (content.items_next) {
                id = content.items_next;
            } else {
                id = null;
                ctx.status = 404;
                ctx.body = {
                    error: 'Not Found.'
                };
            }
        }
    } while (index === -1 && id);

    if (index !== -1) {
        const patch: any = {
            authors: verification.authors,
            title: body.title,
            summary: body.summary,
            tags: verification.tags,
            date_modified: new Date().toISOString(),
            contents: verification.contents,
        };
        Object.keys(patch).forEach(key => patch[key] === undefined && delete patch[key]);

        content.items[index] = Object.assign(content.items[index], patch);

        await storage.write(id, JSON.stringify(content));
        ctx.body = content.items[index];
    }
};