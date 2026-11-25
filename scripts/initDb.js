// 테이블을 새로 만들고 샘플 상품과 관리자 계정을 넣는다: npm run db:init
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../src/db');

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, '../db/seed.sql'), 'utf8');

  await pool.query(schema);
  await pool.query(seed);

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, '관리자', 'admin')`,
      [ADMIN_EMAIL.toLowerCase(), hash]
    );
    console.log(`관리자 계정 생성: ${ADMIN_EMAIL}`);
  }

  console.log('DB 초기화 완료');
  await pool.end();
}

main().catch((err) => {
  console.error('DB 초기화 실패:', err.message);
  process.exit(1);
});
