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
        var size = 2;
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
            $("#swapSpan").hide();
        } else {
            $("#undo").hide();
            $("#reset").hide();
            $("#swapSpan").show();
        }

        if (users.length) {
            var html = usersToHtml(users);
            $("#users").html(html);

            var user = getUser(users, name);
            if (user) {
                if (user.turn) {
                    addTargetsToGrid(grid);
                    $("#end").show();
                } else {
                    $("#end").hide();
                    $("#swapSpan").hide();
                }
                $("#hand").html(handToHtml(user.hand));
                if (user.turn) {
                    $('#grid .target').click(targetClick);
                    $('#hand .tile').click(tileClick);
                }
            }
        }

        $("#grid").html(gridToHtml(grid));
        handIndex = -1;
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
            user.delta = calculateScore(grid, tilesPlaced);

            var html = usersToHtml(users);
            $("#users").html(html);
        }
    }

    function tileClick(e) {
        var swapping = $('#swap').prop('checked');
        if (handIndex !== -1 && !swapping) {
            $('.tile').removeClass("targetSelected");
        }
        var y = $(this).attr("data-y");
        y = parseInt(y);
        console.log("tile index", y);

        handIndex = y;
        var user = getUser(users, name);

        if (swapping) {
            user.swap.push(user.hand[handIndex]);
        }
        $(this).addClass("targetSelected");

        // tbd - this needs to be selected with a help button
        addTargetsToGrid(grid);
        // for (var x = 0; x < size; x++) {
        //     for (var y = 0; y < size; y++) {
        //         if (grid[x][y] && grid[x][y].type === "target" && !isValidMove(grid, user.hand[handIndex], x, y, tilesPlaced)) {
        //             grid[x][y] = {type: "blank"};
        //         }
        //     }
        // }
        $("#grid").html(gridToHtml(grid));
        $('#grid .target').click(targetClick);
    }

    function undoClick(e) {
        var previous = history.pop();
        if (previous) {
            grid = previous.grid;
            users = previous.users;
            tilesPlaced = previous.tilesPlaced;

            buildDesktop(grid, users);
        }
    }
    $("#undo").click(undoClick);

    function resetClick(e) {
        init();
    }
    $("#reset").click(resetClick);

    function endClick(e) {
        var user = getUser(users, name);
        user.score += user.delta;
        user.delta = 0;

        var data = {
            grid: clearGrid(grid),
            user: user
        };

        tilesPlaced.forEach(function (tile) {
            data.grid[tile.x][tile.y].placed = true;
        });

        history = [];
        handIndex = -1;
        tilesPlaced = [];

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

    function resume() {
        $("#resume").hide();
        init();
    }
    $("#resume").click(resume);

    function poll() {
        var count = 0;
        var duration = 3; // in seconds
        $("#resume").hide();
        var timer = setInterval(function () {
            if (count++ > 120 / duration) {
                clearInterval(timer); // and stop
                $("#resume").show();
            }
            console.log("poll for turn");
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: '/' + key + '/' + name + '/users',
                success: function (result, status, xhr) {
                    if (JSON.stringify(users) !== result) {
                        clearInterval(timer);
                        init();
                    }
                }
            });
        }, duration * 1000);
    }
    function init() {
        history = [];
        tilesPlaced = [];
        handIndex = -1;

        $.when(getGrid(), getUsers()).then(function () {
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
                console.log('get users success');
                users = JSON.parse(result);
                var user = getUser(users, name);
                user.delta = 0;
            }
        });
    }

    init();
    // grid = createGrid();
    // var deck = createDeck();
    // grid[32][32] = removeFromDeck(deck, "circle", "red", "1");
    // grid[32][33] = removeFromDeck(deck, "cross", "blue", "2");
    // grid[32][34] = removeFromDeck(deck, "triangle", "green", "3");
    // var tile = removeFromDeck(deck, "circle", "red", "4");
    // var validMove = isValidMove(grid, tile, 32, 35, []);
    // if(validMove) {
    //     grid[32][35] = tile;
    // }
    // buildDesktop(grid, []);
    // code for checked buttons
    $('.button-checkbox').each(function () {

        // Settings
        var $widget = $(this),
            $button = $widget.find('button'),
            $checkbox = $widget.find('input:checkbox'),
            color = $button.data('color'),
            settings = {
                on: {
                    icon: 'glyphicon glyphicon-check'
                },
                off: {
                    icon: 'glyphicon glyphicon-unchecked'
                }
            };

        // Event Handlers
        $button.on('click', function () {
            $checkbox.prop('checked', !$checkbox.is(':checked'));
            $checkbox.triggerHandler('change');
            updateDisplay();
        });
        $checkbox.on('change', function () {
            updateDisplay();
        });

        // Actions
        function updateDisplay() {
            // reset selection and swap hand
            $('.tile').removeClass("targetSelected");
            if (users) {
                var user = getUser(users, name);
                user.swap = [];
            }

            var isChecked = $checkbox.is(':checked');

            // Set the button's state
            $button.data('state', (isChecked) ? "on" : "off");

            // Set the button's icon
            $button.find('.state-icon')
                .removeClass()
                .addClass('state-icon ' + settings[$button.data('state')].icon);

            // Update the button's color
            if (isChecked) {
                $button
                    .removeClass('btn-default')
                    .addClass('btn-' + color + ' active');
            }
            else {
                $button
                    .removeClass('btn-' + color + ' active')
                    .addClass('btn-default');
            }
        }

        // Initialization
        function setUpCheckboxes() {

            updateDisplay();

            // Inject the icon if applicable
            if ($button.find('.state-icon').length == 0) {
                $button.prepend('<i class="state-icon ' + settings[$button.data('state')].icon + '"></i> ');
            }
        }

        setUpCheckboxes();
    });
});
