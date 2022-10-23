const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

//requires users to log in if they want to edit anything
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl //after login, the web will return to the previous page that user was browsing
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//only author has authority to do some specific editing (i.e update, delete)
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params; //take the ID from url
    const campground = await Campground.findById(id); //look up the id from Campground
    if (!campground.author.equals(req.user._id)) { // see if the current user is the author ID
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// specific authority for review author 
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params; //take the ID from url
    const review = await Review.findById(reviewId); //look up the id from Review
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}