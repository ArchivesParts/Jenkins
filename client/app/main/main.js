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
        }).provider('tools', function ()
        {
            var service = function ($http)
            {

                var isEditable = function (name)
                {
                    //2014-11-13 16:59:04
                    var regExp = /\w+Id|^id/
                    return !name.match(regExp);
                };

                return {
                    isEditable: isEditable
                };
            }
            this.$get = ['$http', service];
        }).filter('unique', function ()
        {
            return function (arr, field)
            {
                return _.uniq(arr, function (a)
                {
                    return a[field];
                });
            };
        }).filter('contain', function ()
        {
            return function (arr, field)
            {
                return _.filter(arr, function (a)
                {
                    var regexp = new RegExp(field);
                    return (a.name && a.name.toLowerCase().match(regexp)) ||
                           (a.description && a.description.toLowerCase().match(regexp));
                });
            };
        });