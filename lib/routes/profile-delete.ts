import type Koa from 'koa';
import utils from '../utils/index';

export default async (ctx: Koa.Context) => {
    if (!(await utils.storage.exist(ctx.state.signer))) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.',
        };
        return;
    }

    let personaContent;
    let fileName = ctx.state.signer;
    do {
        const content: RSS3Base = JSON.parse(
            await utils.storage.read(fileName),
        );
        await utils.storage.rm(fileName);
        if (!personaContent) {
            personaContent = content;
        }
        if (content.items_next) {
            fileName = content.items_next;
        } else {
            fileName = null;
        }
    } while (fileName);

    ctx.body = personaContent;
};
