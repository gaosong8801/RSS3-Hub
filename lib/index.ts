import Koa from 'koa';
import Router from '@koa/router';
import KoaBody from 'koa-body';
import cors from '@koa/cors';

import Header from './middleware/header';
import ErrorHandler from './middleware/error-handler';

import logger from './utils/logger';

import FilesGet from './routes/files-get';
import FilesPut from './routes/files-put';
import FilesDelete from './routes/files-delete';

process.on('uncaughtException', (e) => {
    logger.error('uncaughtException: ' + e);
});

const app = new Koa();

app.on('error', (err, ctx) => {
    logger.error('server error', err, ctx);
    ctx.body = {
        error: 'Server error.',
    };
});

app.use(ErrorHandler);
app.use(
    KoaBody({
        includeUnparsed: true,
        parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
    }),
);
app.use(Header);
app.use(cors());

// router
const router = new Router();

router.get('/:fid', FilesGet);
router.put('/', FilesPut);
router.delete('/', FilesDelete);

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
