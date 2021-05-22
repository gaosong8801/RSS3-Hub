import type Koa from 'koa';
import storage from '../utils/storage';
import sign from '../utils/sign';
import EthCrypto from 'eth-crypto';

export default async (ctx: Koa.Context) => {
    const contents: IRSS3Content[] = ctx.request.body.contents;
    const files: string[] = [];
    contents.forEach((content) => {
        const fileID = content.id;
        const message = JSON.stringify(sign.removeNotSignProperties(content));
        console.log('message', message);
        const signer = EthCrypto.recover(
            content.signature,
            EthCrypto.hash.keccak256(message),
        );
        console.log(signer);
        if (signer === fileID.split('-')[0]) {
            storage.write(fileID, JSON.stringify(content));
            files.push(fileID);
        }
    });
    ctx.body = files;
};
