import Koa from 'koa';
import Router from '@koa/router';
import KoaBody from 'koa-body';
import cors from '@koa/cors';

import Auth from './middleware/auth';
import Header from './middleware/header';

import logger from './utils/logger';

import FileGet from './routes/file-get';

import ProfilePost from './routes/profile-post';
import ProfilePatch from './routes/profile-patch';
import ProfileDelete from './routes/profile-delete';

import ItemsPost from './routes/items-post';
import ItemsPatch from './routes/items-patch';
import ItemsDelete from './routes/items-delete';

import LinksPost from './routes/links-post';
import LinksPatch from './routes/links-patch';
import LinksDelete from './routes/links-delete';

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

router.get('/file/:fid', FileGet);

router.post('/profile', Auth, ProfilePost);
router.patch('/profile', Auth, ProfilePatch);
router.delete('/profile', Auth, ProfileDelete);

router.post('/items', Auth, ItemsPost);
router.patch('/items/:tid', Auth, ItemsPatch);
router.delete('/items/:tid', Auth, ItemsDelete);

router.post('/links', Auth, LinksPost);
router.patch('/links/:lid', Auth, LinksPatch);
router.delete('/links/:lid', Auth, LinksDelete);

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
