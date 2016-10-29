/**
 * Created by james on 29/10/2016.
 */

// MODULE
var iotaApp = angular.module('iotaApp', ['ngRoute', 'ngResource']);

iotaApp.config(["$routeProvider", "$locationProvider", "$httpProvider", function ($routeProvider, $locationProvider, $httpProvider) {

    //================================================
    // Define all the routes
    //================================================
    $routeProvider.when('/', {
        templateUrl: 'pages/login.html',
        controller: 'mainCtrl'
    }).otherwise({
        redirectTo: '/'
    });
}]);

//CONTROLLERS
iotaApp.controller('mainCtrl', function ($scope, $rootScope, $log, $http, $location, $routeParams) {
    $log.info("mainCtrl");
});