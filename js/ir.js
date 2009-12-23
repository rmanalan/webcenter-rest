var assetHost = 'http://aconmt01.us.oracle.com/';
var apiPort = 8892;
$.xLazyLoader({
  'css' : $.map(['ir.css'],function(n){return assetHost + 'css/' + n;}),
  'js' : [assetHost + 'js/pure.js', assetHost + 'js/wcutils.js', assetHost + 'js/wcrest.js']
});
$(function(){
  var gs = $('#group-switcher');
  gs.html('<ul id="gs"><li><a href="/webcenter/spaces/home">Home</a></li></ul>');
  webCenter.init({'port':apiPort},function(){
    console.log(currentUser);
    currentUser.getSpaces(function(){
      console.log(currentUser.spaces);
    });
  });

});
/* 
vim:ts=2:sw=2:expandtab
*/
