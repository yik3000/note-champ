const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const elasticsearch = require('elasticsearch');

var contentSchema = new mongoose.Schema({
	asianContent: {type: String, es_indexed: true, es_analyzer: 'myAnalyzer'},
	engContent: {type: String, es_indexed:true},
});

var esClient = new elasticsearch.Client({
  	host: '127.0.0.1:9200',
  	log: 'debug'
});

contentSchema.plugin(mongoosastic, {
	esClient: esClient
});

const Content = mongoose.model('content', contentSchema);
//var stream = Page.synchronize()

Content.createMapping({
	"analysis":{
		"analyzer":{
			"myAnalyzer":{
				type:"custom",
				tokenizer:"smartcn_tokenizer",
				filter: [
					//"stconvert"
					"stconvert_keep_both",
				]
			},
		}		
	},
	"highlight":{
		"properties":{
			"asianContent": {
				type: "string",
				"term_vector": "with_positions_offsets"
			},
			"engContent": {
				type: "string",
				"term_vector": "with_positions_offsets"
			}
		}
	}
},  function(err, mapping){
		if(err) console.log(err);
		console.log(mapping);
})

module.exports = Content;
