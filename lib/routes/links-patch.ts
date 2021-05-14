import type Koa from 'koa';
import storage from '../utils/storage';
import linksVerification from './verifications/links';

export default async (ctx: Koa.Context) => {
    const body = ctx.request.body;
    let pid = ctx.params.pid;
    const lid = ctx.params.lid;

    if (!storage.exist(pid)) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.'
        };
        return;
    }

    const verification = linksVerification(body);
    if (verification.error) {
        ctx.status = 400;
        ctx.body = {
            error: `Bad Request. Parameter ${verification.error}not legal.`
        };
        return;
    }

    let index;
    const content: RSS3Persona = JSON.parse(storage.read(pid));
    index = content.links.findIndex((item) => item.id === lid);
    if (index === -1) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.'
        };
        return;
    }

    const patch: any = {
        name: body.name,
        tags: verification.tags,
        list: verification.list,
    };
    Object.keys(patch).forEach(key => patch[key] === undefined && delete patch[key]);

    content.links[index] = Object.assign(content.links[index], patch);

    storage.write(pid, JSON.stringify(content));
    ctx.body = content.links[index];
};