var assetHost = 'http://aconmt01.us.oracle.com/';
$.xLazyLoader({
  'css' : $.map(['dd','ir'],function(n){return assetHost+'css/'+n+'.css'}),
  'js' : $.map(['curvy','pure','json','domcached','dd','wcutils','wcrest'],function(n){return assetHost+'js/'+n+'.js'})
});
$(function(){
  // _adf.ctrl-state param needs to be passed on each request
  // to prevent mem leaks
  var ctrlState = $.map(location.search.split('&'),function(i){
    var t=i.split('=');
    if(t[0].match('_adf.ctrl-state')) return ['_adf.ctrl-state',t[1]].join('=');
  });
  if(ctrlState) ctrlState = "?" + ctrlState[0];
  else ctrlState = "";
  function renderSwitcher(d,currGS){
    for (i in d['gsspace']) {
      if(d['gsspace'][i].name == currGS) {
        d['gsspace'][i].selected1 = 1;
      } else {
        d['gsspace'][i].selected1 = "";
      }
    }
    $('.gsspace').clone(true).appendTo('#gs').autoRender(d);
    $('#gs').msDropDown();
  }

  var gs = $('#group-switcher');
  gs.html('<select id="gs" onchange="location=this.value" class="hide"><option class="gsspace spacename url@value selected1@selected" value="/webcenter/spaces/home'+ctrlState+'">Home</option></select>');
  var spacesCached = $.DOMCached.get('groups','webcenter');
  if(spacesCached){
    renderSwitcher(spacesCached,currentGroupSpace);
  };
  webCenter.init({},function(){
    currentUser.getSpaces(function(){
      var bindData = {
         'gsspace' : $.map(currentUser.spaces, function(n){
           return {
             'spacename' : n.displayName,
             'name' : n.name,
             'url' : '/webcenter/spaces/' + n.name + ctrlState,
             'selected1' : false
           }
         })
      };
      bindData['gsspace'].push({
        'spacename':'Browse Group Space', 
        'url':'/webcenter/faces/oracle/webcenter/community/view/pages/manage/ManageSpaces-SpacesTab.jspx?' + ctrlState 
      });
      $.DOMCached.set('groups',bindData,86400,'webcenter');
      if(spacesCached) return;
      renderSwitcher(bindData,currentGroupSpace);
      $('.dd').corner({
        tl: { radius: 5 },
        tr: { radius: 5 },
        bl: { radius: 5 },
        br: { radius: 5 },
        antiAlias: true,
        autoPad: false
      });

    });
  });
});
/* 
vim:ts=2:sw=2:expandtab
*/
