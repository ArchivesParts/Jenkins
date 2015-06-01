/**
 * Created by greg on 06/04/15.
 */

var https = require("https");
/**
 * Adapter to convert baseo response into a RESTFull response directly into the HTTP response
 * @param res
 * @returns {{listCallback: Function, entryCallback: Function, updateCallback: Function}}
 * @constructor
 */
exports.adapter = function (res)
{
    /**
     * Callback function to convert Baseo API List Response into RESTFull list
     * @param result
     */
    var listCallback = function (result)
    {
        console.log("statusCode: ", result.statusCode);
        console.log("headers: ", result.headers);

        var buffer = '';

        result.on('data', function (d)
        {
            console.info('GET result:\n');
            buffer += d.toString();
            console.info('\n\nCall completed');
        });

        result.on('end', function ()
        {
            console.info('GET result:\n');
//                        console.log(buffer);
            var json = JSON.parse(buffer);
            if (json.status) {
                res.status(json.status).jsonp({error: json.message});
                res.end();
            } else {
                res.setHeader("X-total", json.total);
                res.json(json.list);
            }
            console.info('\nCall completed');
        });
    };

    /**
     * Callback function to convert Baseo API List into RESTFull single element
     * @param result
     */
    var entryCallback = function (result)
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
            console.info('GET result:\n');
            var json = JSON.parse(buffer);

            if (json.status) {
                res.status(json.status).jsonp({error: json.message});
                res.end();
            } else {
                res.setHeader("X-total", json.total);
                res.json(json.list[0]);
            }

            console.info('\nCall completed');
        });

    };

    /**
     * Callback for create or update action
     * @param result
     */
    var updateCallback = function (result)
    {
        console.log("statusCode: ", result.statusCode);
        console.log("headers: ", result.headers);

        var buffer = '';

        result.on('data', function (d)
        {
            console.info('PUT DATA result:\n');
            //process.stdout.write(d);
            buffer += d.toString();
            console.info('\n\nCall DATA completed');
        });

        result.on('end', function ()
        {
            console.info('PUT result:\n');
            console.log(buffer);
            var json = JSON.parse(buffer);
            if (json.status) {
                res.status(json.status).jsonp({error: json.message});
                res.end();
            } else {
                res.json(json);
            }
            console.info('\nCall completed');
        });

    };
    /**
     * Object aggregation
     */
    return {
        listCallback: listCallback,
        entryCallback: entryCallback,
        updateCallback: updateCallback
    };
}

exports.wrapper = function (entity, adapter)
{
    var list = function (params)
    {
        console.log('/rest/' + entity + '/?' + params.join('&'));
        var reqGet = https.get(
                {
                    host: 'intg-baseo.messengeo.net',
                    port: 443,
                    path: '/rest/' + entity + '/?' + params.join('&'),
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }, adapter.listCallback);

        reqGet.on('error', function (e)
        {
            console.error(e);
        });
        reqGet.end();
    };
    var readOne = function (params)
    {
        console.log('/rest/' + entity + '/?' + params.join('&'));
        var reqGet = https.get(
                {
                    host: 'intg-baseo.messengeo.net',
                    port: 443,
                    path: '/rest/' + entity + '/?' + params.join('&'),
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }, adapter.entryCallback);

        reqGet.on('error', function (e)
        {
            console.error(e);
        });

        reqGet.end();
    }

    var update = function (params, values)
    {

        var bodyString = JSON.stringify(values);

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': bodyString.length
        };

        var options = {
            host: 'intg-baseo.messengeo.net',
            path: '/rest/' + entity + '/?' + params.join('&') + '&metaData=' + bodyString,
            port: 443,
            method: 'PUT',
            headers: headers
        };

        console.log(bodyString);

        try {
            https.request(options, adapter.updateCallback).write(bodyString);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Object aggregation
     */
    return {
        list: list,
        readOne: readOne,
        update: update
    }
}

