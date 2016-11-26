/**
 * Created by james on 29/10/2016.
 */

var express = require('express'),
    app = express(),
    http = require("http").createServer(app),
    bodyParser = require("body-parser"),
    path = require('path'),
    cfenv = require('cfenv');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv

app.use(bodyParser.json());

// return static files from folders
app.use(express.static('node_modules'));
app.use(express.static('public'));

// initial get function for welcome.html
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/welcome.html'));
});

function configureNewPaths(name, key){
    // create route to allow the client to load a unique page for the game and user
    app.get('/' + key + '/' + name, function (req, res) {
        res.sendFile(path.join(__dirname + '/game.html'));
    });
    app.use('/' + key, express.static('node_modules'));
    app.use('/' + key, express.static('public'));
}

// welcome public interface
app.post('/createGame', function (req, res) {
    console.log('createGame');

    // check we have all the data to create a new game
    if (typeof req.body === 'undefined' ||
        typeof req.body.name === 'undefined') {
        console.log('missing data');
        res.sendStatus(400);
        return;
    }

    var name = req.body.name;

    // create a new game using a random key
    var key = generateKey();
    global[key] = {};
    global[key].gameManager = new gameManager;

    // create the new user
    if (!global[key].gameManager.userManager.createUser(name)) {
        console.log('can not create user ', name);
        res.sendStatus(400);
        return;
    }

    configureNewPaths(name, key);

    // return the key to the user
    res.json(key);
});
app.post('/joinGame/:key', function (req, res) {
    console.log('joinGame');

    // join a specific game using the key
    var key = req.params.key;

    // check if a game with this key has been created
    if (typeof global[key] === 'undefined') {
        console.log('game ', key, ' does not exist');
        res.sendStatus(400);
        return;
    }

    // check we have all the data to join a game
    if (typeof req.body === 'undefined' ||
        typeof req.body.name === 'undefined') {
        console.log('missing data');
        res.sendStatus(400);
        return;
    }

    var name = req.body.name;

    // create a new user in the current game
    if (!global[key].gameManager.userManager.createUser(name)) {
        console.log('can not create user ', name);
        res.sendStatus(400);
        return;
    }

    configureNewPaths(name, key);

    // return the key to the user
    res.json(key);
});
app.post('/startGame/:key', function (req, res) {
    console.log('startGame');

    // start a specific game using the key
    var key = req.params.key;

    // check if a game with this key has been created
    if (typeof global[key] === 'undefined') {
        console.log('game ', key, ' does not exist');
        res.sendStatus(400);
        return;
    }

    // check we have all the data to start a game
    if (typeof req.body === 'undefined' || typeof req.body.name === 'undefined') {
        console.log('missing data');
        res.sendStatus(400);
        return;
    }

    var name = req.body.name;

    // start the game
    if (!global[key].gameManager.start(name)) {
        console.log(name, ' can not start game ', key);
        res.sendStatus(400);
        return;
    }

    // return the key to the users
    res.send(key);
});

// game public interface
app.get('/:key/:name/users', function (req, res) {
    console.log('users');

    // get the users for a particular game key
    var key = req.params.key;
    var name = req.params.name;

    // check if a game with this key has been created
    if (typeof global[key] === 'undefined') {
        console.log('game ', key, ' does not exist');
        res.sendStatus(400);
        return;
    }

    var users = global[key].gameManager.userManager.users;
    var message = JSON.stringify(users);

    res.json(message);
});
app.get('/:key/:name/user', function (req, res) {
    console.log('user');

    // get the users for a particular game key
    var key = req.params.key;
    var name = req.params.name;

    // check if a game with this key has been created
    if (typeof global[key] === 'undefined') {
        console.log('game ', key, ' does not exist');
        res.sendStatus(400);
        return;
    }

    var user = global[key].gameManager.userManager.getUser(name);
    if(!user){
        console.log(user, ' does not exist');
        res.sendStatus(400);
        return;
    }
    var message = JSON.stringify(user);

    res.send(message);
});
app.get('/:key/:name/grid', function (req, res) {
    console.log('grid');

    // get the users for a particular game key
    var key = req.params.key;
    var name = req.params.name;

    // check if a game with this key has been created
    if (typeof global[key] === 'undefined') {
        console.log('game ', key, ' does not exist');
        res.sendStatus(400);
        return;
    }

    var grid = global[key].gameManager.grid;
    var message = JSON.stringify(grid);

    res.send(message);
});
app.post('/:key/:name/endTurn', function (req, res) {
    console.log('endTurn');

    // get the game key
    var key = req.params.key;
    var name = req.params.name;

    // check if a game with this key has been created
    if (typeof global[key] === 'undefined') {
        console.log('game ', key, ' does not exist');
        res.sendStatus(400);
        return;
    }

    if (typeof req.body === 'undefined' ||
        typeof req.body.user === 'undefined' ||
        typeof req.body.grid === 'undefined') {
        console.log('missing data');

        res.sendStatus(400); // error status
        return;
    }

    var grid = req.body.grid;
    var hand = req.body.user.hand;
    var score = req.body.user.score;

    var user = global[key].gameManager.userManager.getUser(name);
    if (!user) {
        console.log(user, ' does not exist');
        res.sendStatus(400);
        return;
    }

    global[key].gameManager.grid = grid;
    user.hand = hand;
    user.score = score;

    if (!global[key].gameManager.endTurn(name)) {
        console.log(user, ' can not end turn');
        res.sendStatus(400);
        return;
    }

    var message = JSON.stringify({grid: grid, user: user});
    res.send(message);
});

