import type Koa from 'koa';
import storage from '../utils/storage';
import config from '../config';
import itemsVerification from './verifications/items';

export default async (ctx: Koa.Context) => {
    const body = ctx.request.body;

    if (!await storage.exist(ctx.state.signer)) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.'
        };
        return;
    }
    const nowDate = new Date().toISOString();

    const verification = itemsVerification(body);
    if (verification.error) {
        ctx.status = 400;
        ctx.body = {
            error: `Bad Request. Parameter ${verification.error}not legal.`
        };
        return;
    }

    const persona: RSS3Persona = JSON.parse(await storage.read(ctx.state.signer));

    const id = persona.items[0] ? parseInt(persona.items[0].id.split('-')[2]) + 1 : 0;
    const item: RSS3Item = {
        id: `${ctx.state.signer}-item-${id}`,
        authors: verification.authors || [ctx.state.signer],
        title: body.title,
        summary: body.summary,
        tags: verification.tags,
        date_published: nowDate,
        date_modified: nowDate,
        contents: verification.contents,
    }

    persona.items.unshift(item);

    if (persona.items.length > config.itemPageSize) {
        const newList = persona.items.slice(1);
        const newID = ctx.state.signer + '-' + (persona.items_next ? parseInt(persona.items_next.split('-')[1]) + 1 : 1);
        const newContent: RSS3Items = {
            id: body.id,
            version: 'rss3.io/version/v0.1.0',
            type: 'items',
            date_created: nowDate,
            date_updated: nowDate,

            items: newList,
            items_next: persona.items_next,
        };
        await storage.write(newID, JSON.stringify(newContent));

        persona.items = persona.items.slice(0, 1);
        persona.items_next = newID;
    }

    persona.date_created = nowDate;
    await storage.write(ctx.state.signer, JSON.stringify(persona));

    ctx.body = item;
};
