const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds'); //require methods from controllers/campgrounds
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');

router.route('/')
    .get(catchAsync(campgrounds.index)) //index method from controllers
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)) //create a new cg

router.get('/new', isLoggedIn, campgrounds.renderNewForm) //render a form to create a new cg

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground)) //select a specifc cg to view
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground)) //updating an existed cg
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); //delete a cg

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm)) //render a form to edit an existed cg


module.exports = router;

//this is the file to request methods from controllers/campgrounds