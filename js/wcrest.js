// Currently logged in user. Gets init when webCenter.init() is called
var currentUser;

// Main WebCenter resource module
var webCenter = function(callback){
  var hostname = location.hostname;
  var port = (hostname == 'wc') ? '80' : '8889';
  var resourceIndex = null;
  var perPage = 20;
  
  function currentServer() {
    return location.protocol + '//' + hostname + ':' + port + '/';
  }

  function getResourceIndexURL(){
    return currentServer() + 'rest/api/resourceIndex';
  }

  function init(callback){
    getResourceIndex(function(){
        // setup current user
        userProfile.getCurrentUser(function(d){
          currentUser = d;
          callback();
        });
      });
  }

  function getResourceIndex(callback){
    if(!resourceIndex) {
      $.getJSON(getResourceIndexURL(), function(data){
        resourceIndex = data;

        if(callback) callback(data);
        return resourceIndex;
      });
    } else {
      return resourceIndex;
    }
  };

  function getResourceURL(links, urn, startIndex) {
    var results = $.grep(links, function(n){
        return n.resourceType == urn;
      });
    if(results.length>0){
      if(startIndex==false) return results[0].href;
      if(results[0].template){
        var url = results[0].template.replace("{itemsPerPage}", perPage);
        if(!startIndex) startIndex = "0";
        url = url.replace("{startIndex}", startIndex)
        return url;
      } else {
        return results[0].href;
      }
    } else {
      return null;
    }
  };

  function getTemplateItem(items, type) {
    var results = $.grep(items, function(n){
        return n.type == type;
      });
    if(results.length>0){
      return results[0];
    } else {
      return null;
    }
  }

  function resolveBindItems(str, items) {
    return str.replace(/\{[^\}]*\}/g, function(key){
      var item = $.grep(items, function(n){
          return n.key == key;
        })[0];
      var url = $.grep(item.links, function(l){
          return l.type == 'text/html';
        })[0].href;
      return ' <a href="' + url + '">' + item.displayName + '</a> '; 
    });
  }

  return {
    'init' : init,
    'currentServer' : currentServer,
    'getResourceIndex' : getResourceIndex,
    'getResourceURL' : getResourceURL,
    'getTemplateItem' : getTemplateItem,
    'resolveBindItems' : resolveBindItems
  }
}();

// Activity Stream module
var activityStream = function() {
  var activityId = -1;
  var moreActivities = true;
  function getActivities(startIndex, callback){
    if(!moreActivities) return;
    startIndex = startIndex ? startIndex : 0;
    $.getJSON(webCenter.getResourceURL(webCenter.getResourceIndex().links,'urn:oracle:webcenter:activities:stream',startIndex), callback);
  }
  function renderActivities(startIndex, cloneElem){
    getActivities(startIndex, function(data){
      if(data.items.length==0) {
        moreActivities = false;
        return;
      }
      var bindData = {
        'messages' : $.map(data.items, function(d){
          var detail = d.detail ? d.detail : "";
          return {
            'id' : nextActivityId(), 
            'avatar' : userProfile.avatarSmall(webCenter.getTemplateItem(d.templateParams.items, 'user').guid),
            'name' : webCenter.getTemplateItem(d.templateParams.items,'user').displayName,
            'url' : webCenter.getResourceURL(webCenter.getTemplateItem(d.templateParams.items, 'user').links,
              'urn:oracle:webcenter:people:person'),
            'activity' : webCenter.resolveBindItems(d.message, d.templateParams.items),
            'detail' : detail,
            'reltime' : utils.timeAgoInWords(d.createdDate)
            }
          })
      };
      if(cloneElem) {
        var template = $('li.messages:last').clone(true).appendTo('ol.results');
      } else {
        var template = $('li.messages:last');
      }
      template.autoRender(bindData);
    });
  }
  function nextActivityId() {
    return activityId += 1;
  }
  function currentActivityId() {
    return activityId;
  }

  return {
    'getActivities' : getActivities,
    'renderActivities' : renderActivities,
    'nextActivityId' : nextActivityId,
    'currentActivityId' : currentActivityId
  }
}();

// User Profile module
var userProfile = function(){
  var currUserObj = null;
  var avatarPath = 'webcenter/profilephoto/';
  
  function avatar(guid,size) {
    return webCenter.currentServer() + 'webcenter/profilephoto/' + guid + '/' + size.toUpperCase();
  }

  function setCurrentUser(props){
    props['updateStatus'] = updateStatus;
    props['avatar'] = function(size){size=size?size:'';return avatar(currentUser.guid,size)};
    currUserObj = props;
    return currUserObj;
  }
  
  function getCurrentUser(callback){
    if(!currUserObj){
      $.getJSON(webCenter.getResourceURL(webCenter.getResourceIndex().links,'urn:oracle:webcenter:people',false),function(data){ 
        setCurrentUser(data);
        if(callback) callback(currUserObj);
      });
    } else {
      if(callback) callback(currUserObj);
      return currUserObj;
    }
  }

  function getListNames(callback){
    $.getJSON(webcenter.getResourceURL(currentUser.links,'urn:oracle:webcenter:people:person:listNames',false),function(data){
      console.log(data);
    });
  }

  function updateStatus(status){
    $.ajax({
      url: webCenter.getResourceURL(currentUser.links,'urn:oracle:webcenter:people:person:status',false),
      type: "put",
      dataType: "json"
      contentType: "application/json",
      data: JSON.stringify({'note': utils.resolveURLs(status)}),
      success: function(d){
        return d;
      }
    });
  }

  return {
    'avatarSmall' : function(guid){ return avatar(guid,'SMALL')},
    'avatarLarge' : function(guid){ return avatar(guid,'LARGE')},
    'avatarOriginal' : function(guid){ return avatar(guid,'')},
    'getCurrentUser' : getCurrentUser
  }
}();

/* 
vim:ts=2:sw=2:expandtab
*/
