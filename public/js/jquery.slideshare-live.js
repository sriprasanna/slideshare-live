function SlideShareLiveClient () {
  
  if ( !(this instanceof arguments.callee) ) {
    return new arguments.callee(arguments);
  };
  
  var self = this
    , player = $('#player')
    , currentPage = $('#currentPage');;
  this.init = function() {
    self.slidePubSubPath = "/slide_change" + '_' + slideshowId + '_' + token;
    self.setupBayeuxHandlers();
    window.setTimeout(function(){
      if (owner)
        publishSlideNumber( 1 );
      else
        setEmbedLocation( 1 );
    }, 1000);
  };
  
  this.setupBayeuxHandlers = function() {
    var location = window.location.protocol + "//" + window.location.host + '/connect';
    self.client = new Faye.Client( location, { timeout: 60 } );
    self.client.subscribe(self.slidePubSubPath, function(message) {
      if (message.slideNumber) 
        setEmbedLocation(message.slideNumber);
    });
  };
  
  function generateURL (slideNumber) {
    return slideLocation + slideshowEmbedURL + '-slide-' + slideNumber + ".swf";
  }
  
  function setEmbedLocation (slideNumber) {
    currentPage.val(slideNumber);
    player.attr('src', generateURL(slideNumber));
  }
    
  function publishSlideNumber (slideNumber) {
    if (owner) {
      self.client.publish(self.slidePubSubPath,{
        slideNumber: slideNumber
      });
    }else{
      setEmbedLocation( slideNumber );
    }
  }
  
  function nextSlide () {
    var slideNumber = parseInt(currentPage.val(), 10) + 1;
    if (slideNumber <= slidesCount) 
      publishSlideNumber( slideNumber );
    return false;
  }
  
  function previousSlide () {
    var slideNumber = parseInt(currentPage.val(), 10) - 1;
    if (slideNumber >= 1) 
      publishSlideNumber( slideNumber );
    return false;
  }
  
  $('#prev').click(previousSlide);
  
  $('#next').click(nextSlide);
  
  $(window).keyup(function(e) {
    if (e.keyCode == 37) {
      previousSlide();
    }else if (e.keyCode == 39) {
      nextSlide();
    };
  });
  
  var message = $('#message');
  message.find('a').click(function() {
    message.hide();
  });
  
  this.init();
}

var slideshareLive = new SlideShareLiveClient();
