const http = require('http');

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 直接把环境变量全部返回出来
  res.end(JSON.stringify({
    msg: "当前读到的环境变量",
    env: {
      DB_MYSQL_ADDRESS: process.env.DB_MYSQL_ADDRESS,
      DB_MYSQL_ACCOUNT: process.env.DB_MYSQL_ACCOUNT,
      DB_PASSWORD: process.env.DB_PASSWORD
    }
  }, null, 2));
});

server.listen(8000, '0.0.0.0', () => {
  console.log('排查模式启动');
});
