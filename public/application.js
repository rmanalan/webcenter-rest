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

  var getEntries = function(){
    if(resourceURL){
      $.getJSON(resourceURL,function(data){ return data });
    } else { // wait until resourceURL is available
      setTimeout(getEntries, 100);
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
    getMessages: function(){return getEntries()}
  }
};

$(function(){
  mb = msgBoard();
  var items = mb.getMessages();
  console.log("after get" + items);
});
