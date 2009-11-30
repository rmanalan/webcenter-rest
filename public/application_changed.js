var log = console.log;
var mb, wc;

// Main WebCenter resource module
var webCenter = function(){
  var resourceIndexURL = "/rest/api/resourceIndex";
  var resourceIndex = null;

  var getResourceIndex = function(callback){
    if(!resourceIndex) {
      $.getJSON(resourceIndexURL, theCallback(callback));
    } else {
	theCallback(callback)();
    }
  };
  var theCallback = function(callback) {
      resourceIndex = data;
      callback();
  }
  var getResourceURL = function(urn, callback) {
      getResourceIndex(theCallback2(callback));
  };

  var theCallback2 = function(callback) {
    var resourceURL = $.grep(resourceIndex.links, function(n){
        return n.resourceType == urn;
      })[0].href;
    callback();
    return resourceURL;

  }

  //getResourceIndex();

  return {
    resourceIndex : getResourceIndex,
    getResourceURL : getResourceURL
  }
};

// MessageBoard module
var msgBoard = function(wc) {
  var wcInstance = wc;
  var resourceURL = null;
  var defaultResourceURL = 'urn:oracle:webcenter:messageBoard';
  var getEntries = function(callback){
    if (!resourceURL) {
      wc.getResourceURL(defaultResourceURL, theCallback(callback));
    } else {
	theCallback(callback);
    }
  }
  var theCallback = function(callback) {
    $.getJSON(resourceURL, callback);
  }

  return {
    resourceURL: function(){return resourceURL},
    defaultResourceURL: function() { defaultResourceURL },
    getMessages: getEntries
  }
};

$(function(){
  wc = webCenter();
  mb = msgBoard(wc);
  mb.getEntries(function(data){console.log(data)});
  
});
