/*
 * Constructor for object oriented AJAX request
 */
function AjaxRequest() {
	// Constructor to create an object oriented Ajax request
	var xhr = null;
	var processResponse;

	// get XHR object. Should work for IE 6+, Safari and Mozilla based browsers
	if (window.XMLHttpRequest) {
		xhr = new window.XMLHttpRequest;
	} else {
		try {
			xhr = new ActiveXObject("MSXML2.XMLHTTP.3.0");
		} catch (ex) {
			xhr = null;
		}
	}
	if (xhr == null) {
		alert("Your browser doesn't support AJAX.");
	}

	// callback function in case we want to tweak the actual XHR object before
	// sending
	this.beforeSend = function(xmlHttpRequest) {
	};

	this.get = function(url, callback) {
		xhr.open("GET", url, true);
		// the rest APIs will return XML by default. Please return JSON
		xhr.setRequestHeader("Accept", "application/json; charset=utf-8");
		// callback for when the data comes back
		xhr.onreadystatechange = function() {
			processResponse(xhr, callback);
		};
		this.beforeSend(xhr);
		xhr.send();
	};

	this.post = function(url, data, callback) {
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
		// callback for when the data comes back
		xhr.onreadystatechange = function() {
			processResponse(xhr, callback);
		};
		this.beforeSend(xhr);
		xhr.send(data);
	};

	processResponse = function(xhr, callback) {
		var data = null;
		// can get called here many times. 4 means really done
		if (xhr.readyState == 4) {
			// let's call any HTTP codes in the 200s success
			if (xhr.status >= 200 && xhr.status < 300) {
				data = xhr.responseText;
			} else {
				data = "Error: " + xhr.status + " " + xhr.statusText + "<br />"
						+ xhr.responseText;
			}
			callback(data);
		}
	};
	return true;
}

/*
 * Parse the resourceIndex to find the specified URL and return it.
 * 
 * @Param jsonData the JSON data retrieved from calling the
 * /rest/api/resourceIndex URL. @Param strResourceType the resource type of the
 * URL you want to retrieve from the resourceIndex data. E.g.,
 * 'urn:oracle:webcenter:activities:stream'
 */
function getResourceURL(jsonData, strResourceType)
{
  // Using the HATEOAS model, we browse the returned links
  // looking for the one with the correct resource type.

  for (var i = 0; i < jsonData.links.length; i++) {
    if (jsonData.links[i].resourceType == strResourceType) {
      return jsonData.links[i].href;
    }
  }
  return null;
}

/*
 * Parse the links to find the specified type of href and return it.
 * 
 * @Param jsonData the JSON data retrieved from calling the
 * /rest/api/resourceIndex URL. @Param relType the rel type of the URL you want
 * to retrieve from the link data. E.g., 'self', 'alternate'
 */
function getHref(jsonData, relType)
{
  for (var i = 0; i < jsonData.links.length; i++) {
    if (jsonData.links[i].rel == relType) {
      return jsonData.links[i].href;
    }
  }
  return null;
}


/*
 * Parse the resourceIndex to find the activity stream URL and then load it.
 * 
 * @Param jsonData the JSON data retrieved from calling the
 * /rest/api/resourceIndex URL.
 */
function getActivitiesURL(jsonData)
{
  // Parse the JSON data to get the activities URI entry point.

  return getResourceURL(jsonData, 'urn:oracle:webcenter:activities:stream');
}

/*
 * Escape XML entities. Useful when you want to embed markup in an html page.
 * 
 * @param s The string to escape;
 */

function escapeXML(s) {
	if (typeof s == 'string') {
		s = s.replace(/&/g, "&amp;");
		s = s.replace(/"/g, "&quot;");
		s = s.replace(/</g, "&lt;");
		s = s.replace(/>/g, "&gt;");
	}
	return s;
}

/*
 * This function will remove http : // host : port from the input URL and return
 * the substring starting with subString/
 * 
 * This allows a configured proxy running on the referrer host to proxy the
 * request to the REST services host
 */
function proxyUrl(url, subString)
{
   var start = url.indexOf(subString, 0);
   var end = url.length;
   var _url = url.substring(start, end);
   return _url;
}
