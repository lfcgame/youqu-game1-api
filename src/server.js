const Koa = require('koa')
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')

const app = new Koa()
const router = new Router()

app.use(bodyParser())

router.get('/', ctx => {
  ctx.body = '服务正常运行'
})

router.get('/api/hello', ctx => {
  ctx.body = { success: true, msg: '接口通了！' }
})

app.use(router.routes())

const PORT = 8000
app.listen(PORT, () => {
  console.log('started on 8000')
})
