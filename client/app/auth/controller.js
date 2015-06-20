(function ()
{
    'use strict';
    var controller = function ($rootScope, $scope, $location)
    {
        var self = this;
        self.scenario = 'Sign up';

        self.currentUser = Parse.User.current();

        self.signUp = function (form)
        {
            var user = new Parse.User();
            user.set("email", form.email);
            user.set("username", form.username);
            user.set("password", form.password);

            user.signUp(null, {
                success: function (user)
                {
                    $rootScope.$broadcast(
                            'connect',
                            user
                    );
                    $scope.$apply(); // Notify AngularJS to sync currentUser
                    $location.path('/');
                },
                error: function (user, error)
                {
                    alert("Unable to sign up:  " + error.code + " " + error.message);
                }
            });
        };
        self.logIn = function (form)
        {
            Parse.User.logIn(form.username, form.password, {
                success: function (user)
                {
                    $rootScope.$broadcast(
                            'connect',
                            user
                    );
                    $scope.$apply();
                    $location.path('/');
                },
                error: function (user, error)
                {
                    alert("Unable to log in: " + error.code + " " + error.message);
                }
            });
        };

        self.logOut = function ()
        {
            Parse.User.logOut();
            $rootScope.$broadcast(
                    'connect',
                    null
            );
            $location.path('/');
        };
        if ($location.path() === '/auth/logout') {
            self.logOut()
        }
    }
    angular.module('codingChallengeApp').controller('authController',
            ['$rootScope', '$scope', '$location', controller]);
})();