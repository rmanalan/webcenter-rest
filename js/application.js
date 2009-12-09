$(document).ajaxStart(function(){$('#loading-ind').show()})
  .ajaxStop(function(){$('#loading-ind').hide()});

$(function(){
  function initApp(callback){
    webCenter.init(function(){
      // show who's logged in
      $('ul.headnav li').autoRender({
        'username' : currentUser.name.formatted,
        'url' : webCenter.getResourceURL(currentUser.links,
          'urn:oracle:webcenter:spaces:profile',false)
      }).show();

      // Infinite scroll pager
      $(window).scroll(function(){
        if($(window).scrollTop() == $(document).height() - $(window).height()){
          activityStream.renderActivities($('#listfilters').val(), activityStream.currentActivityId());
        }
       });

      $('#listfilters').bind('change',function(e){
        location = '#/list/' + $('option:selected',this).text();
      });

      // Setup Lists drop-down
      currentUser.getListNames(function(lists){
        if(lists.items.length==0) return;
        var bindData = {
          'lfopts' : $.map(lists.items,function(d){
             return {
               'lfoptname' : d.name,
               'lfoptval' : webCenter.getResourceURL(d.links,'urn:oracle:webcenter:activities:stream',true)
             };
           })
        };
        // Sets url for default stream
        $('.lfopts:first').attr('value',
           webCenter.getResourceURL(webCenter.getResourceIndex().links,
             'urn:oracle:webcenter:activities:stream',true))
        $('.lfopts').clone(true).appendTo('#listfilters').autoRender(bindData);
        $('.lfopts:last').clone(true).appendTo('#listfilters').val('').html('Create a new list');

        // Don't process anything until the filter is set up
        callback(); 
      });
    });
  };

  function renderDefaultStream(){
    var activityTemplate = $('li.messages:first');
    $('ol.results').empty().append(activityTemplate);
    activityStream.renderActivities(webCenter.getResourceIndex().links, 0);
  }

  // App Controller
  var app = $.sammy(function(s){
    var appStarted=false;
    var lastLocation;

    s.before(function(c){
      var currLocation = s.getLocation();
      if(!appStarted){
        initApp(function(){
          appStarted = true;
           s.refresh(); //required to get stream to render
        });
        return false;
      };

      // Properly sets list filter when using the back button
      if(/\#\/list\//.test(currLocation)){
        var selectedVal = currLocation.split('#/list/')[1].split('/')[0];
        $('#listfilters option').each(function(i,n){
          var opt = $(n);
          if(opt.text()==selectedVal){
            opt.attr('selected','1');
          } else {
            opt.removeAttr('selected');
          }
        })
      };
    });

    s.after(function(){
      // Save off last location
      lastLocation = s.getLocation();
    });

    s.get('#/', function(c){
      renderDefaultStream();
    });

    s.get('#/list/:name',function(c){
      var listName = this.params['name'];
      if(listName=='All%20contacts'){
        renderDefaultStream();
      } else if(listName=='Create%20a%20new%20list') {
        alert('Patience little grasshopper... not implemented yet')
        if(lastLocation) this.redirect(lastLocation);
      } else {
        var url = $.grep($('#listfilters option'),function(n){return $(n).text()==listName})[0].value;
        var activityTemplate = $('li.messages:first');
        $('ol.results').empty().append(activityTemplate);
        activityStream.renderActivities(url, 0);
      }
    });

    s.post('#/message',function(c){
      var msg = this.params['body'];
      if(msg == "") return false; 
      $.ajax({
        url: webCenter.getResourceURL(webCenter.getResourceIndex().links,
               'urn:oracle:webcenter:messageBoard'),
        type: "post",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({'body': utils.resolveURLs(msg)}),
        success: function(d){
          $('#pub-text').val('');
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


  });
  app.run('#/');
});
/* 
vim:ts=2:sw=2:expandtab
*/
