var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var GitEntrySchema = new Schema({
	commitSha : {
        type: String,
        unique: true,
        index: true
    },
	authorName : String,
	authorEmail : String,
	message : String,
    commitDate: Date,
    
    createdAt: Date,
    updatedAt: Date,
    repo: {type: Schema.Types.ObjectId, ref: 'Repo'}
},{strict: true});

module.exports = mongoose.model('GitEntry', GitEntrySchema);
