const { pool } = require('../db');

// 모든 쿼리는 $1, $2 같은 자리표시자로 값을 넘긴다.
// 문자열을 직접 이어 붙이면 SQL 인젝션 공격에 뚫린다.

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validate(body, { partial = false } = {}) {
  const errors = [];
  const { name, description, price, stock } = body;

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '' || name.length > 100) {
      errors.push('name은 1~100자 문자열이어야 합니다.');
    }
  }
  if (description !== undefined && typeof description !== 'string') {
    errors.push('description은 문자열이어야 합니다.');
  }
  if (!partial || price !== undefined) {
    if (!Number.isInteger(price) || price < 0) {
      errors.push('price는 0 이상의 정수여야 합니다.');
    }
  }
  if (!partial || stock !== undefined) {
    if (!Number.isInteger(stock) || stock < 0) {
      errors.push('stock은 0 이상의 정수여야 합니다.');
    }
  }
  return errors;
}

// GET /products?q=티셔츠&page=1&limit=10
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const offset = (page - 1) * limit;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const keyword = `%${q}%`;

    const { rows } = await pool.query(
      `SELECT id, name, description, price, stock
         FROM products
        WHERE name ILIKE $1
        ORDER BY id
        LIMIT $2 OFFSET $3`,
      [keyword, limit, offset]
    );
    const count = await pool.query(
      'SELECT COUNT(*)::int AS total FROM products WHERE name ILIKE $1',
      [keyword]
    );

    res.json({ page, limit, total: count.rows[0].total, items: rows });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: '잘못된 상품 ID입니다.' });

    const { rows } = await pool.query(
      'SELECT id, name, description, price, stock FROM products WHERE id = $1',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validate(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });

    const { name, description = '', price, stock } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price, stock)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, price, stock`,
      [name.trim(), description, price, stock]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: '잘못된 상품 ID입니다.' });

    const errors = validate(req.body, { partial: true });
    if (errors.length > 0) return res.status(400).json({ errors });

    const { name, description, price, stock } = req.body;
    // COALESCE: 값이 안 들어온(null) 항목은 기존 값을 유지한다.
    const { rows } = await pool.query(
      `UPDATE products
          SET name        = COALESCE($1, name),
              description = COALESCE($2, description),
              price       = COALESCE($3, price),
              stock       = COALESCE($4, stock),
              updated_at  = now()
        WHERE id = $5
        RETURNING id, name, description, price, stock`,
      [name?.trim() ?? null, description ?? null, price ?? null, stock ?? null, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: '잘못된 상품 ID입니다.' });

    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
