'use strict';

angular.module('codingChallengeApp')
        .controller('NavbarCtrl', ['$scope', '$rootScope', function ($scope, $rootScope)
        {

            var nav = this;

            $rootScope.$on('notification', function (evt, title, body)
            {
                new Notification(
                        title,
                        {
                            body: body,
                            icon: "assets/images/HermanSilverBackHead.png"
                        }
                );
            });
            nav.user =  Parse.User.current();
            $rootScope.$on('connect', function (evt, user)
            {
                nav.user = user;
            });

            nav.menu = [
                {
                    name: 'Coding Game',
                    icon: 'fa fa-gamepad',
                    active: true,
                    url: '/home'
//                    counter: {
//                        value: 4,
//                        style: 'label-primary'
//                    }
                },
                {
                    name: 'Totems',
                    icon: 'fa fa-dashboard',
                    url: '/booked',
                    child: [
                        {
                            name: 'Dashboard',
                            url: '/booked',
                            icon: 'fa fa-pie-chart'
                        },
                        {
                            name: 'Booking',
                            url: '/booking',
                            icon: 'fa fa-bookmark'
                        },
                    ]
                },
                {
                    name: 'Documentation',
                    icon: 'fa fa-book'
                },

            ]
        }]
);