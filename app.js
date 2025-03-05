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
mongoose.connect('mongodb://localhost:27017/tnotchdb');

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
        title: 'TopNotch',
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
        title: 'TopNotch',
        searchQuery: searchQuery,
        hasQuery: searchQuery.trim() !== '',
        restaurants: filteredRestaurants
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
