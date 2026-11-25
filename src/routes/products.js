const express = require('express');
const controller = require('../controllers/productController');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// 누구나 조회 가능
router.get('/', controller.list);
router.get('/:id', controller.get);

// 관리자만 등록·수정·삭제 가능
router.post('/', requireAuth, requireAdmin, controller.create);
router.patch('/:id', requireAuth, requireAdmin, controller.update);
router.delete('/:id', requireAuth, requireAdmin, controller.remove);

module.exports = router;
