-- 개발용: 매번 테이블을 지우고 새로 만든다.
DROP TABLE IF EXISTS order_items, orders, cart_items, products, users CASCADE;

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(50)  NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'admin')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT         NOT NULL DEFAULT '',
  price       INTEGER      NOT NULL CHECK (price >= 0),
  stock       INTEGER      NOT NULL CHECK (stock >= 0),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  UNIQUE (user_id, product_id)
);

CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users(id),
  status      VARCHAR(20) NOT NULL DEFAULT 'paid'
              CHECK (status IN ('paid', 'shipping', 'completed', 'cancelled')),
  total_price INTEGER     NOT NULL CHECK (total_price >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- unit_price: 주문 당시 가격을 따로 저장한다.
-- 나중에 상품 가격이 바뀌어도 과거 주문 금액은 그대로 남아야 하기 때문.
CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0)
);
