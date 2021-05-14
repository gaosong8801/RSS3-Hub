import type Koa from 'koa';
import storage from '../utils/storage';

export default async (ctx: Koa.Context) => {
    const pid = ctx.params.pid;

    if (!storage.exist(pid)) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.'
        };
        return;
    }

    let personaContent;
    let fileName = pid;
    do {
        const content: RSS3Base = JSON.parse(storage.read(fileName));
        storage.rm(fileName);
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