/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * GET     /things/:id          ->  show
 * POST    /things              ->  create
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';
var common = require("../common.controller");
var userKey = 'gadmin';
var options = {
    host: 'intg-baseo.messengeo.net',
    port: 443
};

var entity = 'networks';
// Get list of things
exports.list = function (req, res)
{
    var properties = ['id', 'contractId', 'name', 'nbAffiliates', 'parentId', 'dateUpdated', 'dateCreated',
                      'contactsOwner'];
    common.controller(entity, userKey, options).list(req, res, properties);
};

/**
 * Get a specific user
 * @param req
 * @param res
 */
exports.read = function (req, res)
{
    var properties = [
        'id', 'contractId', 'name', 'nbAffiliates', 'parentId', 'dateUpdated', 'dateCreated',
        'contactsOwner'
    ];
    var additional = [];
    additional['parameters'] = ['parameters'];

    if (req.params.additional && additional[req.params.additional]) {
        properties = additional[req.params.additional];
    }
    console.log(properties);
    common.controller(entity, userKey, options).read(req, res, properties)
};
/**
 * Update contract
 * @param req
 * @param res
 */
exports.update = function (req, res)
{
    common.controller(entity, userKey, options).update(req, res);
}
