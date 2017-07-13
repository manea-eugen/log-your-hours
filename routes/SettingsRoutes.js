var express = require('express');
var router = express.Router();
var SettingsController = require('../controllers/SettingsController.js');

/*
 * GET
 */
router.get('/', SettingsController.list);

/*
 * GET
 */
router.get('/:id', SettingsController.show);

/*
 * POST
 */
router.post('/', SettingsController.create);

/*
 * PUT
 */
router.put('/:id', SettingsController.update);

/*
 * DELETE
 */
router.delete('/:id', SettingsController.remove);

module.exports = router;
