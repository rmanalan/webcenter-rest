(function(a){a(function(){Array.prototype.remove=function(b,d){d=this.slice((d||b)+1||this.length);this.length=b<0?this.length+b:b;return this.push.apply(this,d)};/[Profile Gallery|Connections|Information|]$/.test(a("title").text())&&a("div.xwk a[id='T:secondaryTabSet:2:tab::disclosureAnchor']").text("About");a("div.irltregion").parent().next().hide();a("div.irltregion").parent().next().next().css("left","197px");a('div[id*="pt_ps2::f"]').css("width","211px");a('table[id*="pt_pgl7"]').css("padding",
"8px 10px");a('table[id*="pt_pgl2"]').css("padding-right","10px");a("span.irsubtabs").html()!=""&&a("span.irsubtabs").parent().next().css("top","23px");var h=a("div.irgroupswitcher"),c=h.offset();h.appendTo("body:last").css({top:c.top,left:c.left+5});a('<li id="managepages"></li>').appendTo("div.irmenu ul").append(a('a[id*="managePagesLink"]'));a("li#managepages a").show();a(a("a.irgroupsettings").parent()).insertAfter("li#managepages");var e=a("div.irgroupspaces ul li a");c=a("div.irrecentgroupspaces ul li a");
var k=function(b){return(b=a("img",b).attr("src"))?b:"/owccustom/images/default.png"};e=a.map(e,function(b){b=a(b);var d=k(b);return{name:b.text(),url:b.attr("href"),imgUrl:d}});c=a.map(c,function(b){b=a(b);var d=k(b);return{name:b.text(),url:b.attr("href"),imgUrl:d}});a.each(c.reverse(),function(){var b=this,d=a.grep(e,function(i){return i.name==b.name});d.length>0&&a.each(e,function(i){if(this.name==d[0].name){e.remove(i);e.unshift(d[0])}})});c=e;var f=a('<div id="switcher" class="hide"></div>'),
j=a('<ul id="homeswitcher" class="switch clearfix"></ul>'),g=a("a.irhomespace");a('<li><div class="icon"><img src="/owccustom/images/Home.png" width="16px" alt="'+g.text()+'"/></div><div class="gsitem"><a href="'+g.attr("href")+'">'+g.text()+"</a></div></li>").appendTo(j);g=a("a.irbrowsegroupspaces");a('<li><div class="icon"><img src="/owccustom/images/application_view_icons.png" width="16px" alt="'+g.text()+'"/></div><div class="gsitem"><a href="'+g.attr("href")+'">'+g.text()+"</a></div></li>").appendTo(j);
var l=a('<ul id="gsswitcher" class="switch clearfix"></ul>');a.each(c,function(){a('<li><div class="icon"><img src="'+this.imgUrl+'" width="16px" height="16px" alt="'+this.name+'"/></div><div class="gsitem"><a href="'+this.url+'">'+this.name+"</a></div></li>").appendTo(l)});j.appendTo(f);if(c.length>0){a('<h3 style="clear:both">Recently Visited Group Spaces</h3>').appendTo(f);l.appendTo(f)}f.appendTo(h);h.show();c=Math.floor(Math.sqrt(c.length));f.css("width",c*171+60);var m;h.hover(function(){m=
setTimeout(function(){f.show()},500)},function(){clearTimeout(m);f.hide()})})})(jQuery);
