var log = console.log;
var mb, wc;

// Main WebCenter resource module
var webCenter = function(){
  var resourceIndexURL = "/rest/api/resourceIndex";
  var resourceIndex = null;

  var getResourceIndex = function(callback){
    if(!resourceIndex) {
      $.getJSON(resourceIndexURL, function(data) {
		resourceIndex = data;
		callback(data);
	  })
    } else {
      callback(resourceIndex);
    }
  };

  var getResourceURL = function(urn, callback) {
      var resourceURL = null;
      getResourceIndex(function(data) {
	resourceURL = $.grep(data.links, function(n){
          return n.resourceType == urn;
	    });
	callback(resourceURL);
	  });
  };

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
	wc.getResourceURL(defaultResourceURL, function(data) {
	$.getJSON(data, callback);
	    });
    } else {
	$.getJSON(resourceURL, callback);
    }
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
