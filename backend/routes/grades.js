const router = require('express').Router();
const auth = require('../middleware/auth');
const { list, create, remove } = require('../controllers/gradesController');

router.get('/',    auth, list);
router.post('/',   auth, create);
router.delete('/:id', auth, remove);

module.exports = router;
