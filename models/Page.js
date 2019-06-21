const mongoose = require('mongoose');

var pageSchema = new mongoose.Schema({
  title: { type: String },
  source: { type: mongoose.Schema.ObjectId, ref: 'source'},
  content: {type: mongoose.Schema.ObjectId, ref: 'content'},
  displayContent: String, 
  pageInfo: String,  
  memo: String,
  language: String,
  thumbnail: String,
  imagePath: String,
  timeStamp: { type: Date, default: Date.now },
  user: {type: mongoose.Schema.ObjectId, ref: 'user'},
  finishedOcr: {type: Boolean, default: false},
});

const Page = mongoose.model('page', pageSchema);
module.exports = Page;
