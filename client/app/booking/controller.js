(function ()
{
    'use strict';

    angular
            .module('codingChallengeApp')
            .controller('BookingCtrl', ['ProjectFactory', '$interval', '$filter', 'config', TilesController])
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

    function TilesController(ProjectFactory, $interval, $filter, config)
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

        function refreshMatrix()
        {
//            vm.rows = [];
            vm.projects = $filter('orderBy')(vm.projects, ['type', 'name'], false);
            for (var i = 0; i < vm.projects.length; i++) {
//                if (i % 6 == 0) vm.rows.push([]);
                vm.projects[i].currentUsers = getUsers(vm.projects[i]);
//                vm.rows[vm.rows.length - 1].push(vm.projects[i]);
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
                        console.log(data);
                        vm.projects[index] = data;
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
                        console.log(data);
                        vm.projects[index] = data;
                        refreshMatrix();
                    }).catch();
        };

        function refresh()
        {
            ProjectFactory.getAll().then(function (data)
            {
                vm.projects = data;
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
                project.requests.forEach(function (entry)
                {
                    if (!project.current) {
                        project.current = vm.users[entry.user.id];
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
