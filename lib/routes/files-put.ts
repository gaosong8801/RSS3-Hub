import type Koa from 'koa';
import storage from '../utils/storage';
import sign from '../utils/sign';
import EthCrypto from 'eth-crypto';
import { equals } from 'typescript-is';
import config from '../config';

export default async (ctx: Koa.Context) => {
    const contents: IRSS3Content[] = ctx.request.body.contents;

    // type check
    if (!equals<IRSS3Content[]>(contents)) {
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
        if (!persona) {
            persona = fileID.split('-')[0];
        } else if (persona !== fileID.split('-')[0]) {
            return false;
        }
        const message = JSON.stringify(sign.removeNotSignProperties(content));
        const signer = EthCrypto.recover(
            content.signature,
            EthCrypto.hash.keccak256(message),
        );
        if (signer !== persona) {
            return false;
        }
        if ((<IRSS3 | IRSS3Items>content).items) {
            return (<IRSS3 | IRSS3Items>content).items.every((item) => {
                const message = JSON.stringify(
                    sign.removeNotSignProperties(item),
                );
                const signer = EthCrypto.recover(
                    item.signature,
                    EthCrypto.hash.keccak256(message),
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

    const getIndex = (content: IRSS3Content | IRSS3Item) => {
        const index = content.id.split('-')[2];
        if (index) {
            return parseInt(index);
        } else {
            return Infinity;
        }
    };
    const sorted = contents.sort((a, b) => getIndex(b) - getIndex(a));
    let items: IRSS3Item[] = [];
    sorted.forEach((content) => {
        if ((<IRSS3 | IRSS3Items>content).items) {
            items = items.concat((<IRSS3 | IRSS3Items>content).items);
        }
    });
    // ID order check
    const idOrderCheck = items.every((item, index) => {
        if (index !== 0) {
            if (getIndex(item) === getIndex(items[index - 1]) - 1) {
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

    // no deletion check
    if (await storage.exist(persona)) {
        const oldContent: IRSS3 = JSON.parse(await storage.read(persona));
        if (getIndex(oldContent.items[0]) > getIndex(items[0])) {
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

    sorted.forEach((content) => {
        storage.write(content.id, JSON.stringify(content));
    });

    ctx.body = contents.map((content) => content.id);
};
