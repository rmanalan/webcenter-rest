var dump;
var assetHost = '/owccustom/';
$.xLazyLoader({
  'css' : $.map(['ir'],function(n){return assetHost+'css/'+n+'.css'}),
  'js' : $.map(['curvy'],function(n){return assetHost+'js/'+n+'.js'})
});
// http://ejohn.org/blog/javascript-array-remove
Array.prototype.remove = function(from, to){
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
$(function(){
  // bump up content div when secondary tab is not there
  if($('span.irsubtabs').html()!="") {
    $('div[id="T:pt_psl5::c"]').parent().next().css('cssText','top: 23px !important');
  }

  var switcher = $('div.irgroupswitcher');
  var switcherPosn = switcher.offset();
  switcher.appendTo('body:last').css({
    'top' : switcherPosn.top,
    'left' : switcherPosn.left + 5
  });
  $('<li id="managepages"></li>').appendTo('div[id="T:irmenu"] ul').append($('a[id="T:managePagesLink"]'));

  var allSpaces = $('div.irgroupspaces ul li a');
  var recentSpaces = $('div.irrecentgroupspaces ul li a');

  var allSpaces = $.map(allSpaces,function(e,i){
    var d = $(e);
    return {
      'name': d.text(),
      'url' : d.attr('href'),
      'imgUrl' : $('img',d).attr('src')
    }
  }).sort(function(x,y){return x.name.toLowerCase() > y.name.toLowerCase()});
 
  var recentSpaces = $.map(recentSpaces,function(e,i){
    var d = $(e);
    return {
      'name': d.text(),
      'url' : d.attr('href'),
      'imgUrl' : $('img',d).attr('src')
    }
  });

  // flatten recent and all spaces so that recent spaces
  // are ordered first
  $.each(recentSpaces,function(){
    var rs = this;
    var match = $.grep(allSpaces,function(e){
      return e.name == rs.name;
    });
    if(match.length>0){
      $.each(allSpaces,function(i,e){
        if(this.name == match[0].name) {
          allSpaces.remove(i);
        }
      });
    };
  });
  var spacesMerged = recentSpaces.concat(allSpaces);

  var mainSwitcherContainer = $('<div id="switcher" class="hide"></div>');

  var homeSwitcherContainer = $('<ul id="homeswitcher" class="switch clearfix"></ul>');
  var homeAnchor = $('a[id="T:irhomespace"]')
  $('<li><div class="icon"><img src="/owccustom/images/Home.png" width="16px" alt="' 
      + homeAnchor.text() + '"/></div><div class="gsitem"><a href="'
      + homeAnchor.attr('href') + '">'
      + homeAnchor.text() + '</a></div></li>').appendTo(homeSwitcherContainer);
  var browseGSAnchor = $('a[id="T:irbrowsegroupspaces"]')
  $('<li><div class="icon"><img src="/owccustom/images/application_view_icons.png" width="16px" alt="' 
      + browseGSAnchor.text() + '"/></div><div class="gsitem"><a href="'
      + browseGSAnchor.attr('href') + '">'
      + browseGSAnchor.text() + '</a></div></li>').appendTo(homeSwitcherContainer);

  var gsSwitcherContainer = $('<ul id="gsswitcher" class="switch clearfix"></ul>');
  $.each(spacesMerged,function(){
    $('<li><div class="icon"><img src="' 
        + this.imgUrl + '" width="16px" height="16px" alt="' 
        + this.name + '"/></div><div class="gsitem"><a href="'
        + this.url + '">'
        + this.name + '</a></div></li>').appendTo(gsSwitcherContainer);
  });

  homeSwitcherContainer.appendTo(mainSwitcherContainer);
  if(spacesMerged.length > 0) {
    $('<h3>My Group Spaces</h3>').appendTo(mainSwitcherContainer);
    gsSwitcherContainer.appendTo(mainSwitcherContainer);
  };  
  mainSwitcherContainer.appendTo(switcher);
  
  var cols = Math.floor(Math.sqrt(spacesMerged.length));
  mainSwitcherContainer.css('width', (cols * 171) + 60);

  switcher.hover(
    function(){
      mainSwitcherContainer.show();
    },
    function(){
      mainSwitcherContainer.hide();
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

