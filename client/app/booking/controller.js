(function ()
{
    'use strict';

    angular
            .module('codingChallengeApp')
            .controller('BookingCtrl',
            ['$scope', '$interval', '$filter', '$rootScope', 'ProjectFactory', 'config', TilesController])
            .directive('uiTooltip', TooltipDirective);

    function TooltipDirective()
    {
        return {
            restrict: 'A',
            scope: {
                uiTooltip: "="
            },
            link: function (scope, element, attrs)
            {
                var user = scope.uiTooltip.user;
                var title = "<H3>" + user.username + "</H3><p>" + scope.uiTooltip.date + "</p>";
                element.tooltip({placement: 'right', trigger: 'hover focus', title: title, html: true})
            }
        };
    };

    function TilesController($scope, $interval, $filter, $rootScope, ProjectFactory, config)
    {
        var vm = this;
        vm.users = {};
        vm.rows = [];
        vm.take = take;
        vm.release = release;
        vm.userIsInStack = userIsInStack;

        ProjectFactory.getUsers().then(function (users)
        {
            var t = Parse.User.current();
            users.forEach(function (user)
            {
                vm.users[user.id] = user;
                if (user.id === t.id) {
                    vm.user = user;
                }
            });
            ProjectFactory.getAll().then(function (projects)
            {
                vm.projects = projects;
                refreshMatrix()
            });
        });

        vm.refreshing = false;
        function refreshMatrix()
        {
            if (!vm.refreshing) {
                vm.refreshing = true;
                console.log('Refresh projects status');
                vm.projects = $filter('orderBy')(vm.projects, ['type', 'name'], false);
                for (var i = 0; i < vm.projects.length; i++) {
                    var newUserSet = getUsers(vm.projects[i]);
                    if (newUserSet.length !== vm.projects[i].currentUsers) {

                        if (vm.projects[i].current &&
                            vm.projects[i].current !== vm.projects[i].previous &&
                            vm.projects[i].current.id === vm.user.id
                        ) {
                            $rootScope.$broadcast(
                                    'notification',
                                    vm.projects[i].name,
                                    "Le projet est maintenant bloqué pour toi"
                            );
                        }
                        if (newUserSet.length > 1 && vm.projects[i].newWaiter &&
                            vm.user.id === vm.projects[i].current.id) {
                            $rootScope.$broadcast(
                                    'notification',
                                    vm.projects[i].name,
                                    newUserSet[newUserSet.length - 1].user.username +
                                    " s'est ajouter à la file d'attente que tu bloques"
                            );
                        }
                        vm.projects[i].currentUsers = newUserSet;
                    }
                }
                vm.refreshing = false;
            }
        }

        vm.hasBookedProject = function ()
        {
            return vm.projects && $filter('filter')(vm.projects, isLock, false).length > 0
        }

        $interval(refresh, config.modules.booking.params.refreshPeriod);

        function take(project)
        {
            var index = vm.projects.indexOf(project);
            ProjectFactory.take(project.id)
                    .then(function (data)
                    {
                        vm.projects[index].requests = data.requests;
                        refreshMatrix();
                    })
                    .catch();
        };

        function release(project)
        {
            var index = vm.projects.indexOf(project);
            ProjectFactory.release(project.id)
                    .then(function (data)
                    {
                        project.current = null;
                        vm.projects[index].requests = data.requests;
                        refreshMatrix();
                    }).catch();
        };

        function refresh()
        {
            ProjectFactory.getAll().then(function (data)
            {
                data = $filter('orderBy')(data, ['type', 'name'], false)
                data.forEach(function (project, pos)
                {
                    vm.projects[pos].requests = project.requests;
                });

                refreshMatrix();

            }).catch();
        }

        vm.isBookedInRange = function (project, start, end)
        {
            return project.requests && project.requests[0] &&
                   ((new Date() - new Date(project.requests[0].date)) <= (end * 60 * 60 * 1000) &&
                    (new Date() - new Date(project.requests[0].date)) >= (start * 60 * 60 * 1000));
        }
        vm.isBookedAfter = function (project, hour)
        {
            return project.requests && project.requests[0] &&
                   (new Date() - new Date(project.requests[0].date)) >= (hour * 60 * 60 * 1000);
        }

        function isAvailaible(project, user)
        {
            return !project.requests || project.requests.length === 0 ||
                   (project.current && (project.current.id !== user.id));
        }

        function isLock(project)
        {
            return project.requests && project.requests.length > 0
        }

        vm.isLock = isLock;
        function isUnlock(project)
        {
            return !project.requests || project.requests.length === 0;
        }

        vm.isUnlock = isUnlock;

        function isMine(project, user)
        {
            return project.current && (project.current.id === user.id);
        }

        function iWait(project, user)
        {
            var wait = false;
            if (project.requests) {
                project.requests.forEach(function (entry)
                {
                    if (entry.user.id === user.id) {
                        wait = true;
                    }
                });
            }
            return wait;
        }

        vm.isAvailaible = isAvailaible;
        vm.isMine = isMine;
        vm.iWait = iWait;

        function userIsInStack(user, stack)
        {
            var isInStack = false;
            stack.forEach(function (it)
            {
                if (it.id == user.id) {
                    isInStack = true;
                    return;
                }
            });
            return isInStack;
        }

        function getUsers(project)
        {
            var users = [];
            if (project.requests) {

                project.requests.forEach(function (entry, pos)
                {
                    if (pos === 0) {
                        project.previous = project.current
                        project.current = vm.users[entry.user.id];
                    }
                    if (pos === project.requests.length - 1) {
                        project.newWaiter = project.last !== vm.users[entry.user.id]
                        project.last = vm.users[entry.user.id];
                    }

                    users.push({
                        user: vm.users[entry.user.id],
                        date: entry.date
                    });
                });
            }
            return users;
        }
    };

})();
