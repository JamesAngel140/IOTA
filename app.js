/**
 * Created by james on 29/10/2016.
 */

var express = require('express'),
    app = express(),
    http = require("http").createServer(app),
    bodyParser = require("body-parser"),
    path = require('path');

// global variable of users
var registeredUsers = [];

app.use(bodyParser.json());
app.use(express.static('node_modules'));
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.post('/register', function (req, res) {
    console.log('body: ' + JSON.stringify(req.body));

    if (typeof req.body === 'undefined' || typeof req.body.name === 'undefined') {
        res.sendStatus(400);
    } else {
        registeredUsers.push(req.body.name);
        res.sendStatus(200);
    }
    console.log(registeredUsers);
});
app.get('/users', function (req, res) {
    var message = JSON.stringify(registeredUsers);
    res.send(registeredUsers);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});