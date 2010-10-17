var http  = require('http')
  , express = require('express')
  , app = express.createServer()
  , io = require('socket.io')
  , crypto = require('crypto')
  , querystring = require('querystring');

function SlideShareLive (options) {
  if ( !(this instanceof arguments.callee) ) {
    return new arguments.callee(arguments);
  };
  
  var self = this;
  self.settings = options;
  self.init();
}

SlideShareLive.prototype.init = function() {
  var self = this;
  self.configureServer();
  self.routing();
  self.startServer();
};

SlideShareLive.prototype.configureServer = function() {
  var self = this;
  app.configure(function(){
      app.use(express.methodOverride());
      app.use(express.bodyDecoder());
      app.use(app.router);
      app.use(express.staticProvider(self.settings.staticFilePath));
      app.set('view engine', 'ejs');
  });
  app.configure('development', function(){
      app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });
  app.configure('production', function(){
      app.use(express.errorHandler());
  });
};

SlideShareLive.prototype.routing = function() {
  var self = this;
  app.get('/', function(req, res){
    res.render('index', { layout: false, locals: { error: null } });
  });
  
  app.post('/', function(req, res){
    self.handleSlideShareURL(req.body, res);
  });
};

SlideShareLive.prototype.startServer = function() {
  var self = this;
  app.listen(self.settings.port);
};

SlideShareLive.prototype.handleSlideShareURL = function(params, res) {
  var self = this
    , slideshare = http.createClient(self.settings.slideshare.port, self.settings.slideshare.host)
    , request;
  request = slideshare.request('GET', self.generateAPIURL(params['slideshow_url']), {'host': self.settings.slideshare.host});
  request.on('response', function(response){
    response.setEncoding('utf8');
    var body = "";
    response.on('data', function(data) {
      body += data;
    });
    response.on('end', function() {
      self.handleResponseXML(body, res);
    });
  });
  request.end();
};

SlideShareLive.prototype.handleResponseXML = function(body, res) {
  var self = this
    , data = self.isValidXML(body);
  if ( !!data ) 
    res.render('slideshow', { layout: false, locals: data });
  else
    res.render('index', { layout: false, locals: {error:"Something went wrong!!!"} });
};

SlideShareLive.prototype.generateAPIURL = function(slideshow_url) {
  var self = this
    , settings = self.settings.slideshare
    , timestamp = parseInt(new Date().getTime() / 1000, 10);
  return settings.path + settings.method + "?" + querystring.stringify({
                                                                    api_key: settings.key
                                                                  , ts: timestamp
                                                                  , hash: self.SHA1(settings.secret + timestamp)
                                                                  , slideshow_url: slideshow_url
                                                                  , detailed: 1
                                                                  });
};

SlideShareLive.prototype.SHA1 = function(data) {
  return crypto.createHash('sha1').update(data).digest('hex');
};

SlideShareLive.prototype.isValidXML = function(xml) {
  var self = this
    , data = {};
  if (xml.match(/SlideShareServiceError/))
    return false;
  data.url = xml.match(/value\=\&quot\;(.*?)\&amp\;stripped_title/)[1];
  data.title = xml.match(/\<Title\>(.*?)\<\/Title\>/)[1];
  return data;
};

module.exports = SlideShareLive;