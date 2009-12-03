$(loadPage);

// Common utilities
var utils = function(){
  function linkTo(url, text, newwin){
    newwin = newwin ? ' target="_blank"' : "";
    return '<a href="' + url + '"' + newwin + '>' + text + '</a>'
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
        } else if((result=resolveImages(origUrl))!=origUrl){
          return result;
        } else {
          return linkTo(url, url, true);
        }
      }
    );
  }
  function resolveImages(str) {
    return str.replace(/(^|[\n ])http(|s):\/\/.+(jpg|gif|png|bmp)/i,
      function(token){
        return '"<img src="' + token + '" alt=""/>"';
      }
    );
  }
  function resolveYouTubeURLs(str){
    return str.replace(/http:\/\/(www.)?youtube\.com\/watch\?v=([A-Za-z0-9._%-]*)[&\w;=\+_\-]*/,
      function(token){
        return '<object width="379" height="227">' +
          '<param name="movie" value="http://www.youtube.com/v/'+token[2]+'"></param>' + 
          '<param name="wmode" value="transparent"></param>' +
          '<embed src="http://www.youtube.com/v/' + token[2] +
            '" type="application/x-shockwave-flash" wmode="transparent" ' +
            'width="379" height="227">' +
          '</embed>' +
          '</object>';
      }
    );
  }

  return {
    'linkTo' : linkTo,
    'resolveURLs' : resolveURLs,
    'resolveYouTubeURLs' : resolveYouTubeURLs
  };
}();

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

  function getResourceIndex(callback){
    if(!resourceIndex) {
      $.getJSON(getResourceIndexURL(), function(data){
        resourceIndex = data;
        callback();
      });
    }
    return resourceIndex;
  };

  function getResourceURL(links, urn, startIndex) {
    var results = $.grep(links, function(n){
        return n.resourceType == urn;
      });
    if(results.length>0){
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

  function timeAgoInWords(dttm){
    return $.timeago(dttm.replace(/\.[^\-]*.\-/,'-'));
  }

  return {
    'init' : getResourceIndex,
    'currentServer' : currentServer,
    'getResourceIndex' : getResourceIndex,
    'getResourceURL' : getResourceURL,
    'getTemplateItem' : getTemplateItem,
    'resolveBindItems' : resolveBindItems,
    'timeAgoInWords' : timeAgoInWords
  }
}();

// Activity Stream module
var activityStream = function() {
  var activityId = -1;
  function getActivities(startIndex, callback){
    startIndex = startIndex ? startIndex : 0;
    $.getJSON(webCenter.getResourceURL(webCenter.getResourceIndex().links,'urn:oracle:webcenter:activities:stream',startIndex), callback);
  }
  function renderActivities(startIndex, template){
    getActivities(startIndex, function(data){
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
            'reltime' : webCenter.timeAgoInWords(d.createdDate)
            }
          })
      };
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
  var avatarPath = 'webcenter/profilephoto/';
  function avatar(guid,size) {
    return webCenter.currentServer() + 'webcenter/profilephoto/' + guid + '/' + size.toUpperCase();
  }
  
  return {
    avatarSmall : function(guid){ return avatar(guid,'SMALL')},
    avatarLarge : function(guid){ return avatar(guid,'LARGE')},
    avatarOriginal : function(guid){ return avatar(guid,'')}
  }
}();

// Main page loader/initializer
function loadPage() {
  webCenter.init(function(){

    // setup posting widget
    $('#pub-form').submit(function(){
      var msg = $('#pub-text').val();
      if(msg == "") return false; 
      $.ajax({
        url: webCenter.getResourceURL(webCenter.getResourceIndex().links,'urn:oracle:webcenter:messageBoard'),
        type: "post",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({'body': utils.resolveURLs(msg)}),
        success: function(d){
          $('#pub-text').val('');
          var profileUrl = webCenter.getResourceURL(d.author.links,'urn:oracle:webcenter:spaces:profile');
          var data = {
              'messages' : [{
                'id' : activityStream.nextActivityId(),
                'avatar' : userProfile.avatarSmall(d.author.guid),
                'name' : d.author.displayName,
                'url' : profileUrl,
                'activity' : utils.linkTo(profileUrl, d.author.displayName) + ' posted a message',
                'detail' : d.body,
                'reltime' : webCenter.timeAgoInWords(d.created)
              }]
            };
          // don't re-render the entire stream, just prepend the latest to the top
          $('li.messages:first').clone(true).hide().prependTo('ol.results').autoRender(data).show(300);
        }
      });
      return false;
    });

    // Render initial activities
    activityStream.renderActivities(0,$('li.messages:first'));

    // Infinite scroll pager
    $(window).scroll(function(){
      if($(window).scrollTop() == $(document).height() - $(window).height()){
        activityStream.renderActivities(activityStream.currentActivityId(),
          $('li.messages:last').clone(true).appendTo('ol.results'));
      }
    }); 
    
  });
};

/* 
vim:ts=2:sw=2:expandtab
*/
