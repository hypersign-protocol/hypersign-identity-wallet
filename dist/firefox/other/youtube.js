(()=>{var e={39412:function(e,r){var s,n;s=function(e){"use strict";if("undefined"==typeof browser||Object.getPrototypeOf(browser)!==Object.prototype){const r="The message port closed before a response was received.",s="Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)",n=()=>{const e={alarms:{clear:{minArgs:0,maxArgs:1},clearAll:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getAll:{minArgs:0,maxArgs:0}},bookmarks:{create:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},getChildren:{minArgs:1,maxArgs:1},getRecent:{minArgs:1,maxArgs:1},getSubTree:{minArgs:1,maxArgs:1},getTree:{minArgs:0,maxArgs:0},move:{minArgs:2,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeTree:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}},browserAction:{disable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},enable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},getBadgeBackgroundColor:{minArgs:1,maxArgs:1},getBadgeText:{minArgs:1,maxArgs:1},getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},openPopup:{minArgs:0,maxArgs:0},setBadgeBackgroundColor:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setBadgeText:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},browsingData:{remove:{minArgs:2,maxArgs:2},removeCache:{minArgs:1,maxArgs:1},removeCookies:{minArgs:1,maxArgs:1},removeDownloads:{minArgs:1,maxArgs:1},removeFormData:{minArgs:1,maxArgs:1},removeHistory:{minArgs:1,maxArgs:1},removeLocalStorage:{minArgs:1,maxArgs:1},removePasswords:{minArgs:1,maxArgs:1},removePluginData:{minArgs:1,maxArgs:1},settings:{minArgs:0,maxArgs:0}},commands:{getAll:{minArgs:0,maxArgs:0}},contextMenus:{remove:{minArgs:1,maxArgs:1},removeAll:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},cookies:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:1,maxArgs:1},getAllCookieStores:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},devtools:{inspectedWindow:{eval:{minArgs:1,maxArgs:2}},panels:{create:{minArgs:3,maxArgs:3,singleCallbackArg:!0}}},downloads:{cancel:{minArgs:1,maxArgs:1},download:{minArgs:1,maxArgs:1},erase:{minArgs:1,maxArgs:1},getFileIcon:{minArgs:1,maxArgs:2},open:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},pause:{minArgs:1,maxArgs:1},removeFile:{minArgs:1,maxArgs:1},resume:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},extension:{isAllowedFileSchemeAccess:{minArgs:0,maxArgs:0},isAllowedIncognitoAccess:{minArgs:0,maxArgs:0}},history:{addUrl:{minArgs:1,maxArgs:1},deleteAll:{minArgs:0,maxArgs:0},deleteRange:{minArgs:1,maxArgs:1},deleteUrl:{minArgs:1,maxArgs:1},getVisits:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1}},i18n:{detectLanguage:{minArgs:1,maxArgs:1},getAcceptLanguages:{minArgs:0,maxArgs:0}},identity:{launchWebAuthFlow:{minArgs:1,maxArgs:1}},idle:{queryState:{minArgs:1,maxArgs:1}},management:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},getSelf:{minArgs:0,maxArgs:0},setEnabled:{minArgs:2,maxArgs:2},uninstallSelf:{minArgs:0,maxArgs:1}},notifications:{clear:{minArgs:1,maxArgs:1},create:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:0},getPermissionLevel:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},pageAction:{getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},hide:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},permissions:{contains:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},request:{minArgs:1,maxArgs:1}},runtime:{getBackgroundPage:{minArgs:0,maxArgs:0},getBrowserInfo:{minArgs:0,maxArgs:0},getPlatformInfo:{minArgs:0,maxArgs:0},openOptionsPage:{minArgs:0,maxArgs:0},requestUpdateCheck:{minArgs:0,maxArgs:0},sendMessage:{minArgs:1,maxArgs:3},sendNativeMessage:{minArgs:2,maxArgs:2},setUninstallURL:{minArgs:1,maxArgs:1}},sessions:{getDevices:{minArgs:0,maxArgs:1},getRecentlyClosed:{minArgs:0,maxArgs:1},restore:{minArgs:0,maxArgs:1}},storage:{local:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},managed:{get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1}},sync:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}}},tabs:{captureVisibleTab:{minArgs:0,maxArgs:2},create:{minArgs:1,maxArgs:1},detectLanguage:{minArgs:0,maxArgs:1},discard:{minArgs:0,maxArgs:1},duplicate:{minArgs:1,maxArgs:1},executeScript:{minArgs:1,maxArgs:2},get:{minArgs:1,maxArgs:1},getCurrent:{minArgs:0,maxArgs:0},getZoom:{minArgs:0,maxArgs:1},getZoomSettings:{minArgs:0,maxArgs:1},highlight:{minArgs:1,maxArgs:1},insertCSS:{minArgs:1,maxArgs:2},move:{minArgs:2,maxArgs:2},query:{minArgs:1,maxArgs:1},reload:{minArgs:0,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeCSS:{minArgs:1,maxArgs:2},sendMessage:{minArgs:2,maxArgs:3},setZoom:{minArgs:1,maxArgs:2},setZoomSettings:{minArgs:1,maxArgs:2},update:{minArgs:1,maxArgs:2}},topSites:{get:{minArgs:0,maxArgs:0}},webNavigation:{getAllFrames:{minArgs:1,maxArgs:1},getFrame:{minArgs:1,maxArgs:1}},webRequest:{handlerBehaviorChanged:{minArgs:0,maxArgs:0}},windows:{create:{minArgs:0,maxArgs:1},get:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:1},getCurrent:{minArgs:0,maxArgs:1},getLastFocused:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}}};if(0===Object.keys(e).length)throw new Error("api-metadata.json has not been included in browser-polyfill");class n extends WeakMap{constructor(e,r=void 0){super(r),this.createItem=e}get(e){return this.has(e)||this.set(e,this.createItem(e)),super.get(e)}}const g=(e,r)=>(...s)=>{chrome.runtime.lastError?e.reject(chrome.runtime.lastError):r.singleCallbackArg||s.length<=1?e.resolve(s[0]):e.resolve(s)},t=e=>1==e?"argument":"arguments",a=(e,r,s)=>new Proxy(r,{apply:(r,n,g)=>s.call(n,e,...g)});let m=Function.call.bind(Object.prototype.hasOwnProperty);const i=(e,r={},s={})=>{let n=Object.create(null),o={has:(r,s)=>s in e||s in n,get(o,A,l){if(A in n)return n[A];if(!(A in e))return;let c=e[A];if("function"==typeof c)if("function"==typeof r[A])c=a(e,e[A],r[A]);else if(m(s,A)){let r=((e,r)=>function(s,...n){if(n.length<r.minArgs)throw new Error(`Expected at least ${r.minArgs} ${t(r.minArgs)} for ${e}(), got ${n.length}`);if(n.length>r.maxArgs)throw new Error(`Expected at most ${r.maxArgs} ${t(r.maxArgs)} for ${e}(), got ${n.length}`);return new Promise(((t,a)=>{if(r.fallbackToNoCallback)try{s[e](...n,g({resolve:t,reject:a},r))}catch(g){console.warn(`${e} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `,g),s[e](...n),r.fallbackToNoCallback=!1,r.noCallback=!0,t()}else r.noCallback?(s[e](...n),t()):s[e](...n,g({resolve:t,reject:a},r))}))})(A,s[A]);c=a(e,e[A],r)}else c=c.bind(e);else{if("object"!=typeof c||null===c||!m(r,A)&&!m(s,A))return Object.defineProperty(n,A,{configurable:!0,enumerable:!0,get:()=>e[A],set(r){e[A]=r}}),c;c=i(c,r[A],s[A])}return n[A]=c,c},set:(r,s,g,t)=>(s in n?n[s]=g:e[s]=g,!0),defineProperty:(e,r,s)=>Reflect.defineProperty(n,r,s),deleteProperty:(e,r)=>Reflect.deleteProperty(n,r)},A=Object.create(e);return new Proxy(A,o)},o=e=>({addListener(r,s,...n){r.addListener(e.get(s),...n)},hasListener:(r,s)=>r.hasListener(e.get(s)),removeListener(r,s){r.removeListener(e.get(s))}});let A=!1;const l=new n((e=>"function"!=typeof e?e:function(r,n,g){let t,a,m=!1,i=new Promise((e=>{t=function(r){A||(console.warn(s,(new Error).stack),A=!0),m=!0,e(r)}}));try{a=e(r,n,t)}catch(e){a=Promise.reject(e)}const o=!0!==a&&((l=a)&&"object"==typeof l&&"function"==typeof l.then);var l;if(!0!==a&&!o&&!m)return!1;return(o?a:i).then((e=>{g(e)}),(e=>{let r;r=e&&(e instanceof Error||"string"==typeof e.message)?e.message:"An unexpected error occurred",g({__mozWebExtensionPolyfillReject__:!0,message:r})})).catch((e=>{console.error("Failed to send onMessage rejected reply",e)})),!0})),c=({reject:e,resolve:s},n)=>{chrome.runtime.lastError?chrome.runtime.lastError.message===r?s():e(chrome.runtime.lastError):n&&n.__mozWebExtensionPolyfillReject__?e(new Error(n.message)):s(n)},x=(e,r,s,...n)=>{if(n.length<r.minArgs)throw new Error(`Expected at least ${r.minArgs} ${t(r.minArgs)} for ${e}(), got ${n.length}`);if(n.length>r.maxArgs)throw new Error(`Expected at most ${r.maxArgs} ${t(r.maxArgs)} for ${e}(), got ${n.length}`);return new Promise(((e,r)=>{const g=c.bind(null,{resolve:e,reject:r});n.push(g),s.sendMessage(...n)}))},d={runtime:{onMessage:o(l),onMessageExternal:o(l),sendMessage:x.bind(null,"sendMessage",{minArgs:1,maxArgs:3})},tabs:{sendMessage:x.bind(null,"sendMessage",{minArgs:2,maxArgs:3})}},u={clear:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}};return e.privacy={network:{networkPredictionEnabled:u,webRTCIPHandlingPolicy:u},services:{passwordSavingEnabled:u},websites:{hyperlinkAuditingEnabled:u,referrersEnabled:u}},i(chrome,d,e)};e.exports=n()}else e.exports=browser},void 0===(n=s.apply(r,[e]))||(e.exports=n)}},r={};function s(n){var g=r[n];if(void 0!==g)return g.exports;var t=r[n]={exports:{}};return e[n].call(t.exports,t,t.exports,s),t.exports}s.p="../",(()=>{"use strict";const e=s.p+"assets/twitter-icon-tip.127cec652a79c33c6489.svg";window.browser=s(39412);const r=document.createElement("link");r.rel="stylesheet",r.type="text/css",r.href=browser.extension.getURL("other/tipButton.css"),(document.head||document.documentElement).appendChild(r),setTimeout((async()=>{const r=document.querySelector("ytd-menu-renderer.style-scope.ytd-video-primary-info-renderer #top-level-buttons"),s=r.querySelectorAll(".action-superhero-tip");if(!await browser.runtime.sendMessage({method:"checkHasAccount"})||!r||s.length)return;const n=(r=>{const s=document.createElement("div");s.className="action-superhero-tip",s.setAttribute("role","button"),s.setAttribute("tabindex","0");const n=document.createElement("img");n.src=e;const g=document.createElement("span");g.innerHTML="Tip";const t=document.createElement("button");return t.appendChild(n),t.appendChild(g),t.onclick=e=>{browser.runtime.sendMessage({from:"content",type:"openTipPopup",url:r}),e.stopPropagation()},s.appendChild(t),s})(window.location.href);n.classList.add("youtube"),r.append(n)}),5e3)})()})();