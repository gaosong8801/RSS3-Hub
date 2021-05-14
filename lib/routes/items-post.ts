import type Koa from 'koa';
import storage from '../utils/storage';
import { is } from 'typescript-is';
import config from '../config';

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

    // verify parameters
    let error = false;
    const reject = (parameter: string) => {
        ctx.status = 400;
        ctx.body = {
            error: `Bad Request. Parameter ${parameter} not legal.`
        };
        error = true;
    };

    let authors: Address[];
    try {
        if (body.authors) {
            authors = JSON.parse(body.authors);
            if (!is<Address[]>(authors)) {
                throw new Error();
            }
        }
    } catch (error) {
        reject('authors');
    }

    let tags: string[];
    try {
        if (body.tags) {
            tags = JSON.parse(body.tags);
            if (!is<string[]>(tags)) {
                throw new Error();
            }
        }
    } catch (error) {
        reject('tags');
    }

    let contents: RSS3ItemContents[];
    try {
        if (body.contents) {
            contents = JSON.parse(body.contents);
            if (!is<RSS3ItemContents[]>(contents)) {
                throw new Error();
            }
        }
    } catch (error) {
        reject('contents');
    }

    if (error) {
        return;
    }

    const persona: RSS3Persona = JSON.parse(storage.read(pid));

    const id = persona.items[0] ? parseInt(persona.items[0].id.split('-')[2]) + 1 : 0;
    const item: RSS3Item = {
        id: `${pid}-item-${id}`,
        authors: authors || [pid],
        title: body.title,
        summary: body.summary,
        tags: tags,
        date_published: nowDate,
        date_modified: nowDate,
        contents: contents,
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
