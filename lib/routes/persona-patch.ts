import type Koa from 'koa';
import storage from '../utils/storage';

export default async (ctx: Koa.Context) => {
    const body = ctx.request.body;
    const pid = ctx.params.pid;

    if (!storage.exist(pid)) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found'
        };
        return;
    }

    const persona: RSS3Persona = JSON.parse(storage.read(pid));

    persona.profile = Object.assign(persona.profile, {
        name: body.name,
        avatar: body.avatar,
        bio: body.bio,
    });
    persona.date_updated = new Date().toISOString();

    const content = JSON.stringify(persona);
    storage.write(pid, content);
    ctx.body = content;
};