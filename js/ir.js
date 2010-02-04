var assetHost = 'http://aconmt01.us.oracle.com/';
//var apiPort = 8893;
$.xLazyLoader({
  'css' : $.map(['dd','ir'],function(n){return assetHost+'css/'+n+'.css'}),
  'js' : $.map(['pure','json','domcached','dd','wcutils','wcrest'],function(n){return assetHost+'js/'+n+'.js'})
});
$(function(){
  function renderSwitcher(d,currGS){
    for (i in d['gsspace']) {
      console.log(i);
      if(d['gsspace'][i].name == currGS) {
        $('#gs option')[i].selected1 = true;
      }else{
        $('#gs option')[i].selected1 = false;
      }
    }
    $('.gsspace').clone(true).appendTo('#gs').autoRender(d)
  }

  var gs = $('#group-switcher');
  gs.html('<select id="gs" onchange="location=this.value"><option class="gsspace spacename url@value selected1@selected" value="/webcenter/spaces/home">Home</option></select>');
  var spacesCached = $.DOMCached.get('groups','webcenter');
  if(spacesCached){
    console.log('got cached');
    //renderSwitcher(spacesCached,currentGroupSpace);
  }
  webCenter.init({},function(){
    currentUser.getSpaces(function(){
      var bindData = {
         'gsspace' : $.map(currentUser.spaces, function(n){
           return {
             'spacename' : n.displayName,
             'name' : n.name,
             'url' : '/webcenter/spaces/' + n.name,
             'selected1' : false
           }
         })
      };
      bindData['gsspace'].push({
        'spacename':'Browse Group Space', 
        'url':'/webcenter/faces/oracle/webcenter/community/view/pages/manage/ManageSpaces-SpacesTab.jspx' 
      });
      $.DOMCached.set('groups',bindData,86400,'webcenter');
      //if(spacesCached) return;
      renderSwitcher(bindData,currentGroupSpace);

    });
  });
});
/* 
vim:ts=2:sw=2:expandtab
*/

