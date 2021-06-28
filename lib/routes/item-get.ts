import type Koa from 'koa';
import utils from '../utils';
import STATE from '../state';
import config from '../config';

export default async (ctx: Koa.Context) => {
    const itemID = ctx.params.itemID;

    const parsedID = utils.id.parse(itemID);
    const personaID = parsedID.persona;
    if (!(await utils.storage.exist(personaID))) {
        utils.thorw(STATE.GET_NOT_FOUND_ERROR, ctx);
    }

    // try index file first
    let fileID = personaID;
    let file: RSS3IContent = <RSS3Index>await utils.storage.read(fileID);
    let index = file.items.findIndex((item) => item.id === itemID);
    if (index === -1) {
        let fileID = personaID + '-items-' + Math.ceil(parsedID.index / config.itemPageSize);
        file = <RSS3Items>await utils.storage.read(fileID);
        index = file.items.findIndex((item) => item.id === itemID);
    }
    if (index === -1) {
        utils.thorw(STATE.GET_NOT_FOUND_ERROR, ctx);
    }

    ctx.body = file.items[index];
};
