import type Koa from 'koa';
import utils from '../utils';

export default async (ctx: Koa.Context) => {
    let id = ctx.query.id || ctx.state.signer;
    const tid = ctx.params.tid;

    if (!(await utils.storage.exist(id))) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.',
        };
        return;
    }

    let index;
    let content: RSS3Base;
    do {
        content = JSON.parse(await utils.storage.read(id));
        index = content.items.findIndex((item) => item.id === tid);
        if (index === -1) {
            if (content.items_next) {
                id = content.items_next;
            } else {
                id = null;
                ctx.status = 404;
                ctx.body = {
                    error: 'Not Found.',
                };
            }
        }
    } while (index === -1 && id);

    if (index !== -1) {
        content.items[index] = Object.assign(content.items[index], {
            authors: undefined,
            title: undefined,
            summary: undefined,
            tags: undefined,
            date_modified: new Date().toISOString(),
            contents: undefined,
        });

        await utils.storage.write(id, JSON.stringify(content));
        ctx.body = content.items[index];
    }
};
