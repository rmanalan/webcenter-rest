var assetHost = 'http://aconmt01.us.oracle.com/';
var apiPort = 8892;
jQuery.noConflict();
jQuery.xLazyLoader({
  'css' : $.map(['ir.css'],function(n){return assetHost + 'css/' + n;}),
  'js' : [assetHost + 'js/pure.js', assetHost + 'js/wcutils.js', assetHost + 'js/wcrest.js']
});
jQuery(function(){
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
