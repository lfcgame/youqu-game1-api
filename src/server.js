const http = require('http');

const server = http.createServer((req, res) => {
  // 只处理 /api 路径
  if (req.url === '/api') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('柚趣互娱服务器运行成功\n');
    return;
  }

  // 其他路径返回 404
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(8000, '0.0.0.0', () => {
  console.log('server is running');
});
