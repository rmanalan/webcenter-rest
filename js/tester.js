$(document).ajaxStart(function(){$('#loading-ind').show()}).ajaxStop(function(){$('#loading-ind').hide()});
var log = function(){try {return console.log;} catch(e){}};
  
$(loadPage);
function loadPage() {
  webCenter.init(function(data){
    log(data);
    
  });
};

/* 
vim:ts=2:sw=2:expandtab
*/
