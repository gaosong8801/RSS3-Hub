import type Koa from 'koa';
import utils from '../utils/index';

export default async (ctx: Koa.Context) => {
    const body = ctx.request.body;

    if (!(await utils.storage.exist(ctx.state.signer))) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.',
        };
        return;
    }

    const persona: RSS3Persona = JSON.parse(
        await utils.storage.read(ctx.state.signer),
    );

    const patch: any = {
        name: body.name,
        avatar: body.avatar,
        bio: body.bio,
    };
    Object.keys(patch).forEach(
        (key) => patch[key] === undefined && delete patch[key],
    );

    persona.profile = Object.assign(persona.profile, patch);
    persona.date_updated = new Date().toISOString();

    const content = JSON.stringify(persona);
    await utils.storage.write(ctx.state.signer, content);
    ctx.body = content;
};
