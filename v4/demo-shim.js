/* Keeps the record in this browser so the pages work without the shared log. */
(function(){
var KEY='v4demo.store',NAMEKEY='v4demo.name',store={},L=[];
function load(){try{store=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){store={}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){}}
function clone(x){return x==null?x:JSON.parse(JSON.stringify(x))}
function kids(path){var pre=path+'/',out=[];Object.keys(store).forEach(function(k){if(k.indexOf(pre)===0&&k.slice(pre.length).indexOf('/')<0)out.push(k.slice(pre.length))});return out}
function snapDoc(path){var v=store[path];return{id:path.split('/').pop(),exists:v!==undefined,data:function(){return clone(v)}}}
function snapCol(path){var ids=kids(path),docs=ids.map(function(i){return{id:i,exists:true,data:function(){return clone(store[path+'/'+i])}}});
 return{docs:docs,size:docs.length,empty:!docs.length,forEach:function(f){docs.forEach(f)}}}
function notify(){L.slice().forEach(function(l){try{l.run()}catch(e){}})}
function listen(run){var l={run:run};L.push(l);setTimeout(run,0);return function(){var i=L.indexOf(l);if(i>=0)L.splice(i,1)}}
function uid(){return 'd'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function doc(path){return{
 id:path.split('/').pop(),
 set:function(o,opt){load();store[path]=(opt&&opt.merge&&store[path])?Object.assign({},store[path],clone(o)):clone(o);save();notify();return Promise.resolve()},
 update:function(o){load();store[path]=Object.assign({},store[path]||{},clone(o));save();notify();return Promise.resolve()},
 delete:function(){load();delete store[path];save();notify();return Promise.resolve()},
 get:function(){load();return Promise.resolve(snapDoc(path))},
 onSnapshot:function(ok){return listen(function(){load();ok(snapDoc(path))})}}}
function col(path){return{
 doc:function(i){return doc(path+'/'+(i||uid()))},
 add:function(o){var i=uid();load();store[path+'/'+i]=clone(o);save();notify();return Promise.resolve({id:i})},
 get:function(){load();return Promise.resolve(snapCol(path))},
 onSnapshot:function(ok){return listen(function(){load();ok(snapCol(path))})}}}
var db={doc:doc,collection:col};
function myName(){var n='';try{n=localStorage.getItem(NAMEKEY)||''}catch(e){}
 if(!n){try{n=(window.prompt('Enter your name. Every change you make is recorded against it:','')||'').trim()}catch(e){}
  if(!n)n='Staff user';try{localStorage.setItem(NAMEKEY,n)}catch(e){}}return n}
var NAME=myName();
var user={id:function(){return Promise.resolve('demo-'+NAME.toLowerCase().replace(/[^a-z0-9]+/g,'-'))},
 profiles:function(ids){var o={};(ids||[]).forEach(function(i){o[i]={name:i.indexOf('demo-')===0?NAME:'Staff user'}});return Promise.resolve(o)},
 name:function(){return Promise.resolve(NAME)}};
var downloads={save:function(o){try{var b=new Blob([o.data],{type:'application/octet-stream'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=o.filename||'export';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);return Promise.resolve()}catch(e){return Promise.reject(e)}}};
window.house={use:function(n){return Promise.resolve(n==='db'?db:n==='user'?user:n==='downloads'?downloads:null)}};
window.addEventListener('storage',function(e){if(e.key===KEY)notify()});
document.addEventListener('DOMContentLoaded',function(){var b=document.createElement('button');b.textContent='New sitting';b.title='Clear everything and start from empty';
 b.style.cssText='position:fixed;right:10px;bottom:10px;z-index:99999;font:600 11px Inter,system-ui,sans-serif;background:#0d2b19;color:#f7f4ee;border:0;padding:6px 11px;opacity:.55;cursor:pointer;border-radius:2px';
 b.onmouseenter=function(){b.style.opacity=1};b.onmouseleave=function(){b.style.opacity=.55};
 b.onclick=function(){if(!confirm('Clear all guests and counts and start from an empty sitting?'))return;try{localStorage.removeItem(KEY)}catch(e){}store={};notify();location.reload()};document.body.appendChild(b)});
})();
