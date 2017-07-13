var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var RepoSchema = new Schema({
	'name' : {type: String, required: true},
	'path' : {type: String, required: true}
});

module.exports = mongoose.model('Repo', RepoSchema);
