var request = new AjaxRequest();
/*
 * This URL must be proxied to the real server hosting the REST service. For
 * example on Apache or Oracle Web Tier:
 * 
 * ProxyPass /rest/ http://myspaceshost.example.com:8912/rest/
 * 
 * ProxyPassReverse /rest/ http://myspaceshost.example.com:8912/rest/
 * 
 */
var resourceIndexURL = "/rest/api/resourceIndex";
var serviceProxyStr = '/rest';
var activityStreamURL = null;

function getActivityStream() {
	if (!activityStreamURL) {
		// No Activity Stream URL - send request for it and return
		request.get(resourceIndexURL, getResourceIndexCallback);
		document.getElementById('activityStreamResults').innerHTML = 'Loading resource index from ' + resourceIndexURL + '<img src="loading.gif">';
		document.getElementById('button1').disabled = true;
		return;
	}
	request.get(activityStreamURL, getActivitiesCallback);
	document.getElementById('activityStreamResults').innerHTML = activityStreamURL + '<img src="loading.gif">';
	document.getElementById('button1').disabled = true;
}

function getResourceIndexCallback(data) {
	if (data.substr(0, 7) == "Error: ") {
		document.getElementById('activityStreamResults').innerHTML = escapeXML(data);
		document.getElementById('button1').disabled = false;
		return;
	}
	var jsonData = eval('(' + data + ')');
	activityStreamURL = getActivitiesURL(jsonData);
	if (activityStreamURL) {
		activityStreamURL = proxyUrl(activityStreamURL, serviceProxyStr);
		// Now that we have the URL try that get activity stream request again.
		getActivityStream();
	} else {
		document.getElementById('activityStreamResults').innerHTML = "Couldn't find activity stream URL";
		document.getElementById('button1').disabled = false;
	}
}

function getActivitiesCallback(data) {
	if (data.substr(0, 7) == "Error: ") {
		document.getElementById('activityStreamResults').innerHTML = escapeXML(data);
		document.getElementById('button1').disabled = false;
		return;
	}
	var jsonData = eval('(' + data + ')');
	var html = "";
	for ( var i = 0; i < jsonData.items.length; i++) {
		html = html + formatMessage(i, jsonData);
		html = html + "<br /><br />";
	}
	document.getElementById('activityStreamResults').innerHTML = html;
	document.getElementById('button1').disabled = false;
}

/*
 * Replace activity message parameters.
 * 
 * @Param index the index of the activity to process @Param jsonData the JSON
 * data retrieved from calling the /rest/api/resourceIndex URL.
 */
function formatMessage(index, jsonData) {
	var activity = jsonData.items[index];
	var strMessage = activity.message;
	var href;

	// Look for activity parameters and replace them in the message.

	if (activity.templateParams && activity.templateParams.items) {
		for ( var i = 0; i < activity.templateParams.items.length; i++) {
			var param = activity.templateParams.items[i];

			// Each parameter also has a set of links which at least
			// includes an HTML link and possibly a REST API link.
			href = "<a href='" + getHref(param, "alternate") + "'>"
					+ param.displayName + "</a>";
			strMessage = strMessage.replace(param.key, href);
		}
	}
	if (activity.detail) {
		strMessage = strMessage + "<br><font size='1'>" + activity.detail
				+ "</font>";
	}
	return strMessage;
}
