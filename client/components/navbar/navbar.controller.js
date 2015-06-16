'use strict';

angular.module('codingChallengeApp')
        .controller('NavbarCtrl', function ()
        {
            var nav = this;
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
        }
);