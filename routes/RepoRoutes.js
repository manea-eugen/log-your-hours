var express = require('express');
var router = express.Router();
var RepoController = require('../controllers/RepoController.js');

/*
 * GET
 */
router.get('/', RepoController.list);

/*
 * GET
 */
router.get('/:id', RepoController.show);

/*
 * POST
 */
router.post('/', RepoController.create);

/*
 * PUT
 */
router.put('/:id', RepoController.update);

/*
 * DELETE
 */
router.delete('/:id', RepoController.remove);

module.exports = router;
