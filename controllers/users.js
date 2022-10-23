const User = require('../models/user');

//render register
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

//register 
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body; //store pw, username and email 
        const user = new User({ email, username }); //pass email and username to user, and save it in a variable
        const registeredUser = await User.register(user, password); //take the user and pw (passed to salt and hash pw) and save it to a variable
        req.login(registeredUser, err => { //helper method: login, to help you sign in automatically after registration
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!'); //after successfully register, flash message displayed
            res.redirect('/campgrounds'); //redirect to /campgrounds page
        })
    } catch (e) {
        req.flash('error', e.message); //if there's a error, flash it to user
        res.redirect('register'); //redirect to register page (stay at same page)
    }
}

//reder log in
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

//log in
//use a middleware authenticate, if there's a error: automatically display a flash essage and redirect to /login page
module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!'); //flash message when succesfully login
    const redirectUrl = req.session.returnTo || '/campgrounds'; //after sign in, user would be directed either to the previous page they were browsing or the cg page
    delete req.session.returnTo; //delete the previous url from session
    res.redirect(redirectUrl);
}

//log out
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
}