/**
 * Created by james on 29/10/2016.
 */

// $.ajax({
//     type: "POST",
//     url: http://localhost:3000/action_page.php?uname=James,
//     data: uname,
//     success:,
//     dataType: String
// });

var express = require('express');
var app = express();
var path = require('path');

var bodyParser = require('body-parser');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/register', function(req, res) {
    console.log("register");
    console.log(req);
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});