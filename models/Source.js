const mongoose = require('mongoose');

var sourceSchema = new mongoose.Schema({
	name: {	type: String },
	user: { type: mongoose.Schema.ObjectId, ref: 'user'},
	type: String,
});
sourceSchema.index({name:1, user:1}, {unique: true});

const Source = mongoose.model('source', sourceSchema);
module.exports = Source;
