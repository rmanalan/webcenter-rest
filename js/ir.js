var assetHost = 'http://aconmt01.us.oracle.com/';
var apiPort = 8892;
$.xLazyLoader({
  'css' : $.map(['ir.css'],function(n){return assetHost + 'css/' + n;}),
  'js' : [assetHost + 'js/pure.js', assetHost + 'js/wcutils.js', assetHost + 'js/wcrest.js']
});
$(function(){
  var gs = $('#group-switcher');
  gs.html('<ul id="gs"><li class="gsspace"><a class="gsspacelink gslink@href" href="/webcenter/spaces/home">Home</a></li></ul>');
  webCenter.init({'port':apiPort},function(){
    currentUser.getSpaces(function(){
      var bindData = {
         'gsspace' : $.map(currentUser.spaces, function(n){
           return {
             'gsspacelink' : n.name,
             'gslink' : '/webcenter/faces/oracle/webcenter/page/scopedMD/' + n.guid + '/Home.jspx'
           }
         })
      };
      $('.gsspace').clone(true).appendTo('#gs').autoRender(bindData);
    });
  });

});
/* 
vim:ts=2:sw=2:expandtab
*/
