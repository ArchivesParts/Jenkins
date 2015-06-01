'use strict';

angular.module('baseoFiceApp', [
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