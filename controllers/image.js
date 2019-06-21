//require('strict-mode')(function () {

// every *require* call inside this function will have strict mode enabled 
	const tesseract = require('node-tesseract');
	const async = require('async');
	const Page = require('../models/Page');
	const Content = require('../models/Content');

	exports.postImage = (req, res, next) => {
		//complete async process

		//start async
		var image = req.file;
		async.waterfall([
			function(next){
				var content = new Content({});
				content.save(function(err, content){
					next(err,content);
				})
			},
			function(content,next){
				var page = new Page({
					imagePath: image.filename,
					user: req.user._id,
					language: req.body.lang,
					content: content._id,
					displayContent: '',
					memo: '',
				});
				page.save(function(err,pageResult){
					next(err, pageResult, content);
				})
			}],
			function(err, page, content){
				//start proccessing
						req.flash('info', 'finished uploading');
						res.status(202).end();

						async.parallel({
							ocrProcess: function(cb){
								var requireOcr = false;
								if(requireOcr == true)
								{
										var options = {
											l: req.body.lang,
											psm: 6,
											binary: '/usr/local/bin/tesseract'
										}
										tesseract.process(image.path, options, function(err, text) {
										    if (err) {
										    	cb(err)
										    } else {
										    	if(req.body.lang == "chi_sim" || req.body.lang == "chi_tra"){
										    		content.asianContent = text;
										    	}
										    	else if(req.body.lang == "eng"){
										    		content.engContent = text;
										    	}
										    	content.save(function(err, newContent){
										    		if(err) cb(err);
										    		else
										    		{
										    			page.displayContent = text;
												    	page.finishedOcr = true;
												    	page.content = newContent._id;
												    	page.save(function(err, page){
												    		cb(err, page)
												    	})						    			
										    		}
										    	})
										    }
										 });
									}
									else{
										cb(null)
									}
							},
							compressImage:function(cb){
								const Jimp = require("jimp");
								async.waterfall([
									function(callback)
									{
										Jimp.read(image.path, function(err, result){
											if(err) cb(err);
											else callback(null, result)
										})						
									},
									function(reduced, callback){
										reduced
											.resize(120, Jimp.AUTO)
											.quality(60)
											.getBase64(Jimp.AUTO, function(err,result){										
												if(err) callback(err);
												else callback(null, result);
											})
									},
								], function(err,result){
									if(err) cb(err);
									else
									{
										page.thumbnail = result;
										page.save(function(err, page){										
											cb(err, page)
										})
									}
								});
							}
						}, function(err,results){
							if(err) console.log(err);
							//else console.log(results);
						})
			});	
	};


	
//})

