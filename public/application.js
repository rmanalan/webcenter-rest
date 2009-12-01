var log = function(d) {
	try { console.log(d) }
	catch(e) {};
}

// Main WebCenter resource module
var webCenter = function(callback){
  var resourceIndexURL = "/rest/api/resourceIndex";
  var resourceIndex = null;
	var perPage = 5;
	
	function currentServer() {
		return location.protocol + '//' + location.hostname + ':' + location.port + '/';
	}

  function getResourceIndex(callback){
    if(!resourceIndex) {
      $.getJSON(resourceIndexURL, function(data){
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
			return '<a href="' + url + '">' + item.displayName + '</a>'; 
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

// MessageBoard module
var msgBoard = function() {
  function getMessages(callback){
    $.getJSON(webCenter.getResourceURL(webCenter.getResourceIndex().links,'urn:oracle:webcenter:messageBoard'), callback);
  }
  function createMessage(msg) {
  }

  return {
    'getMessages' : getMessages,
    'createMessage' : createMessage
  }
}();

// Activity Stream module
var activityStream = function() {
  function getActivities(callback){
    $.getJSON(webCenter.getResourceURL(webCenter.getResourceIndex().links,'urn:oracle:webcenter:activities:stream'), callback);
  }

  return {
    'getActivities' : getActivities
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

$(function(){

	$('ol.results').compile('activityTemplate');
	function renderActivities(data){
		activityStream.getActivities(function(data){
			log(data);
			var bindData = {
				'messages' : $.map(data.items, function(d){
					var detail = d.detail ? d.detail : "";
					return {
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
			$('ol.results').autoRender(bindData);
		});
	}

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
				data: JSON.stringify({'body': msg}),
				success: function(){
					$('#pub-text').val('');
					var test = $('ol.results').render({
						 'name' : "RICH",
						 'url' : "http://theappslab.com",
						 'activity' : "RICH IS TRYING SOMETHING OUT"
					  }, 'activityTemplate').autoRender();
					log(test);
				}
			});
			return false;
		});
		
		renderActivities();
  });
});

/* vim:ts=2:sw=2: */
