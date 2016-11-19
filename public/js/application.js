/**
 * Created by James on 06/11/2016.
 */
$(document).ready(function () {

    function newGame_success(result, status, xhr) {
        $("#register").hide();
        $("#game").show();
        globalName = $("#name").val();
        init();

        // every 5000 milliseconds (5 seconds) get the registered users from the server
        // setInterval(function () {
        //     $.ajax({
        //         type: 'GET',
        //         url: '/users',
        //         success: function (data) {
        //             console.log('success');
        //             console.log(JSON.stringify(data));
        //             data.forEach(function (user, index) {
        //                 $("#user" + index).html(user);
        //             });
        //         }
        //     });
        // }, 5000);
    }

    function newGame_error(xhr, status, error) {
        alert("newGame error " + error);
    }

    function newGame() {
        var data = {name: $("#name").val()};

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/newGame',
            success: newGame_success
        });
    }

    $("#new").click(function (e) {
        e.preventDefault();
        newGame();
    });

    function joinGame() {
        var data = {name: $("#name").val()};

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/joinGame',
            success: newGame_success
        });
    }

    $("#join").click(function (e) {
        e.preventDefault();
        joinGame();
    });

    $("#form").submit(function (e) {
        e.preventDefault();
        //newGame();
    });

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

    function clone(obj) {
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

        var validMove = isValidMove(grid, hand[handIndex], x, y, tilesPlaced);

        if (isGridEmpty(grid) || validMove) {
            $(this).addClass("targetSelected");

            // keep history before the change
            history.push({grid: clone(grid), hand: clone(hand), tilesPlaced: tilesPlaced});

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
            hand.forEach(function (item) {
                if (item === null) {
                    nulls++;
                }
            });
            if (nulls === hand.length) {
                $("#next").show();
            } else {
                $("#next").hide();
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


        // tbd - this needs to be slected with a help button
        addTargetsToGrid(grid);
        for (var x = 0; x < size; x++) {
            for (var y = 0; y < size; y++) {
                if (grid[x][y] && grid[x][y].type === "target" && !isValidMove(grid, hand[handIndex], x, y, tilesPlaced)) {
                    grid[x][y] = {type: "blank"};
                }
            }
        }
        $("#grid").html(gridToHtml(grid));
        $('#grid .target').click(targetClick);
    }

    function buildDesktop(grid, hand) {
        if (history.length) {
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

    function undoClick(e) {
        var previous = history.pop();
        if (previous) {
            grid = previous.grid;
            hand = previous.hand;
            tilesPlaced = previous.tilesPlaced;
            buildDesktop(grid, hand);
        }
    }

    $("#undo").click(undoClick);

    function resetClick(e) {
        var previous = history[0];
        history = [];
        if (previous) {
            grid = previous.grid;
            hand = previous.hand;
            buildDesktop(grid, hand);
        }
    }

    $("#reset").click(resetClick);

    function endClick(e) {
        history = [];
        handIndex = -1;
        tilesPlaced = []

        var data = {
            grid: prepareGrid(clone(grid)),
            hand: hand,
            name: globalName
        };

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/grid',
            success: function (message) {
                console.log('grid post success');

                $.ajax({
                    type: 'GET',
                    url: '/user/' + globalName + '/hand',
                    success: function (message) {
                        console.log('user hand success');
                        //console.log(message);

                        hand = JSON.parse(message);

                        buildDesktop(grid, hand);
                    }
                });

            }
        });
    }

    $("#end").click(endClick);

    // this is where we start
    var history = [];
    var tilesPlaced = [];
    var handIndex = -1;

    //var deck = createDeck();
    // shuffle the deck so that it has a random order
    //deck = shuffle(deck);

    var grid = null;
    var hand = null;

    var globalName;

    function init() {
        $.ajax({
            type: 'GET',
            url: '/grid',
            success: function (message) {
                console.log('grid success');
                //console.log(message);

                grid = JSON.parse(message);
                addBlanksToGrid(grid);

                $.ajax({
                    type: 'GET',
                    url: '/user/' + globalName + '/hand',
                    success: function (message) {
                        console.log('user hand success');
                        //console.log(message);

                        hand = JSON.parse(message);

                        $("#end").show();

                        buildDesktop(grid, hand);
                    }
                });
            }
        });
    }

    $("#register").show();

    //var grid = createGrid();
    //grid[32][32] = {type: "target"};
    //grid[32][32] = deck.pop();

    //var hand = dealHand(deck);
});