/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  });
};

exports.getErrorPage = (req, res) => {
	res.render('error', {
		title: 'error page'
	})
}

exports.main = (req, res) => {
	res.render('main',{
		title:'搜索開始吧',
		subtitle: '請在這裡開始'
	})
}

const Page = require('../models/Page');

exports.postMain = (req,res) => {	
	req.session.querystring = req.body.question;
	res.redirect('/page/results');	
}