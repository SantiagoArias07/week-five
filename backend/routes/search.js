const router = require('express').Router();
const auth = require('../middleware/auth');
const { search } = require('../controllers/searchController');

router.use(auth);
router.get('/', search);

module.exports = router;
