const http = require('http');
const { dySDK } = require('@open-dy/node-server-sdk');

const server = http.createServer(async (req, res) => {
  // 只处理 /api 路径
  if (req.url !== '/api') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 不存在');
    return;
  }

  try {
    // 从抖音云请求上下文获取 OpenID
    const context = dySDK.context(req);
    const userInfo = await context.getContext();

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      code: 0,
      msg: '获取成功',
      openId: userInfo.openId,
      anonymousOpenid: userInfo.anonymousOpenid
    }, null, 2));

  } catch (err) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      code: -1,
      msg: '仅在抖音小游戏内访问有效',
      error: err.message
    }));
  }
});

server.listen(8000, '0.0.0.0', () => {
  console.log('server is running');
});
