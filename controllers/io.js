const createFile = require('create-file');
const async = require('async');
const archiver = require('archiver');
var p = require('path');

const Page = require('../models/Page');
const Content = require('../models/Content');
const Source = require('../models/Source');


exports.postImport = (req, res) => {
	//console.log(req.file);	
	var jsonfile = require('jsonfile')
	var file = req.file.path;
	jsonfile.readFile(file, function(err, obj) {
		async.waterfall([
			function(cb){
				async.each(obj.sources, function(source, callback){
					var dbSource = new Source(source);
					dbSource.save(function(err,result){
						callback(err);
					});
				}, function(err){
					cb(err);
				})
			},
			function(cb){
				async.each(obj.pages, function(page, callback){
					var dbPage = new Page(page);
					dbPage.save(function(err,result){
						callback(err);
					})
				}, function(err){
					cb(err);
				})
			},
			function(cb){
				async.each(obj.contents, function(content, callback){
					var dbContent = new Content(content);
					dbContent.save(function(err,result){
						callback(err);
					})
				}, function(err){
					cb(err);
				})
			}]
		,function(err){
			if(err) console.log(err);
			console.log('done');
		})

	})


}

exports.getImport = (req,res) => {
	res.render('io',{
		title:'導入'
	})
}

exports.getExport = (req, res) => {
	var userId = req.user._id;
	var content = "";
  	async.waterfall([
  		function(next){
  			Source.find({}).exec(next);
  		},
  		function(sources, next){
  			Page.find({}).exec(function(err,pages){
  				next(err,sources,pages);
  			});
  		},
  		function(sources, pages, next){
  			Content.find({}).exec(function(err,contents){
  				next(err, sources,pages, contents);
  			})
  		},
  		function(sources, pages, contents, next){
  			var result = {
  				sources: sources,
  				pages: pages, 
  				contents: contents
  			}
  			next(null,result);
  		},
		function(content, next){
			var archive = archiver('zip');
			archive.on('error', function(err){
				next(err);
			})

			archive.on('end', function(){
				console.log('archiver end')
			});


			res.attachment(req.user._id + '.zip');
			archive.pipe(res);

			content = JSON.stringify(content);

			generatedPath = appRoot + '/uploads/generate/' + req.user._id +'.json';
			createFile(generatedPath, content , function(err){
				if(err) return next(err);
				archive.file(generatedPath, {name: 'archive/' + p.basename(generatedPath)});
				//archive.append(generatedPath, {name: 'archive/' +  p.basename(generatedPath)});
				next(null, archive);
			})
		},
  	], function(err,archive){
  		if(!err){
	  		archive.finalize();
  		}
  	})
};
