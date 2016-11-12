/**
 * Created by James on 06/11/2016.
 */
$(document).ready(function () {

    function login_success(result, status, xhr) {
        // alert("login success");

        $("#loginbox").hide();
        $("#users").show();

        // every 5000 milliseconds (5 seconds) get the registered users from the server
        setInterval(function () {
            $.ajax({
                type: 'GET',
                url: '/users',
                success: function (data) {
                    console.log('success');
                    console.log(JSON.stringify(data));
                    data.forEach(function (user, index) {
                        $("#user" + index).html(user);
                    });
                }
            });
        }, 5000);
    }
    function login_error(xhr, status, error) {
        alert("login error " + error);
    }
    function login() {
        var data = {name: $("#login-username").val()};

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/register',
            success: login_success
        });
    }
    $("#btn-login").click(function (e) {
        e.preventDefault();
        login();
    });
    $("#loginform").submit(function (e) {
        e.preventDefault();
        login();
    });

    $("#loginbox").hide();
    $("#users").hide();

    function gridToHtml(grid) {
        html = '<table>';
        for (var y = 0; y < grid.length; y++) {
            html += '<tr>';
            for (var x = 0; x < grid[y].length; x++) {
                if (grid[x][y] !== null) {
                    switch (grid[x][y].type) {
                        case "tile":
                            html += '<td>' + tileToHtml(grid[x][y], x, y) + '</td>';
                            break;
                        case "target":
                            html += '<td>' + targetToHtml(grid[x][y], x, y) + '</td>';
                            break;
                        case "blank":
                            html += '<td>' + blankToHtml(grid[x][y]) + '</td>';
                    }

                } else {
                    html += '<td></td>'
                }
            }
            html += '</tr>';
        }
        html += '</table>';
        return html;
    }
    function handToHtml(hand) {
        html = '<table>';
        html += '<tr>';
        for (var y = 0; y < hand.length; y++) {
            if(hand[y] && hand[y].type === "tile"){
                html += '<td>' + tileToHtml(hand[y], -1, y) + '</td>';
            } else {
                html += '<td>' + blankToHtml(hand[y]) + '</td>';
            }
        }
        html += '</tr>';
        html += '</table>';
        return html;
    }
    function targetToHtml(tile, x, y) {
        var html = '<div class="target" data-x="' + x + '" data-y="' + y + '"></div>';
        return html;
    }
    function blankToHtml(tile) {
        var html = '<div class="blank"></div>';
        return html;
    }
    function tileToHtml(tile, x, y) {
        var html = '<div id="x' + x + 'y' + y + '" class="tile" data-x="' + x + '" data-y="' + y + '"><span class="alignleft">' +
            tile.number +
            '</span><span class="alignright">' +
            tile.number +
            '</span><div style="clear: both;"></div><div class="shapeback"><div class="' +
            tile.shape + '"';

        switch (tile.shape) {
            case "square":
            case "circle":
            case "cross": {
                html += 'style="background:' + tile.colour + '"';
                break;
            }
            case "triangle": {
                html += 'style="border-bottom-color:' + tile.colour + '"';
                break;
            }
        }

        html += '></div></div><span class="alignleft">' +
            tile.number +
            '</span><span class="alignright">' +
            tile.number +
            '</span><div style="clear: both;"></div></div>';

        return html;
    }

    function addTargetsAroundTile(grid, x, y) {
        for (var a = x - 1; a <= x + 1; a++) {
            for (var b = y - 1; b <= y + 1; b++) {
                if (grid[a][b] === null || grid[a][b].type === "blank") {
                    grid[a][b] = {type: "target"};
                }
            }
        }
    }
    function addBlanksAroundTile(grid, x, y) {
        var size = 3;
        for (var a = x - size; a <= x + size; a++) {
            for (var b = y - size; b <= y + size; b++) {
                if (grid[a][b] === null) {
                    grid[a][b] = {type: "blank"};
                }
            }
        }
    }

    function addTargetsToGrid(grid) {
        for (var x = 0; x < grid.length; x++) {
            for (var y = 0; y < grid[x].length; y++) {
                if (grid[x][y] !== null && grid[x][y].type === "tile") {
                    addTargetsAroundTile(grid, x, y);
                }
            }
        }
    }
    function addBlanksToGrid(grid) {
        for (var x = 0; x < grid.length; x++) {
            for (var y = 0; y < grid[x].length; y++) {
                if (grid[x][y] !== null) {
                    switch (grid[x][y].type) {
                        case "target":
                        case "tile":
                            addBlanksAroundTile(grid, x, y);
                            break;
                    }
                }
            }
        }
    }

    function clone(obj){
        return JSON.parse(JSON.stringify(obj));
    }

    function targetClick(e) {
        // read the data coordinates from the div clicked
        var x = $(this).attr("data-x");
        var y = $(this).attr("data-y");
        x = parseInt(x);
        y = parseInt(y);
        console.log("x", x, "y", y);

        // we need a hand index to be able to move a selected item to the grid
        if (handIndex === -1) {
            return;
        }

        // count how many rulesAllValid are true
        // all rulesAllValid must be valid
        var allValidCount = 0;
        rulesAllValid.forEach(function(rule){
            allValidCount += rule(grid, hand[handIndex], x, y, tilesPlaced);
        });

        // one or more of at least one needs to be valid
        var atLeastOneValidCountX = 0;
        rulesAtLeastOneValid.forEach(function(rule){
            atLeastOneValidCountX += rule(grid, hand[handIndex], x, y, 0);
        });
        var atLeastOneValidCountY = 0;
        rulesAtLeastOneValid.forEach(function(rule){
            atLeastOneValidCountY += rule(grid, hand[handIndex], x, y, 1);
        });

        if(isGridEmpty(grid)|| ( allValidCount === rulesAllValid.length && atLeastOneValidCountX >= 1 && atLeastOneValidCountY >= 1)) {
            $(this).addClass("targetSelected");

            // keep history before the change
            history.push({grid:clone(grid), hand:clone(hand), tilesPlaced: tilesPlaced});

            // add new tile to grid
            var tile = hand[handIndex];
            // the tile needs to remember its location
            tile.x = x;
            tile.y = y;
            grid[x][y] = tile;
            tilesPlaced.push(tile);
            hand[handIndex] = null;

            // if all the hand is null then allow next go
            var nulls = 0;
            hand.forEach(function(item){
                if(item === null){
                    nulls++;
                }
            });
            if(nulls === hand.length){
                $("next").show();
            } else {
                $("next").hide();
            }

            buildDesktop(grid, hand);
        }
    }
    function tileClick(e) {
        if (handIndex !== -1) {
            $('#x-1y' + handIndex).removeClass("targetSelected");
        }
        var y = $(this).attr("data-y");
        y = parseInt(y);

        handIndex = y;
        console.log("tile index", y);
        $(this).addClass("targetSelected");
    }

    function buildDesktop(grid, hand){
        if(history.length){
            $("#undo").show();
            $("#reset").show();
        } else {
            $("#undo").hide();
            $("#reset").hide();
        }
        addTargetsToGrid(grid);
        $("#grid").html(gridToHtml(grid));
        $('#grid .target').click(targetClick);

        handIndex = -1;
        $("#hand").html(handToHtml(hand));
        $('#hand .tile').click(tileClick);
    }

    function undoClick(e){
        var previous = history.pop();
        if(previous){
            grid = previous.grid;
            hand = previous.hand;
            tilesPlaced = previous.tilesPlaced;
            buildDesktop(grid, hand);
        }
    }
    $("#undo").click(undoClick);

    function resetClick(e){
        var previous = history[0];
        history = [];
        if(previous){
            grid = previous.grid;
            hand = previous.hand;
            buildDesktop(grid, hand);
        }
    }
    $("#reset").click(resetClick);

    function nextClick(e){
        history = [];
        hand = dealHand(deck);
        buildDesktop(grid, hand);
    }
    $("#next").click(nextClick);

    // this is where we start
    var history = [];
    var tilesPlaced = [];
    var handIndex = -1;

    var deck = createDeck();
    // shuffle the deck so that it has a random order
    deck = shuffle(deck);

    var grid = createGrid();
    //grid[32][32] = {type: "target"};
    grid[32][32] = deck.pop();
    grid[33][32] = deck.pop();
    addBlanksToGrid(grid);

    var hand = dealHand(deck);
    buildDesktop(grid, hand);
});