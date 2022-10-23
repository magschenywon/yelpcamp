const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//return a random element from an array
const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({}); //delete all
    //insert new 50 records into db randomly
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000); //randomly select 1000 objects
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6332330870788b9af141e472', //maggie is the author (db.users.find())
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`, //pick a random descriptors/places to assign
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dosrp1sq8/image/upload/v1664318691/YelpCamp/rs23bglhgnwwklxb8jga.jpg',
                    filename: 'YelpCamp/rs23bglhgnwwklxb8jga'
                }
                // },
                // {
                //     url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
                //     filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
                // }
            ]
        })
        await camp.save();
    }
}

//automatically close out connection once update is done
seedDB().then(() => {
    mongoose.connection.close();
})
