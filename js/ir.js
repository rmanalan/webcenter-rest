(function($) {
	// Dynamically load css
	//var lnk = document.createElement('link');
	//lnk.rel='stylesheet';
	//lnk.type='text/css';
	//lnk.href='/owccustom/css/base-ir.css';
	//document.getElementsByTagName('head')[0].appendChild(lnk);
	// Mint http://mint.us.oracle.com/wcmint
  if(location.hostname=="webcenter.us.oracle.com"){
    var mint = document.createElement('script');
    mint.type='text/javascript';
    mint.src='http://appslab-7.us.oracle.com/wcmint/?js';
    document.getElementsByTagName('head')[0].appendChild(mint);
  }
	$(function() {

		// http://ejohn.org/blog/javascript-array-remove
		function removeElemFromArray(arry, from, to) {
			var rest = arry.slice((to || from) + 1 || arry.length);
			arry.length = from < 0 ? arry.length + from: from;
			return arry.push.apply(arry, rest);
		}

		// Profile label => About
		if (/[Profile Gallery|Connections|Information|]$/.test($('title').text())) {
			$("div.xwk a[id='T:secondaryTabSet:2:tab::disclosureAnchor']").text('About');
		}

		// hide panel splitter
		$('div.irltregion').parent().next().hide();
		$('div.irltregion').parent().next().next().css('left', '197px');

    // hide skin personalization
    $('div[id=T:prefer:preferencesDialog] label:contains("Application Skin")').parent().parent().hide();

		// logo area size
		$('div[id*="pt_ps2::f"]').css('width', '211px');

		// padding around top right header links
		$('table[id*="pt_pgl7"]').css('padding', '8px 10px');

		$('table[id*="pt_pgl2"]').css('padding-right', '10px');

		// bump up content div when secondary tab is not there
		if ($('span.irsubtabs').html() != "") {
			$('span.irsubtabs').parent().next().css('top', '23px');
		}

		var switcher = $('div.irgroupswitcher');
		var switcherPosn = switcher.offset();
		switcher.appendTo('body:last').css({
			'top': switcherPosn.top,
			'left': switcherPosn.left + 5
		});
		$('<li id="managepages"></li>').appendTo('div.irmenu ul').append($('a[id*="managePagesLink"]'));
		$('li#managepages a').show();
		$($('a.irgroupsettings').parent()).insertAfter('li#managepages');

		var allSpaces = $('div.irgroupspaces ul li a');
		var recentSpaces = $('div.irrecentgroupspaces ul li a');

		var getImageUrl = function(d) {
			var srcUrl = $('img', d).attr('src');
			if (srcUrl) return srcUrl;
			else return "/owccustom/images/default.png";
		}

		var allSpaces = $.map(allSpaces, function(e, i) {
			var d = $(e);
			var imgUrl = getImageUrl(d);
			return {
				'name': d.text(),
				'url': d.attr('href'),
				'imgUrl': imgUrl
			}
		});

		var recentSpaces = $.map(recentSpaces, function(e, i) {
			var d = $(e);
			var imgUrl = getImageUrl(d);
			return {
				'name': d.text(),
				'url': d.attr('href'),
				'imgUrl': imgUrl
			}
		});

		// flatten recent and all spaces so that recent spaces
		// are ordered first
		$.each(recentSpaces.reverse(), function() {
			var rs = this;
			var match = $.grep(allSpaces, function(e) {
				return e.name == rs.name;
			});
			if (match.length > 0) {
				$.each(allSpaces, function(i, e) {
					if (this.name == match[0].name) {
						removeElemFromArray(allSpaces, i);
						allSpaces.unshift(match[0]);
					}
				});
			};
		});
		//var spacesMerged = recentSpaces.concat(allSpaces);
		var spacesMerged = allSpaces;

		var mainSwitcherContainer = $('<div id="switcher" class="hide"></div>');

		var homeSwitcherContainer = $('<ul id="homeswitcher" class="switch clearfix"></ul>');
		var homeAnchor = $('a.irhomespace');
		$('<li><div class="icon"><img src="/owccustom/images/Home.png" width="16px" alt="' + homeAnchor.text() + '"/></div><div class="gsitem"><a href="' + homeAnchor.attr('href') + '">' + homeAnchor.text() + '</a></div></li>').appendTo(homeSwitcherContainer);
		var browseGSAnchor = $('a.irbrowsegroupspaces');
		$('<li><div class="icon"><img src="/owccustom/images/application_view_icons.png" width="16px" alt="' + browseGSAnchor.text() + '"/></div><div class="gsitem"><a href="' + browseGSAnchor.attr('href') + '">' + browseGSAnchor.text() + '</a></div></li>').appendTo(homeSwitcherContainer);

		var gsSwitcherContainer = $('<ul id="gsswitcher" class="switch clearfix"></ul>');
		$.each(spacesMerged, function() {
			$('<li><div class="icon"><img src="' + this.imgUrl + '" width="16px" height="16px" alt="' + this.name + '"/></div><div class="gsitem"><a href="' + this.url + '">' + this.name + '</a></div></li>').appendTo(gsSwitcherContainer);
		});

		homeSwitcherContainer.appendTo(mainSwitcherContainer);
		if (spacesMerged.length > 0) {
			$('<h3 style="clear:both">Recently Visited Group Spaces</h3>').appendTo(mainSwitcherContainer);
			gsSwitcherContainer.appendTo(mainSwitcherContainer);
		};
		mainSwitcherContainer.appendTo(switcher);
		switcher.show();

		var cols = Math.floor(Math.sqrt(spacesMerged.length));
		mainSwitcherContainer.css('width', (cols * 171) + 60);

		var switcherEvent;
		switcher.hover(function() {
			switcherEvent = setTimeout(function() {
				mainSwitcherContainer.show();
			},
			250);
		},
		function() {
			clearTimeout(switcherEvent);
			mainSwitcherContainer.hide();
		});
	});
})(jQuery);
/* 
vim:ts=2:sw=2:expandtab
*/

