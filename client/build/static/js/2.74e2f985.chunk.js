(this["webpackJsonpdeliveryPay-react"]=this["webpackJsonpdeliveryPay-react"]||[]).push([[2,26,40],{175:function(e,t,n){"use strict";var r=n(11),o=n(24),i=n(1),a=i.useLayoutEffect,u=function(e){var t=Object(i.useRef)(e);return a((function(){t.current=e})),t},c=function(e,t){"function"!==typeof e?e.current=t:e(t)},d=function(e,t){var n=Object(i.useRef)();return Object(i.useCallback)((function(r){e.current=r,n.current&&c(n.current,null),n.current=t,t&&c(t,r)}),[t])},f={"min-height":"0","max-height":"none",height:"0",visibility:"hidden",overflow:"hidden",position:"absolute","z-index":"-1000",top:"0",right:"0"},s=function(e){Object.keys(f).forEach((function(t){e.style.setProperty(t,f[t],"important")}))},l=null;var p=function(){},h=["borderBottomWidth","borderLeftWidth","borderRightWidth","borderTopWidth","boxSizing","fontFamily","fontSize","fontStyle","fontWeight","letterSpacing","lineHeight","paddingBottom","paddingLeft","paddingRight","paddingTop","tabSize","textIndent","textRendering","textTransform","width","wordBreak"],b=!!document.documentElement.currentStyle,g=function(e,t){var n=e.cacheMeasurements,a=e.maxRows,c=e.minRows,f=e.onChange,g=void 0===f?p:f,v=e.onHeightChange,y=void 0===v?p:v,m=Object(o.a)(e,["cacheMeasurements","maxRows","minRows","onChange","onHeightChange"]);var x=void 0!==m.value,j=Object(i.useRef)(null),w=d(j,t),S=Object(i.useRef)(0),O=Object(i.useRef)(),R=function(){var e=j.current,t=n&&O.current?O.current:function(e){var t=window.getComputedStyle(e);if(null===t)return null;var n,r=(n=t,h.reduce((function(e,t){return e[t]=n[t],e}),{})),o=r.boxSizing;return""===o?null:(b&&"border-box"===o&&(r.width=parseFloat(r.width)+parseFloat(r.borderRightWidth)+parseFloat(r.borderLeftWidth)+parseFloat(r.paddingRight)+parseFloat(r.paddingLeft)+"px"),{sizingStyle:r,paddingSize:parseFloat(r.paddingBottom)+parseFloat(r.paddingTop),borderSize:parseFloat(r.borderBottomWidth)+parseFloat(r.borderTopWidth)})}(e);if(t){O.current=t;var r=function(e,t,n,r){void 0===n&&(n=1),void 0===r&&(r=1/0),l||((l=document.createElement("textarea")).setAttribute("tabindex","-1"),l.setAttribute("aria-hidden","true"),s(l)),null===l.parentNode&&document.body.appendChild(l);var o=e.paddingSize,i=e.borderSize,a=e.sizingStyle,u=a.boxSizing;Object.keys(a).forEach((function(e){var t=e;l.style[t]=a[t]})),s(l),l.value=t;var c=function(e,t){var n=e.scrollHeight;return"border-box"===t.sizingStyle.boxSizing?n+t.borderSize:n-t.paddingSize}(l,e);l.value="x";var d=l.scrollHeight-o,f=d*n;"border-box"===u&&(f=f+o+i),c=Math.max(f,c);var p=d*r;return"border-box"===u&&(p=p+o+i),[c=Math.min(p,c),d]}(t,e.value||e.placeholder||"x",c,a),o=r[0],i=r[1];S.current!==o&&(S.current=o,e.style.setProperty("height",o+"px","important"),y(o,{rowHeight:i}))}};return Object(i.useLayoutEffect)(R),function(e){var t=u(e);Object(i.useLayoutEffect)((function(){var e=function(e){t.current(e)};return window.addEventListener("resize",e),function(){window.removeEventListener("resize",e)}}),[])}(R),Object(i.createElement)("textarea",Object(r.a)({},m,{onChange:function(e){x||R(),g(e)},ref:w}))},v=Object(i.forwardRef)(g);t.a=v},177:function(e,t,n){},215:function(e,t,n){"use strict";var r=n(241),o=n(35);function i(e,t){return t.encode?t.strict?r(e):encodeURIComponent(e):e}function a(e){return Array.isArray(e)?e.sort():"object"===typeof e?a(Object.keys(e)).sort((function(e,t){return Number(e)-Number(t)})).map((function(t){return e[t]})):e}t.extract=function(e){return e.split("?")[1]||""},t.parse=function(e,t){var n=function(e){var t;switch(e.arrayFormat){case"index":return function(e,n,r){t=/\[(\d*)\]$/.exec(e),e=e.replace(/\[\d*\]$/,""),t?(void 0===r[e]&&(r[e]={}),r[e][t[1]]=n):r[e]=n};case"bracket":return function(e,n,r){t=/(\[\])$/.exec(e),e=e.replace(/\[\]$/,""),t?void 0!==r[e]?r[e]=[].concat(r[e],n):r[e]=[n]:r[e]=n};default:return function(e,t,n){void 0!==n[e]?n[e]=[].concat(n[e],t):n[e]=t}}}(t=o({arrayFormat:"none"},t)),r=Object.create(null);return"string"!==typeof e?r:(e=e.trim().replace(/^(\?|#|&)/,""))?(e.split("&").forEach((function(e){var t=e.replace(/\+/g," ").split("="),o=t.shift(),i=t.length>0?t.join("="):void 0;i=void 0===i?null:decodeURIComponent(i),n(decodeURIComponent(o),i,r)})),Object.keys(r).sort().reduce((function(e,t){var n=r[t];return Boolean(n)&&"object"===typeof n&&!Array.isArray(n)?e[t]=a(n):e[t]=n,e}),Object.create(null))):r},t.stringify=function(e,t){var n=function(e){switch(e.arrayFormat){case"index":return function(t,n,r){return null===n?[i(t,e),"[",r,"]"].join(""):[i(t,e),"[",i(r,e),"]=",i(n,e)].join("")};case"bracket":return function(t,n){return null===n?i(t,e):[i(t,e),"[]=",i(n,e)].join("")};default:return function(t,n){return null===n?i(t,e):[i(t,e),"=",i(n,e)].join("")}}}(t=o({encode:!0,strict:!0,arrayFormat:"none"},t));return e?Object.keys(e).sort().map((function(r){var o=e[r];if(void 0===o)return"";if(null===o)return i(r,t);if(Array.isArray(o)){var a=[];return o.slice().forEach((function(e){void 0!==e&&a.push(n(r,e,a.length))})),a.join("&")}return i(r,t)+"="+i(o,t)})).filter((function(e){return e.length>0})).join("&"):""}},241:function(e,t,n){"use strict";e.exports=function(e){return encodeURIComponent(e).replace(/[!'()*]/g,(function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()}))}}}]);
//# sourceMappingURL=2.74e2f985.chunk.js.map