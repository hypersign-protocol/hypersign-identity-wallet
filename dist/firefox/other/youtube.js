(()=>{var e={54512:e=>{e.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNy40OTgiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNy40OTggMTQiPgogIDxnIGlkPSJJY29uX0hlYXJ0IiBkYXRhLW5hbWU9Ikljb24vSGVhcnQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0wLjI1MSAwKSI+CiAgICA8cGF0aCBpZD0iU2hpZWxkIiBkPSJNOC43NSwxNGEuNjE2LjYxNiwwLDAsMS0uNDM5LS4xODNMLjE4NSw1LjY2N2EuNjQ1LjY0NSwwLDAsMS0uMTEtLjc1MkwyLjUyLjMzMkEuNjIyLjYyMiwwLDAsMSwzLjA2OSwwSDE0LjQzMWEuNjIyLjYyMiwwLDAsMSwuNTQ5LjMzMmwyLjQ0NCw0LjU4M2EuNjQ0LjY0NCwwLDAsMS0uMTExLjc1MmwtOC4xMjUsOC4xNUEuNjE2LjYxNiwwLDAsMSw4Ljc1LDE0Wk0zLjYsMS41LDEuNyw1LjA2bDcuMDUyLDcuMDcyTDE1LjgsNS4wNiwxMy45LDEuNVptNC44MjQsOS44SDguNGEuMTc4LjE3OCwwLDAsMS0uMTU1LS4xMzlsMC0uMDU2LjQyNS0zLjQxMmEuMTc2LjE3NiwwLDAsMC0uMTI0LS4xNjZsLS4wNTctLjAwOS0zLjA0OC4wMTFhLjE4OC4xODgsMCwwLDEtLjEtLjAzMUEuMTczLjE3MywwLDAsMSw1LjI2NSw3LjNsLjAyNS0uMDVMOS4yLDEuODc0QS4xOC4xOCwwLDAsMSw5LjM0NSwxLjhsLjAyNywwYS4xNzcuMTc3LDAsMCwxLC4xNS4xNDNWMkw5LjAwNSw1LjM2bDAsLjAyNmEuMTc2LjE3NiwwLDAsMCwuMTIzLjE2NmwuMDU4LjAwOCwyLjkwNi0uMDA2YS4xODQuMTg0LDAsMCwxLC4xLjAyOS4xNzEuMTcxLDAsMCwxLC4wNzUuMTkxbC0uMDIzLjA1MS0zLjY3LDUuNEEuMTguMTgsMCwwLDEsOC40MjEsMTEuM1oiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMjUpIiBmaWxsPSIjNzI3Mjc4Ii8+CiAgPC9nPgo8L3N2Zz4K"},39412:function(e,r){var s,g;s=function(e){"use strict";if("undefined"==typeof browser||Object.getPrototypeOf(browser)!==Object.prototype){const r="The message port closed before a response was received.",s="Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)",g=()=>{const e={alarms:{clear:{minArgs:0,maxArgs:1},clearAll:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getAll:{minArgs:0,maxArgs:0}},bookmarks:{create:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},getChildren:{minArgs:1,maxArgs:1},getRecent:{minArgs:1,maxArgs:1},getSubTree:{minArgs:1,maxArgs:1},getTree:{minArgs:0,maxArgs:0},move:{minArgs:2,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeTree:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}},browserAction:{disable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},enable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},getBadgeBackgroundColor:{minArgs:1,maxArgs:1},getBadgeText:{minArgs:1,maxArgs:1},getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},openPopup:{minArgs:0,maxArgs:0},setBadgeBackgroundColor:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setBadgeText:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},browsingData:{remove:{minArgs:2,maxArgs:2},removeCache:{minArgs:1,maxArgs:1},removeCookies:{minArgs:1,maxArgs:1},removeDownloads:{minArgs:1,maxArgs:1},removeFormData:{minArgs:1,maxArgs:1},removeHistory:{minArgs:1,maxArgs:1},removeLocalStorage:{minArgs:1,maxArgs:1},removePasswords:{minArgs:1,maxArgs:1},removePluginData:{minArgs:1,maxArgs:1},settings:{minArgs:0,maxArgs:0}},commands:{getAll:{minArgs:0,maxArgs:0}},contextMenus:{remove:{minArgs:1,maxArgs:1},removeAll:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},cookies:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:1,maxArgs:1},getAllCookieStores:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},devtools:{inspectedWindow:{eval:{minArgs:1,maxArgs:2}},panels:{create:{minArgs:3,maxArgs:3,singleCallbackArg:!0}}},downloads:{cancel:{minArgs:1,maxArgs:1},download:{minArgs:1,maxArgs:1},erase:{minArgs:1,maxArgs:1},getFileIcon:{minArgs:1,maxArgs:2},open:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},pause:{minArgs:1,maxArgs:1},removeFile:{minArgs:1,maxArgs:1},resume:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},extension:{isAllowedFileSchemeAccess:{minArgs:0,maxArgs:0},isAllowedIncognitoAccess:{minArgs:0,maxArgs:0}},history:{addUrl:{minArgs:1,maxArgs:1},deleteAll:{minArgs:0,maxArgs:0},deleteRange:{minArgs:1,maxArgs:1},deleteUrl:{minArgs:1,maxArgs:1},getVisits:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1}},i18n:{detectLanguage:{minArgs:1,maxArgs:1},getAcceptLanguages:{minArgs:0,maxArgs:0}},identity:{launchWebAuthFlow:{minArgs:1,maxArgs:1}},idle:{queryState:{minArgs:1,maxArgs:1}},management:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},getSelf:{minArgs:0,maxArgs:0},setEnabled:{minArgs:2,maxArgs:2},uninstallSelf:{minArgs:0,maxArgs:1}},notifications:{clear:{minArgs:1,maxArgs:1},create:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:0},getPermissionLevel:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},pageAction:{getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},hide:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},permissions:{contains:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},request:{minArgs:1,maxArgs:1}},runtime:{getBackgroundPage:{minArgs:0,maxArgs:0},getBrowserInfo:{minArgs:0,maxArgs:0},getPlatformInfo:{minArgs:0,maxArgs:0},openOptionsPage:{minArgs:0,maxArgs:0},requestUpdateCheck:{minArgs:0,maxArgs:0},sendMessage:{minArgs:1,maxArgs:3},sendNativeMessage:{minArgs:2,maxArgs:2},setUninstallURL:{minArgs:1,maxArgs:1}},sessions:{getDevices:{minArgs:0,maxArgs:1},getRecentlyClosed:{minArgs:0,maxArgs:1},restore:{minArgs:0,maxArgs:1}},storage:{local:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},managed:{get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1}},sync:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}}},tabs:{captureVisibleTab:{minArgs:0,maxArgs:2},create:{minArgs:1,maxArgs:1},detectLanguage:{minArgs:0,maxArgs:1},discard:{minArgs:0,maxArgs:1},duplicate:{minArgs:1,maxArgs:1},executeScript:{minArgs:1,maxArgs:2},get:{minArgs:1,maxArgs:1},getCurrent:{minArgs:0,maxArgs:0},getZoom:{minArgs:0,maxArgs:1},getZoomSettings:{minArgs:0,maxArgs:1},highlight:{minArgs:1,maxArgs:1},insertCSS:{minArgs:1,maxArgs:2},move:{minArgs:2,maxArgs:2},query:{minArgs:1,maxArgs:1},reload:{minArgs:0,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeCSS:{minArgs:1,maxArgs:2},sendMessage:{minArgs:2,maxArgs:3},setZoom:{minArgs:1,maxArgs:2},setZoomSettings:{minArgs:1,maxArgs:2},update:{minArgs:1,maxArgs:2}},topSites:{get:{minArgs:0,maxArgs:0}},webNavigation:{getAllFrames:{minArgs:1,maxArgs:1},getFrame:{minArgs:1,maxArgs:1}},webRequest:{handlerBehaviorChanged:{minArgs:0,maxArgs:0}},windows:{create:{minArgs:0,maxArgs:1},get:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:1},getCurrent:{minArgs:0,maxArgs:1},getLastFocused:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}}};if(0===Object.keys(e).length)throw new Error("api-metadata.json has not been included in browser-polyfill");class g extends WeakMap{constructor(e,r=void 0){super(r),this.createItem=e}get(e){return this.has(e)||this.set(e,this.createItem(e)),super.get(e)}}const n=(e,r)=>(...s)=>{chrome.runtime.lastError?e.reject(chrome.runtime.lastError):r.singleCallbackArg||s.length<=1?e.resolve(s[0]):e.resolve(s)},t=e=>1==e?"argument":"arguments",a=(e,r,s)=>new Proxy(r,{apply:(r,g,n)=>s.call(g,e,...n)});let m=Function.call.bind(Object.prototype.hasOwnProperty);const i=(e,r={},s={})=>{let g=Object.create(null),A={has:(r,s)=>s in e||s in g,get(A,o,l){if(o in g)return g[o];if(!(o in e))return;let c=e[o];if("function"==typeof c)if("function"==typeof r[o])c=a(e,e[o],r[o]);else if(m(s,o)){let r=((e,r)=>function(s,...g){if(g.length<r.minArgs)throw new Error(`Expected at least ${r.minArgs} ${t(r.minArgs)} for ${e}(), got ${g.length}`);if(g.length>r.maxArgs)throw new Error(`Expected at most ${r.maxArgs} ${t(r.maxArgs)} for ${e}(), got ${g.length}`);return new Promise(((t,a)=>{if(r.fallbackToNoCallback)try{s[e](...g,n({resolve:t,reject:a},r))}catch(n){console.warn(`${e} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `,n),s[e](...g),r.fallbackToNoCallback=!1,r.noCallback=!0,t()}else r.noCallback?(s[e](...g),t()):s[e](...g,n({resolve:t,reject:a},r))}))})(o,s[o]);c=a(e,e[o],r)}else c=c.bind(e);else{if("object"!=typeof c||null===c||!m(r,o)&&!m(s,o))return Object.defineProperty(g,o,{configurable:!0,enumerable:!0,get:()=>e[o],set(r){e[o]=r}}),c;c=i(c,r[o],s[o])}return g[o]=c,c},set:(r,s,n,t)=>(s in g?g[s]=n:e[s]=n,!0),defineProperty:(e,r,s)=>Reflect.defineProperty(g,r,s),deleteProperty:(e,r)=>Reflect.deleteProperty(g,r)},o=Object.create(e);return new Proxy(o,A)},A=e=>({addListener(r,s,...g){r.addListener(e.get(s),...g)},hasListener:(r,s)=>r.hasListener(e.get(s)),removeListener(r,s){r.removeListener(e.get(s))}});let o=!1;const l=new g((e=>"function"!=typeof e?e:function(r,g,n){let t,a,m=!1,i=new Promise((e=>{t=function(r){o||(console.warn(s,(new Error).stack),o=!0),m=!0,e(r)}}));try{a=e(r,g,t)}catch(e){a=Promise.reject(e)}const A=!0!==a&&((l=a)&&"object"==typeof l&&"function"==typeof l.then);var l;if(!0!==a&&!A&&!m)return!1;return(A?a:i).then((e=>{n(e)}),(e=>{let r;r=e&&(e instanceof Error||"string"==typeof e.message)?e.message:"An unexpected error occurred",n({__mozWebExtensionPolyfillReject__:!0,message:r})})).catch((e=>{console.error("Failed to send onMessage rejected reply",e)})),!0})),c=({reject:e,resolve:s},g)=>{chrome.runtime.lastError?chrome.runtime.lastError.message===r?s():e(chrome.runtime.lastError):g&&g.__mozWebExtensionPolyfillReject__?e(new Error(g.message)):s(g)},x=(e,r,s,...g)=>{if(g.length<r.minArgs)throw new Error(`Expected at least ${r.minArgs} ${t(r.minArgs)} for ${e}(), got ${g.length}`);if(g.length>r.maxArgs)throw new Error(`Expected at most ${r.maxArgs} ${t(r.maxArgs)} for ${e}(), got ${g.length}`);return new Promise(((e,r)=>{const n=c.bind(null,{resolve:e,reject:r});g.push(n),s.sendMessage(...g)}))},u={runtime:{onMessage:A(l),onMessageExternal:A(l),sendMessage:x.bind(null,"sendMessage",{minArgs:1,maxArgs:3})},tabs:{sendMessage:x.bind(null,"sendMessage",{minArgs:2,maxArgs:3})}},d={clear:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}};return e.privacy={network:{networkPredictionEnabled:d,webRTCIPHandlingPolicy:d},services:{passwordSavingEnabled:d},websites:{hyperlinkAuditingEnabled:d,referrersEnabled:d}},i(chrome,u,e)};e.exports=g()}else e.exports=browser},void 0===(g=s.apply(r,[e]))||(e.exports=g)}},r={};function s(g){var n=r[g];if(void 0!==n)return n.exports;var t=r[g]={exports:{}};return e[g].call(t.exports,t,t.exports,s),t.exports}s.n=e=>{var r=e&&e.__esModule?()=>e.default:()=>e;return s.d(r,{a:r}),r},s.d=(e,r)=>{for(var g in r)s.o(r,g)&&!s.o(e,g)&&Object.defineProperty(e,g,{enumerable:!0,get:r[g]})},s.o=(e,r)=>Object.prototype.hasOwnProperty.call(e,r),(()=>{"use strict";var e=s(54512),r=s.n(e);window.browser=s(39412);const g=document.createElement("link");g.rel="stylesheet",g.type="text/css",g.href=browser.extension.getURL("other/tipButton.css"),(document.head||document.documentElement).appendChild(g),setTimeout((async()=>{const e=document.querySelector("ytd-menu-renderer.style-scope.ytd-video-primary-info-renderer #top-level-buttons"),s=e.querySelectorAll(".action-superhero-tip");if(!await browser.runtime.sendMessage({method:"checkHasAccount"})||!e||s.length)return;const g=(e=>{const s=document.createElement("div");s.className="action-superhero-tip",s.setAttribute("role","button"),s.setAttribute("tabindex","0");const g=document.createElement("img");g.src=r();const n=document.createElement("span");n.innerHTML="Tip";const t=document.createElement("button");return t.appendChild(g),t.appendChild(n),t.onclick=r=>{browser.runtime.sendMessage({from:"content",type:"openTipPopup",url:e}),r.stopPropagation()},s.appendChild(t),s})(window.location.href);g.classList.add("youtube"),e.append(g)}),5e3)})()})();