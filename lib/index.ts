import Koa from 'koa'
import Router from '@koa/router';
import KoaBody from 'koa-body';

import Auth from './middleware/auth';

const app = new Koa();

app.use(KoaBody({
    includeUnparsed: true,
}));
app.use(Auth);

// router
const router = new Router();

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);