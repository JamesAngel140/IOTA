/**
 * Created by James on 06/11/2016.
 */
$(document).ready(function () {

    function login_success(result, status, xhr) {
        alert("login success");

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

        var html = [];
        deck.forEach(function(item){
            html.push('<li id="item.shape" style="color:' + item.colour + '">' + item.shape + " " + item.colour + " " + item.number + "</li>");
        });
        $("#tiles").html(html.join("\n"));
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