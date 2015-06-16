'use strict';

angular.module('codingChallengeApp')
        .config(function ($routeProvider)
        {
            $routeProvider
                    .when('/booked', {
                        templateUrl: 'app/booking/booked.html',
                        controller: 'BookingCtrl',
                        controllerAs: 'vm'
                    })
                    .when('/booking', {
                        templateUrl: 'app/booking/booking.html',
                        controller: 'BookingCtrl',
                        controllerAs: 'vm'
                    });
        });