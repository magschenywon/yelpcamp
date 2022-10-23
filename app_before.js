const express = require('express'); //require function to use the express module
const path = require('path'); //the path module provides utilities for working with file and directory paths
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js'); //detect error (valida file)
const catchAsync = require('./utils/catchAsync'); //request parse error
const ExpressError = require('./utils/ExpressError'); //display error
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review'); //request review schema 

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}); //connect db(yelp-camp) to webpage

const db = mongoose.connection; //refer mongoose.connection to db
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('database connected');
});

const app = express(); //put it in a variable

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs'); //render web pages using template ejs file
app.set('views', path.join(__dirname, 'views')) //returns the directories of a file path

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); //validate if there's an error
    if (error) {
        const msg = error.details.map(el => el.message).join(',') //if there's an error, store the error msg
        throw new ExpressError(msg, 400) //throw the error to utils/ExpressError.js
    } else {
        next();
    }
}

//review form validation
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body); //from doing reviewSchema, check the error
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
})

//display all the random campgrounds names at webpage (index.ejs)
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}); //camgrounds will store all what we found from mongo
    res.render('campgrounds/index', { campgrounds }) //at the /campgrounds webpage campgrounds, display all found out from mongo
}));

//create new page for adding new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//transform the form we entered in, into the campgrounds webpage (from new to campgrounds)
app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground); //stroe the new campground body we enter into campground
    await campground.save(); //save new enter object
    res.redirect(`/campgrounds/${campground._id}`) //take you to the webpage display the new enter campground info (campgrounds/new_cgID)
}));

//display specific info from clicked ID (show.ejs)
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews'); //camground will store info (from show.ejs) from specific ID parsing through webpage
    res.render('campgrounds/show', { campground }); ///campgrounds/show will display that specific ID's info
}));

//edit & update
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));

//construct put method 
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params; //store the id that you selected
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); //update the specific id info
    res.redirect(`/campgrounds/${campground._id}`)
}));

//delete
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params; // find the id you choose
    await Campground.findByIdAndDelete(id); //mongo will delete that id info
    res.redirect('/campgrounds'); //once delete, redirect to campgrounds page
}));

//post a review 
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id); //find the id you want to add a review
    const review = new Review(req.body.review); // store the review content in a variable
    campground.reviews.push(review); //push review to campground object - reviews
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`); //redirect to campgrounds/id page
}))

//delete review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //only delete the specific review based on reviewID in campgrounds db
    await Review.findByIdAndDelete(reviewId); //delete review in Review db
    res.redirect(`/campgrounds/${id}`); //redirect to campground/id page
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Nsot Found', 404))
})

//handle error
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err }) // if it's an error, render to views/error.js 
})


app.listen(3000, () => {
    console.log('Serving on port 3000')
})