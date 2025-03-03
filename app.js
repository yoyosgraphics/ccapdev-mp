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

const dataModule = require('./data_export');

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

const port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
