var dump;
$(function() {
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

  $('#pub-loading, #msg').hide();

  // Set up attachment controls
  $('a#pub1-attachment').bind('click', function() {
    $('#pub-form').attr('action', '#/upload');
    $(this).hide();
    $('#pub1-attachment-descr').hide()
    $('#pub1-upload-field').removeClass('hide');
  });
  $('#pub1-upload-field button').bind('click', function() {
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
    webCenter.init({
      'perPage': 20
    },
    function(success) {
      if (!success) {
        $('#msg').html('You are not loged in... please <a href="/webcenter/wcAuthentication/?login=true&success_url=/../owccustom/index.html">login</a> first').show();
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
        if ($(window).scrollTop() == $(document).height() - $(window).height()) {
          renderStream($('#stream').data('currentStreamUrl'), activityStream.currentActivityId() + 1, false);
        }
      });

      $('img.playvid').live('click', function() {
        $(this).parent().hide().next().removeClass('hide');
      })

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
      $('#grouppub option:first').attr('value', JSON.stringify({
        'msgBoard': webCenter.getResourceURL(webCenter.resourceIndex.links, 'urn:oracle:webcenter:messageBoard', false),
        'spaceName': null
      }));

      // Sets url for default stream filter
      $('#groupfilter option:first').attr('value', webCenter.getResourceURL(webCenter.resourceIndex.links, 'urn:oracle:webcenter:activities:stream', false));

      currentUser.getSpaces(function(d) {
        if (currentUser.spaces.length == 0) {
          callback();
          return;
        }
        $.each(d, function(i, o) {
          if (!o.isOffline) {
            var urls = JSON.stringify({
              'msgBoard': webCenter.getResourceURL(o.links, 'urn:oracle:webcenter:messageBoard', false),
              'spaceName': o.name
            });

            // populate the publish to drop down
            var pubOption = $('#grouppub option:first').clone().val(urls).text(o.displayName);
            $('#grouppub').append(pubOption);

            // populate the view by drop down
            var asUrl = webCenter.getResourceURL(o.links, 'urn:oracle:webcenter:activities:stream', true);
            var viewByOption = $('#groupfilter option:first').clone().val(asUrl).text(o.displayName);
            $('#groupfilter').append(viewByOption);
          }
        });

        // not sure we need to wait for the spaces api to return before we can render the stream
        //callback();
      });
      callback();
    });
  };

  function renderStream(url, startIndex, clearActivities, callback) {
    activityStream.getActivities(url, startIndex, function(data) {
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
        var actId = activityStream.nextActivityId();
        if (d.activityType == 'create-document') {
          // inline images
          var image = $.grep($(activitySummary).filter('a'), function(e) {
            return /\.(jpg|gif|png)$/i.test($(e).text())
          });
          if (image[0]) {
            detail += '<p>' + '<a class="inline" href="' + $(image[0]).attr('href') + '" target="_blank">' + '<img class="inline hide" src="' + $(image[0]).attr('href') + '" />' + '</a>' + '</p>';
          } else {
            // inline ppts
            var ppt = $.grep($(activitySummary).filter('a'), function(e) {
              return /\.ppt$/i.test($(e).text())
            });
            if (ppt[0]) {
              var ucmid = $(ppt[0]).attr('rel').split(':').splice( - 1);
              var dynConvUrl = webCenter.settings.dynConverterUri + ucmid;
              $.get(dynConvUrl, function(d) {
                var slideImages = $('img', $(d));
                var slides = "";
                slideImages.each(function() {
                  slides += '<li><img src="' + $(this).attr('src') + '" width="350" height="262" /></li>';
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
                  thumbsPercentReduction: 15
                });
                $('img', slides).click(function() {
                  var src = $(this).parent().next().find('img').attr('src');
                  slides.next().find('img[src*="' + src + '"]').parent().trigger('click');
                });
              });
            };
          };
        };

        as += '<tr id="act-' + actId + '" class="messages">' + '<td class="avatar">' + '<img class="avatar" src="' + userProfile.avatarSmall(webCenter.getTemplateItem(d.templateParams.items, 'user').guid) + '"/>' + '</td>' + '<td class="activity">' + '<span class="activity">' + activitySummary + '</span> ' + '<span class="reltime">' + utils.timeAgoInWords(d.createdDate) + '</span>' + '<div class="detail">' + detail + '</div>' + '</td>' + '</tr>';
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
      renderStream(currentUser.links, 0, true);
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
        url: JSON.parse(this.params['puburl']).msgBoard,
        type: "post",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
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
      var fileUpload = $('#pub-form input[name="fileUpload"]').val();
      if (!fileUpload) {
        pubMessage("Don't forget to attach a file");
        $('#pub-form').attr('action', '#/upload');
        return false;
      }
      $('#pub-loading').show();

      // Resolve CMIS URL to post to
      var cmisName = JSON.parse(params['puburl']).spaceName;
      var UCMPath = cmisName ? "/Spaces/" + cmisName: null;
      currentUser.getCmisFolderUrl(UCMPath, function(url) {

        // Prepare uploader iframe
        var strName = ("uploader" + (new Date()).getTime());
        var iFrame = $('<iframe name="' + strName + '" class="hide" />');
        iFrame.load(function() {
          var ifUploadBody = window.frames[strName].document;
          var contentUrl = $(ifUploadBody).text();
          if (/^http/.test(contentUrl)) {
            $('#msg').html('');
            var url = contentUrl;
            $('#pub-text').val('').css('height', 18);
            $('#pub1-upload-field button').trigger('click');
            renderStream($('#stream').data('currentStreamUrl'), 0, true, function() {
              $('#msg').html('').hide();
              $('#pub-loading').hide();
              setTimeout(function() {
                iFrame.remove()
              },
              100);
            });
          } else if (contentUrl != '' && ! /^http/.test(contentUrl)) {
            $('#pub-form').attr('action', '#/upload');
            pubMessage("A duplicate file was found. Sorry, we can't handle dups right now.");
            $('#pub-loading').hide();
          }
        });
        $('body:last').append(iFrame);

        $('#pub-form input[name="contentId"]').val(utils.randBase32());
        $('#pub-form input[name="comments"]').val(msg);
        $('#pub-form input[name="simpleResponse"]').val(true);
        // ugly hack required after Sammy 0.5.1 upgrade... needed to move the form
        // into the iframe in order to avoid Sammy from handling the post route
        $('#pub-form').attr('action', url).attr('target', strName).clone(true).appendTo(iFrame).submit();
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

/* 
 vim:ts=2:sw=2:expandtab
 */

