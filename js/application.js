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

      // setup posting widget
      $('#pub-form').submit(function(){
        var msg = $('#pub-text').val();
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
        return false;
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
        $('.lfopts:first').attr('value',
           webCenter.getResourceURL(webCenter.getResourceIndex().links,
             'urn:oracle:webcenter:activities:stream',true))
        $('.lfopts').clone(true).appendTo('#listfilters').autoRender(bindData);
        $('.lfopts:last').clone(true).appendTo('#listfilters').val('').html('Create a new list');
      });

      $('#listfilters').bind('change',function(e){
        if(this.value==''){
          alert('Patience little grasshopper... not implemented yet')
          return;
        };
        location = '#/list/' + $('option:selected',this).text();
      });

      // Infinite scroll pager
      $(window).scroll(function(){
        if($(window).scrollTop() == $(document).height() - $(window).height()){
          activityStream.renderActivities($('#listfilters').val(), activityStream.currentActivityId());
        }
       });

      callback(); 
    });
  };

  function renderDefaultStream(){
    var activityTemplate = $('li.messages:first');
    $('ol.results').empty().append(activityTemplate);
    activityStream.renderActivities(webCenter.getResourceIndex().links, 0);
  }


  // App Controller
  var app = new Sammy.Application(function(){with(this){
    var appStarted=false;
    element_selector = '#main';

    before(function(){with(this){
      if(!appStarted){
        initApp(function(){
          appStarted = true;
          if(getLocation()=='#/'){
            refresh();
          }else{
            redirect('#/');
          }
        });
        return false;
      }
    }});

    get('#/', function(c){with(this){
      renderDefaultStream();
    }});

    get('#/user/:guid',function(c){with(this){
    }});

    get('#/list/:name',function(c){with(this){
      if(params['name']=='All%20contacts'){
        renderDefaultStream();
        return false;
      };
      var url = $.grep($('#listfilters option'),function(n){return $(n).text()==params['name']})[0].value;
      var activityTemplate = $('li.messages:first');
      $('ol.results').empty().append(activityTemplate);
      activityStream.renderActivities(url, 0);
    }});

  }});
  app.run('#/');
});
/* 
vim:ts=2:sw=2:expandtab
*/
