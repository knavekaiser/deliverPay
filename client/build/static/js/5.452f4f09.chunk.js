(this["webpackJsonpdeliveryPay-react"]=this["webpackJsonpdeliveryPay-react"]||[]).push([[5,6,26,40],{158:function(e,t,n){"use strict";n.r(t),n.d(t,"MilestoneForm",(function(){return m})),n.d(t,"MilestoneReleaseForm",(function(){return x})),n.d(t,"AddressForm",(function(){return f})),n.d(t,"DisputeForm",(function(){return v})),n.d(t,"TicketForm",(function(){return p})),n.d(t,"TicketReplyForm",(function(){return g}));var c=n(23),i=n.n(c),s=n(28),r=n(10),a=n(3),l=n(1),o=n(12),u=n(9),j=n(2),d=n(17),b=n(175),O=n(176),h=(n(177),n(0)),m=function(e){var t,n,c,i,s=e.action,b=e.client,m=e.onSuccess,x=e.definedAmount,f=e.order,v=e.refund,p=e.strict,g=Object(l.useContext)(o.d),y=g.user,S=(g.setUser,g.config),N=Object(l.useState)(!1),C=Object(a.a)(N,2),k=C[0],F=C[1],w=Object(l.useState)(""),M=Object(a.a)(w,2),R=(M[0],M[1],Object(l.useState)(!1)),T=Object(a.a)(R,2),z=(T[0],T[1],Object(l.useState)(Object(r.a)({},y))),D=Object(a.a)(z,2),q=D[0],P=(D[1],Object(l.useState)(Object(r.a)({},b))),I=Object(a.a)(P,2),A=I[0],B=(I[1],Object(l.useState)("")),E=Object(a.a)(B,2),L=E[0],H=E[1],W=Object(l.useState)(x||""),_=Object(a.a)(W,2),J=_[0],U=_[1],Y=Object(l.useState)(0),G=Object(a.a)(Y,2),V=G[0],K=G[1],Q=Object(l.useState)(null),X=Object(a.a)(Q,2),Z=X[0],$=X[1],ee=Object(l.useRef)(),te=Object(l.useCallback)((function(){fetch("/api/requestMilestone",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({buyer_id:b._id,amount:J,dscr:L,order:f,refund:v})}).then((function(e){return e.json()})).then((function(e){F(!1),"ok"===e.code?null===m||void 0===m||m(e.milestone):$(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return $(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Could not request milestone. Try again."})]})]}))})).catch((function(e){F(!1),console.log(e),$(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return $(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Could not request milestone. Make sure you're online."})]})]}))}))}),[A,q,J,L]),ne=Object(l.useCallback)((function(){fetch("/api/createMilestone",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({seller:Object(r.a)({},A),amount:J,dscr:L,order:f,refund:v})}).then((function(e){return e.json()})).then((function(e){F(!1),"ok"===e.code?null===m||void 0===m||m(Object(r.a)({},e)):403===e.code?$(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return $(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Insufficient fund"}),Object(h.jsx)(j.b,{to:"/account/profile/wallet",children:"Add Money to your wallet now."})]})]})):$(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return $(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Could not create milestone. Try again"})]})]}))})).catch((function(e){F(!1),console.log(e),$(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return $(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Could not create milestone. Make sure you're online."})]})]}))}))}),[A,q,J,L]);return Object(l.useEffect)((function(){K((function(){return(+J/100*S.fee).fix()}))}),[J]),Object(h.jsxs)(h.Fragment,{children:[Object(h.jsxs)("form",{className:"milestonesForm",onSubmit:function(e){F(!0),e.preventDefault(),Object(O.b)(Object(h.jsxs)("div",{className:"toast",children:["Milestone is being"," ","create"===s?"created.":"requested."," ",Object(h.jsx)("button",{className:"undo",onClick:function(){ee.current=null},children:"Undo"})]}),{position:"bottom-center",autoClose:8e3,hideProgressBar:!1,closeOnClick:!0,pauseOnHover:!0,onClose:function(){var e;null===(e=ee.current)||void 0===e||e.call(ee),F(!1)},draggable:!0,progress:void 0}),ee.current="create"===s?ne:te},children:[Object(h.jsxs)("section",{className:"transactionDetail",children:[Object(h.jsxs)("section",{className:"amount",children:[Object(h.jsx)("label",{children:"Amount"}),Object(h.jsx)(u.t,{readOnly:p,min:10,defaultValue:x||0,required:!0,onChange:function(e){return U((+e.target.value).toString())}})]}),J&&Object(h.jsxs)(h.Fragment,{children:["create"===s&&Object(h.jsxs)("label",{className:"receivable",children:[b.firstName," ",b.lastName," will recieve \u20b9",(J-V).fix()]}),"request"===s&&Object(h.jsxs)("label",{className:"receivable",children:["You will recieve \u20b9",(J-V).fix()]})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Detail"}),Object(h.jsx)("input",{value:L,required:!0,onChange:function(e){return H(e.target.value)}})]}),Object(h.jsx)("button",{type:"submit",children:"create"===s?"Create Milestone":"Request Milestone"})]}),Object(h.jsxs)("section",{className:"clientDetail",children:["request"===s&&Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)(u.n,{src:(null===b||void 0===b?void 0:b.profileImg)||"/profile-user.jpg"}),Object(h.jsx)("label",{children:"Buyer Information"}),Object(h.jsxs)("div",{className:"detail",children:[Object(h.jsxs)("section",{className:"profileDetail",children:[Object(h.jsx)("p",{className:"name",children:(null===b||void 0===b?void 0:b.firstName)+" "+(null===b||void 0===b?void 0:b.lastName)}),Object(h.jsx)("p",{className:"phone",children:null===b||void 0===b?void 0:b.phone}),Object(h.jsx)("p",{className:"email",children:null===b||void 0===b?void 0:b.email})]}),(null===b||void 0===b||null===(t=b.address)||void 0===t?void 0:t.street)&&Object(h.jsx)("section",{className:"address",children:Object(h.jsxs)("p",{className:"street",children:[null===(n=b.address)||void 0===n?void 0:n.street,", ",null===(c=b.address)||void 0===c?void 0:c.city,","," ",null===(i=b.address)||void 0===i?void 0:i.zip]})})]})]}),"request"===s?null:Object(h.jsxs)("div",{className:"sellerInfo",children:[Object(h.jsx)(u.n,{src:(null===A||void 0===A?void 0:A.profileImg)||"/profile-user.jpg"}),Object(h.jsx)("label",{children:"Seller Information"}),Object(h.jsx)("div",{className:"detail",children:Object(h.jsxs)("section",{className:"profileDetail",children:[Object(h.jsxs)("p",{className:"name",children:[null===A||void 0===A?void 0:A.firstName," ",null===A||void 0===A?void 0:A.lastName]}),Object(h.jsx)("p",{className:"phone",children:null===A||void 0===A?void 0:A.phone}),Object(h.jsx)("p",{className:"email",children:null===A||void 0===A?void 0:A.email})]})})]})]})]}),k&&Object(h.jsx)("div",{className:"spinnerContainer",children:Object(h.jsx)("div",{className:"spinner"})}),Object(h.jsx)(d.Modal,{className:"msg",open:Z,children:Z})]})},x=function(e){var t=e.milestone,n=e.setReleaseForm,c=e.onSuccess,i=Object(l.useState)(t.amount),s=Object(a.a)(i,2),r=s[0],o=(s[1],Object(l.useState)(null)),j=Object(a.a)(o,2),b=j[0],O=j[1];return Object(h.jsxs)("form",{onSubmit:function(e){e.preventDefault(),fetch("/api/releaseMilestone",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({_id:t._id,amount:r})}).then((function(e){return e.json()})).then((function(e){var t=e.code,n=e.milestone;n?null===c||void 0===c||c(n):O(403===t?Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return O(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Could not release Milestone due to low balance."})]})]}):Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return O(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Could not release Milestone."})]})]}))})).catch((function(e){console.log(e),h.Fragment,u.i}))},children:["You sure want to release this Milestone?",Object(h.jsxs)("section",{className:"btns",children:[Object(h.jsx)("button",{type:"submit",children:"Confirm"}),Object(h.jsx)("button",{className:"cancel",type:"button",onClick:function(){return n(!1)},children:"Cancel"})]}),Object(h.jsx)(d.Modal,{open:b,className:"msg",children:b})]})},f=function(e){var t,n,c,i,s,r,o,u=e.client,j=e.onSuccess,d=e.onCancel,b=Object(l.useState)(u?u.name||u.firstName+" "+u.lastName:""),O=Object(a.a)(b,2),m=O[0],x=O[1],f=Object(l.useState)((null===u||void 0===u?void 0:u.phone)||""),v=Object(a.a)(f,2),p=v[0],g=v[1],y=Object(l.useState)((null===u||void 0===u||null===(t=u.address)||void 0===t?void 0:t.zip)||""),S=Object(a.a)(y,2),N=S[0],C=S[1],k=Object(l.useState)((null===u||void 0===u||null===(n=u.address)||void 0===n?void 0:n.locality)||""),F=Object(a.a)(k,2),w=F[0],M=F[1],R=Object(l.useState)((null===u||void 0===u||null===(c=u.address)||void 0===c?void 0:c.street)||""),T=Object(a.a)(R,2),z=T[0],D=T[1],q=Object(l.useState)((null===u||void 0===u||null===(i=u.address)||void 0===i?void 0:i.city)||""),P=Object(a.a)(q,2),I=P[0],A=P[1],B=Object(l.useState)((null===u||void 0===u||null===(s=u.address)||void 0===s?void 0:s.state)||""),E=Object(a.a)(B,2),L=E[0],H=E[1],W=Object(l.useState)((null===u||void 0===u||null===(r=u.address)||void 0===r?void 0:r.landmark)||""),_=Object(a.a)(W,2),J=_[0],U=_[1],Y=Object(l.useState)((null===u||void 0===u||null===(o=u.address)||void 0===o?void 0:o.altPhone)||""),G=Object(a.a)(Y,2),V=G[0],K=G[1];return Object(h.jsxs)("form",{className:"addressForm",onSubmit:function(e){e.preventDefault(),null===j||void 0===j||j({address:{name:m,phone:p,street:z,city:I,state:L,zip:N,locality:w,landmark:J,altPhone:V}})},children:[Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"name",children:"Full Name"}),Object(h.jsx)("input",{value:m,onChange:function(e){return x(e.target.value)},type:"text",name:"name",required:!0})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"phone",children:"Phone Number"}),Object(h.jsx)("input",{value:p,onChange:function(e){return g(e.target.value)},type:"tel",name:"phone",required:!0})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"zip",children:"PIN Code"}),Object(h.jsx)("input",{value:N,onChange:function(e){return C(e.target.value)},type:"number",name:"zip",required:!0})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"locality",children:"Locality"}),Object(h.jsx)("input",{value:w,onChange:function(e){return M(e.target.value)},type:"text",name:"locality",required:!0})]}),Object(h.jsxs)("section",{className:"street",children:[Object(h.jsx)("label",{htmlFor:"address",children:"Address"}),Object(h.jsx)("textarea",{value:z,onChange:function(e){return D(e.target.value)},resiz:"off",type:"text",name:"address",required:!0})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"city",children:"City"}),Object(h.jsx)("input",{value:I,onChange:function(e){return A(e.target.value)},type:"text",name:"city",required:!0})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"state",children:"State"}),Object(h.jsx)("input",{value:L,onChange:function(e){return H(e.target.value)},type:"text",name:"state",required:!0})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"landmark",children:"Landmark (Optional)"}),Object(h.jsx)("input",{value:J,onChange:function(e){return U(e.target.value)},type:"text",name:"landmark"})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"altPhone",children:"Alternate Phone (Optional)"}),Object(h.jsx)("input",{value:V,onChange:function(e){return K(e.target.value)},type:"tel",name:"altPhone"})]}),Object(h.jsx)("button",{className:"save",children:"Save"}),Object(h.jsx)("button",{className:"cancel",type:"button",onClick:function(){return null===d||void 0===d?void 0:d()},children:"Cancel"}),Object(h.jsx)("section",{className:"pBtm"})]})},v=function(e){var t=e.milestone,n=(e.setDisputeForm,e.onSuccess),c=Object(l.useState)(""),r=Object(a.a)(c,2),o=r[0],j=r[1],O=Object(l.useState)(!1),m=Object(a.a)(O,2),x=m[0],f=m[1],v=Object(l.useState)(""),p=Object(a.a)(v,2),g=p[0],y=p[1],S=Object(l.useState)([]),N=Object(a.a)(S,2),C=N[0],k=N[1],F=Object(l.useState)(null),w=Object(a.a)(F,2),M=w[0],R=w[1],T=function(){var e=Object(s.a)(i.a.mark((function e(c){var s;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(c.preventDefault(),f(!0),!C.length){e.next=8;break}return e.next=5,Object(u.F)({files:C,setMsg:R});case 5:e.t0=e.sent,e.next=9;break;case 8:e.t0=[];case 9:s=e.t0,fetch("/api/fileDispute",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({issue:o,milestoneId:t._id,defendantId:t.client._id,_case:{dscr:g,files:s}})}).then((function(e){return e.json()})).then((function(e){f(!1),"ok"===e.code?null===n||void 0===n||n(e.milestone):403===e.code?R(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return R(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Insufficient fund! you have to have \u20b9500 in your wallet to file a dispute."})]})]})):R(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return R(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Could not file dispute."})]})]}))})).catch((function(e){f(!0),console.log(e),R(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return R(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Could not file dispute. make sure you're online."})]})]}))}));case 11:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return Object(h.jsxs)(h.Fragment,{children:[Object(h.jsxs)("form",{className:"disputeForm",onSubmit:T,children:[Object(h.jsx)("h4",{children:"You feel like you are getting scammed?"}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"issue",children:"Issue"}),Object(h.jsx)(u.h,{name:"issue",options:"buyer"===t.role?[{label:"Buyer Not Releasing Payments",value:"Buyer Not Releasing Payments"}]:[{label:"Goods Not Received",value:"Goods Not Received"},{label:"Services Not Received",value:"Services Not Received"},{label:"Damaged",value:"Damaged"},{label:"Not As Agreed",value:"Not As Agreed"},{label:"Not As Displayed",value:"Not As Displayed"}],onChange:function(e){j(e.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"description",children:"Description"}),Object(h.jsx)(b.a,{name:"description",value:g,required:!0,onChange:function(e){return y(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"for",children:"Upload images to prove your case. ie: Product of image, proof of delivery."}),Object(h.jsx)(u.k,{multiple:!0,accept:"audio/*,video/*,image/*",onChange:function(e){return k(e)}})]}),Object(h.jsxs)("section",{className:"btns",children:[Object(h.jsx)("button",{className:"submit",type:"submit",children:"Submit"}),Object(h.jsx)("button",{className:"cancel",type:"button",children:"Cancel"})]}),Object(h.jsx)("div",{className:"pBtm"})]}),x&&Object(h.jsx)("div",{className:"spinnerContainer",children:Object(h.jsx)("div",{className:"spinner"})}),Object(h.jsx)(d.Modal,{open:M,className:"msg",children:M})]})},p=function(e){var t=e.onSuccess,n=Object(l.useState)(!1),c=Object(a.a)(n,2),r=c[0],o=c[1],j=Object(l.useState)(!1),O=Object(a.a)(j,2),m=O[0],x=O[1],f=Object(l.useState)(""),v=Object(a.a)(f,2),p=v[0],g=v[1],y=Object(l.useState)(""),S=Object(a.a)(y,2),N=S[0],C=S[1],k=Object(l.useState)(""),F=Object(a.a)(k,2),w=F[0],M=F[1],R=Object(l.useState)(""),T=Object(a.a)(R,2),z=T[0],D=T[1],q=Object(l.useState)(""),P=Object(a.a)(q,2),I=P[0],A=P[1],B=function(){var e=Object(s.a)(i.a.mark((function e(n){var c;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n.preventDefault(),o(!0),!z.length){e.next=8;break}return e.next=5,Object(u.F)({files:z,setMsg:x});case 5:e.t0=e.sent,e.next=9;break;case 8:e.t0=[];case 9:c=e.t0,fetch("/api/openTicket",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({issue:p,milestone:N,transaction:w,message:{body:I,files:c}})}).then((function(e){return e.json()})).then((function(e){o(!1),"ok"===e.code?null===t||void 0===t||t(e.ticket):"milestone ID is invalid"===e.message?x(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return x(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Milestone Id is invalid."})]})]})):x(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return x(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Ticket could not be submitted."})]})]}))})).catch((function(e){o(!1),console.log(e),x(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return x(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Ticket could not be submitted. Make sure you're online."})]})]}))}));case 11:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return Object(h.jsxs)(h.Fragment,{children:[Object(h.jsxs)("form",{className:"ticketForm",onSubmit:B,children:[Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Issue"}),Object(h.jsx)("input",{value:p,required:!0,onChange:function(e){return g(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Milestone ID (optional)"}),Object(h.jsx)("input",{value:N,onChange:function(e){return C(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Transaction ID (optional)"}),Object(h.jsx)("input",{value:w,onChange:function(e){return M(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Detail"}),Object(h.jsx)(b.a,{required:!0,value:I,onChange:function(e){return A(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"for",children:"Upload relevant files (optional)"}),Object(h.jsx)(u.k,{onChange:function(e){return D(e)}})]}),Object(h.jsxs)("section",{className:"btns",children:[Object(h.jsx)("button",{className:"submit",type:"submit",children:"Submit"}),Object(h.jsx)("button",{className:"cancel",type:"button",children:"Cancel"})]}),Object(h.jsx)("div",{className:"pBtm"})]}),r&&Object(h.jsx)("div",{className:"spinnerContainer",children:Object(h.jsx)("div",{className:"spinner"})}),Object(h.jsx)(d.Modal,{open:m,className:"msg",children:m})]})},g=function(e){var t=e._id,n=e.onSuccess,c=Object(l.useState)(!1),r=Object(a.a)(c,2),o=r[0],j=r[1],O=Object(l.useState)(!1),m=Object(a.a)(O,2),x=m[0],f=m[1],v=Object(l.useState)([]),p=Object(a.a)(v,2),g=p[0],y=p[1],S=Object(l.useState)(""),N=Object(a.a)(S,2),C=N[0],k=N[1],F=function(){var e=Object(s.a)(i.a.mark((function e(c){var s;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(c.preventDefault(),j(!0),!g.length){e.next=8;break}return e.next=5,Object(u.F)({files:g,setMsg:f});case 5:e.t0=e.sent,e.next=9;break;case 8:e.t0=[];case 9:s=e.t0,fetch("/api/addTicketReply",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({_id:t,message:{body:C,files:s}})}).then((function(e){return e.json()})).then((function(e){j(!1),"ok"===e.code?null===n||void 0===n||n(e.ticket):f(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return f(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Reply could not be submitted."})]})]}))})).catch((function(e){j(!1),console.log(e),f(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return f(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(u.i,{}),Object(h.jsx)("h4",{children:"Reply could not be submitted. Make sure you're online."})]})]}))}));case 11:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return Object(h.jsxs)(h.Fragment,{children:[Object(h.jsxs)("form",{className:"ticketReplyForm",onSubmit:F,children:[Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Message"}),Object(h.jsx)(b.a,{required:!0,value:C,onChange:function(e){return k(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"for",children:"Upload relevant files (optional)"}),Object(h.jsx)(u.k,{accept:"audio/*,video/*,image/*",multiple:!0,onChange:function(e){return y(e)}})]}),Object(h.jsxs)("section",{className:"btns",children:[Object(h.jsx)("button",{className:"submit",type:"submit",children:"Submit"}),Object(h.jsx)("button",{className:"cancel",type:"button",children:"Cancel"})]}),Object(h.jsx)("div",{className:"pBtm"})]}),o&&Object(h.jsx)("div",{className:"spinnerContainer",children:Object(h.jsx)("div",{className:"spinner"})}),Object(h.jsx)(d.Modal,{open:x,className:"msg",children:x})]})}},175:function(e,t,n){"use strict";var c=n(11),i=n(24),s=n(1),r=s.useLayoutEffect,a=function(e){var t=Object(s.useRef)(e);return r((function(){t.current=e})),t},l=function(e,t){"function"!==typeof e?e.current=t:e(t)},o=function(e,t){var n=Object(s.useRef)();return Object(s.useCallback)((function(c){e.current=c,n.current&&l(n.current,null),n.current=t,t&&l(t,c)}),[t])},u={"min-height":"0","max-height":"none",height:"0",visibility:"hidden",overflow:"hidden",position:"absolute","z-index":"-1000",top:"0",right:"0"},j=function(e){Object.keys(u).forEach((function(t){e.style.setProperty(t,u[t],"important")}))},d=null;var b=function(){},O=["borderBottomWidth","borderLeftWidth","borderRightWidth","borderTopWidth","boxSizing","fontFamily","fontSize","fontStyle","fontWeight","letterSpacing","lineHeight","paddingBottom","paddingLeft","paddingRight","paddingTop","tabSize","textIndent","textRendering","textTransform","width","wordBreak"],h=!!document.documentElement.currentStyle,m=function(e,t){var n=e.cacheMeasurements,r=e.maxRows,l=e.minRows,u=e.onChange,m=void 0===u?b:u,x=e.onHeightChange,f=void 0===x?b:x,v=Object(i.a)(e,["cacheMeasurements","maxRows","minRows","onChange","onHeightChange"]);var p=void 0!==v.value,g=Object(s.useRef)(null),y=o(g,t),S=Object(s.useRef)(0),N=Object(s.useRef)(),C=function(){var e=g.current,t=n&&N.current?N.current:function(e){var t=window.getComputedStyle(e);if(null===t)return null;var n,c=(n=t,O.reduce((function(e,t){return e[t]=n[t],e}),{})),i=c.boxSizing;return""===i?null:(h&&"border-box"===i&&(c.width=parseFloat(c.width)+parseFloat(c.borderRightWidth)+parseFloat(c.borderLeftWidth)+parseFloat(c.paddingRight)+parseFloat(c.paddingLeft)+"px"),{sizingStyle:c,paddingSize:parseFloat(c.paddingBottom)+parseFloat(c.paddingTop),borderSize:parseFloat(c.borderBottomWidth)+parseFloat(c.borderTopWidth)})}(e);if(t){N.current=t;var c=function(e,t,n,c){void 0===n&&(n=1),void 0===c&&(c=1/0),d||((d=document.createElement("textarea")).setAttribute("tabindex","-1"),d.setAttribute("aria-hidden","true"),j(d)),null===d.parentNode&&document.body.appendChild(d);var i=e.paddingSize,s=e.borderSize,r=e.sizingStyle,a=r.boxSizing;Object.keys(r).forEach((function(e){var t=e;d.style[t]=r[t]})),j(d),d.value=t;var l=function(e,t){var n=e.scrollHeight;return"border-box"===t.sizingStyle.boxSizing?n+t.borderSize:n-t.paddingSize}(d,e);d.value="x";var o=d.scrollHeight-i,u=o*n;"border-box"===a&&(u=u+i+s),l=Math.max(u,l);var b=o*c;return"border-box"===a&&(b=b+i+s),[l=Math.min(b,l),o]}(t,e.value||e.placeholder||"x",l,r),i=c[0],s=c[1];S.current!==i&&(S.current=i,e.style.setProperty("height",i+"px","important"),f(i,{rowHeight:s}))}};return Object(s.useLayoutEffect)(C),function(e){var t=a(e);Object(s.useLayoutEffect)((function(){var e=function(e){t.current(e)};return window.addEventListener("resize",e),function(){window.removeEventListener("resize",e)}}),[])}(C),Object(s.createElement)("textarea",Object(c.a)({},v,{onChange:function(e){p||C(),m(e)},ref:y}))},x=Object(s.forwardRef)(m);t.a=x},177:function(e,t,n){}}]);
//# sourceMappingURL=5.452f4f09.chunk.js.map