import type Koa from 'koa';
import storage from '../utils/storage';
import linksVerification from './verifications/links';

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

    const verification = linksVerification(body);
    if (verification.error) {
        ctx.status = 400;
        ctx.body = {
            error: `Bad Request. Parameter ${verification.error}not legal.`
        };
        return;
    }

    const persona: RSS3Persona = JSON.parse(await storage.read(ctx.state.signer));

    const repeatingLink = persona.links.find((link) => link.name === body.name);
    if (repeatingLink) {
        ctx.status = 400;
        ctx.body = {
            error: `Bad Request. Name already exists.`
        };
        return;
    }

    const id = persona.links[0] ? parseInt(persona.links[0].id.split('-')[2]) + 1 : 0;
    const link: RSS3Link = {
        id: `${ctx.state.signer}-link-${id}`,
        name: body.name,
        tags: verification.tags,
        list: verification.list,
    }

    persona.links.unshift(link);

    persona.date_created = nowDate;
    await storage.write(ctx.state.signer, JSON.stringify(persona));

    ctx.body = link;
};
