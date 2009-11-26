var log = console.log;
var dump;
var mb;
var utils = function(){
  function getResourceURL(urn, json) {
    return $.grep(json.links, function(n){
        return n.resourceType == urn;
      })[0].href;
  }
  return {getResourceURL: getResourceURL}
};
var msgBoard = function() {
  var resourceIndexURL = "/rest/api/resourceIndex";
  var serviceProxyStr = "/rest";
  var resourceURL = null;
  var util = utils();
  
  var getEntries = function(callback){
    if(resourceURL) {
      $.getJSON(resourceURL, callback);
    } else {
      setTimeout(function(){getEntries(callback)},100);
    }
  }

  var setResourceURL = function(){
    $.getJSON(resourceIndexURL, function(json){
      resourceURL = util.getResourceURL('urn:oracle:webcenter:messageBoard', json);
    });
  }

  setResourceURL();

  return {
    resourceURL: function(){return resourceURL},
    getMessages: function(callback){return getEntries(callback)}
  }
};

$(function(){
  mb = msgBoard(); //initialize and get resourceURL
  mb.getMessages(function(data){
    console.log(data.items)
  });
});
