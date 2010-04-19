// Main WebCenter module
var webCenter = function(callback) {
	var settings = {
		'hostname': location.hostname,
		'port': location.port,
		'perPage': 20,
		'dynConverterUri': '/idc/idcplg?IdcService=GET_DYNAMIC_CONVERSION&RevisionSelectionMethod=LatestReleased&dDocName='
	};

  // Support for user switching... this will flush the resourceIndex and currentUser
  // cache then reload the page
  $.ajaxSetup({
    'error' : function(x,s,e){
      if(x.status == 403){
        $.jStorage.flush();
        location.reload();
      }
    }
  });

	function init(options, callback) {
		webCenter.settings = settings;
		webCenter.server = location.protocol + '//' + settings.hostname + ':' + settings.port + '/';
		webCenter.resourceIndexURL = webCenter.server + 'rest/api/resourceIndex';
		if (typeof options == "object") $.extend(settings, options);
		else callback = options;
		getResourceIndex(function(data) {
			// assumes that the user is not logged in
			if (!data) callback(false);

      // setup current user
      userProfile.getCurrentUser(function(d) {
        $.jStorage.set('wc',webCenter);
        webCenter.currentUser = d;
        callback(true);
      });
		});
	}

	function getResourceIndex(callback) {
    try{$.extend(webCenter, {resourceIndex : $.jStorage.get('wc',webCenter).resourceIndex});}catch(e){};
    if (!webCenter.resourceIndex) {
      $.getJSON(webCenter.resourceIndexURL, function(data) {
        webCenter.resourceIndex = data;
        if (callback) callback(data);
        else return webCenter.resourceIndex;
      });
		} else {
			if (callback) callback(webCenter.resourceIndex);
			else return webCenter.resourceIndex;
		}
	};

	function getResourceURL(links, urn, startIndex, perPage, params, projection) {
		if (!perPage) perPage = settings.perPage;
		if (projection) {
			var projectParam = "&projection=" + projection;
		} else {
			var projectParam = "";
		}
		var results = $.grep(links, function(n) {
			if (typeof urn == 'object') {
				if (n.rel == urn.rel && n.resourceType == urn.resourceType) return true;
			} else {
				if (n.rel == urn || n.resourceType == urn) return true;
			}
		});
		if (results.length > 0) {
			//return href if startIndex is false
			if (startIndex == false && typeof(startIndex) == 'boolean') {
				// in some nodes, there are more than one of the same resourceType, like groupSpace.
				// in this case we have to search for the one with the 'alternate' view
				if (results.length > 1) {
					var results = $.grep(links, function(n) {
						return n.rel == 'alternate';
					});
					if (results.length == 1) return results[0].href + projectParam;
					else return null;
				} else {
					return results[0].href + projectParam;
				}
			}
			if (results[0].template) {
				// return template url if startIndex is true
				if (startIndex == true && typeof(startIndex) == 'boolean') return results[0].template + projectParam;
				// return paged url if startIndex is a number
				var url = results[0].template.replace("{itemsPerPage}", perPage);
				if (!startIndex) startIndex = "0";
				url = url.replace("{startIndex}", startIndex)
				if (params) {
					for (param in params) {
						url = url.replace('{' + param + '}', params[param]);
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
		var results = $.grep(items, function(n) {
			return n.type == type;
		});
		if (results.length > 0) {
			return results[0];
		} else {
			return null;
		}
	}

	function resolveBindItems(d) {
		var activityDescr = d.message.replace(/\{[^\}]*\}/g, function(key) {
			var item = $.grep(d.templateParams.items, function(n) {
				return n.key == key;
			})[0];
			try {
				var url = $.grep(item.links, function(l) {
					return l.type == 'text/html';
				})[0].href;
				return ' <a href="' + url + '" target="_top" class="' + item.type + '" rel="' + item.id + '">' + item.displayName + '</a> ';
			} catch(err) {
				return ' ' + item.displayName;
			}
		});
		if (d.groupSpace) {
			activityDescr += ' in <a href="' + webCenter.getResourceURL(d.groupSpace.links, 'urn:oracle:webcenter:space', false) + '" target="_top">' + d.groupSpace.displayName + '</a>';
		};
		return activityDescr;

	}

	function nsNode(nodeName) {
		if ($.browser.webkit) return "[nodeName=" + nodeName + "]";
		else return nodeName.split(':').join('\\:');
	}

	function getCmisResource(url, callback, retry) {
		// http://docs.jquery.com/Specifying_the_Data_Type_for_AJAX_Requests
		$.ajax({
			type: 'get',
			dataType: ($.browser.msie) ? "text": "xml",
			url: url,
			error: function(x, t, e) {
				// Added polling support because UCM can take a while to post process a file
				// and callbacks aren't supported
				if (retry && retry.count > 0 && retry.frequency > 0) {
					getCmisResource(url, callback, retry, retry.count - 1, retry.frequency);
				}
			},
			success: function(data) {
				var xml;
				if (typeof data == "string") {
					xml = new ActiveXObject("Microsoft.XMLDOM");
					xml.async = false;
					xml.loadXML(data);
				} else {
					xml = data;
				}
				callback(xml);
			}
		});
	}

	function getCmisObjectByPathUrl(path, callback) {
		if (!webCenter.cmisObjectByPathUri) {
			getCmisResource(webCenter.getResourceURL(webCenter.resourceIndex.links, 'urn:oracle:webcenter:cmis', false, null, null),function(d) {
				var tmpltNode = $.grep($(d).find(nsNode('cmisra:uritemplate')), function(e) {
					return $(e).find(nsNode('cmisra:type')).text() == 'objectbypath';
				});
				var tmplt = $(tmpltNode).find(nsNode('cmisra:template')).text();
				tmplt = tmplt.split('&')[0].replace(/\{[^\}]*\}/g, '');
				webCenter.cmisObjectByPathUri = tmplt;
				callback(tmplt + path);
			});
		} else {
			callback(webCenter.cmisObjectByPathUri + path);
		}
	}

	function getCmisFolderUrl(path, callback) {
		if (typeof path == 'function') {
			callback = path;
			var folderPath = webCenter.currentUser.publicFolderPath;
		}
		if (path == null) {
			var folderPath = webCenter.currentUser.publicFolderPath;
		}
		if (typeof path == 'string') {
			var folderPath = path;
		}
		webCenter.getCmisObjectByPathUrl(folderPath, function(url) {
			webCenter.getCmisResource(url, function(d) {
				var childrenFolderUrl = $($.grep($(d).find('a'), function(e) {
					return $(e).text() == "down"
				})).attr('href');
				webCenter.currentUser.publicFolderUrl = childrenFolderUrl;
				if (callback) callback(childrenFolderUrl);
			});
		});
	}

	// Activity Stream module
	var activityStream = function() {
		var activityId = - 1;
		var moreActivities = true;
		function getActivities(links, startIndex, callback) {
			if (startIndex == 0) moreActivities = true;
			if (!moreActivities) return;
			startIndex = startIndex ? startIndex: 0;
			if (startIndex == 0) {
				activityId = - 1;
			};
			if (typeof(links) == 'object') {
				var url = webCenter.getResourceURL(links, {
					"resourceType": "urn:oracle:webcenter:activities:stream",
					"rel": "urn:oracle:webcenter:activities:stream"
				},
				startIndex, null, {
					'personal': true,
					'connections': true,
					'groupSpaces': true,
					'serviceIds': ''
				});
			} else {
				var url = links.replace("{startIndex}", startIndex).replace("{itemsPerPage}", webCenter.settings.perPage);
			}
			$.getJSON(url, callback);
		}
		function nextActivityId() {
			return activityId += 1;
		}
		function currentActivityId() {
			return activityId;
		}

		return {
			'getActivities': getActivities,
			'nextActivityId': nextActivityId,
			'currentActivityId': currentActivityId
		}
	} ();

	// User Profile module
	var userProfile = function() {
		var avatarPath = 'webcenter/profilephoto/';

		function avatar(guid, size) {
			return webCenter.server + 'webcenter/profilephoto/' + guid + '/' + size.toUpperCase();
		}

		function setCurrentUser(props) {
      props['publicFolderPath'] = '/PersonalSpaces/' + props.emails.value + '/Public';
			props['updateStatus'] = updateStatus;
			props['avatar'] = function(size) {
				size = size ? size: '';
				return avatar(webCenter.currentUser.guid, size)
			};
			props['getListNames'] = getListNames;
			props['getSpaces'] = getSpaces;
			props['getSpacesPaged'] = getSpacesPaged;
			props['getConnections'] = getConnections;
			props['getStatus'] = getStatus;
			webCenter.currentUser = props;
			return webCenter.currentUser;
		}

		function getCurrentUser(callback) {
      try{webCenter.currentUser = $.jStorage.get('wc').currentUser;}catch(e){};
			if (!webCenter.currentUser) {
				$.getJSON(webCenter.getResourceURL(webCenter.resourceIndex.links, 'urn:oracle:webcenter:people', false), function(data) {
					setCurrentUser(data);
					if (callback) callback(webCenter.currentUser);
				});
			} else {
        setCurrentUser(webCenter.currentUser);
				if (callback) callback(webCenter.currentUser);
				return webCenter.currentUser;
			}
		}

		function getListNames(callback) {
			$.getJSON(webCenter.getResourceURL(webCenter.currentUser.links, 'urn:oracle:webcenter:people:person:listNames', false), function(d) {
				webCenter.currentUser.listNames = d.items;
				if (callback) callback(webCenter.currentUser.listNames);
				else return webCenter.currentUser.listNames;
			});
		}

		function getSpaces(callback, projection) {
			if (projection) var projectParam = true;
			else var projectParam = false;
			$.ajax({
				'url': webCenter.resourceIndex.links, 'urn:oracle:webcenter:spaces', false, null, null, projectParam),
				'method': 'get',
				'dataType': 'json',
			  'error' : function(x,s,e){
			      if(x.status == 403){
				      return $.evalJSON(x.responseText);
			      }
			    },
				'success': function(d) {
					webCenter.currentUser.spaces = d.items;
					if (callback) {
						callback(d.items);
					} else {
						return d.items;
					}
				}
			});      
		}

		function getSpacesPaged(page, perPage, callback) {
			var params = {
				'projection': '',
				'visibility': ''
			};
			$.ajax({
				'url': webCenter.getResourceURL(webCenter.resourceIndex.links, 'urn:oracle:webcenter:spaces', page, perPage, params),
				'method': 'get',
				'dataType': 'json',
			  'error' : function(x,s,e){
			      if(x.status == 403){
				      return $.evalJSON(x.responseText);
			      }
			    },
				'success': function(d) {
					webCenter.currentUser.spaces = d.items;
					if (callback) {
						callback(d.items);
					} else {
						return d.items;
					}
				}
			});      
		}

		function getConnections(callback) {
			$.getJSON(webCenter.getResourceURL(webCenter.currentUser.links, 'urn:oracle:webcenter:people:person:list', false), function(d) {
				callback($.extend(webCenter.currentUser, {
					"connections": d.items
				}));
			});
		}

		function getStatus(callback) {
			$.getJSON(webCenter.getResourceURL(webCenter.currentUser.links, 'urn:oracle:webcenter:people:person:status', false), function(d) {
				callback($.extend(webCenter.currentUser, {
					"status": d.note
				}));
			});
		}

		function updateStatus(status) {
			$.ajax({
				url: webCenter.getResourceURL(webCenter.currentUser.links, 'urn:oracle:webcenter:people:person:status', false),
				type: "put",
				dataType: "json",
				contentType: "application/json",
				data: JSON.stringify({
					'note': utils.resolveURLs(status)
				}),
				success: function(d) {
					return d;
				}
			});
		}

		return {
			'avatarSmall': function(guid) {
				return avatar(guid, 'SMALL')
			},
			'avatarLarge': function(guid) {
				return avatar(guid, 'LARGE')
			},
			'avatarOriginal': function(guid) {
				return avatar(guid, '')
			},
			'getCurrentUser': getCurrentUser
		}
	} ();

	return {
		'init': init,
		'activityStream': activityStream,
		'userProfile': userProfile,
		'getResourceURL': getResourceURL,
		'getTemplateItem': getTemplateItem,
		'resolveBindItems': resolveBindItems,
		'getCmisFolderUrl': getCmisFolderUrl,
		'getCmisObjectByPathUrl': getCmisObjectByPathUrl,
		'getCmisResource': getCmisResource
	}
}();

/* 
vim:ts=2:sw=2:expandtab
*/

