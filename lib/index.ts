import Koa from 'koa'
import Router from '@koa/router';
import KoaBody from 'koa-body';

import Auth from './middleware/auth';
import Header from './middleware/header';

import logger from './utils/logger';

import PersonaPost from './routes/persona-post';
import PersonaGet from './routes/persona-get';
import PersonaPatch from './routes/persona-patch';
import PersonaDelete from './routes/persona-delete';

import ItemsGet from './routes/items-get';
import ItemsPost from './routes/items-post';
import ItemsPatch from './routes/items-patch';
import ItemsDelete from './routes/items-delete';

process.on('uncaughtException', (e) => {
    logger.error('uncaughtException: ' + e);
});

const app = new Koa();

app.use(KoaBody({
    includeUnparsed: true,
    parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(Header);

// router
const router = new Router();

router.post('/personas', Auth, PersonaPost);
router.get('/personas/:pid', PersonaGet);
router.patch('/personas/:pid', Auth, PersonaPatch);
router.delete('/personas/:pid', Auth, PersonaDelete);

router.get('/personas/:pid/items', Auth, ItemsGet);
router.post('/personas/:pid/items', Auth, ItemsPost);
router.patch('/personas/:pid/items/:tid', Auth, ItemsPatch);
router.delete('/personas/:pid/items/:tid', Auth, ItemsDelete);

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);