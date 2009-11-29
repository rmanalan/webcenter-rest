var log = console.log;

// Main WebCenter resource module
var webCenter = function(callback){
  var resourceIndexURL = "/rest/api/resourceIndex";
  var resourceIndex = [];

  function getResourceIndex(callback){
    if(resourceIndex.length == 0) {
      $.getJSON(resourceIndexURL, function(data){
        resourceIndex = data;
	callback();
      });
    }
    return resourceIndex;
  };

  function getResourceURL(links, urn) {
    var results = $.grep(links, function(n){
        return n.resourceType == urn;
      });
    if(results.length>0){
      return results[0].href;
    } else {
      return null;
    }
  };

  return {
    init : getResourceIndex,
    getResourceIndex : getResourceIndex,
    getResourceURL : getResourceURL
  }
}();

// MessageBoard module
var msgBoard = function() {
  function getMessages(callback){
    $.getJSON(webCenter.getResourceURL(webCenter.getResourceIndex().links,'urn:oracle:webcenter:messageBoard'), callback);
  }
  function createMessage(msg) {
  }

  return {
    getMessages: getMessages,
    createMessage: createMessage
  }
}();

$(function(){
  webCenter.init(function(){
    msgBoard.getMessages(function(data){
      log(data);
      var HTML = "";
      $.each(data.items,function(){
	HTML += "<div>" +
	  "<a href='" + webCenter.getResourceURL(this.author.links, 'urn:oracle:webcenter:people:person') + "'>" +
	  this.author.displayName +
	  "</a> " +
	  this.body +
	  "</div>"
      });
      $('#results').html(HTML);
    });
  });
});
