var assetHost = 'http://aconmt01.us.oracle.com/';
var apiPort = 8892;
$.xLazyLoader({
  'css' : $.map(['dd','ir'],function(n){return assetHost+'css/'+n+'.css'}),
  'js' : $.map(['pure','json','domcached','dd','wcutils','wcrest'],function(n){return assetHost+'js/'+n+'.js'})
});
$(function(){
  var gs = $('#group-switcher');
  gs.html('<select id="gs" onchange="location=this.value"><option class="gsspace spacename url@value selected@selected" value="/webcenter/spaces/home">Home</option></select><a href="/webcenter/faces/oracle/webcenter/community/view/pages/manage/ManageSpaces-SpacesTab.jspx">Browse Group Space</a>');
  var spacesCached = $.DOMCached.get('groups','webcenter');
  if(spacesCached){
    $('.gsspace').clone(true).appendTo('#gs').autoRender(spacesCached);
  }
  webCenter.init({'port':apiPort},function(){
    currentUser.getSpaces(function(){
      var bindData = {
         'gsspace' : $.map(currentUser.spaces, function(n){
           return {
             'spacename' : n.displayName,
             'url' : '/webcenter/spaces/' + n.name,
             'selected' : function(){
               
             }
           }
         })
      };
	bindData += { 'spacename':'Home test', 'url':'/webcenter/faces/oracle/webcenter/community/view/pages/manage/ManageSpaces-SpacesTab.jsp' };
	bindData += { 'spacename':'Create Group Space', 'url':'/webcenter/faces/oracle/webcenter/community/view/pages/manage/ManageSpaces-SpacesTab.jspx' };
      $.DOMCached.set('groups',bindData,86400,'webcenter');
      if(spacesCached) return;
      $('.gsspace').clone(true).appendTo('#gs').autoRender(bindData);
    });
  });

});
/* 
vim:ts=2:sw=2:expandtab
*/
