var assetHost = 'http://aconmt01.us.oracle.com/';
//var apiPort = 8893;
$.xLazyLoader({
  'css' : $.map(['dd','ir'],function(n){return assetHost+'css/'+n+'.css'}),
  'js' : $.map(['pure','json','domcached','dd','wcutils','wcrest'],function(n){return assetHost+'js/'+n+'.js'})
});
$(function(){
  var gs = $('#group-switcher');
  gs.html('<select id="gs" onchange="location=this.value"><option class="gsspace spacename url@value selected1@selected" value="/webcenter/spaces/home">Home</option></select>');
  var spacesCached = $.DOMCached.get('groups','webcenter');
  if(spacesCached){
    console.log('got cached');
    $('.gsspace').clone(true).appendTo('#gs').autoRender(spacesCached);
  }
  webCenter.init({},function(){
    currentUser.getSpaces(function(){
      var bindData = {
         'gsspace' : $.map(currentUser.spaces, function(n){
           return {
             'spacename' : n.displayName,
             'name' : n.name,
             'url' : '/webcenter/spaces/' + n.name,
             'selected1' : function(){
             }
           }
         })
      };
      bindData['gsspace'].unshift({'name':'', 'spacename':'Home', 'url':'/webcenter/spaces/home'});
      bindData['gsspace'].push({'spacename':'Browse Group Space', 'url':'/webcenter/faces/oracle/webcenter/community/view/pages/manage/ManageSpaces-SpacesTab.jspx' });
      bindData['gsspace'][0].selected1 = 'selected';
      $.DOMCached.set('groups',bindData,86400,'webcenter');
      if(spacesCached) return;
      $('.gsspace').clone(true).appendTo('#gs').autoRender(bindData);
      $('.gsspace').autoRender(bindData);
      for (index in bindData['gsspace']) {
        $('#gs option')[2].selected = true;
        if (bindData['gsspace'][index].name == currentGroupSpace) {
          $('#gs option')[index].selected = true;
        }
      }
      $('#gs option')[2].selected = true;
    });
  });
});
/* 
vim:ts=2:sw=2:expandtab
*/
