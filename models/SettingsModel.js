var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var SettingsSchema = new Schema({

module.exports = mongoose.model('Settings', SettingsSchema);