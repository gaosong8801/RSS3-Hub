import type Koa from 'koa';
import storage from '../utils/storage';

export default async (ctx: Koa.Context) => {
    const body = ctx.request.body;

    if (storage.exist(body.id)) {
        ctx.status = 406;
        ctx.body = {
            error: 'Persona already exists.'
        };
        return;
    }
    const nowDate = new Date().toISOString();

    const persona: RSS3Persona = {
        id: body.id,
        version: 'rss3.io/version/v0.1.0',
        type: 'persona',
        date_created: nowDate,
        date_updated: nowDate,

        profile: {
            name: body.name,
            avatar: body.avatar,
            bio: body.bio,
            tags: body.tags,
        },

        links: [],
        items: [],
        assets: [],
    }

    const content = JSON.stringify(persona);
    storage.write(body.id, content);
    ctx.body = content;
};