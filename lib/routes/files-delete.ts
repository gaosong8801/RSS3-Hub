import type Koa from 'koa';
import EthCrypto from 'eth-crypto';
import utils from '../utils';
import STATE from '../state';
import config from '../config';

export default async (ctx: Koa.Context) => {
    const signature = ctx.request.body.signature;
    const date = ctx.request.body.date;

    if (Math.abs(+new Date(date) - +new Date()) > config.maxDateGap) {
        utils.thorw(STATE.DELETE_DATE_ERROR, ctx);
    }

    const signer = EthCrypto.recover(
        signature,
        EthCrypto.hash.keccak256(`Delete my RSS3 persona at ${date}`),
    );

    if (!(await utils.storage.exist(signer))) {
        utils.thorw(STATE.DELETE_NOT_FOUND_ERROR, ctx);
    }

    const files = await utils.storage.list(signer);
    await utils.storage.delete(files);

    ctx.body = files;
};
