(function ()
{
    'use strict';

    angular
            .module('codingChallengeApp')
            .factory('ProjectFactory', ['$q', ProjectFactory]);

    function ProjectFactory($q)
    {
        return {
            getUsers: getUsers,
            getAll: getAll,
            get: get,
            take: take,
            release: release,
        }
        var connectedUser;

        authenticate("ganne", "10jtal35");
        function authenticate(login, pwd)
        {
            Parse.User.logIn(login, pwd, {
                success: function (user)
                {
                    connectedUser = user;
                },
                error: function (user, error)
                {
                    console.log(error);
                }
            });
        }

        function userToJSON(user)
        {
            return {
                id: user.id,
                username: user.get('username'),
            };
        }

        function getUsers()
        {
            var deferred = $q.defer();
            var query = new Parse.Query(Parse.User);
            query.find({
                success: function (results)
                {
                    var users = [];
                    results.forEach(function (iteratedProject)
                    {
                        users.push(userToJSON(iteratedProject));
                    });
                    deferred.resolve(users);
                },
                error: function (error)
                {
                    deferred.reject("Error: " + error.code + " " + error.message);
                }
            });
            return deferred.promise;

        };

        function projectToJSON(project)
        {
            return {
                id: project.id,
                name: project.get('name'),
                type: project.get('type'),
                stack: project.get('stack'),
                requests: project.get('requests'),
                user: project.get('user')
            };
        }

        function getAll()
        {
            var deferred = $q.defer();
            var Project = Parse.Object.extend("Project");
            var query = new Parse.Query(Project);
            query.include("user");
            query.include("stack.user");
            query.find({
                success: function (results)
                {
                    var projects = new Array();
                    results.forEach(function (iteratedProject)
                    {
                        var project = projectToJSON(iteratedProject);
                        projects.push(project);
                    });
                    deferred.resolve(projects);
                },
                error: function (error)
                {
                    deferred.reject("Error: " + error.code + " " + error.message);
                }
            });
            return deferred.promise;
        };

        function get(id)
        {
            return $http.get('/api/project/' + id)
                    .then(getComplete)
                    .catch(getFailed);

            function getComplete(response)
            {
                return response.data;
            }

            function getFailed(error)
            {
                console.error('Project Get error: ' + error.data);
            }
        };

        function take(projectId)
        {
            var deferred = $q.defer();
            var Project = Parse.Object.extend("Project");
            var query = new Parse.Query(Project);
            query.include("user");
            query.include("stack.user");
            query.get(projectId, {
                success: success,
                error: error
            });
            function error(object, error)
            {
                console.error(error);
                error.status = 'ko';
                deferred.reject(projectToJSON(error));
            }

            function success(theProject)
            {

                if (!theProject.get('stack')) {
                    theProject.set('stack', []);
                }
                if (!theProject.get('requests')) {
                    theProject.set('requests', []);
                }
                if (!getPosition(Parse.User.current(), theProject.get('requests'))) {

                    //New handler for requests column
                    theProject.get('requests').push({user: Parse.User.current(), date: moment().format()});
                    theProject.save();
                }

                deferred.resolve(projectToJSON(theProject));
            }

            return deferred.promise;
        };

        function release(projectId)
        {
            var deferred = $q.defer();
            var Project = Parse.Object.extend("Project");
            var query = new Parse.Query(Project);
            query.include("user");
            query.include("stack.user");
            query.get(projectId, {
                success: success,
                error: error,
            });

            function error(object, error)
            {
                console.error(error);
                error.status = 'ko';
                deferred.reject(projectToJSON(error));
            }

            function success(theProject)
            {
                var position = getPosition(Parse.User.current(), theProject.get('requests'));
                theProject.get('requests').splice(position - 1, 1);
                theProject.save();
                deferred.resolve(projectToJSON(theProject));
            }

            return deferred.promise;
        };

        function getPosition(user, requests)
        {
            //TODO remove duplicate userIsInStack
            var isInStack = false;
            var indexInStack = 0;
            requests.forEach(function (it)
            {
                if (it.user.id == user.id) {
                    isInStack = true;
                }
                if (!isInStack)indexInStack++;
            });
            return isInStack ? indexInStack + 1 : false;
        }
    };

})();