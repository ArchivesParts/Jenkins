'use strict';
var user = new Parse.User();
//user.set("username", "ganne");
//user.set("password", "10jtal35");
//user.set("email", "email@example.com");

Parse.initialize("JyHA29BGTe9B12FlDdrmnTEgtc0etHocLU4uLyuq", "jx8aHTbzLnrsdQVL8T5ohllILd43bLWeWUQcbglp");
angular.module('codingChallengeApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
])
        .config(function ($routeProvider, $locationProvider)
        {
            $routeProvider
                    .otherwise({
                        redirectTo: '/home'
                    });

            $locationProvider.html5Mode(true);
        });