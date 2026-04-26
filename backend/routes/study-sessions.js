const router = require('express').Router();
const auth = require('../middleware/auth');
const { listWeekly, create } = require('../controllers/studySessionsController');

router.get('/weekly', auth, listWeekly);
router.post('/',      auth, create);

module.exports = router;
