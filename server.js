require.paths.unshift(__dirname + "/vendor");

process.addListener('uncaughtException', function(err, stack) {
  console.log('---------------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('---------------------');
});

var SlideShareLive = require('./lib/slideshare-live');

new SlideShareLive({
    port: parseInt(process.env.PORT || 8000, 10)
  , slideshare: {
      secret: 'LQabSfjq'
    , key: 'kfqB74Zi'
    , host: 'www.slideshare.net'
    , path: '/api/2/'
    , port: 80
    , method: 'get_slideshow'
    }
  , staticFilePath: __dirname + "/public"
});
