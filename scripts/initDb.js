// 테이블을 새로 만들고 샘플 상품을 넣는다: npm run db:init
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, '../db/seed.sql'), 'utf8');

  await pool.query(schema);
  await pool.query(seed);
  console.log('DB 초기화 완료');
  await pool.end();
}

main().catch((err) => {
  console.error('DB 초기화 실패:', err.message);
  process.exit(1);
});
