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

    function ToTable(dataArray)
    {
        html = '<table>';
        var len = dataArray.length;
        for(var i = 0; i < len; i++){
            html += '<tr>';
            for(var key in dataArray[i]){
                html += '<td>' + dataArray[i][key] + '</td>';
            }
            html += '</tr>';
        }
        html += '</table>';
        return html;
    }

    var item = deck[3];
    grid[32][32] = '<div class="' + item.shape + '" style="background:' + item.colour + '"></div>';
    item = deck[17];
    grid[32][33] = '<div class="' + item.shape + '" style="background:' + item.colour + '"></div>';
    var html = ToTable(grid);
    $("#grid").html(html);

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