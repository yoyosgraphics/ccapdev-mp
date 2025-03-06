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
        restaurants: restaurants,
        show_auth: true,
        logged_in: false
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
        restaurants: filteredRestaurants,
        show_auth: true,
        logged_in: false
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
        restaurants: filteredRestaurants,
        show_auth: true,
        logged_in: false
    });
});

// edit (restaurant)
server.get('/edit/restaurant/:id', function(req, resp){
    var restaurants = dataModule.getData("./data/restaurants.json");
    var selected = restaurants.find(d => d.id == req.params.id);
    resp.render('edit_restaurant', {
        layout: 'index',
        title: 'Edit '+selected.name,
        selected: selected,
        show_auth: false,
        logged_in: true
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
        reviews: reviews,
        show_auth: true,
        logged_in: false
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
        comments: comments,
        show_auth: true,
        logged_in: false
    });
});

// create (review)
server.get('/:id/create_review', function(req, resp){
    var restaurants = dataModule.getData("./data/restaurants.json");
    var selected = restaurants.find(d => d.id == req.params.id); // selected restaurant
    resp.render('create_review', {
        layout: 'index',
        title: "Write a Review",
        selected: selected,
        show_auth: false,
        logged_in: true
    });
});

// edit (review)
server.get('/edit/review/:id', function(req, resp){
    var reviews = dataModule.getData("./data/reviews.json");
    var selected = reviews.find(d => d.id == req.params.id);
    resp.render('edit_review', {
        layout: 'index',
        title: "Edit Your Review",
        selected: selected,
        show_auth: false,
        logged_in: true
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
        selectedComment: selectedComment,
        show_auth: false,
        logged_in: true
    });
});

// register
server.get('/register', function(req, resp){
    resp.render('register',{
        layout: 'index',
        title: 'TopNotch',
        show_auth: false,
        logged_in: false
    });
});

// login
server.get('/login', function(req, resp){
    resp.render('login',{
        layout: 'index',
        title: 'TopNotch',
        show_auth: false,
        logged_in: false
    });
});

// user profile (reviews)
server.get('/:username', function(req, resp){
    var users = dataModule.getData("./data/users.json");
    var reviews = dataModule.getData("./data/reviews.json");
    var comments = dataModule.getData("./data/comments.json");
    var restaurants = dataModule.getData("./data/restaurants.json");
    var selected = users.find(d => d.username == req.params.username);
    resp.render('user_profile', {
        layout: 'index',
        title: selected.name+"'s Profile",
        selected: selected,
        reviews: reviews,
        comments: comments,
        restaurants: restaurants,
        show_auth: false,
        logged_in: true
    });
});

// edit (profile)
server.get('/edit/profile', function(req, resp){
    resp.render('edit_profile',{
        layout: 'index',
        title: 'TopNotch',
        show_auth: false,
        logged_in: true
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
