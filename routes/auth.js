const express = require('express');
const { register, login, verifyUser } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyUser); 

module.exports = router;
