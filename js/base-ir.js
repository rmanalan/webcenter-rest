var lnk=document.createElement("link");lnk.rel="stylesheet";lnk.type="text/css";lnk.href="/owccustom/css/base-ir.css";document.getElementsByTagName("head")[0].appendChild(lnk);
$(function(){Array.prototype.remove=function(a,c){c=this.slice((c||a)+1||this.length);this.length=a<0?this.length+a:a;return this.push.apply(this,c)};$("div.irltregion").parent().next().hide();$("div.irltregion").parent().next().next().css("left","197px");$('div[id*="pt_ps2::f"]').css("width","211px");$('table[id*="pt_pgl7"]').css("padding","8px 10px");$('table[id*="pt_pgl2"]').css("padding-right","10px");$("span.irsubtabs").html()!=""&&$("span.irsubtabs").parent().next().css("top","23px");var g=
$("div.irgroupswitcher"),b=g.offset();g.appendTo("body:last").css({top:b.top,left:b.left+5});$('<li id="managepages"></li>').appendTo("div.irmenu ul").append($('a[id*="managePagesLink"]'));$("li#managepages a").show();var f=$("div.irgroupspaces ul li a");b=$("div.irrecentgroupspaces ul li a");f=$.map(f,function(a){a=$(a);return{name:a.text(),url:a.attr("href"),imgUrl:$("img",a).attr("src")}}).sort(function(a,c){return a.name.toLowerCase()>c.name.toLowerCase()});b=$.map(b,function(a){a=$(a);return{name:a.text(),
url:a.attr("href"),imgUrl:$("img",a).attr("src")}});$.each(b,function(){var a=this,c=$.grep(f,function(h){return h.name==a.name});c.length>0&&$.each(f,function(h){this.name==c[0].name&&f.remove(h)})});b=b.concat(f);var d=$('<div id="switcher" class="hide"></div>'),i=$('<ul id="homeswitcher" class="switch clearfix"></ul>'),e=$("a.irhomespace");$('<li><div class="icon"><img src="/owccustom/images/Home.png" width="16px" alt="'+e.text()+'"/></div><div class="gsitem"><a href="'+e.attr("href")+'">'+e.text()+
"</a></div></li>").appendTo(i);e=$("a.irbrowsegroupspaces");$('<li><div class="icon"><img src="/owccustom/images/application_view_icons.png" width="16px" alt="'+e.text()+'"/></div><div class="gsitem"><a href="'+e.attr("href")+'">'+e.text()+"</a></div></li>").appendTo(i);var j=$('<ul id="gsswitcher" class="switch clearfix"></ul>');$.each(b,function(){$('<li><div class="icon"><img src="'+this.imgUrl+'" width="16px" height="16px" alt="'+this.name+'"/></div><div class="gsitem"><a href="'+this.url+'">'+
this.name+"</a></div></li>").appendTo(j)});i.appendTo(d);if(b.length>0){$('<h3 style="clear:both">My Group Spaces</h3>').appendTo(d);j.appendTo(d)}d.appendTo(g);g.show();b=Math.floor(Math.sqrt(b.length));d.css("width",b*171+60);g.hover(function(){d.show()},function(){d.hide()})});