// game objects
function user(name) {
    this.name = name;
    this.hand = [];
    this.score = 0;
    this.turn = false;
}
function userManager() {
    this.users = [];

    this.getUser = function (name) {
        for (var i = 0; i < this.users.length; i++) {
            if (this.users[i].name === name) {
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
    this.getNextUser = function (name) {
        if (this.getUser(name) === null) {
            return null;
        }

        for (var i = 0; i < this.users.length; i++) {
            if (this.users[i].name === name) {
                if (i === this.users.length - 1) {
                    return this.users[0];
                } else {
                    return this.users[i + 1];
                }
            }
        }
    };
    this.getFirstTurnUser = function () {
        if (this.users.length === 0) {
            return null;
        }
        var user = this.users[Math.floor(Math.random() * this.users.length)];
        return user;
    };
    this.forAllUsers = function (func) {
        for (var i = 0; i < this.users.length; i++) {
            func(this.users[i]);
        }
    };
}
function gameManager() {
    this.grid = null;
    this.deck = null;
    this.userManager = new userManager;
    this.startedBy = null;

    this.start = function (name) {
        this.startedBy = name;
        this.grid = createGrid();
        this.deck = createDeck();
        this.deck = shuffle(this.deck);

        // dealing first card onto the grid
        this.grid[32][32] = this.deck.pop();

        // deal hands
        var deck = this.deck; // temp var for the function below
        this.userManager.forAllUsers(function (user) {
            user.hand = dealHand(deck);
        });

        var user = this.userManager.getFirstTurnUser();
        if (user === null) {
            return false;
        }
        user.turn = true;

        return true;
    };
    this.endTurn = function (name) {
        var user = this.userManager.getUser(name);
        if (user === null) {
            console.log("User ", name, " does no exist");
            return false; // user does not exist
        }
        if (user.turn === false) {
            console.log("User ", name, " is not their turn");
            return false; // not the users turn
        }
        // now handle the turn logic
        user.turn = false;
        user.hand = refreshHand(user.hand, this.deck);
        this.userManager.getNextUser(name).turn = true;

        return true;
    };
}

// helper functions
function generateKey() {
    return Math.random().toString(36).substr(2, 5);
}
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
function createDeck() {
    // Create the 3 variables of a tile
    var shapes = ["square", "circle", "triangle", "cross"],
        colours = ["blue", "red", "green", "yellow"],
        numbers = ["1", "2", "3", "4"];

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
function shuffle(array) {
    // The Fisher-Yates (aka Knuth) Shuffle.
    // See https://github.com/coolaj86/knuth-shuffle
    // You can see a great visualization here (and the original post linked to this)
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
function dealHand(deck) {
    var hand = [];

    for (var i = 0; i < 4; i++) {
        hand.push(deck.pop());
    }
    return hand;
}
function refreshHand(hand, deck) {

    for (var i = 0; i < 4; i++) {
        if (!hand[i]) {
            hand[i] = deck.pop();
        }
    }
    return hand;
}

// single global variable
var global = {};

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// always create a game for testing
function createTestGame(){
    var key = '0000';
    global[key] = {};
    global[key].gameManager = new gameManager;
    global[key].gameManager.userManager.createUser('James');
    global[key].gameManager.userManager.createUser('Sam');
    global[key].gameManager.start('James');

    // force the turn to James
    global[key].gameManager.userManager.getUser('James').turn = true;
    global[key].gameManager.userManager.getUser('Sam').turn = false;

    configureNewPaths('James', key);
    configureNewPaths('Sam', key);
}
createTestGame();

//start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function () {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
});