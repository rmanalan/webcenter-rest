// Common utilities
var utils = function(){
  function linkTo(url, text, newwin){
    newwin = newwin ? ' target="_blank"' : "";
    return '<a href="' + url + '"' + newwin + '>' + text + '</a>'
  }

  function timeAgoInWords(dttm){
    return $.timeago(dttm.replace(/\.[^\-]*.\-/,'-'));
  }

  function resolveURLs(str) {
    // based on Gruber's liberal regex pattern enhanced by Alan Storm
    // http://alanstorm.com/url_regex_explained
    return str.replace(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g,
      function(url){
        // apply filters one by one. if one is applied, move on to the next url. order matters
        var origUrl = url;
        if((result=resolveYouTubeURLs(origUrl))!=origUrl){
          return result;
        } else if((result=resolveVimeoURLs(origUrl))!=origUrl){
          return result;
        //} else if((result=resolveGists(origUrl))!=origUrl){
        //  return result;
        } else if((result=resolveImages(origUrl))!=origUrl){
          return result;
        } else {
          return linkTo(url, url, true);
        }
      }
    );
  }
  function resolveGists(str){
    return str.replace(/http:\/\/gist\.github\.com\/([0-9]*)[&\w;=\+_\-]*/,
      function(url,id){
        return '<script src="http://gist.github.com/' + id + '.js"></script>';
      }
    );
  }
  function resolveImages(str) {
    return str.replace(/(^|[\n ])http(|s):\/\/.+(jpg|gif|png|bmp)/i,
      function(token){
        return '<p><img src="' + token + '" alt=""/></p>';
      }
    );
  }
  function resolveYouTubeURLs(str){
    return str.replace(/http:\/\/(www.)?youtube\.com\/watch\?v=([A-Za-z0-9._%-]*)[&\w;=\+_\-]*/,
      function(url, token1, id){
        return linkTo(url, url, true) + '<p><object width="379" height="227">' +
          '<param name="movie" value="http://www.youtube.com/v/'+id+'"></param>' + 
          '<param name="wmode" value="transparent"></param>' +
          '<embed src="http://www.youtube.com/v/' + id +
            '" type="application/x-shockwave-flash" wmode="transparent" ' +
            'width="379" height="227"></embed></object></p>';
      }
    );
  }
  function resolveVimeoURLs(str){
    return str.replace(/http:\/\/(www.)?vimeo\.com\/([A-Za-z0-9._%-]*)[&\w;=\+_\-]*/,
      function(url, token1, id){
        return linkTo(url, url, true) + '<p><object width="379" height="227">' +
          '<param name="movie" value="http://vimeo.com/moogaloop.swf?clip_id='+id+'&amp;server=vimeo.com&amp;show_title=0&amp;show_byline=0&amp;show_portrait=0&amp;color=00adef&amp;fullscreen=1"></param>' + 
          '<param name="allowfullscreen" value="true" />' +
          '<param name="allowscriptaccess" value="always" />' +
          '<embed src="http://vimeo.com/moogaloop.swf?clip_id=' + id +
            '&amp;server=vimeo.com&amp;show_title=0&amp;show_byline=0&amp;show_portrait=0&amp;color=00adef&amp;fullscreen=1" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" ' +
            'width="379" height="227"></embed></object></p>';
      }
    );
  }

  return {
    'linkTo' : linkTo,
    'resolveURLs' : resolveURLs,
    'timeAgoInWords' : timeAgoInWords
  };
}();

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
  
function getCurrentUser(callback){
    if(!currUserObj){
      $.getJSON(webCenter.getResourceURL(webCenter.getResourceIndex().links,'urn:oracle:webcenter:people',false),function(data){ 
        currUserObj = data;
        if(callback) callback(currUserObj);
      });
    } else {
      if(callback) callback(currUserObj);
      return currUserObj;
    }
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
