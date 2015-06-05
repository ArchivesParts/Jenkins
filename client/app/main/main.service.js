/**
 * Created by greg on 04/06/15.
 */
'use strict';
(function ()
{

    var codingChallengeProvider = function ()
    {
        this.projectApiUrl = "/api/projects";
        this.jobApiUrl = "'/api/jobs/project/'";

        this.$get = ["$http", "$log", "$q", function ($http, $log, $q)
        {
            /**
             * Get the project list with detail
             * @returns {*}
             */
            var getProjects = function ()
            {
                return $http.get("/api/projects");
            };
            /**
             * Get The last job number for a project
             * @param project
             * @returns {*}
             */
            var getProjectLastJob = function (projectName)
            {
                return $http.get("/api/projects/project/" + projectName);
            };

            /**
             * Load jobs list for a specific project
             * @param string projectName
             * @returns {*}
             */
            var getJobs = function (projectName)
            {
                return $http.get('/api/jobs/project/' + projectName)
            }

            /**
             * Load job detail for one test
             * @param projectName
             * @param jobId
             * @param test
             * @returns {*}
             */
            var getJobsTestDetail = function (projectName, jobId, test)
            {
                return $http.get('/api/stats/project/' + projectName + '/id/' + jobId + '/test/' + test)
            }

            var initResult = function (player)
            {
                return {
                    player: player,
                    stats: {
                        cs: 0,
                        md: 0,
                        cpd: 0
                    },
                    score: function ()
                    {
                        return this.stats.cs + this.stats.md*5 + this.stats.cpd*3;
                    }
                };
            }

            /**
             * Process a job test result
             * @param result
             * @param job
             * @returns {*}
             */
            var process = function (result, job)
            {
                result.stats.cs += job.checkstyleResult && (
                job.checkstyleResult.numberOfFixedWarnings - job.checkstyleResult.numberOfNewWarnings) || 0;
                result.stats.md += job.pmdResult && (
                job.pmdResult.numberOfFixedWarnings - job.pmdResult.numberOfNewWarnings) || 0;
                result.stats.cpd += job.dryResult && (
                job.dryResult.numberOfFixedWarnings - job.dryResult.numberOfNewWarnings) || 0;
                return result;
            }

            return {
                getProjects: getProjects,
                getProjectLastJob: getProjectLastJob,
                getJobs: getJobs,
                getJobsTestDetail: getJobsTestDetail,
                initResult: initResult,
                process: process
            };
        }];
    }

    angular.module('codingChallengeApp').provider('codingChallenge', codingChallengeProvider);

})();