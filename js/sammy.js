// -- Sammy -- /sammy.js
// http://code.quirkey.com/sammy
// Version: 0.5.2
// Built: Sun Mar 14 15:49:31 -0400 2010
(function(g){var h,d="([^/]+)",f=/:([\w\d]+)/g,c=/\?([^#]*)$/,a=decodeURIComponent,b=function(i){return function(j,k){return this.route.apply(this,[i,j,k])}},e=[];h=function(){var j=g.makeArray(arguments),k,i;h.apps=h.apps||{};if(j.length===0||j[0]&&g.isFunction(j[0])){return h.apply(h,["body"].concat(j))}else{if(typeof(i=j.shift())=="string"){k=h.apps[i]||new h.Application();k.element_selector=i;if(j.length>0){g.each(j,function(l,m){k.use(m)})}if(k.element_selector!=i){delete h.apps[i]}h.apps[k.element_selector]=k;return k}}};h.VERSION="0.5.2";h.addLogger=function(i){e.push(i)};h.log=function(){var i=g.makeArray(arguments);i.unshift("["+Date()+"]");g.each(e,function(k,j){j.apply(h,i)})};if(typeof window.console!="undefined"){if(g.isFunction(console.log.apply)){h.addLogger(function(){window.console.log.apply(console,arguments)})}else{h.addLogger(function(){window.console.log(arguments)})}}else{if(typeof console!="undefined"){h.addLogger(function(){console.log.apply(console,arguments)})}}h.Object=function(i){return g.extend(this,i||{})};g.extend(h.Object.prototype,{toHash:function(){var i={};g.each(this,function(l,j){if(!g.isFunction(j)){i[l]=j}});return i},toHTML:function(){var i="";g.each(this,function(l,j){if(!g.isFunction(j)){i+="<strong>"+l+"</strong> "+j+"<br />"}});return i},uuid:function(){if(typeof this._uuid=="undefined"||!this._uuid){this._uuid=(new Date()).getTime()+"-"+parseInt(Math.random()*1000,10)}return this._uuid},keys:function(i){var j=[];for(var k in this){if(!g.isFunction(this[k])||!i){j.push(k)}}return j},has:function(i){return this[i]&&g.trim(this[i].toString())!=""},join:function(){var j=g.makeArray(arguments);var i=j.shift();return j.join(i)},log:function(){h.log.apply(h,arguments)},toString:function(i){var j=[];g.each(this,function(m,l){if(!g.isFunction(l)||i){j.push('"'+m+'": '+l.toString())}});return"Sammy.Object: {"+j.join(",")+"}"}});h.HashLocationProxy=function(j,i){this.app=j;if("onhashchange" in window){h.log("native hash change exists, using");this.is_native=true}else{h.log("no native hash change, falling back to polling");this.is_native=false;this._startPolling(i)}};h.HashLocationProxy.prototype={bind:function(){var i=this.app;g(window).bind("hashchange."+this.app.eventNamespace(),function(){i.trigger("location-changed")})},unbind:function(){g(window).die("hashchange."+this.app.eventNamespace())},getLocation:function(){var i=window.location.toString().match(/^[^#]*(#.+)$/);return i?i[1]:""},setLocation:function(i){return(window.location=i)},_startPolling:function(k){var j=this;if(!h.HashLocationProxy._interval){if(!k){k=10}var i=function(){current_location=j.getLocation();if(!h.HashLocationProxy._last_location||current_location!=h.HashLocationProxy._last_location){setTimeout(function(){g(window).trigger("hashchange")},1)}h.HashLocationProxy._last_location=current_location};i();h.HashLocationProxy._interval=setInterval(i,k);g(window).bind("beforeunload",function(){clearInterval(h.HashLocationProxy._interval)})}}};h.DataLocationProxy=function(j,i){this.app=j;this.data_name=i||"sammy-location"};h.DataLocationProxy.prototype={bind:function(){var i=this;this.app.$element().bind("setData",function(k,j){if(j==i.data_name){i.app.trigger("location-changed")}})},unbind:function(){this.app.$element().die("setData")},getLocation:function(){return this.app.$element().data(this.data_name)},setLocation:function(i){return this.app.$element().data(this.data_name,i)}};h.Application=function(i){var j=this;this.routes={};this.listeners=new h.Object({});this.arounds=[];this.befores=[];this.namespace=this.uuid();this.context_prototype=function(){h.EventContext.apply(this,arguments)};this.context_prototype.prototype=new h.EventContext();if(g.isFunction(i)){i.apply(this,[this])}if(!this.location_proxy){this.location_proxy=new h.HashLocationProxy(j,this.run_interval_every)}if(this.debug){this.bindToAllEvents(function(l,k){j.log(j.toString(),l.cleaned_type,k||{})})}};h.Application.prototype=g.extend({},h.Object.prototype,{ROUTE_VERBS:["get","post","put","delete"],APP_EVENTS:["run","unload","lookup-route","run-route","route-found","event-context-before","event-context-after","changed","error","check-form-submission","redirect"],_last_route:null,_running:false,element_selector:"body",debug:false,raise_errors:false,run_interval_every:50,location_proxy:null,template_engine:null,toString:function(){return"Sammy.Application:"+this.element_selector},$element:function(){return g(this.element_selector)},use:function(){var i=g.makeArray(arguments);var j=i.shift();try{i.unshift(this);j.apply(this,i)}catch(k){if(typeof j=="undefined"){this.error("Plugin Error: called use() but plugin is not defined",k)}else{if(!g.isFunction(j)){this.error("Plugin Error: called use() but '"+j.toString()+"' is not a function",k)}else{this.error("Plugin Error",k)}}}return this},route:function(l,j,n){var k=this,m=[],i;if(!n&&g.isFunction(j)){j=l;n=j;l="any"}l=l.toLowerCase();if(j.constructor==String){f.lastIndex=0;while((path_match=f.exec(j))!==null){m.push(path_match[1])}j=new RegExp("^"+j.replace(f,d)+"$")}if(typeof n=="string"){n=k[n]}i=function(o){var p={verb:o,path:j,callback:n,param_names:m};k.routes[o]=k.routes[o]||[];k.routes[o].push(p)};if(l==="any"){g.each(this.ROUTE_VERBS,function(p,o){i(o)})}else{i(l)}return this},get:b("get"),post:b("post"),put:b("put"),del:b("delete"),any:b("any"),mapRoutes:function(j){var i=this;g.each(j,function(k,l){i.route.apply(i,l)});return this},eventNamespace:function(){return["sammy-app",this.namespace].join("-")},bind:function(i,k,m){var l=this;if(typeof m=="undefined"){m=k}var j=function(){var p,n,o;p=arguments[0];o=arguments[1];if(o&&o.context){n=o.context;delete o.context}else{n=new l.context_prototype(l,"bind",p.type,o)}p.cleaned_type=p.type.replace(l.eventNamespace(),"");m.apply(n,[p,o])};if(!this.listeners[i]){this.listeners[i]=[]}this.listeners[i].push(j);if(this.isRunning()){this._listen(i,j)}return this},trigger:function(i,j){this.$element().trigger([i,this.eventNamespace()].join("."),[j]);return this},refresh:function(){this.last_location=null;this.trigger("location-changed");return this},before:function(i,j){if(g.isFunction(i)){j=i;i={}}this.befores.push([i,j]);return this},after:function(i){return this.bind("event-context-after",i)},around:function(i){this.arounds.push(i);return this},isRunning:function(){return this._running},helpers:function(i){g.extend(this.context_prototype.prototype,i);return this},helper:function(i,j){this.context_prototype.prototype[i]=j;return this},run:function(i){if(this.isRunning()){return false}var j=this;g.each(this.listeners.toHash(),function(k,l){g.each(l,function(n,m){j._listen(k,m)})});this.trigger("run",{start_url:i});this._running=true;this.last_location=null;if(this.getLocation()==""&&typeof i!="undefined"){this.setLocation(i)}this._checkLocation();this.location_proxy.bind();this.bind("location-changed",function(){j._checkLocation()});this.bind("submit",function(l){var k=j._checkFormSubmission(g(l.target).closest("form"));return(k===false)?l.preventDefault():false});g(window).bind("beforeunload",function(){j.unload()});return this.trigger("changed")},unload:function(){if(!this.isRunning()){return false}var i=this;this.trigger("unload");this.location_proxy.unbind();this.$element().unbind("submit").removeClass(i.eventNamespace());g.each(this.listeners.toHash(),function(j,k){g.each(k,function(m,l){i._unlisten(j,l)})});this._running=false;return this},bindToAllEvents:function(j){var i=this;g.each(this.APP_EVENTS,function(k,l){i.bind(l,j)});g.each(this.listeners.keys(true),function(l,k){if(i.APP_EVENTS.indexOf(k)==-1){i.bind(k,j)}});return this},routablePath:function(i){return i.replace(c,"")},lookupRoute:function(l,j){var k=this,i=false;this.trigger("lookup-route",{verb:l,path:j});if(typeof this.routes[l]!="undefined"){g.each(this.routes[l],function(n,m){if(k.routablePath(j).match(m.path)){i=m;return false}})}return i},runRoute:function(k,v,m){var l=this,t=this.lookupRoute(k,v),j,r,n,q,u,s,p,i;this.log("runRoute",[k,v].join(" "));this.trigger("run-route",{verb:k,path:v,params:m});if(typeof m=="undefined"){m={}}g.extend(m,this._parseQueryString(v));if(t){this.trigger("route-found",{route:t});if((path_params=t.path.exec(this.routablePath(v)))!==null){path_params.shift();g.each(path_params,function(w,x){if(t.param_names[w]){m[t.param_names[w]]=a(x)}else{if(!m.splat){m.splat=[]}m.splat.push(a(x))}})}j=new this.context_prototype(this,k,v,m);n=this.arounds.slice(0);u=this.befores.slice(0);p=[j].concat(m.splat);r=function(){var w;while(u.length>0){s=u.shift();if(l.contextMatchesOptions(j,s[0])){w=s[1].apply(j,[j]);if(w===false){return false}}}l.last_route=t;j.trigger("event-context-before",{context:j});w=t.callback.apply(j,p);j.trigger("event-context-after",{context:j});return w};g.each(n.reverse(),function(w,x){var y=r;r=function(){return x.apply(j,[y])}});try{i=r()}catch(o){this.error(["500 Error",k,v].join(" "),o)}return i}else{return this.notFound(k,v)}},contextMatchesOptions:function(l,n,j){var k=n;if(typeof k==="undefined"||k=={}){return true}if(typeof j==="undefined"){j=true}if(typeof k==="string"||g.isFunction(k.test)){k={path:k}}if(k.only){return this.contextMatchesOptions(l,k.only,true)}else{if(k.except){return this.contextMatchesOptions(l,k.except,false)}}var i=true,m=true;if(k.path){if(g.isFunction(k.path.test)){i=k.path.test(l.path)}else{i=(k.path.toString()===l.path)}}if(k.verb){m=k.verb===l.verb}return j?(m&&i):!(m&&i)},getLocation:function(){return this.location_proxy.getLocation()},setLocation:function(i){return this.location_proxy.setLocation(i)},swap:function(i){return this.$element().html(i)},notFound:function(k,j){var i=this.error(["404 Not Found",k,j].join(" "));return(k==="get")?i:true},error:function(j,i){if(!i){i=new Error()}i.message=[j,i.message].join(" ");this.trigger("error",{message:i.message,error:i});if(this.raise_errors){throw (i)}else{this.log(i.message,i)}},_checkLocation:function(){var i,j;i=this.getLocation();if(i!=this.last_location){j=this.runRoute("get",i)}this.last_location=i;return j},_checkFormSubmission:function(k){var i,l,n,m,j;this.trigger("check-form-submission",{form:k});i=g(k);l=i.attr("action");n=g.trim(i.attr("method").toString().toLowerCase());if(!n||n==""){n="get"}this.log("_checkFormSubmission",i,l,n);m=g.extend({},this._parseFormParams(i),{"$form":i});j=this.runRoute(n,l,m);return(typeof j=="undefined")?false:j},_parseFormParams:function(i){var j={};g.each(i.serializeArray(),function(k,l){if(j[l.name]){if(g.isArray(j[l.name])){j[l.name].push(l.value)}else{j[l.name]=[j[l.name],l.value]}}else{j[l.name]=l.value}});return j},_parseQueryString:function(n){var l={},m,k,o,j;m=n.match(c);if(m){k=m[1].split("&");for(j=0;j<k.length;j+=1){o=k[j].split("=");l[o[0]]=a(o[1])}}return l},_listen:function(i,j){return this.$element().bind([i,this.eventNamespace()].join("."),j)},_unlisten:function(i,j){return this.$element().unbind([i,this.eventNamespace()].join("."),j)}});h.EventContext=function(l,k,i,j){this.app=l;this.verb=k;this.path=i;this.params=new h.Object(j)};h.EventContext.prototype=g.extend({},h.Object.prototype,{$element:function(){return this.app.$element()},partial:function(q,m,p){var i,l,o,n,k="partial:"+q,j=this;if((o=q.match(/\.([^\.]+)$/))){o=o[1]}if((!o||!g.isFunction(j[o]))&&this.app.template_engine){o=this.app.template_engine}if(o&&!g.isFunction(o)&&g.isFunction(j[o])){o=j[o]}if(!p&&g.isFunction(m)){p=m;m={}}n=(g.isArray(m)?m:[m||{}]);l=function(r){var s=r,t="";g.each(n,function(u,v){g.extend(v,j);if(g.isFunction(o)){s=o.apply(j,[r,v])}t+=s;if(p){return p.apply(j,[s,u])}});if(!p){j.swap(t)}j.trigger("changed")};if(this.app.cache_partials&&this.cache(k)){l.apply(j,[this.cache(k)])}else{g.get(q,function(r){if(j.app.cache_partials){j.cache(k,r)}l.apply(j,[r])})}},redirect:function(){var k,j=g.makeArray(arguments),i=this.app.getLocation();if(j.length>1){j.unshift("/");k=this.join.apply(this,j)}else{k=j[0]}this.trigger("redirect",{to:k});this.app.last_location=this.path;this.app.setLocation(k);if(i==k){this.app.trigger("location-changed")}},trigger:function(i,j){if(typeof j=="undefined"){j={}}if(!j.context){j.context=this}return this.app.trigger(i,j)},eventNamespace:function(){return this.app.eventNamespace()},swap:function(i){return this.app.swap(i)},notFound:function(){return this.app.notFound(this.verb,this.path)},toString:function(){return"Sammy.EventContext: "+[this.verb,this.path,this.params].join(" ")}});g.sammy=window.Sammy=h})(jQuery);