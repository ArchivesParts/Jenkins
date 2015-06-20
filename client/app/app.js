'use strict';
(function ()
{
    /**
     * Local interceptor to manage HTTP 401 error
     * @param $q
     * @param $rootScope
     * @returns {{request: request, responseError: responseError, response: response}}
     */
    var interceptor = function ($q, $location)
    {
        return {
            request: function (config)
            {
                if (!Parse.User.current()) {
                    $location.path('/auth');
                }
                return config;
            },
            responseError: function (rejection)
            {
                return $q.reject(rejection);
            },
            response: function (response)
            {
                return response;
            }
        };
    };

    angular.module('codingChallengeApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute'
    ]).config(function ($routeProvider, $locationProvider, $httpProvider, config)
    {
        Parse.initialize(config.main.parse.applicationKey, config.main.parse.secret);
        $routeProvider
                .otherwise({
                    redirectTo: '/home'
                }).
                when('/auth', {
                    templateUrl: 'app/auth/view.html',
                    controller: 'authController',
                    controllerAs: 'auth'
                }).
                when('/auth/logout', {
                    templateUrl: 'app/auth/view.html',
                    controller: 'authController',
                    controllerAs: 'auth'
                });

        $httpProvider.interceptors.push('local.error.interceptor');
        $locationProvider.html5Mode(true);
    }).factory('local.error.interceptor', ['$q', '$location', interceptor]
    ).run(['$location', function ($location)
            {
                if (!Parse.User.current()) {
                    $location.path('/auth');
                }
            }]);
})(angular);
