const express = require('express');
const controller = require('../controllers/productController');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.get);

// TODO(2단계): 아래 세 개는 관리자만 쓸 수 있게 막는다.
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
