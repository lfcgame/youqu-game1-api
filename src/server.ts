const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
const axios = require('axios');

const app = new Koa();
const router = new Router();

router.get('/', (ctx) => {
  ctx.body = "Nodejs koa demo project";
});

router.get('/api/get_open_id', async (ctx) => {
  const value = ctx.request.header['x-tt-openid'];
  if (value) {
    ctx.body = {
      success: true,
      data: value
    };
  } else {
    ctx.body = {
      success: false,
      message: "dyc-open-id not exist"
    };
  }
});

router.post('/api/text/antidirt', async (ctx) => {
  const body = ctx.request.body;
  const content = body.content;
  const res = await axios.post('http://developer.toutiao.com/api/v2/tags/text/antidirt', {
    "tasks": [
      { "content": content }
    ]
  });
  ctx.body = {
    "result": res.data,
    "success": true
  };
});

// 你的测试接口
router.get('/api/hello', async (ctx) => {
  ctx.body = {
    success: true,
    msg: "柚趣互娱测试接口成功！"
  };
});

app.use(bodyParser());
app.use(router.routes());

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
