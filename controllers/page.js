const async = require('async');
const Page = require('../models/Page');
const Content = require('../models/Content');
const Source = require('../models/Source');
const striptags = require('striptags');
const fs = require('fs');
const elasticsearch = require('elasticsearch');

const pageLib = require('../lib/page.js');

var esClient = new elasticsearch.Client({
  host: '127.0.0.1:9200',
  log: 'debug'
});

exports.newPage = (req,res) => {
	res.render('page/pages/new',{
		title:'新一頁'
	})
}
exports.getLatest = (req, res) => {
	async.waterfall([
		function(cb){
				Page
					.find({user: req.user._id})
					.sort({timeStamp:-1}).limit(2).exec(function(err,results){
						if(err){}
						if(results.length > 1)
						{
							if(results[1].source != null){
								Source.findOne({_id:results[1].source})
								.exec(function(err,result){
									if(err) return cb(err);
									req.session['defaultTitle'] = result.name;
									cb(null,results[0])
								})
							}
							else{
								cb(null,results[0])
							}
						}
						else{
							cb(null,results[0])
						}
				})
		}
	], function(err,result){
		res.redirect('edit/' + result._id);
	})

}



exports.editPage = (req, res) => {
	var pageId = req.params.id;
	pageLib.get(pageId, true)
		.then(function(page){
			if((page.source == null || page.source.name == "" ) && req.session.defaultTitle != null)
			{
				page.source = {};
				page.source.name = req.session.defaultTitle;
				req.session.defaultTitle = "";
			}
			page.displayContent = unescape(page.displayContent);
			page.memo = unescape(page.memo)
			res.render('page/pages/edit',{
				title:'細節',
				page: page
			})	
		})
		.catch(function(err){
				req.flash('error', err)
				res.redirect('../../error');
		})
}

exports.postPage = (req,res) => {
	if(req.body.delete == 'true'){
		pageLib.delete(req.params.id).then(function(result){
			return res.redirect('../all');			
		})
		.catch(function(err){
			res.redirect('../../error');
		})
	}
	else{
		pageLib.update(req.params.id, req.user, req.body)
			.then(function(result){
				res.redirect('../all');
			})
			.catch(function(err){
				res.redirect('../../error');
			})
	}		
}

exports.getPages = (req,res) => {	
	Page.find({}).populate('source').exec(function(err,results){
		if(err) {}
		res.render('page/pages/all',{
			title:'我的筆記',
			pages: results
		})	
	})
}


exports.getResults = (req, res) => {
	var queryStr = req.session.querystring;
	async.waterfall([
		function(cb){
			esClient.search({
				index: 'contents',
				type: 'content',
				body:{
					query:{
						match:{
							"_all": queryStr
						}
					},
					highlight:{
						fields:
						{
							"engContent": {
								"fragment_size": 30,
								"highlight_query": {
									"bool":{
										 "must": {
				                            "match": {
				                                "engContent": {
				                                    "query": queryStr
				                                }
				                            }
				                        },
									}
								}
							},
							"asianContent": {
								"fragment_size": 100,
								"highlight_query": {
									"bool":{
										 "must": {
				                            "match": {
				                                "asianContent": {
				                                    "query": queryStr
				                                }
				                            }
				                        },
									}
								}
							},
						}
					}
				}
			}).then(function(resp){
				var hits = resp.hits.hits;
				cb(null, hits)
			}, function(err){
				console.log(err)
			})
		},
		function(hits, cb){
			ids = hits.map(function(hit){
				return hit._id; 
			});

			Page.find({content: {$in: ids}})
				.populate('source')
				.lean().exec(function(err, pages){
				if(err) return cb(err);
				else cb(null, hits, pages)
			})
		},
		function(hits,pages,cb){
			var result = pages.map(page => {
				 var targetHit = hits.filter(hit => { return hit._id.toString() === page.content.toString()})[0];
				 page.hit = targetHit;
				 return page;
			})
			cb(null,result);
		}
	], function(err,result){
		res.render('page/pages/results',{
			title: '搜索結果',
			searchResult: result,
		})					
	})
}
