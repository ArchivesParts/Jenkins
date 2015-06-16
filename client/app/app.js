'use strict';
var user = new Parse.User();
//user.set("username", "ganne");
//user.set("password", "10jtal35");
//user.set("email", "email@example.com");

angular.module('codingChallengeApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
])
        .config(function ($routeProvider, $locationProvider, config)
        {
            Parse.initialize(config.main.parse.applicationKey, config.main.parse.secret);
            $routeProvider
                    .otherwise({
                        redirectTo: '/home'
                    });

            $locationProvider.html5Mode(true);
        });