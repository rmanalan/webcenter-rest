(function($) { //seal it up
	$(function() { //wait for load

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
				$('#msg').fadeOut(1000);
			},
			2000);
		}

		function initApp(callback) {
			webCenter.init(function(success) {
				if (!success) {
					$('#msg').html('You are not loged in... please <a href="/webcenter/wcAuthentication/?login=true&success_url=/../owccustom/index.html">login</a> first').slideDown();
					return false;
				}

				// Listen for <enter> key inside the publisher textarea
				$('#pub-text').bind('keyup', function(e) {
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
					if (($(window).scrollTop() > $(document).height() - $(window).height() - 200) && !infScrollActive) {
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
					location.hash = '#/group/' + escape($('option:selected', this).text());
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
					slides.next().find('img[src*="' + src.split('/').slice( - 1)[0] + '"]').parent().trigger('click');
				});

				webCenter.currentUser.getSpacesPaged(0, 1000, function(d) {
					if (webCenter.currentUser.spaces && webCenter.currentUser.spaces.length == 0) {
						callback();
						return;
					}
					$.each(d, function(i, o) {
						if (!o.isOffline) {
							var urls = $.toJSON({
								'msgBoard': webCenter.getResourceURL(o.links, 'urn:oracle:webcenter:messageBoard', false),
								'spaceName': o.name
							});

							// populate the publish to drop down
							var pubOption = $('#grouppub option:first').clone().val(urls).text(o.displayName);
							$('#grouppub').append(pubOption);
							$('#grouppub option:first').attr('selected', 'true');

							// populate the view by drop down
							//var asUrl = webCenter.getResourceURL(o.links, 'urn:oracle:webcenter:activities:stream', true);
							//var viewByOption = $('#groupfilter option:first').clone().val(asUrl).text(o.displayName);
							//$('#groupfilter').append(viewByOption);
							//$('#groupfilter option:first').attr('selected','true');
						}
					});

					// not sure we need to wait for the spaces api to return before we can render the stream
					//callback();
				});
				callback();
			});
		};

		function renderStream(url, startIndex, clearActivities, callback) {
			webCenter.activityStream.getActivities(url, startIndex, function(data) {
				// Store off current stream url for paging purposes
				$('#stream').data('currentStreamUrl', url);

				if (data.items.length == 0 && startIndex == 0) {
					$('#no-activities').removeClass('hide');
					$('table.results').hide();
					moreActivities = false;
					return;
				} else {
					$('#no-activities').addClass('hide');
					$('table.results').show();
				}

				var as;
				$.each(data.items, function(i, d) {
					var activitySummary = webCenter.resolveBindItems(d);
					var detail = d.detail ? d.detail: "";
					var actId = webCenter.activityStream.nextActivityId();
					if (d.activityType == 'create-document') {
						// inline images
						var image = $.grep($(activitySummary).filter('a'), function(e) {
							return /\.(jpg|jpeg|gif|png)$/i.test($(e).text())
						});
						if (image[0]) {
							detail += '<p>' + '<a class="inline" href="' + $(image[0]).attr('href') + '" target="_blank">' + '<img class="inline hide" src="' + $(image[0]).attr('href') + '" />' + '</a>' + '</p>';
						} else {
							// inline ppts
							var ppt = $.grep($(activitySummary).filter('a'), function(e) {
								return /\.ppt$|\.pptx$/i.test($(e).text())
							});
							if (ppt[0] && ! $.browser.msie) {
								var ucmid = $(ppt[0]).attr('rel').split(':').splice( - 1);
								var dynConvUrl = webCenter.settings.dynConverterUri + ucmid;
								$.get(dynConvUrl, function(d) {
									var slideImages = $('img', $(d));
									var slides = "";
									slideImages.each(function() {
										slides += '<li><img class="slide" src="' + $(this).attr('src') + '" width="500" height="375" /></li>';
									});
									slides = '<div id="det-' + actId + '" class="swvp"><ul>' + slides + '</ul></div>';
									$(slides).appendTo('#act-' + actId + ' div.detail').slideViewerPro({
										galBorderWidth: 1,
										galBorderColor: '#ccc',
										thumbsBorderWidth: 1,
										thumbsTopMargin: 8,
										thumbsBorderColor: '#ccc',
										thumbs: 5,
										thumbsBorderOpacity: .7,
										leftButtonInner: '&laquo;',
										rightButtonInner: '&raquo;',
										thumbsPercentReduction: 16
									});
								});
							};
						};
					};

					as += '<tr id="act-' + actId + '" class="messages">' + '<td class="avatar">' + '<img class="avatar" width="50" height="50" src="' + webCenter.userProfile.avatarSmall(webCenter.getTemplateItem(d.templateParams.items, 'user').guid) + '"/>' + '</td>' + '<td class="activity">' + '<span class="activity">' + activitySummary + '</span> ' + '<span class="reltime">' + utils.timeAgoInWords(d.createdDate) + '</span>' + '<div class="detail">' + detail + '</div>' + '</td>' + '</tr>';
				});
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
						app.runRoute('get', '#/')
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
				var groupName = this.params['name'];
				if (groupName == 'My connections') {
					this.redirect('#/');
				} else {
					var url = $.grep($('#groupfilter option'), function(n) {
						return $(n).text() == decodeURI(groupName)
					})[0].value;
					var activityTemplate = $('li.messages:first');
					$('ol.results').empty().append(activityTemplate).hide();
					renderStream(url, 0, true);
				}
			});

			app.post('#/message', function(c) {
				var msg = this.params['body'];
				if (msg == "" || msg == "Share something...") return false;
				$.ajax({
					url: $.evalJSON(this.params['puburl']).msgBoard,
					type: "post",
					dataType: "json",
					contentType: "application/json",
					data: $.toJSON({
						'body': utils.resolveURLs(msg)
					}),
					success: function(d) {
						$('#pub-text').val('').css('height', 18);
						renderStream($('#stream').data('currentStreamUrl'), 0, true);
					}
				});
			});

			app.post('#/upload', function(c) {
				$('#msg').html('').hide();
				var params = this.params;
				var msg = params['body'];
        msg = (msg == "Share something...") ? "" : msg;
				var fileUpload = $('#pub-form input[name="fileUpload"]').val();
				if (!fileUpload) {
					pubMessage("Don't forget to attach a file");
					$('#pub-form').attr('action', '#/upload');
					return false;
				}
				$('#pub-loading').show();

				// Resolve CMIS URL to post to
				var cmisName = $.evalJSON(params['puburl']).spaceName;
				var UCMPath = cmisName ? "/Spaces/" + cmisName: null;
				webCenter.getCmisFolderUrl(UCMPath, function(url) {

					// Prepare uploader iframe
					var strName = ("uploader" + (new Date()).getTime());
					var iFrame = $('<iframe name="' + strName + '" class="hide" />');
					iFrame.load(function() {
						var ifUploadBody = window.frames[strName].document;
            // shitty way of detecting that a post to an iframe was successful
            if($.browser.msie || $.browser.webkit) var contentUrl = $(ifUploadBody).text();
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
							pubMessage("A duplicate file was found. Sorry, we can't handle dups right now.");
							$('#pub-loading').hide();
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
					$('#groupfilter option').each(function(i, n) {
						var opt = $(n);
						if (opt.text() == selectedVal) {
							opt.attr('selected', '1');
						} else {
							opt.removeAttr('selected');
						}
					})
				};
			});

		});
		activityStreamApp.run('#/');
	});
})(jQuery);

/* 
 vim:ts=2:sw=2:expandtab
 */


