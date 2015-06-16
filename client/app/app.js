'use strict';
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