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

    $("#loginbox").hide();
    $("#users").hide();

    // var html = [];
    // deck.forEach(function(item){
    //     html.push('<li><div class="' + item.shape + '" style="background:' + item.colour + '"></div></li>');
    // });
    // $("#tiles").html(html.join("\n"));

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
            switch (hand[y].type) {
                case "tile":
                    html += '<td>' + tileToHtml(hand[y], -1, y) + '</td>';
                    break;
                case "blank":
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
            tile.shape +
            '" style="background:' +
            tile.colour +
            '"></div></div><span class="alignleft" style="color:' + tile.colour + '">' +
            tile.number +
            '</span><span class="alignright">' +
            tile.number +
            '</span><div style="clear: both;"></div></div>';
        return html;
    }

    function addTargets(grid, x, y) {
        for (var a = x - 1; a <= x + 1; a++) {
            for (var b = y - 1; b <= y + 1; b++) {
                if (grid[a][b] === null || grid[a][b].type === "blank") {
                    grid[a][b] = {type: "target"};
                }
            }
        }
    }

    function addBlanks(grid, x, y) {
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
                if (grid[x][y] !== null) {
                    switch (grid[x][y].type) {
                        case "tile":
                            addTargets(grid, x, y);
                            //addBlanks(grid, x, y);
                            break;
                        case "target":
                            //addBlanks(grid, x, y);
                            break;
                    }
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
                            addBlanks(grid, x, y);
                            break;
                    }
                }
            }
        }
    }

    // grid[32][32] = {type:"target"};
    // grid[32][32] = deck[4];
    // grid[32][33] = deck[17];
    // grid[31][32] = deck[50];

    grid[32][32] = {type: "target"};

    addTargetsToGrid(grid);
    addBlanksToGrid(grid);

    dealHand();
    var html = handToHtml(hand);
    $("#hand").html(html);

    html = gridToHtml(grid);
    $("#grid").html(html);

    function targetClick(e) {
        var x = $(this).attr("data-x");
        var y = $(this).attr("data-y");
        console.log(x, y);
        $(this).addClass("targetSelected");
        // grid[x][y] = deck[5];

        // swap item out of hand into grid
        if(handIndex === -1){
            return;
        }

        grid[x][y] = hand[handIndex];

        hand[handIndex] = {type: "blank"};
        var html = handToHtml(hand);
        $("#hand").html(html);
        handIndex = -1;
        $('#hand .tile').click(tileClick);

        addTargetsToGrid(grid);
        html = gridToHtml(grid);
        $("#grid").html(html);
        $('.target').click(targetClick);
    }

    $('.target').click(targetClick);

    var handIndex = -1;
    function tileClick(e) {
        if(handIndex !== -1){
            $('#x-1y' + handIndex).removeClass("targetSelected");
        }
        // var x = $(this).attr("data-x");
        var y = $(this).attr("data-y");
        handIndex = y;
        console.log(x, y);
        $(this).addClass("targetSelected");
        // grid[x][y] = deck[5];
        // addTargetsToGrid(grid);
        // var html = gridToHtml(grid);
        // $("#grid").html(html);
        // $('.target').click(targetClick);
    }
    $('#hand .tile').click(tileClick);

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
            // success: function (data) {
            //     console.log('success');
            //     console.log(JSON.stringify(data));
            //     $("#loginbox").hide();
            //     $("#header").show();
            // }
        });
    }

    $("#btn-login").click(function () {
        login();
    });

    $("#loginform").submit(function (event) {
        event.preventDefault();
        login();
    });

});