/**
 * Created by james on 29/10/2016.
 */

var express = require('express'),
    app = express(),
    http = require("http").createServer(app),
    bodyParser = require("body-parser"),
    path = require('path');



app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//     extended: true
// }))
app.use(express.static('node_modules'));
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.post('/newGame', function (req, res) {
    console.log('body: ' + JSON.stringify(req.body));

    if (typeof req.body === 'undefined' || typeof req.body.name === 'undefined') {
        res.sendStatus(400);
    } else {
        init();
        global.users[req.body.name] = {hand: dealHand(global.deck)};
        res.sendStatus(200);
    }
    console.log(registeredUsers);
});
app.post('/joinGame', function (req, res) {
    console.log('body: ' + JSON.stringify(req.body));

    if (typeof req.body === 'undefined' || typeof req.body.name === 'undefined') {
        res.sendStatus(400);
    } else {
        if(!global.users[req.body.name]) {
            global.users[req.body.name] = {hand: dealHand(global.deck)};
        }
        res.sendStatus(200);
    }
    console.log(registeredUsers);
});
app.get('/users', function (req, res) {
    var message = JSON.stringify(registeredUsers);
    res.send(registeredUsers);
});
// Grid functions
app.get('/grid', function(req,res) {
    var message = JSON.stringify(global.grid);
    res.send(message);
});
// this is the end of the users turn
app.post('/grid', function (req, res) {
    //console.log('body: ' + JSON.stringify(req.body));

    if (typeof req.body === 'undefined' ||
        typeof req.body.grid === 'undefined' ||
        typeof req.body.hand === 'undefined' ||
        typeof req.body.name === 'undefined' ) {
        res.sendStatus(400); // error status
    } else {
        global.grid = req.body.grid;
        global.users[req.body.name].hand = refreshHand(req.body.hand, global.deck);
        res.sendStatus(200); // success status
    }
});
function createGrid() {
    var size = 64;
    var grid = [];

    for (var x = 0; x < size; x++) {
        grid.push([]);
        for (var y = 0; y < size; y++) {
            grid[x].push(null);
        }
    }
    return grid;
}
// tbd create start function

// Deck functions
function createDeck() {
    // Create the 3 variables of a tile
    var shapes=["square", "circle", "triangle", "cross"],
        colours=["blue", "red", "green", "yellow"],
        numbers=["1", "2", "3", "4"];

    var deck = [];
// using the variables above create a deck of cards
    shapes.forEach(function (shape) {
        colours.forEach(function (colour) {
            numbers.forEach(function (number) {
                deck.push({shape: shape, colour: colour, number: number, type: "tile"});
            })
        })
    });
    return deck;
}

// The Fisher-Yates (aka Knuth) Shuffle.
// See https://github.com/coolaj86/knuth-shuffle
// You can see a great visualization here (and the original post linked to this)
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
//tbd refresh hand function
function dealHand(deck){
    var hand = [];

    for(var i = 0; i < 4; i++){
        hand.push(deck.pop());
    }
    return hand;
}
function refreshHand(hand, deck){

    for(var i = 0; i < 4; i++){
        if(!hand[i]){
            hand[i] = deck.pop();
        }
    }
    return hand;
}

// Hand functions
app.get('/user/:name/hand', function(req,res) {
    var name= req.params.name;
    console.log(name);
    var hand = global.users[name].hand;
    var message = JSON.stringify(hand);
    res.send(message);
});

var global = {};
function init(){
    global.grid = createGrid();
    global.deck = createDeck();
    global.deck = shuffle(global.deck);
    global.grid[32][32] = global.deck.pop();
    global.users = {};
}
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});