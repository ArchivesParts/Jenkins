'use strict';
(function ()
{
    var mainController = function ($scope, $http, $q, $interval, codingChallenge)
    {
        var self = this;
        self.jobs = [];
        self.players = {};
        self.selected;
        var startProjectName = "App.Digitaleo.com"

        /**
         * Start scanner to test
         */
        $interval(function ()
        {
            self.selected &&
            self.processing === 100 &&
            codingChallenge.getProjectLastJob(self.selected.name).then(function (response)
            {
                self.status = "fa-refresh fa-spin";
                if (!response.data.building) {
                    console.log('Wait new jobs');
                    if (self.selected.lastBuild.number < response.data.number) {
                        self.status = "fa-gear fa-spin";
                        self.analyseProject(self.selected.name);
                        self.selected.lastBuild.number = response.data.number;
                    }
                } else {
                    self.status = "fa-pause";
                    console.log('Build runnning');
                }
            })

        }, 10000);

        codingChallenge.getProjects().then(function (response)
        {
            self.projects = response.data;
            self.projects.forEach(function (project)
            {
                if (project.name === startProjectName) {
                    self.selected = project;
                }
            })
            $scope.$watch(function ()
            {
                return self.selected;
            }, function (newValue, oldValue)
            {
                if (newValue) {
                    self.analyseProject(newValue.name);
                }
            })
        });

        self.analyseProject = function (projectName)
        {
            console.log('Launch analyse : ' + projectName);
            self.players = {};
            codingChallenge.getJobs(projectName).then(function (response)
            {
                var nbJob = response.data.length;
                var nbIdentifiedJob = 0;
                var cursor = 0;
                var promises = [];
                self.loading = 0;
                self.processing = 0;
                self.results = [];
                angular.forEach(response.data, function (job)
                {
                    var currentJob = job;

                    angular.forEach(['checkstyleResult', 'pmdResult', 'dryResult'], function (test)
                    {
                        promises.push(codingChallenge.getJobsTestDetail(projectName, job.id, test).then(
                                function (response)
                                {
                                    currentJob[test] = response.data;
                                    self.loading = Math.ceil((cursor * 100) / (nbJob * 3));
                                    cursor++;

                                }));
                    });
                    self.jobs.push(currentJob);
                    if (job.changeSet.items[0]) {
                        if (!self.players[job.changeSet.items[0].author.fullName]) {
                            self.players[job.changeSet.items[0].author.fullName] = [];
                        }
                        self.players[job.changeSet.items[0].author.fullName].push(currentJob);
                        nbIdentifiedJob++;
                    }

                });

                $q.all(promises).then(function ()
                {
                    self.currentProcessing = 0;
                    angular.forEach(self.players, function (jobs, player)
                    {
                        var result = codingChallenge.initResult(player)
                        angular.forEach(jobs, function (job)
                        {
                            codingChallenge.process(result, job);
                            self.currentProcessing++;
                            self.processing =
                            Math.ceil((self.currentProcessing * 100) / nbIdentifiedJob);
                        });
                        self.results.push(result);
                    });

                });
            });
        }
    };
    angular.module('codingChallengeApp')
            .controller('MainCtrl', ['$scope', '$http', '$q', '$interval', 'codingChallenge', mainController]);
})
()
