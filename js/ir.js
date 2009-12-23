var assetHost = 'http://aconmt01.us.oracle.com/';
var apiPort = 8892;
$.xLazyLoader({
  'css' : $.map(['ir.css'],function(n){return assetHost + 'css/' + n;}),
  'js' : [assetHost + 'js/pure.js', assetHost + 'js/wcutils.js', assetHost + 'js/wcrest.js']
});
$(function(){
  var gs = $('#group-switcher');
  gs.html('<select id="gs"><option class="gsspace spacename url@value" value="/webcenter/spaces/home">Home</option></select>');
  webCenter.init({'port':apiPort},function(){
    currentUser.getSpaces(function(){
      var bindData = {
         'gsspace' : $.map(currentUser.spaces, function(n){
           return {
             'spacename' : n.displayName,
             'url' : '/webcenter/spaces/' + n.name
           }
         })
      };
      $('.gsspace').clone(true).appendTo('#gs').autoRender(bindData);
      $('#gs').bind('change',function(){
        location = this.value;
      });
    });
  });

});
/* 
vim:ts=2:sw=2:expandtab
*/
