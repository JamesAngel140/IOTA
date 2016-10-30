/**
 * Created by james on 29/10/2016.
 */

var express = require('express');
var app = express();
var path = require('path');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});