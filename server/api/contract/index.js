'use strict';

var express = require('express');
var controller = require('./contract.controller');

var router = express.Router();

router.get('/', controller.list);
router.get('/limit/:limit', controller.list);
router.get('/limit/:limit/offset/:offset', controller.list);
router.get('/query/:query', controller.list);
router.get('/query/:query/limit/:limit', controller.list);
router.get('/query/:query/limit/:limit/offset/:offset', controller.list);

router.get('/id/:id', controller.read);
router.get('/id/:id/additional/:additional', controller.read);

router.put('/:id', controller.update);

module.exports = router;