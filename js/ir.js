var assetHost = 'http://aconmt01.us.oracle.com/';
var apiPort = 8892;
$.xLazyLoader({
  'css' : $.map(['ir.css'],function(n){return assetHost + 'css/' + n;}),
  'js' : $.map(['pure.js', 'json.js','domcached.js', 'wcutils.js', 'wcrest.js'],function(n){return assetHost + 'js/' + n;})
});
$(function(){
  var gs = $('#group-switcher');
  gs.html('<select id="gs"><option class="gsspace spacename url@value" value="/webcenter/spaces/home">Home</option></select>');
  var spacesCached = $.DOMCached.get('groups','webcenter');
  if(spacesCached){
    $('.gsspace').clone(true).appendTo('#gs').autoRender(spacesCached);
    $('#gs').bind('change',function(){
      location = this.value;
    });
  }
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
      $.DOMCached.set('groups',bindData,86400,'webcenter');
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
