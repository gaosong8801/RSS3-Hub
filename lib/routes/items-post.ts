import type Koa from 'koa';
import storage from '../utils/storage';
import { is } from 'typescript-is';
import config from '../config';
import itemsBodyVerification from './items-body-verification';

export default async (ctx: Koa.Context) => {
    const pid = ctx.params.pid;
    const body = ctx.request.body;

    if (!storage.exist(pid)) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.'
        };
        return;
    }
    const nowDate = new Date().toISOString();

    const verification = itemsBodyVerification(body);
    if (verification.error) {
        ctx.status = 400;
        ctx.body = {
            error: `Bad Request. Parameter ${verification.error}not legal.`
        };
        return;
    }

    const persona: RSS3Persona = JSON.parse(storage.read(pid));

    const id = persona.items[0] ? parseInt(persona.items[0].id.split('-')[2]) + 1 : 0;
    const item: RSS3Item = {
        id: `${pid}-item-${id}`,
        authors: verification.authors || [pid],
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
        const newID = pid + '-' + (persona.items_next ? parseInt(persona.items_next.split('-')[1]) + 1 : 1);
        const newContent: RSS3Items = {
            id: body.id,
            version: 'rss3.io/version/v0.1.0',
            type: 'items',
            date_created: nowDate,
            date_updated: nowDate,

            items: newList,
            items_next: persona.items_next,
        };
        storage.write(newID, JSON.stringify(newContent));

        persona.items = persona.items.slice(0, 1);
        persona.items_next = newID;
    }

    persona.date_created = nowDate;
    storage.write(pid, JSON.stringify(persona));

    ctx.body = item;
};
