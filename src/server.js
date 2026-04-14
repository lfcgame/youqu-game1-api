const http = require('http');
const { dySDK } = require('@open-dy/node-server-sdk');
const mysql = require('mysql2');

// ===================== 数据库直连配置（你后台的信息，直接写死） =====================
const dbConfig = {
  host: "mysql33a5e2f7bae9.rds.ivolces.com",  // 你后台 MYSQL_ADDRESS
  port: 3306,
  user: "yqhy1194230100",             // 你后台 MYSQL_USERNAME
  password: "Lfc199688",           // 你后台 MYSQL_PASSWORD
  database: "youqu_game",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// 自动建表
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
    console.log("表创建成功");
  } catch (err) {}
}
initDB();

// ===================== 服务接口 =====================
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (!req.url.startsWith("/api")) {
    return res.end(JSON.stringify({ code: 404, msg: "not found" }));
  }

  try {
    const context = dySDK.context(req);
    const user = await context.getContext();
    const openid = user.openId;

    // 1. 获取OpenID
    if (req.url === "/api") {
      return res.end(JSON.stringify({
        code: 0,
        msg: openid ? "获取成功" : "外部访问",
        openId: openid || null
      }));
    }

    // 2. 上传分数
    if (req.url.startsWith("/api/upload")) {
      if (!openid) return res.end(JSON.stringify({ code: -1, msg: "请在抖音内访问" }));
      const params = new URLSearchParams(req.url.split('?')[1] || '');
      const score = parseInt(params.get("score")) || 0;

      await promisePool.query(
        "INSERT INTO game_rank (openid, score) VALUES (?, ?) ON DUPLICATE KEY UPDATE score = ?",
        [openid, score, score]
      );
      return res.end(JSON.stringify({ code: 0, msg: "上传成功" }));
    }

    // 3. 排行榜
    if (req.url === "/api/rank") {
      const [rows] = await promisePool.query(
        "SELECT openid, score FROM game_rank ORDER BY score DESC LIMIT 100"
      );
      return res.end(JSON.stringify({ code: 0, data: rows }));
    }

    res.end(JSON.stringify({ code: 404, msg: "接口不存在" }));
  } catch (e) {
    res.end(JSON.stringify({ code: -1, msg: "服务器错误", error: e.message }));
  }
});

server.listen(8000, "0.0.0.0", () => {
  console.log("服务启动成功");
});
