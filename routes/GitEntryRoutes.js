var express = require('express');
var router = express.Router();
var GitEntryController = require('../controllers/GitEntryController.js');

/*
 * GET
 */
router.get('/', GitEntryController.list);

/*
 * GET For now
 */
router.get('/fetch', GitEntryController.fetchGitInfo);

/*
 * GET
 */
router.get('/:id', GitEntryController.show);

module.exports = router;
