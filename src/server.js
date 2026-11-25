require('dotenv').config();
const app = require('./app');

// 비밀키가 없거나 기본값이면 서버를 띄우지 않는다.
// 기본값 그대로 배포하면 누구나 토큰을 위조할 수 있다.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me') {
  console.error('JWT_SECRET을 .env에 설정하세요. (.env.example 참고)');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
