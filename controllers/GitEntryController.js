var GitEntryModel = require('../models/GitEntryModel.js');
var GitRepoService = require('../services/GitRepoService.js');

/**
 * GitEntryController.js
 *
 * @description :: Server-side logic for managing GitEntrys.
 */
module.exports = {

    /**
     * GitEntryController.fetchGitInfo()
     */
    fetchGitInfo: function (req, res) {

        GitRepoService.fetchGitInfo();
        return res.json({
            message: 'Fetch is in progress'
        });

    },
    /**
     * GitEntryController.list()
     */
    list: function (req, res) {

        GitEntryModel.find({}).sort({commitDate: -1,authorName: -1}).exec(function (err, GitEntrys) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting GitEntry.',
                    error: err
                });
            }
            return res.json(GitEntrys);
        });
    },

    /**
     * GitEntryController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        GitEntryModel.findOne({_id: id}, function (err, GitEntry) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting GitEntry.',
                    error: err
                });
            }
            if (!GitEntry) {
                return res.status(404).json({
                    message: 'No such GitEntry'
                });
            }
            return res.json(GitEntry);
        });
    },

    /**
     * @deprecated To be used
     * GitEntryController.create()
     */
    create: function (req, res) {
        var GitEntry = new GitEntryModel({
			commitId : req.body.commitId,
			author : req.body.author,
			message : req.body.message
        });

        GitEntry.save(function (err, GitEntry) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating GitEntry',
                    error: err
                });
            }
            return res.status(201).json(GitEntry);
        });
    },

    /**
     * @deprecated To be used
     * GitEntryController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        GitEntryModel.findOne({_id: id}, function (err, GitEntry) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting GitEntry',
                    error: err
                });
            }
            if (!GitEntry) {
                return res.status(404).json({
                    message: 'No such GitEntry'
                });
            }

            GitEntry.commitId = req.body.commitId ? req.body.commitId : GitEntry.commitId;
			GitEntry.author = req.body.author ? req.body.author : GitEntry.author;
			GitEntry.message = req.body.message ? req.body.message : GitEntry.message;

            GitEntry.save(function (err, GitEntry) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating GitEntry.',
                        error: err
                    });
                }

                return res.json(GitEntry);
            });
        });
    },

    /**
     * @deprecated To be used
     * GitEntryController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        GitEntryModel.findByIdAndRemove(id, function (err, GitEntry) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the GitEntry.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};
