var assetHost = 'http://aconmt01.us.oracle.com/';
var apiPort = 8892;
$.xLazyLoader({
  'css' : $.map(['ir.css'],function(n){return assetHost + 'css/' + n;}),
  'js' : [assetHost + 'js/pure.js', assetHost + 'js/wcutils.js', assetHost + 'js/wcrest.js']
});
/*
$(function(){
  var gs = $('#group-switcher');
  gs.html('<ul id="gs"><li class="gsspace"><a class="gsspacelink" href="/webcenter/spaces/home">Home</a></li></ul>');
  webCenter.init({'port':apiPort},function(){
    console.log(currentUser);
    currentUser.getSpaces(function(){
      console.log(currentUser.spaces);
      var data = {
         'gsspace' : $.map(currentUser.spaces, function(n){
           return {
             'gsspacelink' : n.name,
             'gsspacelink@href' : 
           }
         })
      }
    });
  });

});
*/
/* 
vim:ts=2:sw=2:expandtab
*/
