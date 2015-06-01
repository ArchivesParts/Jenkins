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

var entity = 'users';
// Get list of things
exports.list = function (req, res)
{
    var properties = ['id','firstName','name','role','email','lastAccess','contractName'];
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
        'contractId',
        'contractName',
        'dateCreated',
        'dateUpdated',
        'description',
        'email',
        'expired',
        'firstName',
        'id',
        'lastAccess',
        'locale',
        'login',
        'mobile',
        'name',
        'role',
        'userKey',
    ];
    var additional = [];
    additional['detail'] = [
        'application',
        'contactsUniqueness',
        'contractMaintenance',
        'contractMyeboxUserId',
        'contractRemoteControl',
        'contractSmsKey',
        'contractTabletAccountId',
        'contractTenantId',
        'csvSeparator',
        'dialingCode',
        'emailSmsNotif',
        'mainNetwork',
        'managedNetwork',
        'managedNetworkContactsOwner',
        'medias',
        'mobileValidated',
        'shareContacts',
        'timezone',
    ];
    additional['parameters'] = ['parameters'];
    additional['social'] = [
        'facebookCode',
        'facebookToken',
        'googleCode',
        'googleToken'
    ];

    if (req.params.additional && additional[req.params.additional]) {
        properties = additional[req.params.additional];
    }
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
