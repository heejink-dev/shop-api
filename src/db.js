const { Pool } = require('pg');

// 접속 정보는 코드에 직접 쓰지 않고 환경변수(.env)에서 읽는다.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = { pool };
