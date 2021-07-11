import type Koa from 'koa';
import utils from '../utils';
import { equals } from 'typescript-is';
import config from '../config';
import STATE from '../state';

export default async (ctx: Koa.Context) => {
    let contents: RSS3IContent[] = ctx.request.body.contents;
    if (typeof contents === 'string') {
        try {
            contents = JSON.parse(contents);
        } catch (e) {
            utils.thorw(STATE.FILE_TYPE_ERROR, ctx);
        }
    }

    let persona: string;
    let itemIndex: number;
    let nextIndex: number;
    const now = +new Date();
    let oldItems: RSS3Item[] = [];

    // type check
    if (!equals<RSS3IContent[]>(contents)) {
        utils.thorw(STATE.FILE_TYPE_ERROR, ctx);
    }
    contents = contents.sort((a, b) => utils.id.parse(b.id).index - utils.id.parse(a.id).index);
    await Promise.all(
        contents.map(async (content, index) => {
            let old: RSS3IContent;
            const idParsed = utils.id.parse(content.id);
            const isIndex = idParsed.type === 'index';

            // file id check
            if (!isIndex) {
                if (!utils.check.idFormat(content.id, 'items')) {
                    utils.thorw(STATE.FILE_ID_ERROR, ctx);
                }
            } else {
                if (utils.check.idFormat(content.id, 'index')) {
                    utils.thorw(STATE.FILE_ID_ERROR, ctx);
                }
            }

            // file next check
            if (content.items_next) {
                const nextIdParsed = utils.id.parse(content.items_next);
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

            if (await utils.storage.exist(content.id)) {
                old = <RSS3IContent>await utils.storage.read(content.id);
                oldItems = oldItems.concat(old.items || []);
            }

            if (index === 0) {
                persona = idParsed.persona;

                if (old) {
                    // file date check
                    if (content.date_created !== old.date_created) {
                        utils.thorw(STATE.FILE_DATE_ERROR, ctx);
                    }

                    if (isIndex) {
                        // file next check
                        if (old.items_next !== contents[contents.length - 1].items_next) {
                            utils.thorw(STATE.FILE_NEXT_ERROR, ctx);
                        }
                    } else {
                        if (old.items_next !== content.items_next) {
                            utils.thorw(STATE.FILE_NEXT_ERROR, ctx);
                        }
                    }

                    // items id check
                    if (old.items?.[0]) {
                        if (!content.items?.[0]) {
                            utils.thorw(STATE.ITEMS_ID_ERROR, ctx);
                        } else {
                            if (utils.id.parse(content.items[0].id).index < utils.id.parse(old.items[0].id).index) {
                                utils.thorw(STATE.ITEMS_ID_ERROR, ctx);
                            }
                        }
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
                if (idParsed.persona !== utils.id.parse(contents[0].id).persona) {
                    utils.thorw(STATE.FILE_ID_ERROR, ctx);
                }
                if (!idParsed.type) {
                    utils.thorw(STATE.FILE_ID_ERROR, ctx);
                }
            }

            // signature check
            if (!utils.accounts.check(content, persona)) {
                utils.thorw(STATE.FILE_SIG_ERROR, ctx);
            }
            if ((<RSS3Index>content).profile && !utils.accounts.check((<RSS3Index>content).profile, persona)) {
                utils.thorw(STATE.PROFILE_SIG_ERROR, ctx);
            }
            if (content.items) {
                if (!content.items.every((item) => utils.accounts.check(item, persona))) {
                    utils.thorw(STATE.ITEMS_SIG_ERROR, ctx);
                }

                content.items.forEach((item) => {
                    // items id check
                    const itemIdParsed = utils.id.parse(item.id);
                    const index = itemIdParsed.index;
                    if (itemIndex) {
                        if (index !== itemIndex - 1) {
                            utils.thorw(STATE.ITEMS_ID_ERROR, ctx);
                        }
                    }
                    itemIndex = index;

                    utils.check.idFormat(item.id, 'item');

                    // items date check
                    if (+new Date(item.date_modified) > +new Date(content.date_updated)) {
                        utils.thorw(STATE.ITEMS_DATE_ERROR, ctx);
                    }
                    if (+new Date(item.date_modified) < +new Date(item.date_published)) {
                        utils.thorw(STATE.ITEMS_DATE_ERROR, ctx);
                    }
                });

                let page = idParsed.index;
                if (page === Infinity) {
                    if (content.items_next) {
                        page = utils.id.parse(content.items_next).index + 1;
                    } else {
                        page = 0;
                    }
                }
                if (utils.id.parse(content.items[content.items.length - 1].id).index !== page * config.itemPageSize) {
                    utils.thorw(STATE.ITEMS_ID_ERROR, ctx);
                }
            }

            // file date check
            if (Math.abs(+new Date(content.date_updated) - now) > config.maxDateGap) {
                utils.thorw(STATE.FILE_DATE_ERROR, ctx);
            }

            // items length check
            if (!isIndex) {
                if (!content.items || content.items.length !== config.itemPageSize) {
                    utils.thorw(STATE.ITEMS_LENGTH_ERROR, ctx);
                }
            } else {
                if (content.items && content.items.length > config.itemPageSize) {
                    utils.thorw(STATE.ITEMS_LENGTH_ERROR, ctx);
                }
            }

            if (!utils.check.valueLength(content)) {
                utils.thorw(STATE.ITEMS_LENGTH_ERROR, ctx);
            }
        }),
    );

    contents.forEach((content) => {
        utils.storage.write(content);
    });

    contents.forEach(async (content) => {
        // contexts
        content.items?.forEach((item) => {
            const old = oldItems.find((oldItem) => oldItem.id === item.id);
            if (item.upstream) {
                if (old?.upstream && old.upstream !== item.upstream) {
                    utils.context.add(item);
                    utils.context.remove(old);
                } else if (!old?.upstream) {
                    utils.context.add(item);
                }
            } else if (old?.upstream) {
                utils.context.remove(old);
            }
        });

        // backlinks
        const addLinks: RSS3LinksInput[] = [];
        const removeLinks: RSS3LinksInput[] = [];
        if ((<RSS3Index>content).links) {
            const links = (<RSS3Index>content).links;
            let oldLinks: RSS3Links[];
            try {
                oldLinks = (<RSS3Index>await utils.storage.read(content.id)).links;
            } catch (e) {}
            links.forEach((lks) => {
                const oldLks = oldLinks?.find((oldLks) => oldLks.type === lks.type);
                if (oldLks) {
                    const newList = lks.list?.filter((link) => oldLks.list.indexOf(link) === -1);
                    if (newList && newList.length) {
                        addLinks.push({
                            type: lks.type,
                            list: newList,
                        });
                    }
                    const lostList = oldLks.list?.filter((link) => lks.list.indexOf(link) === -1);
                    if (lostList && lostList.length) {
                        removeLinks.push({
                            type: lks.type,
                            list: lostList,
                        });
                    }
                } else {
                    addLinks.push(lks);
                }
            });
            oldLinks.forEach((oldLks) => {
                const lks = links?.find((lks) => lks.type === oldLks.type);
                if (!lks) {
                    removeLinks.push(oldLks);
                }
            });
        } else {
            let oldLinks;
            try {
                oldLinks = (<RSS3Index>await utils.storage.read(content.id)).links;
            } catch (e) {}
            if (oldLinks) {
                removeLinks.push(...oldLinks);
            }
        }
        utils.backlinks.add(content.id, addLinks);
        utils.backlinks.remove(content.id, removeLinks);
    });

    ctx.body = contents.map((content) => content.id);
};
