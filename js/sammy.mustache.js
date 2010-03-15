// -- Sammy -- /plugins/sammy.mustache.js
// http://code.quirkey.com/sammy
// Version: 0.5.2
// Built: Sun Mar 14 15:49:26 -0400 2010
(function(b){if(!a){var a=function(){var c=function(){};c.prototype={otag:"{{",ctag:"}}",pragmas:{},buffer:[],render:function(g,f,e,h){if(g.indexOf(this.otag)==-1){if(h){return g}else{this.send(g)}}if(!h){this.buffer=[]}g=this.render_pragmas(g);var d=this.render_section(g,f,e);if(h){return this.render_tags(d,f,e,h)}this.render_tags(d,f,e,h)},send:function(d){if(d!=""){this.buffer.push(d)}},render_pragmas:function(d){if(d.indexOf(this.otag+"%")==-1){return d}var f=this;var e=new RegExp(this.otag+"%([\\w_-]+) ?([\\w]+=[\\w]+)?"+this.ctag);return d.replace(e,function(j,g,h){f.pragmas[g]={};if(h){var k=h.split("=");f.pragmas[g][k[0]]=k[1]}return""})},render_partial:function(d,f,e){if(typeof(f[d])!="object"){throw ({message:"subcontext for '"+d+"' is not an object"})}if(!e||!e[d]){throw ({message:"unknown_partial"})}return this.render(e[d],f[d],e,true)},render_section:function(f,e,d){if(f.indexOf(this.otag+"#")==-1){return f}var h=this;var g=new RegExp(this.otag+"\\#(.+)"+this.ctag+"\\s*([\\s\\S]+?)"+this.otag+"\\/\\1"+this.ctag+"\\s*","mg");return f.replace(g,function(k,j,l){var m=h.find(j,e);if(h.is_array(m)){return h.map(m,function(n){return h.render(l,h.merge(e,h.create_context(n)),d,true)}).join("")}else{if(m){return h.render(l,e,d,true)}else{return""}}})},render_tags:function(l,d,f,h){var g=this;var k=function(){return new RegExp(g.otag+"(=|!|>|\\{|%)?([^/#]+?)\\1?"+g.ctag+"+","g")};var j=k();var m=l.split("\n");for(var e=0;e<m.length;e++){m[e]=m[e].replace(j,function(p,n,o){switch(n){case"!":return p;case"=":g.set_delimiters(o);j=k();return"";case">":return g.render_partial(o,d,f);case"{":return g.find(o,d);default:return g.escape(g.find(o,d))}},this);if(!h){this.send(m[e])}}return m.join("\n")},set_delimiters:function(e){var d=e.split(" ");this.otag=this.escape_regex(d[0]);this.ctag=this.escape_regex(d[1])},escape_regex:function(e){if(!arguments.callee.sRE){var d=["/",".","*","+","?","|","(",")","[","]","{","}","\\"];arguments.callee.sRE=new RegExp("(\\"+d.join("|\\")+")","g")}return e.replace(arguments.callee.sRE,"\\$1")},find:function(d,e){d=this.trim(d);if(typeof e[d]==="function"){return e[d].apply(e)}if(e[d]!==undefined){return e[d]}return""},escape:function(d){return d.toString().replace(/[&"<>\\]/g,function(e){switch(e){case"&":return"&amp;";case"\\":return"\\\\";case'"':return'"';case"<":return"&lt;";case">":return"&gt;";default:return e}})},merge:function(e,d){var g={};for(var f in e){if(e.hasOwnProperty(f)){g[f]=e[f]}}for(var f in d){if(d.hasOwnProperty(f)){g[f]=d[f]}}return g},create_context:function(e){if(this.is_object(e)){return e}else{if(this.pragmas["IMPLICIT-ITERATOR"]){var f=this.pragmas["IMPLICIT-ITERATOR"].iterator||".";var d={};d[f]=e;return d}}},is_object:function(d){return d&&typeof d=="object"},is_array:function(d){return(d&&typeof d==="object"&&d.constructor===Array)},trim:function(d){return d.replace(/^\s*|\s*$/g,"")},map:function(g,e){if(typeof g.map=="function"){return g.map(e)}else{var f=[];var d=g.length;for(i=0;i<d;i++){f.push(e(g[i]))}return f}}};return({name:"mustache.js",version:"0.2.2",to_html:function(f,d,e,h){var g=new c();if(h){g.send=h}g.render(f,d,e);return g.buffer.join("\n")}})}()}Sammy=Sammy||{};Sammy.Mustache=function(e,c){var d=function(g,h,f){h=b.extend({},this,h);f=b.extend({},h.partials,f);return a.to_html(g,h,f)};if(!c){c="mustache"}e.helper(c,d)}})(jQuery);