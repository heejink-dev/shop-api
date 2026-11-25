# shop-api

쇼핑몰 백엔드 API (Node.js + Express + PostgreSQL)

## 실행

```bash
docker compose up -d        # PostgreSQL 실행
cp .env.example .env
npm install
npm run db:init             # 테이블 생성 + 샘플 상품
npm run dev
```

## DB 구조

| 테이블 | 설명 |
|---|---|
| users | 회원 (customer / admin) |
| products | 상품 |
| cart_items | 장바구니 (회원 1명당 상품별 1줄) |
| orders | 주문 (paid → shipping → completed / cancelled) |
| order_items | 주문 상품. 주문 당시 가격(unit_price)을 따로 저장 |

## API

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | /health | 서버 상태 확인 |
| POST | /auth/signup | 회원가입 |
| POST | /auth/login | 로그인 (JWT 발급) |
| GET | /auth/me | 내 정보 (로그인 필요) |
| GET | /products?q=&page=&limit= | 상품 목록 (검색, 페이지) |
| GET | /products/:id | 상품 상세 |
| POST | /products | 상품 등록 (관리자) |
| PATCH | /products/:id | 상품 수정 (관리자) |
| DELETE | /products/:id | 상품 삭제 (관리자) |

## 보안·설계 메모

- 모든 SQL은 파라미터 바인딩($1, $2)으로 실행해 SQL 인젝션을 막는다.
- DB 접속 정보는 코드가 아닌 환경변수로 관리하고, `.env`는 Git에 올리지 않는다.
- 서버 내부 에러는 로그로만 남기고 클라이언트에는 일반 메시지만 보낸다.
- 비밀번호는 bcrypt 해시로만 저장한다.
- 로그인 실패 시 이메일과 비밀번호 중 무엇이 틀렸는지 구분하지 않는다. (가입 이메일 노출 방지)
- 회원가입 요청에 role을 넣어도 무시한다. (관리자 권한 탈취 방지)
- JWT_SECRET이 없거나 기본값이면 서버가 시작되지 않는다.

## 진행 상황

- [x] DB 설계, 상품 API
- [x] 회원가입·로그인 (JWT, bcrypt), 관리자 권한
- [ ] 장바구니
- [ ] 주문 (트랜잭션으로 재고 차감)
- [ ] 관리자 주문 상태 변경
- [ ] GitHub Actions CI
