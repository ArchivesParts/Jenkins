'use strict';

angular.module('codingChallengeApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/home'
      });

    $locationProvider.html5Mode(true);
  });