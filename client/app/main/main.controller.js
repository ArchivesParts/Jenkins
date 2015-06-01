'use strict';

angular.module('codingChallengeApp')
        .controller('MainCtrl', function ($scope, $http, $q)
        {
            var self = this;
            self.jobs = [];
            self.players = {};
            self.selected='App.Digitaleo.com'
            $http.get('/api/projects').then(function (response)
            {
                self.projects = response.data;
                $scope.$watch(function ()
                {
                    return self.selected;
                }, function (newValue, oldValue)
                {
                    if (newValue) {
                        self.analyseProject(newValue);
                    }
                })
            });

            self.classement = function(position){

            }

            self.analyseProject = function (projectName)
            {
                self.players = {};
                $http.get('/api/jobs/project/' + projectName).then(function (response)
                {
                    var nbJob = response.data.length;
                    var nbIdentifiedJob = 0;
                    var cursor = 0;
                    var promises = [];
                    self.loading = 0;
                    self.results=[];
                    angular.forEach(response.data, function (job)
                    {
                        var currentJob = job;

                        angular.forEach(['checkstyleResult', 'pmdResult', 'dryResult'], function (test)
                        {
                            promises.push($http.get('/api/stats/project/'+projectName+'/id/' + currentJob.id + '/test/' + test).then(
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
                        self.processing = 0;
                        self.currentProcessing = 0;
                        angular.forEach(self.players, function (jobs, player)
                        {
                            var result = {
                                player: player,
                                stats: {
                                    cs: 0,
                                    md: 0,
                                    cpd: 0
                                },
                                score: function ()
                                {
                                    return this.stats.cs + this.stats.md + this.stats.cpd;
                                }
                            };
                            angular.forEach(jobs, function (job)
                            {
                                result.stats.cs +=
                                job.checkstyleResult.numberOfFixedWarnings - job.checkstyleResult.numberOfNewWarnings;
                                result.stats.md +=
                                job.pmdResult.numberOfFixedWarnings - job.pmdResult.numberOfNewWarnings;
                                result.stats.cpd +=
                                job.dryResult.numberOfFixedWarnings - job.dryResult.numberOfNewWarnings;

                                self.currentProcessing++;
                                self.processing =
                                Math.ceil((self.currentProcessing * 100) / nbIdentifiedJob);
                            });
                            self.results.push(result);
//                            self.results[player].stats = stats;
//                            self.results[player].score = self.score(stats);
                        });

                    });
                });
            }

        });
