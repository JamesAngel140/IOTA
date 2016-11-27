/**
 * Created by james on 26/11/2016.
 */

/**
 * Created by James on 06/11/2016.
 */
$(document).ready(function () {
    var key = null;
    var name = null;

    var history = [];
    var tilesPlaced = [];
    var handIndex = -1;
    var grid = null;
    var users = null;
    var runningScore = 0;

    var tmp = window.location.href.split("/");

    name = tmp[tmp.length - 1];
    key = tmp[tmp.length - 2];

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
    function getUser(users, name) {
        for (var i = 0; i < users.length; i++) {
            if (users[i].name === name) {
                return users[i];
            }
        }
        return null;
    }

    function buildDesktop(grid, users) {
        if (history.length) {
            $("#undo").show();
            $("#reset").show();
        } else {
            $("#undo").hide();
            $("#reset").hide();
        }

        var html = usersToHtml(users);
        $("#users").html(html);

        var user = getUser(users, name);

        // if any of the hand is null then allow next go
        var count = 0;
        user.hand.forEach(function (item) {
            if (item === null) {
                count++;
            }
        });
        if (count > 0) {
            $("#end").show();
        } else {
            $("#end").hide();
        }
        if (user.turn) {
            addTargetsToGrid(grid);
        }
        $("#grid").html(gridToHtml(grid));

        handIndex = -1;
        $("#hand").html(handToHtml(user.hand));
        if (user.turn) {
            $('#grid .target').click(targetClick);
            $('#hand .tile').click(tileClick);
        }
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

        var user = getUser(users, name);

        var validMove = isValidMove(grid, user.hand[handIndex], x, y, tilesPlaced);

        if (isGridEmpty(grid) || validMove) {
            $(this).addClass("targetSelected");

            // keep history before the change
            history.push({grid: clone(grid), users: clone(users), tilesPlaced: clone(tilesPlaced)});

            // add new tile to grid
            var tile = user.hand[handIndex];
            // the tile needs to remember its location
            tile.x = x;
            tile.y = y;
            grid[x][y] = tile;
            tilesPlaced.push(tile);
            user.hand[handIndex] = null;

            buildDesktop(grid, users);
            var score = calculateScore(grid, tilesPlaced);
            user.score = runningScore + score;
            // add the score to the correct user
            // users.forEach(function (user) {
            //     if (user.name === name) {
            //         user.score = score;
            //     }
            // });
            var html = usersToHtml(users);
            $("#users").html(html);
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

        var user = getUser(users, name);

        // tbd - this needs to be slected with a help button
        addTargetsToGrid(grid);
        for (var x = 0; x < size; x++) {
            for (var y = 0; y < size; y++) {
                if (grid[x][y] && grid[x][y].type === "target" && !isValidMove(grid, user.hand[handIndex], x, y, tilesPlaced)) {
                    grid[x][y] = {type: "blank"};
                }
            }
        }
        $("#grid").html(gridToHtml(grid));
        $('#grid .target').click(targetClick);
    }

    function undoClick(e) {
        var previous = history.pop();
        if (previous) {
            grid = previous.grid;
            users = previous.users;
            tilesPlaced = previous.tilesPlaced;

            //clearGrid(grid);
            //addBlanksToGrid(grid);
            buildDesktop(grid, users);
        }
    }
    $("#undo").click(undoClick);

    function resetClick(e) {
        getGrid();
    }
    $("#reset").click(resetClick);

    function endClick(e) {
        history = [];
        handIndex = -1;
        tilesPlaced = [];

        var user = getUser(users, name);

        var data = {
            grid: clearGrid(clone(grid)),
            user: user
        };

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/' + key + '/' + name + '/endTurn',
            success: function (result, status, xhr) {
                console.log('end post success');

                var message = JSON.parse(result);
                grid = message.grid;
                users = message.users;
                init();
            }
        });
    }
    $("#end").click(endClick);

    function poll() {
        var timer = setInterval(function () {
            console.log("poll for turn");
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: '/' + key + '/' + name + '/user',
                success: function (result, status, xhr) {
                    user = JSON.parse(result);
                    if (user.turn === true) {
                        // stop polling and refresh everything
                        clearInterval(timer);
                        init();
                    }
                }
            });
        }, 2000);
    }

    function init() {
        history = [];
        tilesPlaced = [];
        handIndex = -1;

        $.when(getGrid(), getUsers()).then(function(){
            addBlanksToGrid(grid);
            buildDesktop(grid, users);

            var user = getUser(users, name);
            if (user.turn === false) {
                poll();
            }
        });
    }

    function getGrid() {
        return $.ajax({
            type: 'GET',
            url: '/' + key + '/' + name + '/grid',
            success: function (result, status, xhr) {
                console.log('get grid success');
                grid = JSON.parse(result);
            }
        });
    }
    function getUsers() {
        return $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: '/' + key + '/' + name + '/users',
            success: function (result, status, xhr) {
                console.log('get grid success');
                users = JSON.parse(result);
                var user = getUser(users, name);
                runningScore = user.score;
            }
        });
    }

    init();
});
