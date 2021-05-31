import type Koa from 'koa';
import utils from '../utils';
import { equals } from 'typescript-is';
import config from '../config';
import STATE from '../state';

export default async (ctx: Koa.Context) => {
    const contents: RSS3Content[] = ctx.request.body.contents;

    let persona: string;
    let itemIndex: number;
    let nextIndex: number;
    const now = +new Date();

    // type check
    if (!equals<RSS3Content[]>(contents)) {
        utils.thorw(STATE.FILE_TYPE_ERROR, ctx);
    }

    contents.forEach(async (content, index) => {
        let old;
        const idParsed = utils.check.parseId(content.id);
        const isIndex = !idParsed.type;

        // file id check
        if (!isIndex) {
            if (!utils.check.idFormat(content.id, 'items')) {
                utils.thorw(STATE.FILE_ID_ERROR, ctx);
            }
        } else {
            if (utils.check.idFormat(content.id)) {
                utils.thorw(STATE.FILE_ID_ERROR, ctx);
            }
        }

        // file next check
        if (content.items_next) {
            const nextIdParsed = utils.check.parseId(content.items_next);
            if (!utils.check.idFormat(content.items_next, 'items')) {
                utils.thorw(STATE.FILE_NEXT_ERROR, ctx);
            }
            if (nextIndex) {
                if (nextIdParsed.index !== nextIndex - 1) {
                    utils.thorw(STATE.FILE_NEXT_ERROR, ctx);
                }
            }
            nextIndex = nextIdParsed.index;
        } else {
            if (!isIndex) {
                if (idParsed.index !== 0) {
                    utils.thorw(STATE.FILE_NEXT_ERROR, ctx);
                }
            }
        }

        if (index === 0) {
            persona = idParsed.persona;

            if (await utils.storage.exist(content.id)) {
                old = JSON.parse(await utils.storage.read(content.id));
                // file next check
                if (isIndex) {
                    if (
                        old.items_next !==
                        contents[contents.length - 1].items_next
                    ) {
                        utils.thorw(STATE.FILE_NEXT_ERROR, ctx);
                    }
                } else {
                    if (old.items_next !== content.items_next) {
                        utils.thorw(STATE.FILE_NEXT_ERROR, ctx);
                    }
                }

                // items id check
                if (
                    utils.check.parseId(content.items[0].id).index <
                    utils.check.parseId(old.items[0].id).index
                ) {
                    utils.thorw(STATE.ITEMS_ID_ERROR, ctx);
                }
            } else {
                // file id check
                if (!isIndex) {
                    utils.thorw(STATE.FILE_ID_ERROR, ctx);
                }
            }
        } else {
            // file next check
            if (content.id !== contents[index - 1].items_next) {
                utils.thorw(STATE.FILE_NEXT_ERROR, ctx);
            }
            // file id check
            if (persona !== idParsed.persona) {
                utils.thorw(STATE.FILE_ID_ERROR, ctx);
            }
            if (!idParsed.type) {
                utils.thorw(STATE.FILE_ID_ERROR, ctx);
            }
        }

        // signature check
        if (!utils.signature.check(content, persona)) {
            utils.thorw(STATE.FILE_SIG_ERROR, ctx);
        }
        if (
            (<RSS3Index>content).profile &&
            !utils.signature.check((<RSS3Index>content).profile, persona)
        ) {
            utils.thorw(STATE.PROFILE_SIG_ERROR, ctx);
        }
        if (
            !content.items.every((item) => utils.signature.check(item, persona))
        ) {
            utils.thorw(STATE.ITEMS_SIG_ERROR, ctx);
        }

        // file date check
        if (
            Math.abs(+new Date(content.date_updated) - now) > config.maxDateGap
        ) {
            utils.thorw(STATE.FILE_DATE_ERROR, ctx);
        }
        if (+new Date(content.date_created) > +new Date(content.date_updated)) {
            utils.thorw(STATE.FILE_DATE_ERROR, ctx);
        }

        content.items.forEach((item) => {
            // items id check
            const itemIdParsed = utils.check.parseId(item.id);
            const index = itemIdParsed.index;
            if (itemIndex) {
                if (index !== itemIndex - 1) {
                    utils.thorw(STATE.ITEMS_ID_ERROR, ctx);
                }
            }
            itemIndex = index;

            utils.check.idFormat(item.id, 'item');

            // items date check
            if (
                +new Date(item.date_modified) > +new Date(content.date_updated)
            ) {
                utils.thorw(STATE.ITEMS_DATE_ERROR, ctx);
            }
            if (
                +new Date(item.date_modified) < +new Date(item.date_published)
            ) {
                utils.thorw(STATE.ITEMS_DATE_ERROR, ctx);
            }
        });
        let page = idParsed.index;
        if (!page) {
            if (content.items_next) {
                page = utils.check.parseId(content.items_next).index + 1;
            } else {
                page = 0;
            }
        }
        if (
            utils.check.parseId(content.items[content.items.length - 1].id)
                .index !==
            page * config.itemPageSize
        ) {
            utils.thorw(STATE.ITEMS_ID_ERROR, ctx);
        }

        // items length check
        if (!isIndex) {
            if (content.items.length !== config.itemPageSize) {
                utils.thorw(STATE.ITEMS_LENGTH_ERROR, ctx);
            }
        } else {
            if (content.items.length > config.itemPageSize) {
                utils.thorw(STATE.ITEMS_LENGTH_ERROR, ctx);
            }
        }

        if (!utils.check.valueLength(content)) {
            utils.thorw(STATE.ITEMS_LENGTH_ERROR, ctx);
        }
    });

    contents.forEach(async (content) => {
        await utils.storage.write(content.id, JSON.stringify(content));
    });

    // contexts
    // let newItems = items;
    // if (oldContent) {
    //     const newItemsLength =
    //         utils.parseId(items[0].id).index -
    //         utils.parseId(oldContent.items[0].id).index;
    //     newItems = items.slice(0, newItemsLength);
    // }
    // for (const newItem of newItems) {
    //     if (newItem.upstream) {
    //         const upstreamPersona = utils.parseId(newItem.upstream).persona;
    //         const upstreamIndex = utils.parseId(newItem.upstream).index;
    //         let fileID =
    //             upstreamPersona +
    //             '-items-' +
    //             Math.ceil(upstreamIndex / config.itemPageSize);
    //         if (!(await utils.storage.exist(fileID))) {
    //             fileID = upstreamPersona;
    //         }
    //         const upstreamContent: RSS3Index | RSS3Items = JSON.parse(
    //             await utils.storage.read(fileID),
    //         );
    //         const index =
    //             config.itemPageSize - 1 - (upstreamIndex % config.itemPageSize);
    //         if (!upstreamContent.items[index]['@contexts']) {
    //             upstreamContent.items[index]['@contexts'] = [];
    //         }
    //         let typeContext = upstreamContent.items[index]['@contexts'].find(
    //             (context) => context.type === newItem.type,
    //         );
    //         if (!typeContext) {
    //             typeContext = {
    //                 type: newItem.type,
    //                 list: [],
    //             };
    //             upstreamContent.items[index]['@contexts'].push(typeContext);
    //         }
    //         typeContext.list.push(newItem.id);
    //         await utils.storage.write(fileID, JSON.stringify(upstreamContent));
    //     }
    // }

    ctx.body = contents.map((content) => content.id);
};
