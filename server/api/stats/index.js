'use strict';

var https = require("https");
var express = require('express');
var _ = require('lodash');

// Get list of things
var controller = function (req, res)
{
    var url = 'https://jenkins.digitaleo.com/job/' + req.params.project + '/' + req.params.id +
              '/' + req.params.test +
              '/api/json?tree=numberOfWarnings,numberOfNewWarnings,numberOfFixedWarnings';
    console.log(url)
    https.get(url,
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
                    try {
                        var json = JSON.parse(buffer);
                        res.json(json);
                        console.info('\nCall completed');
                    } catch (e) {
                        console.error('\nCannot parse result');

                        res.json({error: 'Cannot parse result'});
                    }

                });

            }).on('error', function (e)
            {
                console.error(e);
            });
};

var router = express.Router();
router.get('/project/:project/id/:id/test/:test', controller);

router.get('/', controller);

module.exports = router;