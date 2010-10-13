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
    res.render('index', { layout: false });
  });
  
  app.post('/', function(req, res){
    var locals = self.handleSlideShareURL(req.body);
    res.render('index', { layout: false, locals: locals });
  });
};

SlideShareLive.prototype.startServer = function() {
  var self = this;
  app.listen(self.settings.port);
};

SlideShareLive.prototype.handleSlideShareURL = function(params) {
  var self = this
    , slideshare = http.createClient(self.settings.slideshare.port, self.settings.slideshare.host)
    , request;
  console.log(self.generateAPIURL(params['slideshow_url']));
  request = slideshare.request('GET', self.generateAPIURL(params['slideshow_url']), {'host': self.settings.slideshare.host});
  request.on('response', function(response){
    response.setEncoding('utf8');
    var body = "";
    response.on('data', function(data) {
      body += data;
    });
    response.on('end', function() {
      console.log(body);
    });
  });
  request.end();
};

SlideShareLive.prototype.generateAPIURL = function(slideshow_url) {
  var self = this,
      settings = self.settings.slideshare,
      timestamp = parseInt(new Date().getTime() / 1000, 10);
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

// 
//     
// LiveStats.prototype.init = function() {
//   var self = this;
//   self.bayeux = self.createBayeuxServer();
//   self.httpServer = self.createHTTPServer();
//   self.bayeux.attach(self.httpServer);
//   self.httpServer.listen(self.settings.port);
//   sys.log('Server started on PORT ' + self.settings.port );
// };
// 
// LiveStats.prototype.createBayeuxServer = function() {
//   var self = this;
//   var bayeux = new faye.NodeAdapter({
//     mount: '/faye'
//   , timeout: 45
//   });
//   return bayeux;
// };
// 
// LiveStats.prototype.createHTTPServer = function() {
//   var self = this;
//   var server = http.createServer(function(request, response) {
//     var file = new nodeStatic.Server('./public', {
//       cache : false
//     });
//     request.addListener('end', function() {
//       var location = url.parse(request.url, true),
//           params = location.query || request.headers;
//       if (location.pathname == '/config.json' && request.method == 'GET') {
//         response.writeHead(200,{
//           'Content-Type': 'application/x-javascript'
//         });
//         var jsonString = JSON.stringify({
//           port: self.settings.port
//         });
//         response.write(jsonString);
//         response.end();
//       }else if(location.pathname == "/stat" && request.method == "GET"){
//         self.ipToPosition(params.ip, function(latitude, longitude, city) {
//           self.bayeux.getClient().publish('/stat', {
//             title: params.title
//           , latitude: latitude
//           , longitude: longitude
//           , city: city
//           , ip: params.ip
//           });
//         });
//         response.writeHead(200, {
//           'Content-Type': 'text/plain'
//         });
//         response.write('OK');
//         response.end();
//       }else{
//         file.serve(request, response);
//       }
//     });
//   });
//   return server;
// };
// 
// LiveStats.prototype.ipToPosition = function (ip, callback) {
//   var self = this;
// 
//   var client = http.createClient(self.settings.geoipServer.port, 
//                                  self.settings.geoipServer.hostname);
//   var request = client.request('GET', '/geoip/api/locate.json?ip=' + ip, {
//     'host': self.settings.geoipServer.hostname
//   });
// 
//   request.addListener('response', function (response) {
//     response.setEncoding('utf8');
// 
//     var body = '';
//     response.addListener('data', function (chunk) {
//       body += chunk;
//     });
//     response.addListener('end', function () {
//       var json = JSON.parse(body);
// 
//       if (json.latitude && json.longitude) {
//         callback(json.latitude, json.longitude, json.city);
//       }
//     });
//   });
// 
//   request.end();
// };

module.exports = SlideShareLive;