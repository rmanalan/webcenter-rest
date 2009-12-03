$(document).ajaxStart(function(){$('#loading-ind').show()}).ajaxStop(function(){$('#loading-ind').hide()});
$(loadPage);
function loadPage() {
  webCenter.init(function(){

    // setup posting widget
    $('#pub-form').submit(function(){
      var msg = $('#pub-text').val();
      if(msg == "") return false; 
      $.ajax({
        url: webCenter.getResourceURL(webCenter.getResourceIndex().links,'urn:oracle:webcenter:messageBoard'),
        type: "post",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({'body': utils.resolveURLs(msg)}),
        success: function(d){
          $('#pub-text').val('');
          var profileUrl = webCenter.getResourceURL(d.author.links,'urn:oracle:webcenter:spaces:profile');
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
          $('li.messages:first').clone(true).hide().prependTo('ol.results').autoRender(data).show(300);
        }
      });
      return false;
    });

    // Render initial activities
    activityStream.renderActivities(0,false);

    // Infinite scroll pager
    $(window).scroll(function(){
      if($(window).scrollTop() == $(document).height() - $(window).height()){
        $('#loading-ind').show()
        setTimeout(function(){
          activityStream.renderActivities(activityStream.currentActivityId(),true);
        }, 1000);
      }
    }); 
    
  });
};

/* 
vim:ts=2:sw=2:expandtab
*/
