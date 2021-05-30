import type Koa from 'koa';
import utils from '../utils/index';
import linksVerification from './verifications/links';

export default async (ctx: Koa.Context) => {
    const body = ctx.request.body;
    const lid = ctx.params.lid;

    if (!(await utils.storage.exist(ctx.state.signer))) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.',
        };
        return;
    }

    const verification = linksVerification(body);
    if (verification.error) {
        ctx.status = 400;
        ctx.body = {
            error: `Bad Request. Parameter ${verification.error}not legal.`,
        };
        return;
    }

    let index;
    const content: RSS3Persona = JSON.parse(
        await utils.storage.read(ctx.state.signer),
    );
    index = content.links.findIndex((item) => item.id === lid);
    if (index === -1) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.',
        };
        return;
    }

    const patch: any = {
        name: body.name,
        tags: verification.tags,
        list: verification.list,
    };
    Object.keys(patch).forEach(
        (key) => patch[key] === undefined && delete patch[key],
    );

    content.links[index] = Object.assign(content.links[index], patch);

    await utils.storage.write(ctx.state.signer, JSON.stringify(content));
    ctx.body = content.links[index];
};
