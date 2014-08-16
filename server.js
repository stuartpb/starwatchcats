var queue = require('queue-async');
var express = require('express');
var request = require('request');

var app = express();
app.use(express.static(__dirname + '/static'));

app.get('/:owner/:repo', function(req, res, next) {
  var q = queue();
  var repoName = req.params.owner + '/' + req.params.repo;
  res.locals.repoName = repoName;
  for (var i=1; i<=10; i++) {
    q.defer(request,{
      url:'https://api.github.com/repos/' + repoName + '/events',
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
    res.render(__dirname + 'starwatchcats.jade');
  });
});

var server = require('http').createServer(app);

server.listen(process.env.PORT || 5000, process.env.IP);

