$(document).ajaxStart(function(){$('#loading-ind').show()}).ajaxStop(function(){$('#loading-ind').hide()});

$(function(){
  function initApp(callback){
    webCenter.init({'port':apiPort},function(){
      // show who's logged in
      $('ul.headnav li').autoRender({
        'username' : currentUser.name.formatted,
        'url' : webCenter.getResourceURL(currentUser.links,
          'urn:oracle:webcenter:spaces:profile',false)
      }).show();

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

      $('#listfilter').bind('change',function(e){
        location = '#/list/' + $('option:selected',this).text();
      });

      // Sets url for default stream
      $('.lfopts:first').attr('value',
         webCenter.getResourceURL(webCenter.resourceIndex.links,
           'urn:oracle:webcenter:activities:stream',true));

      // Setup Lists drop-down
      currentUser.getListNames(function(){
        if(currentUser.listNames.length==0) return;
        var bindData = {
          'lfopts' : $.map(currentUser.listNames,function(d){
             return {
               'lfoptname' : d.name,
               'lfoptval' : webCenter.getResourceURL(d.links,'urn:oracle:webcenter:activities:stream',true)
             };
           })
        };
        $('.lfopts').clone(true).appendTo('#listfilter').autoRender(bindData);
        $('.lfopts:last').clone(true).appendTo('#listfilter').val('').html('Create a new list');
      });


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
                // TODO the following URL won't work... need to figure out what to publish to for groups
                'groupval' : webCenter.getResourceURL(d.links,'urn:oracle:webcenter:activities:stream',true)
              };
            };
          })
        };
        var widgetData = {
          'sbspace' : $.map(currentUser.spaces, function(d){
            var descr = "";
            var iconUrl = "";
            if(typeof(d.description)=='undefined') descr="";
            else descr = d.description;
            if(typeof(d.iconUrl)=='undefined') iconUrl = "";
            else iconUrl = d.iconUrl;
            if(!d.isOffline) {
              return {
                'spspaceiconimg' : iconUrl,
                'sbspacename' : d.displayName,
                'sbspacelink' : '/webcenter/spaces/' + d.name,
                'sbspacedescr' : descr
              }
            }
          })
        };
        $('#grouppub option:first').clone(true).appendTo('#grouppub').autoRender(filterData);
        $('#groupfilter option:first').clone(true).appendTo('#groupfilter').autoRender(filterData);
        $('.sbspace').autoRender(widgetData);

      });

      currentUser.getConnections(function(){
        if(currentUser.connections.length==0) {
          callback();
          return;
        }
        var connectionData = {
          'sbconnection' : $.map(currentUser.connections,function(d){
            return {
              'sbconnectionlink' : webCenter.getResourceURL(d.links,'urn:oracle:webcenter:read',false),
              'sbconnectionimg' : userProfile.avatarSmall(d.guid),
              'sbconnectionname' : d.displayName
            };
          })
        };
        $('.sbconnection').autoRender(connectionData);
        // Don't process anything until everything is set up
        callback(); 
      })
      
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
          app.refresh(); //required to get stream to render
        });
        return false;
      };
      app.trigger('update-filters', currLocation);
    });

    app.after(function(){
      // Save off last location
      lastLocation = app.getLocation();
    });

    app.get('#/', function(c){
      renderStream(webCenter.resourceIndex.links, 0,true);
    });

    app.get('#/list/:name',function(c){
      var listName = this.params['name'];
      if(listName=='All%20contacts'){
        renderStream(webCenter.resourceIndex.links, 0,true);
      } else if(listName=='Create%20a%20new%20list') {
        alert('Patience little grasshopper... not implemented yet')
        if(lastLocation) this.redirect(lastLocation);
      } else {
        var url = $.grep($('#listfilter option'),function(n){return $(n).text()==decodeURI(listName)})[0].value;
        var activityTemplate = $('li.messages:first');
        $('ol.results').empty().append(activityTemplate);
        renderStream(url, 0,true);
      }
    });

    app.get('#/group/:name',function(c){
      var groupName = this.params['name'];
      if(groupName=='My%20connections'){
        $('#listfilter').attr('disabled',false);
        $('#listfilter option:first').attr('selected',true);
        renderStream(webCenter.resourceIndex.links, 0,true);
      } else {
        $('#listfilter').attr('disabled',true);
        $('#listfilter option:first').attr('selected',true);
        var url = $.grep($('#groupfilter option'),function(n){return $(n).text()==decodeURI(groupName)})[0].value;
        var activityTemplate = $('li.messages:first');
        $('ol.results').empty().append(activityTemplate);
        renderStream(url,0,true);
      }
    });

    app.post('#/message',function(c){
      var msg = this.params['body'];
      if(msg == "") return false; 
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
      if(/\#\/list\//.test(currLocation)){
        var selectedVal = currLocation.split('#/list/')[1].split('/')[0];
        $('#listfilter option').each(function(i,n){
          var opt = $(n);
          if(opt.text()==selectedVal){
            opt.attr('selected','1');
          } else {
            opt.removeAttr('selected');
          }
        })
      };
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
