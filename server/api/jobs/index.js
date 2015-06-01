'use strict';

var https = require("https");
var express = require('express');
var _ = require('lodash');

// Get list of things
var controller = function (req, res)
{
    https.get('https://jenkins.digitaleo.com/job/' + req.params.project +
              '/api/json?tree=builds[number,id,result,checkstyleResult' +
              '[numberOfWarnings,numberOfNewWarnings,numberOfFixedWarnings],' +
              'changeSet[items[comment,author[fullName],msg]]]',
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
                    res.json(json.builds);

                    console.info('\nCall completed');
                });

            }).on('error', function (e)
            {
                console.error(e);
            });
};

var router = express.Router();

router.get('/project/:project', controller);

module.exports = router;