'use strict';

angular.module('codingChallengeApp')
        .config(function ($routeProvider)
        {
            $routeProvider
                    .when('/home', {
                        templateUrl: 'app/main/main.html',
                        controller: 'MainCtrl',
                        controllerAs: 'main'
                    });
        });