'use strict';

var https = require("https");
var express = require('express');
var _ = require('lodash');

// Get list of things
var getProjects = function (req, res)
{
    https.get('https://jenkins.digitaleo.com/api/json?tree=jobs[name,lastBuild[number,duration,timestamp,result]]',
            function (result)
            {
                console.log("statusCode: ", result.statusCode);
                console.log("headers: ", result.headers);

                var buffer = '';

                result.on('data', function (d)
                {
                    console.info('GET Data result:\n');
                    buffer += d.toString();
                    console.info('\n\nCall data completed');
                });

                result.on('end', function ()
                {
                    var json = JSON.parse(buffer);
                    res.json(json.jobs);

                    console.info('\nCall completed');
                });

            }).on('error', function (e)
            {
                console.error(e);
            });
};
var getProject = function (req, res)
{
    https.get('https://jenkins.digitaleo.com/job/' + req.params.project + '/api/json?tree=lastBuild[number,building]',
            function (result)
            {
                console.log("statusCode: ", result.statusCode);
                console.log("headers: ", result.headers);

                var buffer = '';

                result.on('data', function (d)
                {
                    console.info('GET Data result:\n');
                    buffer += d.toString();
                    console.info('\n\nCall data completed');
                });

                result.on('end', function ()
                {
                    var json = JSON.parse(buffer);
                    res.json(json.lastBuild);

                    console.info('\nCall completed');
                });

            }).on('error', function (e)
            {
                console.error(e);
            });
};

var router = express.Router();

router.get('/', getProjects);
router.get('/project/:project', getProject);

module.exports = router;