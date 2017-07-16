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
 * Fetch one git repo by id
 */
router.post('/fetch/:id', GitEntryController.fetchGitInfoById);

/*
 * Fetches all unique authors
 */
router.get('/get-all-authors-email', GitEntryController.getAllAuthorsEmail);

/*
 * Fetches all unique repositories
 */
router.get('/get-all-repositories', GitEntryController.getAllRepositories);

/*
 * GET
 */
router.get('/:id', GitEntryController.show);

module.exports = router;
