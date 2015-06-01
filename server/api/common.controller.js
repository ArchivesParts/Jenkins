/**
 * Created by greg on 06/04/15.
 * @version 1.0.0.0
 */
var https = require("https");

var _options = {
    host: 'intg-baseo.messengeo.net',
    port: 443
};

/**
 * Abstract controller to interact withbaseo
 * @param entity
 * @param userKey
 * @param options {host:URI, port:80|443}
 * @returns {{list: Function, read: Function, update: Function}}
 * @version 1.0.0.0
 */
var AbstractController = function (entity, userKey, userOptions)
{
    var options = userOptions || _options;
    var list = function (req, res, properties)
    {
        var params = [
            'sort=id%20DESC',
            'key=' + userKey,
            'limit=' + (req.params.limit || 10),
            'offset=' + (req.params.offset || 0),
            'properties=' + properties.join(',')
        ];

        if (req.params.query) {
            var query = JSON.parse(req.params.query);
            for (var entry in query) {
                params.push(entry + '=' + query[entry]);
            }
        }

        Wrapper(entity, Adapter(res), options).list(params);
    };

    /**
     * Get a specific user
     * @param req
     * @param res
     */
    var read = function (req, res, properties)
    {
        var params = [
            'key=' + userKey,
            'id=' + req.params.id,
            'limit=' + (req.params.limit || 10),
            'offset=' + (req.params.offset || 0),
            'properties=' + properties.join(',')
        ];

        Wrapper(entity, Adapter(res), options).readOne(params);
    };
    /**
     * Update contract
     * @param req
     * @param res
     */
    var update = function (req, res)
    {
        var params = [
            'key=' + userKey,
            'id=' + req.params.id
        ];
        Wrapper(entity, Adapter(res), options).update(params, req.body);
    }
    return {
        list: list,
        read: read,
        update: update
    }
}

/**
 * Adapter to convert baseo response into a RESTFull response directly into the HTTP response
 * @param res
 * @returns {{listCallback: Function, entryCallback: Function, updateCallback: Function}}
 * @version 1.0.0.0
 */
var Adapter = function (res)
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

/**
 * Wrapper to make rest call on baseo
 * @param entity
 * @param adapter
 * @param options {host:URI, port:80|443}
 * @returns {{list: Function, readOne: Function, update: Function}}
 * @version 1.0.0.0
 */
var Wrapper = function (entity, adapter, options)
{
    if (!entity) {
        throw new Exception('Cannot Instantiate wrapper without a specified entity name');
    }
    if (!adapter) {
        throw new Exception('Cannot Instantiate wrapper without an adapter');
    }
    if (!options) {
        throw new Exception('Cannot Instantiate wrapper without a valid options set');
    }
    console.info('Load wrapper for ' + entity + ' on http' + (options.port === 443 ? 's' : '') + '://' + options.host);
    var list = function (params)
    {
        console.log('/rest/' + entity + '/?' + params.join('&'));
        var reqGet = https.get(
                {
                    host: options.host,
                    port: options.port,
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
                    host: options.host,
                    port: options.port,
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

        console.log('/rest/' + entity + '/?' + params.join('&') + '&metaData=' + bodyString);

        try {
            https.request({
                host: options.host,
                port: options.port,
                path: '/rest/' + entity + '/?' + params.join('&') + '&metaData=' + bodyString,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': bodyString.length
                }
            }, adapter.updateCallback).write(bodyString);
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

exports.controller = AbstractController;