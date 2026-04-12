const router = require('express').Router();
const auth = require('../middleware/auth');
const { list, create, remove } = require('../controllers/subjectsController');

router.use(auth);
router.get('/', list);
router.post('/', create);
router.delete('/:id', remove);

module.exports = router;
