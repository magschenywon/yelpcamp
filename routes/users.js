const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users'); //require all methods from controllers/users file

router.route('/register')
    .get(users.renderRegister) //render a register form
    .post(catchAsync(users.register)); // registering

router.route('/login')
    .get(users.renderLogin) //render a log in form
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login) //validate if the log in is legal

router.get('/logout', users.logout) //log out

module.exports = router;
