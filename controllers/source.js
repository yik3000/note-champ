const async = require('async');
const Source = require('../models/Source');
const Pages = require('../models/Page');

exports.getByPages = (req, res) => {
	Pages.find({source: req.params.id}).populate('source').lean().exec(function(err,pages){
			res.render('page/sources/bypage',{
				title:'分頁',	
				results: pages
			})
	})
}

exports.getAll = (req, res) => {
	Source.aggregate([{
				    $match:{
				        user: req.user._id
				    }
				},{
				    $lookup:
				    {
				            from: 'pages',
				            localField: '_id',
				            foreignField: 'source',
				            as: 'page',
				    }
				},{
				    $unwind:{
				        path: '$page',
				        preserveNullAndEmptyArrays: true
				    }
				},{
				    $group: {
				        _id: { title: '$name', id: '$_id' },
				        count: {$sum: 1},
				        latest: {$max: '$page.timeStamp'}
				    }    
				}
		]).exec(function(err, sources){
			//console.log(sources);
			res.render('page/sources/all',{
				title:'我的信息來源',	
				results: sources
			})
	})
}