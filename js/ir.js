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
  // hide panel splitter
  $('div.irltregion').parent().next().hide();
  $('div.irltregion').parent().next().next().css('left','197px');

  // logo area size
  $('div[id*="pt_ps2::f"]').css('width','211px');

  // padding around top right header links
  $('table[id*="pt_pgl7"]').css('padding','8px 10px');

  // bump up content div when secondary tab is not there
  if($('span.irsubtabs').html()!="") {
    $('span.irsubtabs').parent().next().css('top','23px');
  }

  var switcher = $('div.irgroupswitcher');
  var switcherPosn = switcher.offset();
  switcher.appendTo('body:last').css({
    'top' : switcherPosn.top,
    'left' : switcherPosn.left + 5
  });
  $('<li id="managepages"></li>').appendTo('div.irmenu ul').append($('a[id*="managePagesLink"]'));

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
  switcher.show();
  
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
});
/* 
vim:ts=2:sw=2:expandtab
*/

