const express = require('express');
const server = express();

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs'
}));

server.use(express.static('public'));

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/restaurant-review-db');

const dataModule = require('./data_export'); // remove this once you get the db working

// home
server.get('/', function(req, resp){
    var restaurants = dataModule.getData("./data/restaurants.json");
    resp.render('home',{
        layout: 'index',
        title: 'TopNotch',
        restaurants: restaurants
    });
});

// restaurants
server.get('/restaurants', function(req, resp){
    var restaurants = dataModule.getData("./data/restaurants.json");
    var filteredRestaurants = {
        "American Food" : restaurants.filter(d => d.type == "American Food"),
        "Italian Food" : restaurants.filter(d => d.type == "Italian Food"),
        "Japanese Food" : restaurants.filter(d => d.type == "Japanese Food"),
        "Mexican Food" : restaurants.filter(d => d.type == "Mexican Food"),
        "Chinese Food" : restaurants.filter(d => d.type == "Chinese Food")
    }
    resp.render('restaurants',{
        layout: 'index',
        title: 'Restaurants',
        restaurants: filteredRestaurants
    });
});

// search (restaurants)
server.get('/search', function(req, resp){
    var restaurants = dataModule.getData("./data/restaurants.json");
    var searchQuery = req.query.q || ''; 
    var filteredRestaurants = restaurants.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    resp.render('search', {
        layout: 'index',
        title: (searchQuery.trim() !== '') ? searchQuery : "Search for your next meal",
        searchQuery: searchQuery,
        hasQuery: searchQuery.trim() !== '',
        restaurants: filteredRestaurants
    });
});

// edit (restaurant)
server.get('/edit/restaurant/:id', function(req, resp){
    var restaurants = dataModule.getData("./data/restaurants.json");
    var selected = restaurants.find(d => d.id == req.params.id);
    resp.render('edit_restaurant', {
        layout: 'index',
        title: 'Edit '+selected.name,
        selected: selected
    });
});

// view (restaurant)
server.get('/view/restaurant/:id/', function(req, resp){
    var restaurants = dataModule.getData("./data/restaurants.json");
    var reviews = dataModule.getData("./data/reviews.json");
    var selected = restaurants.find(d => d.id == req.params.id);
    resp.render('view_restaurant', {
        layout: 'index',
        title: selected.name,
        selected: selected,
        reviews: reviews
    });
});

// view (review)
server.get('/view/reviews/:id/', function(req, resp){
    var comments = dataModule.getData("./data/comments.json");
    var reviews = dataModule.getData("./data/reviews.json");
    var selected = reviews.find(d => d.id == req.params.id);
    resp.render('view_review', {
        layout: 'index',
        title: selected.title,
        selected: selected,
        comments: comments
    });
});

// create (review)
server.get('/:id/create_review', function(req, resp){
    var restaurants = dataModule.getData("./data/restaurants.json");
    var selected = restaurants.find(d => d.id == req.params.id); // selected restaurant
    resp.render('create_review', {
        layout: 'index',
        title: "Write a Review",
        selected: selected
    });
});

// edit (review)
server.get('/edit/review/:id', function(req, resp){
    var reviews = dataModule.getData("./data/reviews.json");
    var selected = reviews.find(d => d.id == req.params.id);
    resp.render('edit_review', {
        layout: 'index',
        title: "Edit Your Review",
        selected: selected
    });
});

// edit (comments)
server.get('/view/reviews/:id/edit/:comment_id', function(req, resp){
    var comments = dataModule.getData("./data/comments.json");
    var reviews = dataModule.getData("./data/reviews.json");
    var selected = reviews.find(d => d.id == req.params.id);
    var selectedComment = comments.find(d => d.id == req.params.comment_id);
    resp.render('edit_comment', {
        layout: 'index',
        title: selected.title,
        selected: selected,
        comments: comments,
        selectedComment: selectedComment
    });
});

function finalClose(){
    console.log('Close connection at the end!');
    mongoose.connection.close();
    process.exit();
}

process.on('SIGTERM',finalClose);
process.on('SIGINT',finalClose);
process.on('SIGQUIT', finalClose);

const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
