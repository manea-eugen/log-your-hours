var SettingsModel = require('../models/SettingsModel.js');

/**
 * SettingsController.js
 *
 * @description :: Server-side logic for managing Settings.
 */
module.exports = {

    /**
     * SettingsController.list()
     */
    list: function (req, res) {
        SettingsModel.find(function (err, Settingss) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Settings.',
                    error: err
                });
            }
            return res.json(Settingss);
        });
    },

    /**
     * SettingsController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        SettingsModel.findOne({_id: id}, function (err, Settings) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Settings.',
                    error: err
                });
            }
            if (!Settings) {
                return res.status(404).json({
                    message: 'No such Settings'
                });
            }
            return res.json(Settings);
        });
    },

    /**
     * SettingsController.create()
     */
    create: function (req, res) {
        var Settings = new SettingsModel({
			key : req.body.key,
			value : req.body.value
        });

        Settings.save(function (err, Settings) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Settings',
                    error: err
                });
            }
            return res.status(201).json(Settings);
        });
    },

    /**
     * SettingsController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        SettingsModel.findOne({_id: id}, function (err, Settings) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Settings',
                    error: err
                });
            }
            if (!Settings) {
                return res.status(404).json({
                    message: 'No such Settings'
                });
            }

            Settings.key = req.body.key ? req.body.key : Settings.key;
			Settings.value = req.body.value ? req.body.value : Settings.value;
			
            Settings.save(function (err, Settings) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Settings.',
                        error: err
                    });
                }

                return res.json(Settings);
            });
        });
    },

    /**
     * SettingsController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        SettingsModel.findByIdAndRemove(id, function (err, Settings) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Settings.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};
