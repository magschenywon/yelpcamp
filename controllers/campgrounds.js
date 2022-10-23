const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

//find our campground, and render an index
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

//render a new form for selected cg
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

// create a new campground 
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send() //store the request body location as one result in geoData
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry; //store geometry coordinates
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); //map over the request image url and file name in an object and add it to cg.image
    campground.author = req.user._id; //when create a new cg, the author would be same as user_id 
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

//select a specifc cg to view 
module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        } // populate all the reviews from their own authors
    }).populate('author'); //populate the only author who created this cg
    //below is to detect if you've deleted that cg, if so -> error flash alert -> go back to /campgrounds
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

//find a campground to edit
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    // when you delete a campground, below will find out that flash an alert then go back to /campgrounds page
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground }); // if you just edited a campground, after that it will redirect you to the /campgrounds/id page for that specific cg
}

// editing an existed campground
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs); //push the image data (instead of an array) to CG
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        } // if there is/are delete images, loop over them and destroy from cloudinary
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }) //pull out the image filename if it's a delete one, and delete from cg
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

//delete a cg
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground') //what will be displayed as a campaground delete flash message
    res.redirect('/campgrounds');
}