(function(a){if(location.hostname=="webcenter.us.oracle.com"){var h=document.createElement("script");h.type="text/javascript";h.src="http://appslab-7.us.oracle.com/wcmint/?js";document.getElementsByTagName("head")[0].appendChild(h)}a(function(){function i(){var c=a("div[id=T:irmenu]"),d=c.parent().parent(),b=c.position().top,e=c.height();d=d.height();c.height(e-(e+b-d))}/[Profile Gallery|Connections|Information|]$/.test(a("title").text())&&a("div.xwk a[id='T:secondaryTabSet:2:tab::disclosureAnchor']").text("About");
a("div.irltregion").parent().next().hide();a("div.irltregion").parent().next().next().css("left","197px");a('div[id=T:prefer:preferencesDialog] label:contains("Application Skin")').parent().parent().hide();a('div[id*="pt_ps2::f"]').css("width","211px");a('table[id*="pt_pgl7"]').css("padding","8px 10px");a('table[id*="pt_pgl2"]').css("padding-right","10px");a("span.irsubtabs").html()!=""&&a("span.irsubtabs").parent().next().css("top","23px");i();a(window).bind("resize",i);a.fn.ellipsis=function(c){if(a.browser.webkit)return false;
var d=document.documentElement.style;return"textOverflow"in d||"OTextOverflow"in d?this:this.each(function(){var b=a(this);if(b.css("overflow")=="hidden"){var e=b.html();b.width();var f=a(this.cloneNode(true)).hide().css({position:"absolute",width:"auto",overflow:"visible","max-width":"inherit"});b.after(f);for(var g=e;g.length>0&&f.width()>b.width();){g=g.substr(0,g.length-1);f.html(g+"...")}b.html(f.html());f.remove();if(c==true){var j=b.width();setInterval(function(){if(b.width()!=j){j=b.width();
b.html(e);b.ellipsis()}},200)}}})};a("div.irsw").appendTo("body").css({"margin-top":36,"margin-left":6});a(".nav-button").ellipsis();a(".irswcollapsed.switcher-button").bind("click",function(){a(".irswcollapsed.switcher-button").hide();a(".irswitcher").show();a.browser.msie&&a(".irswb").css("width",function(){return a(".irswcontent").outerWidth()});return false});a("a.nav-button").bind("click",function(){window.location=this.href;return false});a("a.irswexpanded").bind("click",function(){a(".irswitcher").hide();
a(".irswcollapsed.switcher-button").show()});var k;a("div.irswitcher").bind("mouseleave",function(){var c=a(this);k=setTimeout(function(){c.hide();a(".switcher-button.irswcollapsed").show()},500)}).bind("mouseenter",function(){clearTimeout(k)})})})(jQuery);
