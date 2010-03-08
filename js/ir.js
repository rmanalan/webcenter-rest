var assetHost = '/owccustom/';
$.xLazyLoader({
  'css' : $.map(['dd','ir'],function(n){return assetHost+'css/'+n+'.css'}),
  'js' : $.map(['curvy','pure','json','domcached','dd','wcutils','wcrest'],function(n){return assetHost+'js/'+n+'.js'})
});
$(function(){

  // bump up content div when secondary tab is not there
  if($('div[id="T:pt_psl5::t"]').length==0) {
    $('div[id="T:pt_psl5::c"]').css('cssText','top: 0 !important');
  }

  var switcher = $('div[id="T:irgroupswitcher"]');
  var switcherPosn = switcher.offset();
  console.log(switcherPosn)
  switcher.appendTo('body:last').css({
    'top' : switcherPosn.top,
    'left' : switcherPosn.left + 5
  });
  $('<li id="managepages"></li>').appendTo('div[id="T:irmenu"] ul').append($('a[id="T:managePagesLink"]'));
  console.log(switcher.position())
  var switcherContents = $("a[id='T:irhomespace'], a[id='T:irbrowsegroupspaces'], div[id='T:irrecentgroupspaces'], div[id='T:irgroupspaces']");
  switcher.hover(
    function(){
      switcherContents.show();
    },
    function(){
     switcherContents.hide();
    }
  );
  
/*
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
  var spacesCached = $.DOMCached.get('groups'+ctrlState,'webcenter');
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
      $.DOMCached.set('groups' + ctrlState,bindData,86400,'webcenter');
      if(spacesCached) return;
      renderSwitcher(bindData,currentGroupSpace);
    });
  });
*/
});
/* 
vim:ts=2:sw=2:expandtab
*/

