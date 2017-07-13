var RepoModel = require('../models/RepoModel.js');

/**
 * RepoController.js
 *
 * @description :: Server-side logic for managing Repos.
 */
module.exports = {

    /**
     * RepoController.list()
     */
    list: function (req, res) {
        RepoModel.find(function (err, Repos) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Repo.',
                    error: err
                });
            }
            return res.json(Repos);
        });
    },

    /**
     * RepoController.show()
     */
    show: function (req, res) {
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
            return res.json(Repo);
        });
    },

    /**
     * RepoController.create()
     */
    create: function (req, res) {
        var Repo = new RepoModel({			name : req.body.name,			path : req.body.path
        });

        Repo.save(function (err, Repo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Repo',
                    error: err
                });
            }
            return res.status(201).json(Repo);
        });
    },

    /**
     * RepoController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        RepoModel.findOne({_id: id}, function (err, Repo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Repo',
                    error: err
                });
            }
            if (!Repo) {
                return res.status(404).json({
                    message: 'No such Repo'
                });
            }

            Repo.name = req.body.name ? req.body.name : Repo.name;			Repo.path = req.body.path ? req.body.path : Repo.path;			
            Repo.save(function (err, Repo) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Repo.',
                        error: err
                    });
                }

                return res.json(Repo);
            });
        });
    },

    /**
     * RepoController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        RepoModel.findByIdAndRemove(id, function (err, Repo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Repo.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};
