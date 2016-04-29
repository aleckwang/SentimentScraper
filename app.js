var express = require('express');
var app = express();
var scrape = require('./scraper.js');
var bodyParser = require('body-parser');
var handlebars = require('handlebars');
var cheerio = require('cheerio');

// Serve static pages
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.static(__dirname));

app.get('/', function (req, res) {
	res.render('index');
});

app.use(bodyParser.urlencoded({extended: false}));

app.use('/', scrape);

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
	console.log('Express server listening on port %d', server.address().port);
});