/**
 * Created by James on 06/11/2016.
 */
$(document).ready(function () {
    var key = null;
    var name = null;

    $("#form").submit(function (e) {
        e.preventDefault();
    });

    function newButtonClick(e) {
        $("#openingDiv").hide();
        $("#newGameDiv").show();
        $("#newGameName").focus();
    }
    $("#newButton").click(newButtonClick);

    function joinButtonClick(e) {
        $("#openingDiv").hide();
        $("#joinDiv").show();
        $("#joinKey").focus();
    }
    $("#joinGameButton").click(joinButtonClick);

    function backButtonClick(e) {
        $("#openingDiv").show();
        $("#newGameDiv").hide();
        $("#joinDiv").hide();
        $("#startGameDiv").hide();
        $("#newGameName").val("");
        $("#joinName").val("");
        $("#joinKey").val("");
        $("#gameKey").html("");
        $("#usersTable").html("");
    }
    $("#newBackButton").click(backButtonClick);
    $("#joinBackButton").click(backButtonClick);
    $("#startBackButton").click(backButtonClick);

    function getUsersSuccess(result, status, xhr){
        var users = JSON.parse(result);

        var html = userToHtml(users);
        $("#usersTable").html(html);

        // check if the game has started its someone's turn
        // if so jump to the game page
        for(var i = 0; i < users.length; i++){
            if(users[i].turn){
                window.location.href = window.location.href + key + "/" + name;
            }
        }
    }

    function createGameSuccess(result, status, xhr) {
        console.log(result);
        key = result;
        $("#gameKey").html("Access code: " + key);
        $("#startGameDiv").show();
        $("#newGameDiv").hide();

        var timer = setInterval(function(){
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: '/' + key + '/' + name + '/users',
                success: getUsersSuccess
            });
        }, 2000);

        // $.ajax({
        //     type: 'GET',
        //     url: '/grid',
        //     success: function (message) {
        //         console.log('grid success');
        //
        //         grid = JSON.parse(message);
        //         addBlanksToGrid(grid);
        //
        //         $.ajax({
        //             type: 'GET',
        //             url: '/user/' + globalName + '/hand',
        //             success: function (message) {
        //                 console.log('user hand success');
        //                 //console.log(message);
        //
        //                 hand = JSON.parse(message);
        //
        //                 $("#end").show();
        //
        //                 buildDesktop(grid, hand);
        //             }
        //         });
        //     }
        // });
    }
    function createGameError(xhr, status, error) {
        alert("create game error " + error);
        backButtonClick();
    }
    function createGame() {
        name = $("#newGameName").val();
        var data = {name: name};

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/createGame',
            success: createGameSuccess,
            error: createGameError
        });
    }
    $("#createButton").click(function (e) {
        e.preventDefault();
        createGame();
    });

    function joinSuccess(result, status, xhr) {
        console.log(result);
        key = result;
        $("#gameKey").html("Access code: " + key);
        $("#joinDiv").hide();

        var timer = setInterval(function(){
            $.ajax({
                type: 'GET',
                contentType: 'application/json',
                url: '/' + key + '/' + name + '/users',
                success: getUsersSuccess
            });
        }, 2000);
    }
    function joinError(xhr, status, error) {
        alert("join game error " + error);
        backButtonClick();
    }
    function join() {
        name = $("#joinName").val();
        var data = {name: name};
        key = $("#joinKey").val();

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/joinGame/' + key,
            success: joinSuccess,
            error: joinError
        });
    }
    $("#joinButton").click(function (e) {
        e.preventDefault();
        join();
    });

    function startSuccess(result, status, xhr) {
        console.log(result);
    }
    function startError(xhr, status, error) {
        alert("start game error " + error);
        backButtonClick();
    }
    function start() {
        var data = {name: name};

        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: '/startGame/' + key,
            success: startSuccess,
            error: startError
        });
    }
    $('#startButton').click(start);

    function userToHtml(users) {
        html = '<table class="table table-striped table-condensed">';
        html += '<tr><th>#</th><th>Name</th></tr>';
        for (var i = 0; i < users.length; i++) {
            html += '<tr>';
            html += '<td>' + (i + 1) + '</td>';
            html += '<td>' + users[i].name + '</td>';
            html += '</tr>';
        }
        html += '</table>';
        return html;
    }
});