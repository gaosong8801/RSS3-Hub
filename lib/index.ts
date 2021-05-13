import Koa from 'koa'
import Router from '@koa/router';
import KoaBody from 'koa-body';

import Auth from './middleware/auth';
import Header from './middleware/header';

import PersonaPost from './routes/persona-post';
import PersonaGet from './routes/persona-get';
import PersonaPatch from './routes/persona-patch';

const app = new Koa();

app.use(KoaBody({
    includeUnparsed: true,
}));
app.use(Header);

// router
const router = new Router();

router.post('/personas', Auth, PersonaPost);
router.get('/personas/:pid', PersonaGet);
router.patch('/personas/:pid', Auth, PersonaPatch);

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);