const http = require('http');
const { dySDK } = require('@open-dy/node-server-sdk');
const mysql = require('mysql2');

// ===================== 数据库配置（适配抖音云环境变量，100% 对应你后台）=====================
let host = '127.0.0.1';
let port = 3306;

// 读取你后台的三个 KEY
if (process.env.DB_MYSQL_ADDRESS) {
  const addr = process.env.DB_MYSQL_ADDRESS;
  if (addr.includes(':')) {
    host = addr.split(':')[0];
    port = addr.split(':')[1] || 3306;
  } else {
    host = addr;
  }
}

const dbConfig = {
  host: host,
  port: port,
  user: process.env.DB_MYSQL_ACCOUNT || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'youqu_game',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// 初始化排行榜表
async function initDB() {
  try {
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS game_rank (
        id INT AUTO_INCREMENT PRIMARY KEY,
        openid VARCHAR(64) NOT NULL UNIQUE,
        score INT NOT NULL DEFAULT 0,
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('数据库表初始化完成');
  } catch (err) {
    console.error('数据库初始化失败', err);
  }
}
initDB();

// ===================== HTTP 服务 =====================
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!req.url.startsWith('/api')) {
    res.writeHead(404);
    return res.end(JSON.stringify({ code: 404, msg: 'not found' }));
  }

  try {
    const context = dySDK.context(req);
    const user = await context.getContext();
    const openid = user.openId;

    // -------------------- /api 获取 OpenID --------------------
    if (req.url === '/api') {
      return res.end(JSON.stringify({
        code: 0,
        msg: openid ? '获取成功' : '外部访问，无OpenID',
        openId: openid || null
      }));
    }

    // -------------------- /api/upload?score=xxx 上传分数 --------------------
    else if (req.url.startsWith('/api/upload')) {
      if (!openid) {
        return res.end(JSON.stringify({ code: -1, msg: '请在抖音内访问' }));
      }

      const params = new URLSearchParams(req.url.split('?')[1] || '');
      const score = parseInt(params.get('score')) || 0;

      await promisePool.query(
        'INSERT INTO game_rank (openid, score) VALUES (?, ?) ON DUPLICATE KEY UPDATE score = ?',
        [openid, score, score]
      );

      return res.end(JSON.stringify({ code: 0, msg: '上传成功' }));
    }

    // -------------------- /api/rank 获取排行榜 --------------------
    else if (req.url === '/api/rank') {
      const [rows] = await promisePool.query(
        'SELECT openid, score FROM game_rank ORDER BY score DESC LIMIT 100'
      );
      return res.end(JSON.stringify({ code: 0, data: rows }));
    }

    // -------------------- 其他接口 --------------------
    else {
      res.writeHead(404);
      res.end(JSON.stringify({ code: 404, msg: '接口不存在' }));
    }

  } catch (e) {
    res.end(JSON.stringify({ code: -1, msg: '服务器错误', error: e.message }));
  }
});

server.listen(8000, '0.0.0.0', () => {
  console.log('柚趣互娱服务器已启动');
});
