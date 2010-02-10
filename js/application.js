$(document).ajaxStart(function(){$('#loading-ind').show()}).ajaxStop(function(){$('#loading-ind').hide()});

var dump;
$(function(){
  $('#pub1-uploader').uploadify({
    'wmode' : 'transparent',
    'hideButton' : true,
    'uploader' : 'http://weblogic-stage.us.oracle.com/js/uploadify.swf',
    'cancelImg' : '../images/cancel.png',
    'script' : 'http://localhost:9393',
    'fileDataName' : 'file',
    'scriptAccess' : 'always',
    'height' : 16,
    'width' : 70,
//    'sizeLimit' : 2097152,
    'multi' : true,
    'auto' : true,
    'onComplete' : function(event,queueID,fileObj,response,data) {
      console.log(response);
    },
    'onError': function (event, queueID ,fileObj, errorObj) {
      dump = {'event':event, 'queueID': queueID, 'fileObj' : fileObj, 'errorObj' : errorObj};
      console.log(errorObj.info)
    }
  });

  // Set up placeholder text for publisher
  if (!("placeholder" in document.createElement("textarea"))) {
    var placeholder = $('#pub-text').attr('placeholder');
    $('#pub-text').val(placeholder)
      .focus(function(){if(this.value==placeholder)$(this).val('')})
      .blur(function(){if(this.value.replace(' ')=='')$(this).val(placeholder)});
  }
  if($.browser.msie) {
    $('#publisher, #pub1-text textarea, #share').corner({          
      tl: { radius: 5 },
      tr: { radius: 5 },
      bl: { radius: 5 },
      br: { radius: 5 },
      antiAlias: true,
      autoPad: false
    });
  };

  function initApp(callback){
    webCenter.init({},function(){
      // Listen for <enter> key inside the publisher textarea
      $('#pub-text').bind('keyup',function(e){
        if(e.keyCode==13){
          $('#pub-form').submit();
          return false;
        }
      })

      $("textarea.autoresize").autoResize({'extraSpace':0});

      // Infinite scroll pager
      $(window).scroll(function(){
        if($(window).scrollTop() == $(document).height() - $(window).height()){
          renderStream($('#stream').data('currentStreamUrl'), activityStream.currentActivityId(),false);
        }
       });

      $('#refresh').bind('click',function(){
        renderStream($('#stream').data('currentStreamUrl'),0,true);
        return false;
      });

      // Sets url for default stream
      $('.lfopts:first').attr('value',
         webCenter.getResourceURL(webCenter.resourceIndex.links,
           'urn:oracle:webcenter:activities:stream',true));

      $('#groupfilter').bind('change',function(e){
        location = '#/group/' + $('option:selected',this).text();
      });

      // Sets url for default stream
      $('#grouppub option:first').attr('value',
          webCenter.getResourceURL(webCenter.resourceIndex.links,
            'urn:oracle:webcenter:messageBoard',false));
      $('#groupfilter option:first').attr('value',
          webCenter.getResourceURL(webCenter.resourceIndex.links,
            'urn:oracle:webcenter:activities:stream',false));

      currentUser.getSpaces(function(){
        if(currentUser.spaces.length==0) {
          callback();
          return;
        }
        var filterData = {
          'groupopt' : $.map(currentUser.spaces,function(d){
            if(!d.isOffline) {
              return {
                'groupname' : d.displayName,
                'groupval' : webCenter.getResourceURL(d.links,'urn:oracle:webcenter:activities:stream',true),
                'groupmsgboard' : webCenter.getResourceURL(d.links,'urn:oracle:webcenter:messageBoard',false),
                'cmuploadurl' : webCenter.getResourceURL(d.links,'urn:oracle:webcenter:cmis:folder',false)
              };
            };
          })
        };
        $('#grouppub option:first').clone(true).appendTo('#grouppub').autoRender(filterData);
        $('#groupfilter option:first').clone(true).appendTo('#groupfilter').autoRender(filterData);
        callback(); 

      });

    });

  };

  function renderStream(url,startIndex,clearActivities){
    activityStream.getActivities(url,startIndex,function(data){
      // Store off current stream url for paging purposes
      $('#stream').data('currentStreamUrl',url);

      if(data.items.length==0) {
        moreActivities = false;
        return;
      }

      var bindData = {
        'messages' : $.map(data.items, function(d){
          var detail = d.detail ? d.detail : "";
          return {
            'id' : activityStream.nextActivityId(), 
            'avatar' : userProfile.avatarSmall(webCenter.getTemplateItem(d.templateParams.items, 'user').guid),
            'name' : webCenter.getTemplateItem(d.templateParams.items,'user').displayName,
            'url' : webCenter.getResourceURL(webCenter.getTemplateItem(d.templateParams.items, 'user').links,
              'urn:oracle:webcenter:people:person'),
            'activity' : webCenter.resolveBindItems(d.message, d.templateParams.items),
            'detail' : detail,
            'reltime' : utils.timeAgoInWords(d.createdDate)
            }
          })
      };
      if(clearActivities){
        var activityTemplate = $('li.messages:first');
        $('ol.results').empty().append(activityTemplate);
      }
      var template = $('li.messages:last').clone(true).appendTo('ol.results');
      template.autoRender(bindData).removeClass('hide');
    });
  };

  // App Controller
  var activityStreamApp = $.sammy(function(app){
    var appStarted=false;
    var lastLocation;
    app.element_selector = '#main-content';


    app.before(function(c){
      var currLocation = app.getLocation();
      if(!appStarted){
        initApp(function(){
          appStarted = true;
					// Bug: needed to render the stream... shouldn't have to do this since
					// activityStreamApp.run('#/') already does it
					app.runRoute('get','#/')
        });
				return false;
			}
    	app.trigger('update-filters', currLocation);
    });

    app.after(function(){
      // Save off last location
      lastLocation = app.getLocation();
    });

    app.get('#/', function(c){
      renderStream(webCenter.resourceIndex.links, 0,true);
    });

    app.get('#/group/:name',function(c){
      var groupName = this.params['name'];	  
      if(groupName=='My connections'){
        this.redirect('#/');
      } else {
        var url = $.grep($('#groupfilter option'),function(n){return $(n).text()==decodeURI(groupName)})[0].value;
        var activityTemplate = $('li.messages:first');
        $('ol.results').empty().append(activityTemplate);
        renderStream(url,0,true);
      }
    });

    app.post('#/message',function(c){
      var msg = this.params['body'];
      if(msg == "" || msg == "Share something...") return false; 
      $.ajax({
        url: this.params['puburl'],
        type: "post",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({'body': utils.resolveURLs(msg)}),
        success: function(d){
          $('#pub-text').val('').css('height',18);
          var profileUrl = webCenter.getResourceURL(d.author.links,
            'urn:oracle:webcenter:spaces:profile');
          var data = {
              'messages' : [{
                'id' : activityStream.nextActivityId(),
                'avatar' : userProfile.avatarSmall(d.author.guid),
                'name' : d.author.displayName,
                'url' : profileUrl,
                'activity' : utils.linkTo(profileUrl, d.author.displayName) + ' posted a message',
                'detail' : d.body,
                'reltime' : utils.timeAgoInWords(d.created)
              }]
            };
          // don't re-render the entire stream, just prepend the latest to the top
          $('li.messages:first').clone(true).prependTo('ol.results')
            .autoRender(data).show(300);
        }
      });
    });

    app.bind('update-filters',function(e,currLocation){
      if(/\#\/group\//.test(currLocation)){
        var selectedVal = currLocation.split('#/group/')[1].split('/')[0];
        $('#groupfilter option').each(function(i,n){
          var opt = $(n);
          if(opt.text()==selectedVal){
            opt.attr('selected','1');
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

