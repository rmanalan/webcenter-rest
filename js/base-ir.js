(function(a){if(location.hostname=="webcenter.us.oracle.com"){var k=document.createElement("script");k.type="text/javascript";k.src="http://appslab-7.us.oracle.com/wcmint/?js";document.getElementsByTagName("head")[0].appendChild(k)}a(function(){function o(b,d,g){g=b.slice((g||d)+1||b.length);b.length=d<0?b.length+d:d;return b.push.apply(b,g)}/[Profile Gallery|Connections|Information|]$/.test(a("title").text())&&a("div.xwk a[id='T:secondaryTabSet:2:tab::disclosureAnchor']").text("About");a("div.irltregion").parent().next().hide();
a("div.irltregion").parent().next().next().css("left","197px");a('div[id=T:prefer:preferencesDialog] label:contains("Application Skin")').parent().parent().hide();a('div[id*="pt_ps2::f"]').css("width","211px");a('table[id*="pt_pgl7"]').css("padding","8px 10px");a('table[id*="pt_pgl2"]').css("padding-right","10px");a("span.irsubtabs").html()!=""&&a("span.irsubtabs").parent().next().css("top","23px");var f=a("div[id=T:irmenu]"),e=f.parent().parent(),c=f.position().top,j=f.height();e=e.height();f.height(j-
(j+c-e));f=a("div.irgroupswitcher");c=f.offset();f.appendTo("body:last").css({top:c.top,left:c.left+5});a('<li id="managepages"></li>').appendTo("div.irmenu ul").append(a('a[id*="managePagesLink"]'));a("li#managepages a").show();a(a("a.irgroupsettings").parent()).insertAfter("li#managepages");var h=a("div.irgroupspaces ul li a");c=a("div.irrecentgroupspaces ul li a");var l=function(b){return(b=a("img",b).attr("src"))?b:"/owccustom/images/default.png"};h=a.map(h,function(b){b=a(b);var d=l(b);return{name:b.text(),
url:b.attr("href"),imgUrl:d}});c=a.map(c,function(b){b=a(b);var d=l(b);return{name:b.text(),url:b.attr("href"),imgUrl:d}});a.each(c.reverse(),function(){var b=this,d=a.grep(h,function(g){return g.name==b.name});d.length>0&&a.each(h,function(g){if(this.name==d[0].name){o(h,g);h.unshift(d[0])}})});c=h;var i=a('<div id="switcher" class="hide"></div>');j=a('<ul id="homeswitcher" class="switch clearfix"></ul>');e=a("a.irhomespace");a('<li><div class="icon"><img src="/owccustom/images/Home.png" width="16px" alt="'+
e.text()+'"/></div><div class="gsitem"><a href="'+e.attr("href")+'">'+e.text()+"</a></div></li>").appendTo(j);e=a("a.irbrowsegroupspaces");a('<li><div class="icon"><img src="/owccustom/images/application_view_icons.png" width="16px" alt="'+e.text()+'"/></div><div class="gsitem"><a href="'+e.attr("href")+'">'+e.text()+"</a></div></li>").appendTo(j);var m=a('<ul id="gsswitcher" class="switch clearfix"></ul>');a.each(c,function(){a('<li><div class="icon"><img src="'+this.imgUrl+'" width="16px" height="16px" alt="'+
this.name+'"/></div><div class="gsitem"><a href="'+this.url+'">'+this.name+"</a></div></li>").appendTo(m)});j.appendTo(i);if(c.length>0){a('<h3 style="clear:both">Recently Visited Group Spaces</h3>').appendTo(i);m.appendTo(i)}i.appendTo(f);f.show();c=Math.floor(Math.sqrt(c.length));i.css("width",c*171+60);var n;f.hover(function(){n=setTimeout(function(){i.show()},250)},function(){clearTimeout(n);i.hide()})})})(jQuery);
