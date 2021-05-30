import Koa from 'koa';
import Router from '@koa/router';
import KoaBody from 'koa-body';
import cors from '@koa/cors';

import Auth from './middleware/auth';
import Header from './middleware/header';

import utils from './utils';

import FileGet from './routes/file-get';

import PersonaPost from './routes/persona-post';
import PersonaDelete from './routes/persona-delete';

import ProfilePatch from './routes/profile-patch';

import ItemsPost from './routes/items-post';
import ItemsPatch from './routes/items-patch';
import ItemsDelete from './routes/items-delete';

import LinksPost from './routes/links-post';
import LinksPatch from './routes/links-patch';
import LinksDelete from './routes/links-delete';

process.on('uncaughtException', (e) => {
    utils.logger.error('uncaughtException: ' + e);
});

const app = new Koa();

app.on('error', (err, ctx) => {
    utils.logger.error('server error', err, ctx);
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

router.post('/profile', Auth, PersonaPost);
router.delete('/profile', Auth, PersonaDelete);

router.patch('/profile', Auth, ProfilePatch);

router.post('/items', Auth, ItemsPost);
router.patch('/items/:tid', Auth, ItemsPatch);
router.delete('/items/:tid', Auth, ItemsDelete);

router.post('/links', Auth, LinksPost);
router.patch('/links/:lid', Auth, LinksPatch);
router.delete('/links/:lid', Auth, LinksDelete);

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
