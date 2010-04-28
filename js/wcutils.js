// Common utilities
var utils = function() {
	function linkTo(url, text, newwin) {
		newwin = newwin ? ' target="_blank"': "";
		return '<a href="' + url + '"' + newwin + '>' + text + '</a>'
	}

	function timeAgoInWords(dttm) {
		return $.timeago(dttm.replace(/\.[^\-]*.\-/, '-'));
	}

	function randBase32() {
		return Math.floor(Math.random() * 1000000000000000000).toString(36);
	}

	function resolveURLs(str) {
		// Caja's html_sanitizer prevents XSS/code injection attacks
		str = html_sanitize(str, function(url) {
			if (/^https?:\/\//.test(url)) return url;
		},
		function(id) {
			return id
		});

		// based on Gruber's liberal regex pattern enhanced by Alan Storm
		// http://alanstorm.com/url_regex_explained
		return str.replace(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g, function(url) {
			// apply filters one by one. if one is applied, move on to the next url. order matters
			var origUrl = url;
			if ((result = resolveYouTubeURLs(origUrl)) != origUrl) {
				return result;
			} else if ((result = resolveVimeoURLs(origUrl)) != origUrl) {
				return result;
				//} else if((result=resolveGists(origUrl))!=origUrl){
				//  return result;
			} else if ((result = resolveImages(origUrl)) != origUrl) {
				return result;
			} else {
				return linkTo(url, url, true);
			}
		});
	}
	function resolveGists(str) {
		return str.replace(/http:\/\/gist\.github\.com\/([0-9]*)[&\w;=\+_\-]*/, function(url, id) {
			return '<script src="http://gist.github.com/' + id + '.js"></script>';
		});
	}
	function resolveImages(str) {
		return str.replace(/(^|[\n ])http(|s):\/\/.+(jpg|jpeg|gif|png|bmp)/i, function(token) {
			return '<p><a class="inline" href="' + token + '" target="_blank"><img class="inline" src="' + token + '" alt=""/></a></p>';
		});
	}
	function resolveYouTubeURLs(str) {
		return str.replace(/http:\/\/(www.)?youtube\.com\/watch\?v=([A-Za-z0-9._%-]*)[&\w;=\+_\-]*/, function(url, token1, id) {
			return linkTo(url, url, true) + '<p><object id="vid' + id + '" width="500" height="300">' + '<param name="movie" value="http://www.youtube.com/v/' + id + '?autoplay=1"></param>' + '<param name="wmode" value="transparent"></param>' + '<embed src="http://www.youtube.com/v/' + id + '?autoplay=0" type="application/x-shockwave-flash" wmode="transparent" ' + 'width="500" height="300"></embed></object></p>';
		});
	}
	function resolveVimeoURLs(str) {
		return str.replace(/http:\/\/(www.)?vimeo\.com\/([A-Za-z0-9._%-]*)[&\w;=\+_\-]*/, function(url, token1, id) {
			return linkTo(url, url, true) + '<p><object width="500" height="300">' + '<param name="movie" value="http://vimeo.com/moogaloop.swf?clip_id=' + id + '&amp;server=vimeo.com&amp;show_title=0&amp;show_byline=0&amp;show_portrait=0&amp;color=00adef&amp;fullscreen=1"></param>' + '<param name="allowfullscreen" value="true" />' + '<param name="allowscriptaccess" value="always" />' + '<embed src="http://vimeo.com/moogaloop.swf?clip_id=' + id + '&amp;server=vimeo.com&amp;show_title=0&amp;show_byline=0&amp;show_portrait=0&amp;color=00adef&amp;fullscreen=1" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" ' + 'width="500" height="300"></embed></object></p>';
		});
	}

  function formatXhrMsg(d,overideMsg) {
    if(overideMsg) {
      return overideMsg + " (" + d.xhr.status + " " + d.xhr.statusText + ")";
    } else {
      try {
        var sysMsg = $.evalJSON(d.xhr.responseText).message + " (" + d.xhr.status + " " + d.xhr.statusText + ")";
      } catch(e) {
        var sysMsg = d.xhr.status + " " + d.xhr.statusText;
      }
      return sysMsg;
    }
  }

	return {
		'linkTo': linkTo,
		'resolveURLs': resolveURLs,
		'timeAgoInWords': timeAgoInWords,
		'randBase32': randBase32,
    'formatXhrMsg': formatXhrMsg
	};
} ();

/* 
vim:ts=2:sw=2:expandtab
*/

