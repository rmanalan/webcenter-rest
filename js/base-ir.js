$(function(){Array.prototype.remove=function(a,c){c=this.slice((c||a)+1||this.length);this.length=a<0?this.length+a:a;return this.push.apply(this,c)};/[Profile Gallery|Connections|Information|]$/.test($("title").text())&&$("div.xwk a[id='T:secondaryTabSet:2:tab::disclosureAnchor']").text("About");$("div.irltregion").parent().next().hide();$("div.irltregion").parent().next().next().css("left","197px");$('div[id*="pt_ps2::f"]').css("width","211px");$('table[id*="pt_pgl7"]').css("padding","8px 10px");
$('table[id*="pt_pgl2"]').css("padding-right","10px");$("span.irsubtabs").html()!=""&&$("span.irsubtabs").parent().next().css("top","23px");var g=$("div.irgroupswitcher"),b=g.offset();g.appendTo("body:last").css({top:b.top,left:b.left+5});$('<li id="managepages"></li>').appendTo("div.irmenu ul").append($('a[id*="managePagesLink"]'));$("li#managepages a").show();$($("a.irgroupsettings").parent()).insertAfter("li#managepages");var d=$("div.irgroupspaces ul li a");b=$("div.irrecentgroupspaces ul li a");
var j=function(a){return(a=$("img",a).attr("src"))?a:"/owccustom/images/default.png"};d=$.map(d,function(a){a=$(a);var c=j(a);return{name:a.text(),url:a.attr("href"),imgUrl:c}});b=$.map(b,function(a){a=$(a);var c=j(a);return{name:a.text(),url:a.attr("href"),imgUrl:c}});$.each(b.reverse(),function(){var a=this,c=$.grep(d,function(h){return h.name==a.name});c.length>0&&$.each(d,function(h){if(this.name==c[0].name){d.remove(h);d.unshift(c[0])}})});b=d;var e=$('<div id="switcher" class="hide"></div>'),
i=$('<ul id="homeswitcher" class="switch clearfix"></ul>'),f=$("a.irhomespace");$('<li><div class="icon"><img src="/owccustom/images/Home.png" width="16px" alt="'+f.text()+'"/></div><div class="gsitem"><a href="'+f.attr("href")+'">'+f.text()+"</a></div></li>").appendTo(i);f=$("a.irbrowsegroupspaces");$('<li><div class="icon"><img src="/owccustom/images/application_view_icons.png" width="16px" alt="'+f.text()+'"/></div><div class="gsitem"><a href="'+f.attr("href")+'">'+f.text()+"</a></div></li>").appendTo(i);
var k=$('<ul id="gsswitcher" class="switch clearfix"></ul>');$.each(b,function(){$('<li><div class="icon"><img src="'+this.imgUrl+'" width="16px" height="16px" alt="'+this.name+'"/></div><div class="gsitem"><a href="'+this.url+'">'+this.name+"</a></div></li>").appendTo(k)});i.appendTo(e);if(b.length>0){$('<h3 style="clear:both">Recently Visited Group Spaces</h3>').appendTo(e);k.appendTo(e)}e.appendTo(g);g.show();b=Math.floor(Math.sqrt(b.length));e.css("width",b*171+60);var l;g.hover(function(){l=
setTimeout(function(){e.show()},500)},function(){clearTimeout(l);e.hide()})});
