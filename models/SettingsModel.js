var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var SettingsSchema = new Schema({	'key' : String,	'value' : Array});

module.exports = mongoose.model('Settings', SettingsSchema);
