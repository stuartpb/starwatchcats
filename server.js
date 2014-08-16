var queue = require('queue-async');
var express = require('express');
var request = require('request');

var app = express();
app.use(express.static(__dirname + '/static'));

function renderStargazes(req, res, next) {
  var q = queue();
  for (var i=1; i<=10; i++) {
    q.defer(request,{
      url:'https://api.github.com/repos/' + res.local.repoName + '/events',
      qs: {page: i},
      json: true
      });
  }
  q.awaitAll(function(err, pages) {
    if (err) return next(err);
    res.locals.stargazes = [].concat.apply([], pages).filter(function(v) {
      return v.type == 'WatchEvent';
    });
    res.set('content-type','text/html');
    res.render('starwatchcats.jade');
  });
}

app.get('/:owner/:repo', function(req, res, next) {
  res.locals.repoName = req.params.owner + '/' + req.params.repo;
  renderStargazes(req, res, next);
});

if (process.env.DEFAULT_REPO) {
  app.get('/', function(req, res, next) {
    res.locals.repoName = process.env.DEFAULT_REPO;
    renderStargazes(req, res, next);
  });
}

var server = require('http').createServer(app);

server.listen(process.env.PORT || 5000, process.env.IP);

