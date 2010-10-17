$(document).ready(function() {
  var player = $('#player')
    , currentPage = $('#currentPage');
  
  function generateURL (slideNumber) {
    return slideLocation + slideshowEmbedURL + '-slide-' + slideNumber + ".swf";
  }
  
  function setEmbedLocation (slideNumber) {
    player.attr('src', generateURL(slideNumber));
  }
  
  $('#prev').click(function() {
    var slideNumber = parseInt(currentPage.val(), 10) - 1;
    if (slideNumber >= 1) {
      setEmbedLocation( slideNumber );
      currentPage.val(slideNumber);
    }
    return false;
  });
  
  $('#next').click(function() {
    var slideNumber = parseInt(currentPage.val(), 10) + 1;
    if (slideNumber <= slidesCount) {
      setEmbedLocation( slideNumber );
      currentPage.val(slideNumber);
    }
    return false;
  }).click();
});
