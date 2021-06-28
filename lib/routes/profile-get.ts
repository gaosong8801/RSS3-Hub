import type Koa from 'koa';
import utils from '../utils';
import STATE from '../state';

export default async (ctx: Koa.Context) => {
    const personaID = ctx.params.personaID;

    if (!(await utils.storage.exist(personaID))) {
        utils.thorw(STATE.GET_NOT_FOUND_ERROR, ctx);
    }

    ctx.body = (<RSS3Index>await utils.storage.read(personaID)).profile;
};
