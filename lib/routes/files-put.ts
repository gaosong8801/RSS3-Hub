import type Koa from 'koa';
import storage from '../utils/storage';
import utils from '../utils';
import EthCrypto from 'eth-crypto';
import { equals } from 'typescript-is';
import config from '../config';

export default async (ctx: Koa.Context) => {
    const contents: RSS3Content[] = ctx.request.body.contents;

    // type check
    if (!equals<RSS3Content[]>(contents)) {
        ctx.status = 400;
        ctx.body = {
            error: `Type check error.`,
        };
        return;
    }

    let persona: string;
    // signature check
    const signatureCheck = contents.every((content) => {
        const fileID = content.id;
        const currentPersona = utils.parseId(fileID).persona;
        if (!persona) {
            persona = currentPersona;
        } else if (persona !== currentPersona) {
            return false;
        }
        const signer = EthCrypto.recover(
            content.signature,
            utils.signature.hash(content),
        );
        if (signer !== persona) {
            return false;
        }
        if ((<RSS3Index | RSS3Items>content).items) {
            return (<RSS3Index | RSS3Items>content).items.every((item) => {
                const signer = EthCrypto.recover(
                    item.signature,
                    utils.signature.hash(item),
                );
                if (signer !== persona) {
                    return false;
                } else {
                    return true;
                }
            });
        }
    });
    if (!signatureCheck) {
        ctx.status = 400;
        ctx.body = {
            error: `Signature check error.`,
        };
        return;
    }

    const sorted = contents.sort(
        (a, b) => utils.parseId(b.id).index - utils.parseId(a.id).index,
    );
    let items: RSS3Item[] = [];
    sorted.forEach((content) => {
        if ((<RSS3Index | RSS3Items>content).items) {
            items = items.concat((<RSS3Index | RSS3Items>content).items);
        }
    });
    // ID order check
    const idOrderCheck = items.every((item, index) => {
        if (index !== 0) {
            if (
                utils.parseId(item.id).index ===
                utils.parseId(items[index - 1].id).index - 1
            ) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    });
    if (!idOrderCheck) {
        ctx.status = 400;
        ctx.body = {
            error: `ID order check error.`,
        };
        return;
    }

    let oldContent: RSS3Index;
    // no deletion check
    if (await storage.exist(persona)) {
        oldContent = JSON.parse(await storage.read(persona));
        if (
            utils.parseId(oldContent.items[0].id).index >
            utils.parseId(items[0].id).index
        ) {
            ctx.status = 400;
            ctx.body = {
                error: `No deletion check error.`,
            };
            return;
        }
    }

    // date check
    const nowDate = +new Date();
    const fileDateCheck = sorted.every((content) => {
        if (nowDate < +new Date(content.date_updated)) {
            return false;
        } else {
            return true;
        }
    });
    if (!fileDateCheck) {
        ctx.status = 400;
        ctx.body = {
            error: `File date check error.`,
        };
        return;
    }
    const itemDateCheck = items.every((item) => {
        if (nowDate < +new Date(item.date_modified)) {
            return false;
        }
        if (+new Date(item.date_modified) < +new Date(item.date_published)) {
            return false;
        }
        return true;
    });
    if (!itemDateCheck) {
        ctx.status = 400;
        ctx.body = {
            error: `Item date check error.`,
        };
        return;
    }

    // length check
    const attributeslengthCheck = (obj: any) => {
        let result = true;
        for (let key in obj) {
            if (
                typeof obj[key] === 'object' &&
                !attributeslengthCheck(obj[key])
            ) {
                result = false;
                break;
            } else if (
                obj[key].length &&
                obj[key].length > config.maxValueLength
            ) {
                result = false;
                break;
            }
        }
        return result;
    };
    const lengthCheck = sorted.every((content) => {
        return attributeslengthCheck(content);
    });
    if (!lengthCheck) {
        ctx.status = 400;
        ctx.body = {
            error: `Length check error.`,
        };
        return;
    }

    sorted.forEach(async (content) => {
        await storage.write(content.id, JSON.stringify(content));
    });

    // contexts
    let newItems = items;
    if (oldContent) {
        const newItemsLength =
            utils.parseId(items[0].id).index -
            utils.parseId(oldContent.items[0].id).index;
        newItems = items.slice(0, newItemsLength);
    }
    for (const newItem of newItems) {
        if (newItem.upstream) {
            const upstreamPersona = utils.parseId(newItem.upstream).persona;
            const upstreamIndex = utils.parseId(newItem.upstream).index;
            let fileID =
                upstreamPersona +
                '-items-' +
                Math.ceil(upstreamIndex / config.itemPageSize);
            if (!(await storage.exist(fileID))) {
                fileID = upstreamPersona;
            }
            const upstreamContent: RSS3Index | RSS3Items = JSON.parse(
                await storage.read(fileID),
            );
            const index =
                config.itemPageSize - 1 - (upstreamIndex % config.itemPageSize);
            if (!upstreamContent.items[index]['@contexts']) {
                upstreamContent.items[index]['@contexts'] = [];
            }
            let typeContext = upstreamContent.items[index]['@contexts'].find(
                (context) => context.type === newItem.type,
            );
            if (!typeContext) {
                typeContext = {
                    type: newItem.type,
                    list: [],
                };
                upstreamContent.items[index]['@contexts'].push(typeContext);
            }
            typeContext.list.push(newItem.id);
            await storage.write(fileID, JSON.stringify(upstreamContent));
        }
    }

    ctx.body = contents.map((content) => content.id);
};
