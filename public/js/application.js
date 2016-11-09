/**
 * Created by James on 06/11/2016.
 */
$(document).ready(function () {

    function login_success(result, status, xhr) {
        // alert("login success");

        $("#loginbox").hide();
        $("#users").show();

        // every 5000 milliseconds (5 seconds) get the registered users from the server
        setInterval(function(){
            $.ajax({
                type: 'GET',
                url: '/users',
                success: function (data) {
                    console.log('success');
                    console.log(JSON.stringify(data));
                    data.forEach(function(user,index){
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

    function gridToHtml(grid)
    {
        html = '<table>';
        for(var y = 0; y < grid.length; y++){
            html += '<tr>';
            for(var x = 0; x < grid[y].length; x++){
                if(grid[x][y] !== null){
                    switch(grid[x][y].type){
                        case "tile":
                            html += '<td>' + tileToHtml(grid[x][y]) + '</td>';
                            break;
                        case "target":
                            html += '<td>' + targetToHtml(grid[x][y],x,y) + '</td>';
                            break;
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

    function targetToHtml(tile, x, y){
        var html = '<div class="target" data-x="' + x + '" data-y="' + y + '"></div>';
        return html;
    }

    function tileToHtml(tile){
        var html = '<div class="tileback"><span class="alignleft">'+
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

    function addTargets(grid, x, y){
        for(var a = x-1; a <= x+1; a++){
            for(var b = y-1; b <= y+1; b++) {
                if(grid[a][b] === null){
                    grid[a][b] = {type:"target"};
                }
            }
        }
    }

    function addTargetsToGrid(grid){
        for(var x = 0; x < grid.length; x++){
            html += '<tr>';
            for(var y in grid[x]){
                if(grid[x][y] !== null){
                    switch(grid[x][y].type){
                        case "tile":
                            addTargets(grid,x,y);
                            break;
                        case "target":
                            break;
                    }
                }
            }
        }
    }

    // grid[32][32] = {type:"target"};
    grid[32][32] = deck[4];
    grid[32][33] = deck[17];
    grid[31][32] = deck[50];

    addTargetsToGrid(grid);

    var html = gridToHtml(grid);
    $("#grid").html(html);

    function targetClick(e){
            var x = $(this).attr("data-x");
            var y = $(this).attr("data-y");
            console.log(x,y);
            // $(this).addClass("targetSelected");
            grid[x][y] = deck[5];
        addTargetsToGrid(grid);
        var html = gridToHtml(grid);
            $("#grid").html(html);
        $('.target').click(targetClick);
    }

    $('.target').click(targetClick);

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