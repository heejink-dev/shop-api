const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function issueToken(user) {
  // 토큰에는 비밀번호 같은 민감한 정보를 넣지 않는다.
  // (JWT 내용은 암호화가 아니라 누구나 디코딩해서 볼 수 있다)
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

// POST /auth/signup
exports.signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const errors = [];
    if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
      errors.push('올바른 이메일을 입력하세요.');
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
      errors.push('비밀번호는 8~72자여야 합니다.');
    }
    if (typeof name !== 'string' || name.trim() === '' || name.length > 50) {
      errors.push('이름은 1~50자여야 합니다.');
    }
    if (errors.length > 0) return res.status(400).json({ errors });

    // 비밀번호는 원문 그대로 저장하지 않고 bcrypt 해시로 저장한다.
    const hash = await bcrypt.hash(password, 10);

    // role은 요청에서 받지 않는다. 받으면 누구나 관리자로 가입할 수 있다.
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, role`,
      [email.toLowerCase(), hash, name.trim()]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    // 23505: UNIQUE 제약 위반 = 이미 가입된 이메일
    if (err.code === '23505') {
      return res.status(409).json({ error: '이미 가입된 이메일입니다.' });
    }
    next(err);
  }
};

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력하세요.' });
    }

    const { rows } = await pool.query(
      'SELECT id, email, name, role, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    const user = rows[0];
    const ok = user && (await bcrypt.compare(password, user.password_hash));

    // 이메일이 틀렸는지 비밀번호가 틀렸는지 구분해서 알려주지 않는다.
    // 구분해주면 공격자가 가입된 이메일 목록을 알아낼 수 있다.
    if (!ok) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    res.json({
      token: issueToken(user),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// GET /auth/me (로그인 필요)
exports.me = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
