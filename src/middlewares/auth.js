const jwt = require('jsonwebtoken');

// 요청 헤더의 "Authorization: Bearer <토큰>"을 확인하고,
// 토큰이 올바르면 req.user에 로그인한 사용자 정보를 넣는다.
exports.requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    // 만료됐거나 위조된 토큰
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

// requireAuth 뒤에 붙여서 관리자만 통과시킨다.
exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: '관리자만 사용할 수 있습니다.' });
  }
  next();
};
