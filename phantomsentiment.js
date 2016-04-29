var phantom = require("phantom");
var cheerio = require("cheerio");
var sentiment = require("sentiment");

var analyzePage = function (url) {
    var _ph, _page, _outObj;
    var sent = 0;
    
    return phantom.create().then(ph => {
        _ph = ph;
        return _ph.createPage();
    }).then(page => {
        _page = page;
        return _page.open(url);
    }).then(status => {
        return _page.property('content')
    }).then(content => {
        var $ = cheerio.load(content);

        $('p.story-body-text').each(function (i, element) {
            sent += sentiment($(this).text()).score;
        });
        _page.close();
        _ph.exit();
        console.log('Sent: ' + sent);
        return sent;
    });
}

//analyzePage('http://www.nytimes.com/2016/04/21/business/dealbook/theranos-under-pressureas-inquiries-mount.html');
exports.analyzePage = analyzePage;