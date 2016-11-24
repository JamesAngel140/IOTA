/**
 * Created by james on 29/10/2016.
 */

var express = require('express'),
    app = express(),
    http = require("http").createServer(app),
    bodyParser = require("body-parser"),
    path = require('path');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

app.use(bodyParser.json());
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
        global.users[req.body.name] = {hand: dealHand(global.deck), turn: false};
        res.sendStatus(200);
    }
    console.log('newGame');
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
    console.log('joinGame');
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

function user(name){
    this.name = name;
    this.hand = [];
    this.score = 0;
    this.turn = false;
}
// create user manager
function userManager(mode) {
    this.users = [];
    this.mode = mode;

    this.getUser = function(name){
        for(var i=0; i < this.users.length; i++){
            if(this.users[i].name === name) {
                return this.users[i];
            }
        }
        return null;
    };

    this.createUser = function (name) {
        if (this.getUser(name) !== null) {
            return false; // if the user already exists return false, can not override an existing user
        }
        this.users.push(new user(name));
        return true;
    };

    this.getNextUser = function(name){
        if(this.getUser(name) === null){
            return null;
        }

        for(var i=0; i < this.users.length; i++){
            if(this.users[i].name === name) {
                if(i === this.users.length - 1){
                    return this.users[0];
                } else {
                    return this.users[i+1];
                }
            }
        }
    };

    this.getFirstTurnUser = function(){
        if(this.users.length === 0){
            return null;
        }
        var user = this.users[Math.floor(Math.random()*this.users.length)];
        return user;
    };

    this.forAllUsers = function(func){
        for(var i=0; i < this.users.length; i++){
            func(user);
        }
    }
}
var userManager = new userManager("multi");
userManager.createUser("James");
userManager.createUser("Graham");

var james = userManager.getUser("James");
console.log(james.name);

console.log("Graham ", userManager.getNextUser("James"));
console.log("James ", userManager.getNextUser("Graham"));

function gameManager(userManager){
    this.grid = null;
    this.deck = null;
    this.deck = null;
    this.userManager = userManager;

    this.start = function(){
        this.grid = createGrid();
        this.deck = createDeck();
        this.deck = shuffle(this.deck);

        // dealing first card onto the grid
        this.grid[32][32] = this.deck.pop();

        // deal hands
        var deck = this.deck; // temp var for the function below
        this.userManager.forAllUsers(function(user){
            user.hand = dealHand(deck);
        });
        // this.userManager.forAllUsers(function(user){
        //     console.log(user);
        // });
        var user = this.userManager.getFirstTurnUser();
        if(user === null){
            return false;
        }
        user.turn = true;
    };

    this.endTurn = function(name){
        var user = this.userManager.getUser(name);
        if(user === null ){
            console.log("User ", name, " does no exist");
            return false; // user does not exist
        }
        if(user.turn === false){
            console.log("User ", name, " is not their turn");
            return false; // not the users turn
        }
        // now handle the turn logic
        user.turn = false;
        user.hand = refreshHand(user.hand,this.deck);
        this.userManager.getNextUser(name).turn = true;
    }
}

var gameManager = new gameManager(userManager);
gameManager.start();
console.log(userManager.users);
//gameManager.endTurn("Graham");

var global = {};
function init(){
    global.grid = createGrid();
    global.deck = createDeck();
    global.deck = shuffle(global.deck);
    global.grid[32][32] = global.deck.pop();
    global.users = {};
}

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
// app.listen(appEnv.port, '0.0.0.0', function() {
//     // print a message when the server starts listening
//     console.log("server starting on " + appEnv.url);
// });