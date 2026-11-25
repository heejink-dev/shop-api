const express = require('express');
const productRoutes = require('./routes/products');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <meta charset="UTF-8">
    <body style="background:#1e2433; color:#e6e9f0; font-family:sans-serif; padding:40px;">
      <h1>shop-api</h1>
      <p style="color:#4ade80;">● 서버가 정상 작동 중입니다.</p>
      <ul>
        <li><a href="/health" style="color:#8ab4f8;">/health</a> 서버 상태</li>
        <li><a href="/products" style="color:#8ab4f8;">/products</a> 상품 목록</li>
      </ul>
    </body>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ error: '존재하지 않는 경로입니다.' });
});

app.use(errorHandler);

module.exports = app;