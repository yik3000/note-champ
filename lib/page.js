const Page = require('../models/Page');
const Content = require('../models/Content');
const Source = require('../models/Source');
const async = require('async');
const fs = require('fs');
const striptags = require('striptags');


var getPage = function(id,lean, cb)
{
	var pageQuery = Page.findOne({_id: id})
	.populate('content')
	.populate('source');
	if(lean){
		pageQuery = pageQuery.lean();
	}
	pageQuery.exec(function(err,result){
		if(err) return cb(err);
		else cb(null, result)
	})			
}

var getContent = function(id, cb)
{
	Content.findOne({_id:id}).exec(function(err, content){
		cb(err, content)
	})			
}


exports.get = (id, lean) =>{		
	if(!lean) lean = false
	return new Promise(function(resolve, reject){			
			async.waterfall([
				function(next){
					getPage(id,lean, next)
				}
			], function(err,result){
				if(err)reject(err);
				else if(result.content == null){
					reject('result contain no content')
				}
				else resolve(result); })
		}
	)
}

exports.update = (id, user, body) => {
	return new Promise(function(resolve,reject){
		async.waterfall([
			function(cb){				
				getPage(id, false, cb)
			},
			function(page, cb){
				getContent(page.content, function(err,content){
					cb(err, page, content)
				})
			},
			function(page, content, cb){
				page.memo = body.memo;
				page.pageInfo = body.pageInfo;
				if(page.displayContent != body.content){
					page.displayContent = body.content;
					if(page.language == "chi_tra" || page.language == "chi_sim"){
						var userText = body.content;
						userText = striptags(userText)
						userText = userText.replace(/(\r\n|\n|\r|&nbsp;)/gm,"");
						content.asianContent = userText;
					}					
					else if(page.language == "eng"){
						var userText = body.content;
						userText = striptags(userText)
						userText = userText.replace(/(\r\n|\n|\r|&nbsp;)/gm,"");						
						content.engContent = userText;
					}
					content.save(function(err,content){
						if(err) return cb(err);
					});
				}
				page.save(function(err,result){
					if(err) return cb(err);
					else return cb(null, page);					
				})
			},
			function(page,cb){
				//caution: the next two steps must be the last step of the waterfall because we use bypass mechanism
				//if there's something in the title field from the post
				if(body.title == null || body.title == ''){
					//if title field is empty, we can pass
					return cb('bypass');
				}
				if(page.source != null && page.source.name == body.title){
					return cb('bypass');
				}
				Source.findOne({name: body.title} , function(err, source){
					if(err) return cb(err);
					if(source)
					{
						cb(null, page, source);
					}
					else{
						var source = new Source({
								name: body.title,
								user: user._id,
							});
							source.save(function(err, newSource){
								//update page with new source
								cb(err, page, newSource);
						});
					}
				});
			},
			function(page, source, cb){
				var originalSource
				if(page.source != null){
				 	originalSource = page.source					
				}
				page.source = source._id;
				page.save(function(err, page){
					//check if there's any other page use this source besides the current page, 
					//if none other uses it, remove the source
					if(originalSource == null) return cb(null);

					Page.count({source:originalSource._id}, function(err, count){
						if(count == 0){
							Source.remove({_id:originalSource._id},function(err){
								cb(err)
							})
						}
						else{
							cb(null);							
						}
					})
				})
			}
		],function(err){
			if(err)
			{
				if(err == 'bypass')
				{
					resolve();
				}
				else
				{
					reject(err);
				}
			}
			resolve();
		})
	})
}

exports.delete = (id) => {
	return new Promise(function(resolve,reject){
		async.waterfall([
			function(cb){
				getPage(id, false, cb)
			},
			function(page,cb){
				getContent(page.content, function(err, content){
					cb(err, page, content)
				})
			},
			function(page, content, cb){
				var pagePath = appRoot + '/uploads/' + page.imagePath;
				var tempFile = fs.openSync(pagePath,'r');
				fs.closeSync(tempFile);
				fs.unlinkSync(pagePath)
				cb(null,page, content)
			},
			function(page,content,cb){
				content.remove(function(err){
					if(err) return cb(err);
					cb(null, page);
				})
			},
			function(page, cb){
				Page.find({source:page.source}).count(function(err,count){
					if(err) { console.log(err); return; }
					if(count == 0){
						Source.findOne({_id: page.source}).exec(function(err, source){
							if(err) { console.log(err); return ;}
							if(source){
								source.remove(function(err){ if(err) console.log(err)})
							}
						})
					}
				})
				page.remove(function(err){
					if(err) return cb(err);
					cb(null)
				});
			}
		], function(err, result){
			if(err)reject(err);
			else resolve(result);
		})
	})
}



