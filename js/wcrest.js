// Currently logged in user. Gets init when webCenter.init() is called
var currentUser;
var user;

// Main WebCenter resource module
var webCenter = function(callback){
  var settings = {
    'hostname' : location.hostname,
    'port' : location.port,
    'perPage' : 10
  };

  var resourceIndex = null;
  
  function currentServer() {
    var server = location.protocol + '//' + settings.hostname + ':' + settings.port + '/';
    $.extend(webCenter,{'server':server});
    return server;
  }

  function getResourceIndexURL(){
    var url = currentServer() + 'rest/api/resourceIndex';
    $.extend(webCenter,{'resourceIndexURL': url})
    return url;
  }

  function init(options,callback){
    $.extend(settings,options);
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
        $.extend(webCenter,{'resourceIndex': data});
        if(callback) callback(data);
        return resourceIndex;
      });
    } else {
      return resourceIndex;
    }
  };

  function getResourceURL(links, urn, startIndex, perPage, params, projections) {
    if(!perPage) perPage = settings.perPage;
    if(projections) {
      var projectParam = "&projection=details";
    } else {
      var projectParam = "";
    }
    var results = $.grep(links, function(n){
        return n.resourceType == urn;
    });
    if(results.length>0){
      //return href if startIndex is false
      if(startIndex==false && typeof(startIndex)=='boolean') {
        // in some nodes, there are more than one of the same resourceType, like groupSpace.
        // in this case we have to search for the one with the 'alternate' view
        if(results.length>1){
          var results = $.grep(links,function(n){return n.rel=='alternate'});
          if(results==1) return results[0].href + projectParam;
          else return null;
        } else {
          return results[0].href + projectParam;
        }
      }
      if(results[0].template){
        // return template url if startIndex is true
        if(startIndex==true && typeof(startIndex)=='boolean') return results[0].template + projectParam;
        // return paged url if startIndex is a number
        var url = results[0].template.replace("{itemsPerPage}", perPage);
        if(!startIndex) startIndex = "0";
        url = url.replace("{startIndex}", startIndex)
        if(params){
          for(param in params){
            url = url.replace('{'+param+'}',params[param]);
          }
        }
        return url + projectParam;
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

  function resolveBindItems(d) {
    var activityDescr = d.message.replace(/\{[^\}]*\}/g, function(key){
      var item = $.grep(d.templateParams.items, function(n){
          return n.key == key;
        })[0];
      var url = $.grep(item.links, function(l){
          return l.type == 'text/html';
        })[0].href;
      return ' <a href="' + url + '" target="_top">' + item.displayName + '</a> '; 
    });
    if(d.groupSpace){
      activityDescr += ' in <a href="' + webCenter.getResourceURL(d.groupSpace.links,'urn:oracle:webcenter:space',false) 
        + '" target="_top">' + d.groupSpace.displayName + '</a>';
    };
    return activityDescr;
    
  }

  function getPerPage(){
    return settings.perPage;
  }

  return {
    'init' : init,
    'currentServer' : currentServer,
    'getResourceIndex' : getResourceIndex,
    'getResourceURL' : getResourceURL,
    'getTemplateItem' : getTemplateItem,
    'resolveBindItems' : resolveBindItems,
    'getPerPage' : getPerPage
  }
}();

// Activity Stream module
var activityStream = function() {
  var activityId = -1;
  var moreActivities = true;
  function getActivities(links,startIndex,callback){
    if(startIndex==0) moreActivities=true;
    if(!moreActivities) return;
    startIndex = startIndex ? startIndex : 0;
    if(startIndex==0){
      activityId = -1;
    };
    if(typeof(links)=='object')
      var url = webCenter.getResourceURL(links,'urn:oracle:webcenter:activities:stream',startIndex);
    else
      var url = links.replace("{startIndex}", startIndex).replace("{itemsPerPage}", webCenter.getPerPage());
    $.getJSON(url, callback);
  }
  function nextActivityId() {
    return activityId += 1;
  }
  function currentActivityId() {
    return activityId;
  }

  return {
    'getActivities' : getActivities,
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
    props['getListNames'] = getListNames;
    props['getSpaces'] = getSpaces;
    props['getSpacesPaged'] = getSpacesPaged;
    props['getConnections'] = getConnections;
    props['getStatus'] = getStatus;
    currUserObj = props;
    return currUserObj;
  }
  
  function getCurrentUser(callback){
    if(!currUserObj){
      $.getJSON(webCenter.getResourceURL(webCenter.resourceIndex.links,'urn:oracle:webcenter:people',false),function(data){ 
        setCurrentUser(data);
        if(callback) callback(currUserObj);
      });
    } else {
      if(callback) callback(currUserObj);
      return currUserObj;
    }
  }

  function getListNames(callback){
    $.getJSON(webCenter.getResourceURL(currentUser.links,'urn:oracle:webcenter:people:person:listNames',false),function(d){
      var obj = $.extend(currentUser,{"listNames":d.items});
      if(callback) {
        callback(obj);
      } else {
        return obj;
      }
    });
  }

  function getSpaces(callback,projection){
    if(projection) var projectParam = true
    else var projectParam = false
    $.getJSON(webCenter.getResourceURL(webCenter.resourceIndex.links,'urn:oracle:webcenter:spaces',false,null,null,projectParam),function(d){
      var obj = $.extend(currentUser,{"spaces":d.items});
      if(callback) {
        callback(obj);
      } else {
        return obj;
      }
    });
  }

  function getSpacesPaged(page, perPage, callback){
    var params = {
      'projection' : '',
      'visibility' : ''
    };
    $.getJSON(webCenter.getResourceURL(webCenter.resourceIndex.links,'urn:oracle:webcenter:spaces',page,perPage,params),function(d){
      if(callback) {
        callback(d.items);
      } else {
        return d.items;
      }
    });
  }

  function getConnections(callback){
    $.getJSON(webCenter.getResourceURL(currentUser.links,'urn:oracle:webcenter:people:person:list',false),function(d){
      callback($.extend(currentUser,{"connections":d.items}));
    });
  }

  function getStatus(callback){
    $.getJSON(webCenter.getResourceURL(currentUser.links,'urn:oracle:webcenter:people:person:status',false),function(d){
      callback($.extend(currentUser,{"status":d.note}));
    });
  }

  function updateStatus(status){
    $.ajax({
      url: webCenter.getResourceURL(currentUser.links,'urn:oracle:webcenter:people:person:status',false),
      type: "put",
      dataType: "json",
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
