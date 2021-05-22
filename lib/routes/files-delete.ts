import type Koa from 'koa';
import storage from '../utils/storage';
import EthCrypto from 'eth-crypto';

export default async (ctx: Koa.Context) => {
    const signature = ctx.request.body.signature;
    const signer = EthCrypto.recover(
        signature,
        EthCrypto.hash.keccak256('delete'),
    );

    if (!(await storage.exist(signer))) {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found.',
        };
        return;
    }

    const files = await storage.list(signer);
    await storage.delete(files);

    ctx.body = files;
};
