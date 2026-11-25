// 예상하지 못한 에러를 한 곳에서 처리한다.
// 내부 에러 내용(SQL 등)은 로그로만 남기고, 클라이언트에는 노출하지 않는다.
module.exports = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON 형식이 올바르지 않습니다.' });
  }

  console.error(err);
  res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
};
