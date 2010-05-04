/**
 * WebCenter Activity Stream main for IR
 * Released April 2010
 * Rich Manalang (rich.manalang@oracle.com)
 **/
(function($) { //seal it up
	//	$(function() { //wait for load
	var settings = {
    applyActivityTypeBlackList: true,
		activityTypeBlacklist: {
      'delete-document': true,
      'deleteGroupSpace': true,
      'editPage': true,
      'deletePage': true,
      'update-document': true,
      'editListRow': true,
      'addListRow': true,
      'updatePhoto': true,
      'inviteForConnection': true,
      'changeGroupSpaceRole': true,
      'updateAnnouncement': true,
    }
	}

	var infScrollActive = false;

	// A shitty fucking hack to tell IE never to cache ajax responses
	$.ajaxSetup({
		'cache': false
	});

	$('#pub-loading').hide();

	$(document).ajaxStart(function() {
		$('#loading-ind').show();
	}).ajaxStop(function() {
		$('#loading-ind').hide();
	}).ajaxError(function() {
		$('#loading-ind').hide();
	});

	// Set up placeholder text for publisher
	if (! ("placeholder" in document.createElement("textarea"))) {
		var placeholder = $('#pub-text').attr('placeholder');
		$('#pub-text').val(placeholder).focus(function() {
			if (this.value == placeholder) $(this).val('')
		}).blur(function() {
			if (this.value.replace(' ') == '') $(this).val(placeholder)
		});
	}

	// Set up attachment controls
	$('a#pub1-attachment').bind('click', function() {
		$('#pub-form').attr('action', '#/upload');
		$(this).hide();
		$('#pub1-attachment-descr').hide()
		$('#pub1-upload-field').removeClass('hide');
	});
	$('#pub1-upload-field a.cancel').bind('click', function() {
		$('#pub-form').attr('action', '#/message');
		$('#pub1-upload-field input').val('');
		$('#pub1-upload-field').addClass('hide');
		$('a#pub1-attachment, #pub1-attachment-descr').show();
		return false;
	});

	// IE specific UI tweaks
	if ($.browser.msie) {
		$('#publisher').corner({
			tl: {
				radius: 5
			},
			tr: {
				radius: 5
			},
			bl: {
				radius: 5
			},
			br: {
				radius: 5
			},
			antiAlias: true,
			autoPad: false
		});
	};

	function pubMessage(m) {
		$('#msg').html(m).slideDown();
		setTimeout(function() {
			$('#msg').slideUp();
		},
		7000);
	}

	function initApp(callback) {
		webCenter.init(function(resp) {
			if (resp.error) {
				if (resp.xhr.status == 403) {
					$.jStorage.flush();
					location.reload();
				} else if (resp.xhr.status == 401) {
					$('#msg').html('You are not loged in... please <a href="/webcenter/wcAuthentication/?login=true&success_url=/../owccustom/index.html">login</a> first').slideDown();
				}
				return false;
			}

			// Listen for <enter> key inside the publisher textarea
			$('#pub-text').bind('keydown', function(e) {
				if (e.keyCode == 13) {
					$('#pub-form').submit();
					return false;
				}
			})

			// Auto expand the publisher
			$("textarea.autoresize").autoResize({
				'extraSpace': 0
			});

			// Infinite scroll pager
			$(window).scroll(function() {
				if (($(window).scrollTop() > $(document).height() - $(window).height() - 400) && ! infScrollActive) {
					infScrollActive = true
					renderStream($('#stream').data('currentStreamUrl'), webCenter.activityStream.currentActivityId() + 1, false);
				}
			});

			// Refresh button
			$('#refresh').bind('click', function() {
				renderStream($('#stream').data('currentStreamUrl'), 0, true);
				return false;
			});

			// Sets url for default stream
			$('.lfopts:first').attr('value', webCenter.getResourceURL(webCenter.resourceIndex.links, 'urn:oracle:webcenter:activities:stream', true));

			$('#groupfilter').bind('change', function(e) {
				if (this.value) var spaceName = $.evalJSON(this.value).spaceName;
				else var spaceName = escape($('option:selected', this).text());

				location.hash = ['#/group/', spaceName].join('');
			});

			// Sets url for default stream
			$('#grouppub option:first').attr('value', $.toJSON({
				'msgBoard': webCenter.getResourceURL(webCenter.resourceIndex.links, 'urn:oracle:webcenter:messageBoard', false),
				'spaceName': null
			}));

			// Sets url for default stream filter
			$('#groupfilter option:first').attr('value', webCenter.getResourceURL(webCenter.resourceIndex.links, 'urn:oracle:webcenter:activities:stream', false));

			// Adds click handler to advance slide by one
			$('img.slide').live('click', function() {
				var src = $(this).parent().next().find('img').attr('src');
				var slides = $(this).parents('div.swvp');
				slides.next().find(['img[src*="', src.split('/').slice( - 1)[0], '"]'].join('')).parent().trigger('click');
			});

			webCenter.currentUser.getSpacesPaged(0, 1000, function(d) {
				if (d.error) {
					pubMessage(utils.formatXhrMsg(d));
					callback();
					return;
				}
				if (webCenter.currentUser.spaces && webCenter.currentUser.spaces.length == 0) {
					callback();
					return;
				}
				for (var i = 0; i < d.length; i++) {
					var o = d[i];
					if (!o.isOffline) {
						var urls = $.toJSON({
							'msgBoard': webCenter.getResourceURL(o.links, 'urn:oracle:webcenter:messageBoard', false),
							'asUrl': webCenter.getResourceURL(o.links, 'urn:oracle:webcenter:activities:stream', true),
							'spaceName': o.name
						});

						// populate the publish to drop down
						var pubOption = $('#grouppub option:first').clone().val(urls).text(o.displayName);
						$('#grouppub').append(pubOption);
						$('#grouppub option:first').attr('selected', 'true');

						// populate the view by drop down
						var viewByOption = $('#groupfilter option:first').clone().val(urls).text(o.displayName);
						$('#groupfilter').append(viewByOption);
						$('#groupfilter option:first').attr('selected', 'true');
					}
				};

				// not sure we need to wait for the spaces api to return before we can render the stream
				//callback();
			});
			callback();
		});
	};

	function renderStream(url, startIndex, clearActivities, callback) {
		webCenter.activityStream.getActivities(url, startIndex, function(data) {
			webCenter.activityStreamResults = data;
			if (data.error) {
				if (data.xhr.status == 403) {
					$.jStorage.flush();
					location.reload();
				}
				pubMessage(utils.formatXhrMsg(data));
				return;
			}

			// Store off current stream url for paging purposes
			$('#stream').data('currentStreamUrl', url);

			if (data.items && data.items.length == 0 && startIndex == 0) {
				$('#no-activities').removeClass('hide');
				$('table.results').hide();
				moreActivities = false;
				return;
			} else {
				$('#no-activities').addClass('hide');
				$('table.results').show();
			}

			var as="";
			for (var i = 0; i < data.items.length; i++) {
				var d = data.items[i];
 				var actId = webCenter.activityStream.nextActivityId();
       
        // filter out unwanted activity types
				if (settings.applyActivityTypeBlackList && settings.activityTypeBlacklist[d.activityType]) continue;

				var activitySummary = webCenter.resolveBindItems(d);
				var detail = d.detail ? d.detail: "";
				if (d.activityType == 'create-document') {
					// inline images
					var image = $.grep($(activitySummary).filter('a'), function(e) {
						return /\.(jpg|jpeg|gif|png)$/i.test($(e).text())
					});
					if (image[0]) {
						detail = [detail,'<p>', '<a class="inline" href="', 
              $(image[0]).attr('href'), '" target="_blank"><img class="inline hide" src="',
              $(image[0]).attr('href'), '" /></a></p>'].join('');
					} else {
						// inline ppts
						var ppt = $.grep($(activitySummary).filter('a'), function(e) {
							return /\.ppt$|\.pptx$/i.test($(e).text())
						});
						if (ppt[0] && ! $.browser.msie) {
							var ucmid = $(ppt[0]).attr('rel').split(':').splice( - 1);
							var dynConvUrl = [webCenter.settings.dynConverterUri, ucmid].join('');
							$.ajax({
								url: dynConvUrl,
								method: 'get',
								error: function(x, t, e) {
									// ignoring 403s for now
								},
								success: function(d) {
									var slideImages = $('img', $(d));
									var slides = "";
									for (var i = 0; i < slideImages.length; i++) {
										slides = [slides,'<li><img class="slide" src="', $(slideImages[i]).attr('src'),
                      '" width="500" height="375" /></li>'].join('');
									};
									slides = ['<div id="det-', actId, '" class="swvp"><ul>', slides, '</ul></div>'].join();
									$(slides).appendTo(['#act-',actId,' div.detail'].join('')).slideViewerPro({
										galBorderWidth: 1,
										galBorderColor: '#ccc',
										thumbsBorderWidth: 1,
										thumbsTopMargin: 8,
										thumbsBorderColor: '#ccc',
										thumbs: 4,
										thumbsBorderOpacity: .7,
										leftButtonInner: '&laquo;',
										rightButtonInner: '&raquo;',
										thumbsPercentReduction: 22
									});
								}
							});
						};
					};
				};

				as = [as,'<tr id="act-', actId, 
          '" class="messages"><td class="avatar"><img class="avatar" width="50" height="50" src="',
          webCenter.userProfile.getAvatarUrl(d),'"/></td><td class="activity"><span class="activity">',
          activitySummary,'</span> <span class="reltime">', utils.timeAgoInWords(d.createdDate),
          '</span><div class="detail">', detail, '</div></td></tr>'].join('');
			};
			if (clearActivities) {
				$('table.results').empty().append($(as));
				$('table.results *').show();
			} else {
				$('table.results').append($(as));
				$('table.results *').show();
			}

			// make sure inlined images aren't too big
			$('img.inline').load(function() {
				var img = $(this)
				if (img.width() > 570) {
					img.width(570);
				};
				img.fadeIn();
			});
			infScrollActive = false;
			if (callback) callback();
		});
	};

	// App Controller
	var activityStreamApp = $.sammy(function(app) {
		var appStarted = false;
		var lastLocation;
		app.element_selector = '#main-content';

		app.before(function(c) {
			var currLocation = app.getLocation();
			if (!appStarted) {
				initApp(function() {
					appStarted = true;
					// Bug: needed to render the stream... shouldn't have to do this since
					// activityStreamApp.run('#/') already does it
					app.runRoute('get', currLocation)
				});
				return false;
			}
			app.trigger('update-filters', currLocation);
		});

		app.after(function() {
			// Save off last location
			lastLocation = app.getLocation();
		});

		app.get('#/', function(c) {
			renderStream(webCenter.currentUser.links, 0, true);
		});

		app.get('#/group/:name', function(c) {
			// TODO this won't work for user's who don't belong to a space.
			// Need to come up with a better way to access the spaces api
			// for users who are not members of a space
			var groupName = this.params['name'];
			if (groupName == 'My connections') {
				this.redirect('#/');
			} else {
				var checkIfSpacesLoaded = function() {
					if (webCenter.currentUser.spaces) {
						var d = $.grep($('#groupfilter option'), function(n) {
							try {
								return $.evalJSON($(n).val()).spaceName == decodeURI(groupName)
							} catch(e) {}
						})[0];
						$('#pub1-share span').text(["Share something with ", d.innerHTML].join(''));
						$('#pub1-share select').hide();
						var url = $.evalJSON(d.value).asUrl;
						var activityTemplate = $('li.messages:first');
						$('ol.results').empty().append(activityTemplate).hide();
						renderStream(url, 0, true);
						app.trigger('update-filters', app.getLocation());
					} else {
						setTimeout(checkIfSpacesLoaded, 100);
					};
				};
				checkIfSpacesLoaded();
			}
		});

		app.post('#/message', function(c) {
			var msg = this.params['body'].replace(/^\s+|\s+$/g, '');
			if (msg == "" || msg == "Share something...") return false;
			webCenter.messageBoard.postMessage($.evalJSON(this.params['puburl']).msgBoard, msg, function(d) {
				if (d.error) {
					if (d.xhr.status == 403) pubMessage(utils.formatXhrMsg(d, 'You do not have access to contribute to this group space. Please contact a group space moderator.'));
					else pubMessage();
					return;
				}
				$('#pub-text').val('').css('height', 18);
				renderStream($('#stream').data('currentStreamUrl'), 0, true);
			});
		});

		app.post('#/upload', function(c) {
			$('#msg').html('').hide();
			var params = this.params;
			var msg = params['body'];
			msg = (msg == "Share something...") ? "": msg;
			var fileUpload = $('#pub-form input[name="fileUpload"]').val();
			if (!fileUpload) {
				pubMessage("Don't forget to attach a file");
				$('#pub-form').attr('action', '#/upload');
				return false;
			}
			$('#pub-loading').show();

			// Resolve CMIS URL to post to
			var cmisName = $.evalJSON(params['puburl']).spaceName;
			var UCMPath = cmisName ? ["/Spaces/", cmisName].join(''): null;
			webCenter.getCmisFolderUrl(UCMPath, function(url) {

				// Prepare uploader iframe
				var strName = ["uploader", (new Date()).getTime()].join('');
				var iFrame = $(['<iframe name="', strName, '" class="hide" />'].join(''));
				iFrame.load(function() {
					var ifUploadBody = window.frames[strName].document;
					// shitty way of detecting that a post to an iframe was successful
					if ($.browser.msie || $.browser.webkit) var contentUrl = $(ifUploadBody).text();
					else var contentUrl = ifUploadBody.getElementsByTagName('location-header');
					if (contentUrl.length > 0) {
						$('#msg').html('');
						$('#pub-text').val('').css('height', 18);
						$('#pub1-upload-field a.cancel').trigger('click');
						renderStream($('#stream').data('currentStreamUrl'), 0, true, function() {
							$('#msg').html('').hide();
							$('#pub-loading').hide();
							setTimeout(function() {
								iFrame.remove()
							},
							100);
						});
					} else {
						$('#pub-form').attr('action', '#/upload');
						$('#pub-loading').hide();
						pubMessage('Something went wrong with your upload, probably a duplicate file or no access to upload. Check those first. Then send a note to <a href="mailto:irdevadmin_ww@oracle.com?subject=[WebCenter] Error with posting file through publisher">irdevadmin_ww@oracle.com</a>.');
					}
				});
				$('body:last').append(iFrame);

				$('#pub-form input[name="contentId"]').val(utils.randBase32());
				$('#pub-form input[name="comments"]').val(msg);
				$('#pub-form input[name="simpleResponse"]').val(true);
				$('#pub-form').attr('action', url).attr('target', strName).submit();
			});
		});

		app.bind('update-filters', function(e, currLocation) {
			if (/\#\/group\//.test(currLocation)) {
				var selectedVal = unescape(currLocation.split('#/group/')[1].split('/')[0]);
				var filterOpts = $('#groupfilter option');
				for (var i = 0; i < filterOpts.length; i++) {
					var n = filterOpts[i];
					var opt = $(n);
					var spaceName;
					try {
						spaceName = $.evalJSON(opt.val()).spaceName
					} catch(e) {};
					if (spaceName == selectedVal) {
						opt.attr('selected', '1');
					} else {
						opt.removeAttr('selected');
					}
				};
				var groupOpts = $('#grouppub option');
				for (var i = 0; i < groupOpts.length; i++) {
					var n = groupOpts[i];
					var opt = $(n);
					var spaceName;
					try {
						spaceName = $.evalJSON(opt.val()).spaceName
					} catch(e) {};
					if (spaceName == selectedVal) {
						opt.attr('selected', '1');
					} else {
						opt.removeAttr('selected');
					}
				};
			};
		});

	});
	activityStreamApp.run('#/');
	//	});
})(jQuery);

/* 
 vim:ts=2:sw=2:expandtab
 */

