var lnk=document.createElement("link");lnk.rel="stylesheet";lnk.type="text/css";lnk.href="/owccustom/css/base-ir.css";document.getElementsByTagName("head")[0].appendChild(lnk);
$(function(){Array.prototype.remove=function(a,b){b=this.slice((b||a)+1||this.length);this.length=a<0?this.length+a:a;return this.push.apply(this,b)};$("div.irltregion").parent().next().hide();$("div.irltregion").parent().next().next().css("left","197px");$('div[id*="pt_ps2::f"]').css("width","211px");$('table[id*="pt_pgl7"]').css("padding","8px 10px");$('table[id*="pt_pgl2"]').css("padding-right","10px");$("span.irsubtabs").html()!=""&&$("span.irsubtabs").parent().next().css("top","23px");var g=
$("div.irgroupswitcher"),c=g.offset();g.appendTo("body:last").css({top:c.top,left:c.left+5});$('<li id="managepages"></li>').appendTo("div.irmenu ul").append($('a[id*="managePagesLink"]'));$("li#managepages a").show();var d=$("div.irgroupspaces ul li a");c=$("div.irrecentgroupspaces ul li a");var j=function(a){return(a=$("img",a).attr("src"))?a:"/owccustom/images/default.png"};d=$.map(d,function(a){a=$(a);var b=j(a);return{name:a.text(),url:a.attr("href"),imgUrl:b}}).sort(function(a,b){return a.name.toLowerCase()>
b.name.toLowerCase()});c=$.map(c,function(a){a=$(a);var b=j(a);return{name:a.text(),url:a.attr("href"),imgUrl:b}});$.each(c.reverse(),function(){var a=this,b=$.grep(d,function(h){return h.name==a.name});b.length>0&&$.each(d,function(h){if(this.name==b[0].name){d.remove(h);d.unshift(b)}})});c=d;var e=$('<div id="switcher" class="hide"></div>'),i=$('<ul id="homeswitcher" class="switch clearfix"></ul>'),f=$("a.irhomespace");$('<li><div class="icon"><img src="/owccustom/images/Home.png" width="16px" alt="'+
f.text()+'"/></div><div class="gsitem"><a href="'+f.attr("href")+'">'+f.text()+"</a></div></li>").appendTo(i);f=$("a.irbrowsegroupspaces");$('<li><div class="icon"><img src="/owccustom/images/application_view_icons.png" width="16px" alt="'+f.text()+'"/></div><div class="gsitem"><a href="'+f.attr("href")+'">'+f.text()+"</a></div></li>").appendTo(i);var k=$('<ul id="gsswitcher" class="switch clearfix"></ul>');$.each(c,function(){$('<li><div class="icon"><img src="'+this.imgUrl+'" width="16px" height="16px" alt="'+
this.name+'"/></div><div class="gsitem"><a href="'+this.url+'">'+this.name+"</a></div></li>").appendTo(k)});i.appendTo(e);if(c.length>0){$('<h3 style="clear:both">My Group Spaces</h3>').appendTo(e);k.appendTo(e)}e.appendTo(g);g.show();c=Math.floor(Math.sqrt(c.length));e.css("width",c*171+60);g.hover(function(){e.show()},function(){e.hide()})});
