var GitEntryModel = require('../models/GitEntryModel.js');
var RepoModel = require('../models/RepoModel.js');
var GitRepoService = require('../services/GitRepoService.js');

/**
 * GitEntryController.js
 *
 * @description :: Server-side logic for managing GitEntries.
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

    }, /**
     * GitEntryController.fetchGitInfo()
     */
    fetchGitInfoById: function (req, res) {

        var id = req.params.id;

        RepoModel.findOne({_id: id}, function (err, Repo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Repo.',
                    error: err
                });
            }
            if (!Repo) {
                return res.status(404).json({
                    message: 'No such Repo'
                });
            }

            GitRepoService.fetchGitInfo(Repo);


            return res.json(Repo);
        });

    },
    /**
     * GitEntryController.list()
     */
    list: function (req, res) {

        var authorEmail = req.query.authorEmail,
            repoId = req.query.repoId,
            query = {};


        if (authorEmail) {
            query.authorEmail = authorEmail;
        }

        if (repoId) {
            query.repo = repoId;
        }
console.log(query);
        GitEntryModel
            .find(query)
            .sort({commitDate: -1, authorName: -1})
            .populate('repo')
            .exec(function (err, GitEntries) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting GitEntry.',
                        error: err
                    });
                }
                return res.json(GitEntries);
            });
    },
    /**
     * GitEntryController.getAllAuthorsEmail()
     */
    getAllAuthorsEmail: function (req, res) {
        GitEntryModel
            .find()
            .distinct('authorEmail', function (err, emails) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting authors email.',
                        error: err
                    });
                }

                return res.json(emails);
            });
    },
    /**
     * GitEntryController.getAllRepositories()
     */
    getAllRepositories: function (req, res) {
        GitEntryModel
            .find()
            .distinct('repo', function (err, repoIds) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting distinct repo ids.',
                        error: err
                    });
                }


                RepoModel.find({'_id':{$in : repoIds}},function(err,result) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when getting repositories by id',
                            error: err
                        });
                    }

                    return res.json(result);
                });
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
            commitId: req.body.commitId,
            author: req.body.author,
            message: req.body.message
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
