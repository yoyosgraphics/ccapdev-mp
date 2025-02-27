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
    const restaurants = dataModule.getData("./data/restaurants.json");
    resp.render('home',{
        layout: 'index',
        title: 'TopNotch',
        restaurants: restaurants
    });
});

const port = process.env.PORT || 9090;
server.listen(port, function(){
    console.log('Listening at port '+port);
});
