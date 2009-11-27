var log = console.log;
var mb, wc;

// Main WebCenter resource module
var webCenter = function(){
  var resourceIndexURL = "/rest/api/resourceIndex";
  var resourceIndex = null;

  var getResourceIndex = function(){
    if(!resourceIndex) {
      $.getJSON(resourceIndexURL, function(data){
        resourceIndex = data;
      });
    }
  };
  var getResourceURL = function(urn) {
    return $.grep(resourceIndex.links, function(n){
        return n.resourceType == urn;
      })[0].href;
  };

  getResourceIndex();

  return {
    resourceIndex : getResourceIndex,
    getResourceURL : getResourceURL
  }
};

// MessageBoard module
var msgBoard = function(resourceURL) {
  var getEntries = function(callback){
    $.getJSON(resourceURL, callback);
  }

  return {
    resourceURL: function(){return resourceURL},
    getMessages: function(callback){return getEntries(callback)}
  }
};

$(function(){
  wc = webCenter();
  mb = msgBoard(mb.wc.getResourceURL('urn:oracle:webcenter:messageBoard'));
  mb.getEntries(function(data){console.log(data)});
  
});
