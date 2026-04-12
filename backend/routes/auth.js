const router = require('express').Router();
const auth = require('../middleware/auth');
const { register, login, getMe, updateProfile, deleteAccount } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.delete('/account', auth, deleteAccount);

module.exports = router;
