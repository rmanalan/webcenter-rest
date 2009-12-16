$(document).ajaxStart(function(){$('#loading-ind').show()}).ajaxStop(function(){$('#loading-ind').hide()});
var log = function(l){try {return console.log(l);} catch(e){}};
  
$(loadPage);
function loadPage() {
  webCenter.init(function(data){
    log('Main resource index =>');
    log(data);
    $('li.services').autoRender({
        'services' : [{
          'service' : data.links
        }]
      });
    $
  });
};

/* 
vim:ts=2:sw=2:expandtab
*/
