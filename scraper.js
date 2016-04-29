var rp = require("request-promise");
var cheerio = require("cheerio");
var sentiment = require("sentiment");
var pageAnalysis = require("./phantomsentiment.js");
var express = require("express");
var handlebars = require("handlebars");
var router = express.Router();

var uri = 'http://api.nytimes.com/svc/search/v2/articlesearch.json';
var key = '&api-key=1d70fc35c6944d670b049c25daf69a0d:8:75094642';
var filters = '&fq=news_desk:("Business" "Business Day" "DealBook" "Financial") AND document_type:("article")&fl=web_url';

var getFormattedDate = function (date) {
	date_day = date.getDate();
	date_month = date.getMonth() + 1;
	date_year = date.getFullYear();
	if (date_day < 10) {
		date_day = '0' + date_day;
	}
	if (date_month < 10) {
		date_month = '0' + date_month;
	}
	return '' + date_year + date_month + date_day;
}

var scrape = function (query, callback) {
	var date = new Date();
	var query_url = '?q=' + query + filters;
	var daily_sent = [];
	var dates = [];

	for (var i = 0; i < 5; i++) {
		var start_date = new Date(date);
		start_date.setDate(date.getDate() - (5 * (i + 1)));
		var start_date_string = getFormattedDate(start_date);
		console.log('Start Date: ' + start_date_string);

		var end_date = new Date(date);
		end_date.setDate(date.getDate() - (5 * i));
		var end_date_string = getFormattedDate(end_date);
		console.log('End Date: ' + end_date_string);

		dates[4-i] = end_date_string;

		query_url = query_url + '&begin_date=' + start_date_string + '&end_date=' + end_date_string;
		daily_sent[4-i] = new Promise(function (resolve) {
			rp(uri+query_url+key, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					var resp = JSON.parse(body)['response']['docs']
					console.log(resp);
					if (resp.length > 0) {
						var sent = [];
						resp.forEach(function (value, index) {
							sent[index] = pageAnalysis.analyzePage(value['web_url']);
						});
						resolve(Promise.all(sent));
					} else {
						console.log('No Results');
						resolve('No Results');
					}
				} else {
					console.log('Error');
					resolve('Error');
				}
			});
		});
	}

	console.log(daily_sent);
	Promise.all(daily_sent).then(function (daily_sent) {
		console.log(daily_sent);

		daily_sent = daily_sent.filter(function (value, index) {
			if (typeof(value) === 'string') {
				dates.splice(index, 1);
			}
			return typeof(value) !== 'string';
		})

		console.log(daily_sent);
		console.log('Sending Callback');
		callback(null, query, dates, daily_sent);
	})
};

var scrapeRoute = function (req, res, next) {
	console.log(req.body);
	scrape(req.body.search, function (err, query, dates, daily_sent) {
		if (err) {
			next(err);
		} else {

			sentiment = daily_sent.map(function (sent) {
				return Promise.resolve(sent).then(sent => {
					return sent.reduce(function (prevVal, currVal) {
						return prevVal + currVal;
					});
				});
			});

			//console.log(sentiment);
			Promise.all(sentiment).then(function (sent) {
				console.log(sent);
				console.log('Sending JSON');
				res.json({
					name: query,
					dates: dates,
					sent: sent
				});
			});
		}
	});
};

router.post('/', scrapeRoute);

//scrape('Theranos', console.log);
module.exports = router;