var assetHost = 'http://aconmt01.us.oracle.com/';
var apiPort = 8892;
$.xLazyLoader({
  'css' : $.map(['dd','ir'],function(n){return assetHost+'css/'+n+'.css'}),
  'js' : $.map(['pure','json','domcached','dd','wcutils','wcrest'],function(n){return assetHost+'js/'+n+'.js'})
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
      if(spacesCached) return;
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
