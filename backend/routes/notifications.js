const router = require('express').Router();
const auth = require('../middleware/auth');
const { list, markRead, markAllRead } = require('../controllers/notificationsController');

router.use(auth);
router.get('/', list);
router.put('/read-all', markAllRead);   // must come BEFORE /:id/read
router.put('/:id/read', markRead);

module.exports = router;
