(this["webpackJsonpdeliveryPay-react"]=this["webpackJsonpdeliveryPay-react"]||[]).push([[14],{159:function(e,t,c){"use strict";c.r(t),c.d(t,"MilestoneForm",(function(){return x})),c.d(t,"MilestoneReleaseForm",(function(){return m})),c.d(t,"AddressForm",(function(){return p})),c.d(t,"DisputeForm",(function(){return f})),c.d(t,"TicketForm",(function(){return v})),c.d(t,"TicketReplyForm",(function(){return g}));var n=c(23),s=c.n(n),l=c(28),i=c(10),a=c(3),j=c(1),r=c(12),o=c(8),b=c(2),d=c(17),u=c(174),O=c(176),h=(c(177),c(0)),x=function(e){var t,c,n,s,l=e.action,u=e.client,x=e.onSuccess,m=e.definedAmount,p=e.order,f=e.refund,v=e.strict,g=Object(j.useContext)(r.d),N=g.user,k=(g.setUser,g.config),y=Object(j.useState)(!1),S=Object(a.a)(y,2),C=S[0],M=S[1],F=Object(j.useState)(""),D=Object(a.a)(F,2),T=(D[0],D[1],Object(j.useState)(!1)),Y=Object(a.a)(T,2),w=(Y[0],Y[1],Object(j.useState)(Object(i.a)({},N))),q=Object(a.a)(w,2),A=q[0],P=(q[1],Object(j.useState)(Object(i.a)({},u))),R=Object(a.a)(P,2),I=R[0],_=(R[1],Object(j.useState)("")),B=Object(a.a)(_,2),G=B[0],J=B[1],L=Object(j.useState)(m||""),H=Object(a.a)(L,2),z=H[0],U=H[1],E=Object(j.useState)(0),V=Object(a.a)(E,2),Z=V[0],Q=V[1],W=Object(j.useState)(null),K=Object(a.a)(W,2),X=K[0],$=K[1],ee=Object(j.useRef)(),te=Object(j.useCallback)((function(){fetch("/api/requestMilestone",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({buyer_id:u._id,amount:z,dscr:G,order:p,refund:f})}).then((function(e){return e.json()})).then((function(e){M(!1),"ok"===e.code?null===x||void 0===x||x(Object(i.a)({},e)):$(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return $(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Could not request milestone. Try again."})]})]}))})).catch((function(e){M(!1),console.log(e),$(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return $(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Could not request milestone. Make sure you're online."})]})]}))}))}),[I,A,z,G]),ce=Object(j.useCallback)((function(){fetch("/api/createMilestone",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({seller:Object(i.a)({},I),amount:z,dscr:G,order:p,refund:f})}).then((function(e){return e.json()})).then((function(e){M(!1),"ok"===e.code?null===x||void 0===x||x(Object(i.a)({},e)):403===e.code?$(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return $(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Insufficient fund"}),Object(h.jsx)(b.b,{to:"/account/profile/wallet",children:"Add Money to your wallet now."})]})]})):$(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return $(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Could not create milestone. Try again"})]})]}))})).catch((function(e){M(!1),console.log(e),$(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return $(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Could not create milestone. Make sure you're online."})]})]}))}))}),[I,A,z,G]);return Object(j.useEffect)((function(){Q((function(){return(+z/100*k.fee).fix()}))}),[z]),Object(h.jsxs)(h.Fragment,{children:[Object(h.jsxs)("form",{className:"milestonesForm",onSubmit:function(e){M(!0),e.preventDefault(),Object(O.b)(Object(h.jsxs)("div",{className:"toast",children:["Milestone is being"," ","create"===l?"created.":"requested."," ",Object(h.jsx)("button",{className:"undo",onClick:function(){ee.current=null},children:"Undo"})]}),{position:"bottom-center",autoClose:8e3,hideProgressBar:!1,closeOnClick:!0,pauseOnHover:!0,onClose:function(){var e;null===(e=ee.current)||void 0===e||e.call(ee),M(!1)},draggable:!0,progress:void 0}),ee.current="create"===l?ce:te},children:[Object(h.jsxs)("section",{className:"transactionDetail",children:[Object(h.jsxs)("section",{className:"amount",children:[Object(h.jsx)("label",{children:"Amount"}),Object(h.jsx)(o.t,{readOnly:v,min:10,defaultValue:m||0,required:!0,onChange:function(e){return U((+e.target.value).toString())}})]}),z&&Object(h.jsxs)(h.Fragment,{children:["create"===l&&Object(h.jsxs)("label",{className:"receivable",children:[u.firstName," ",u.lastName," will recieve \u20b9",(z-Z).fix()]}),"request"===l&&Object(h.jsxs)("label",{className:"receivable",children:["You will recieve \u20b9",(z-Z).fix()]})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Detail"}),Object(h.jsx)("input",{value:G,required:!0,onChange:function(e){return J(e.target.value)}})]}),Object(h.jsx)("button",{type:"submit",children:"create"===l?"Create Milestone":"Request Milestone"})]}),Object(h.jsxs)("section",{className:"clientDetail",children:["request"===l&&Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)(o.n,{src:(null===u||void 0===u?void 0:u.profileImg)||"/profile-user.jpg"}),Object(h.jsx)("label",{children:"Buyer Information"}),Object(h.jsxs)("div",{className:"detail",children:[Object(h.jsxs)("section",{className:"profileDetail",children:[Object(h.jsx)("p",{className:"name",children:(null===u||void 0===u?void 0:u.firstName)+" "+(null===u||void 0===u?void 0:u.lastName)}),Object(h.jsx)("p",{className:"phone",children:null===u||void 0===u?void 0:u.phone}),Object(h.jsx)("p",{className:"email",children:null===u||void 0===u?void 0:u.email})]}),(null===u||void 0===u||null===(t=u.address)||void 0===t?void 0:t.street)&&Object(h.jsx)("section",{className:"address",children:Object(h.jsxs)("p",{className:"street",children:[null===(c=u.address)||void 0===c?void 0:c.street,", ",null===(n=u.address)||void 0===n?void 0:n.city,","," ",null===(s=u.address)||void 0===s?void 0:s.zip]})})]})]}),"request"===l?null:Object(h.jsxs)("div",{className:"sellerInfo",children:[Object(h.jsx)(o.n,{src:(null===I||void 0===I?void 0:I.profileImg)||"/profile-user.jpg"}),Object(h.jsx)("label",{children:"Seller Information"}),Object(h.jsx)("div",{className:"detail",children:Object(h.jsxs)("section",{className:"profileDetail",children:[Object(h.jsxs)("p",{className:"name",children:[null===I||void 0===I?void 0:I.firstName," ",null===I||void 0===I?void 0:I.lastName]}),Object(h.jsx)("p",{className:"phone",children:null===I||void 0===I?void 0:I.phone}),Object(h.jsx)("p",{className:"email",children:null===I||void 0===I?void 0:I.email})]})})]})]})]}),C&&Object(h.jsx)("div",{className:"spinnerContainer",children:Object(h.jsx)("div",{className:"spinner"})}),Object(h.jsx)(d.Modal,{className:"msg",open:X,children:X})]})},m=function(e){var t=e.milestone,c=e.setReleaseForm,n=e.onSuccess,s=Object(j.useState)(t.amount),l=Object(a.a)(s,2),i=l[0],r=(l[1],Object(j.useState)(null)),b=Object(a.a)(r,2),u=b[0],O=b[1];return Object(h.jsxs)("form",{onSubmit:function(e){e.preventDefault(),fetch("/api/releaseMilestone",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({_id:t._id,amount:i})}).then((function(e){return e.json()})).then((function(e){var t=e.code,c=e.milestone;c?null===n||void 0===n||n(c):O(403===t?Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return O(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Could not release Milestone due to low balance."})]})]}):Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return O(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Could not release Milestone."})]})]}))})).catch((function(e){console.log(e),h.Fragment,o.i}))},children:["You sure want to release this Milestone?",Object(h.jsxs)("section",{className:"btns",children:[Object(h.jsx)("button",{type:"submit",children:"Confirm"}),Object(h.jsx)("button",{className:"cancel",type:"button",onClick:function(){return c(!1)},children:"Cancel"})]}),Object(h.jsx)(d.Modal,{open:u,className:"msg",children:u})]})},p=function(e){var t,c,n,s,l,i,r,o=e.client,b=e.onSuccess,d=e.onCancel,u=Object(j.useState)(o?o.name||o.firstName+" "+o.lastName:""),O=Object(a.a)(u,2),x=O[0],m=O[1],p=Object(j.useState)((null===o||void 0===o?void 0:o.phone)||""),f=Object(a.a)(p,2),v=f[0],g=f[1],N=Object(j.useState)((null===o||void 0===o||null===(t=o.address)||void 0===t?void 0:t.zip)||""),k=Object(a.a)(N,2),y=k[0],S=k[1],C=Object(j.useState)((null===o||void 0===o||null===(c=o.address)||void 0===c?void 0:c.locality)||""),M=Object(a.a)(C,2),F=M[0],D=M[1],T=Object(j.useState)((null===o||void 0===o||null===(n=o.address)||void 0===n?void 0:n.street)||""),Y=Object(a.a)(T,2),w=Y[0],q=Y[1],A=Object(j.useState)((null===o||void 0===o||null===(s=o.address)||void 0===s?void 0:s.city)||""),P=Object(a.a)(A,2),R=P[0],I=P[1],_=Object(j.useState)((null===o||void 0===o||null===(l=o.address)||void 0===l?void 0:l.state)||""),B=Object(a.a)(_,2),G=B[0],J=B[1],L=Object(j.useState)((null===o||void 0===o||null===(i=o.address)||void 0===i?void 0:i.landmark)||""),H=Object(a.a)(L,2),z=H[0],U=H[1],E=Object(j.useState)((null===o||void 0===o||null===(r=o.address)||void 0===r?void 0:r.altPhone)||""),V=Object(a.a)(E,2),Z=V[0],Q=V[1];return Object(h.jsxs)("form",{className:"addressForm",onSubmit:function(e){e.preventDefault(),null===b||void 0===b||b({address:{name:x,phone:v,street:w,city:R,state:G,zip:y,locality:F,landmark:z,altPhone:Z}})},children:[Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"name",children:"Full Name"}),Object(h.jsx)("input",{value:x,onChange:function(e){return m(e.target.value)},type:"text",name:"name",required:!0})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"phone",children:"Phone Number"}),Object(h.jsx)("input",{value:v,onChange:function(e){return g(e.target.value)},type:"tel",name:"phone",required:!0})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"zip",children:"PIN Code"}),Object(h.jsx)("input",{value:y,onChange:function(e){return S(e.target.value)},type:"number",name:"zip",required:!0})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"locality",children:"Locality"}),Object(h.jsx)("input",{value:F,onChange:function(e){return D(e.target.value)},type:"text",name:"locality",required:!0})]}),Object(h.jsxs)("section",{className:"street",children:[Object(h.jsx)("label",{htmlFor:"address",children:"Address"}),Object(h.jsx)("textarea",{value:w,onChange:function(e){return q(e.target.value)},resiz:"off",type:"text",name:"address",required:!0})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"city",children:"City"}),Object(h.jsx)("input",{value:R,onChange:function(e){return I(e.target.value)},type:"text",name:"city",required:!0})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"state",children:"State"}),Object(h.jsx)("input",{value:G,onChange:function(e){return J(e.target.value)},type:"text",name:"state",required:!0})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"landmark",children:"Landmark (Optional)"}),Object(h.jsx)("input",{value:z,onChange:function(e){return U(e.target.value)},type:"text",name:"landmark"})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"altPhone",children:"Alternate Phone (Optional)"}),Object(h.jsx)("input",{value:Z,onChange:function(e){return Q(e.target.value)},type:"tel",name:"altPhone"})]}),Object(h.jsx)("button",{className:"save",children:"Save"}),Object(h.jsx)("button",{className:"cancel",type:"button",onClick:function(){return null===d||void 0===d?void 0:d()},children:"Cancel"}),Object(h.jsx)("section",{className:"pBtm"})]})},f=function(e){var t=e.milestone,c=(e.setDisputeForm,e.onSuccess),n=Object(j.useState)(""),i=Object(a.a)(n,2),r=i[0],b=i[1],O=Object(j.useState)(!1),x=Object(a.a)(O,2),m=x[0],p=x[1],f=Object(j.useState)(""),v=Object(a.a)(f,2),g=v[0],N=v[1],k=Object(j.useState)([]),y=Object(a.a)(k,2),S=y[0],C=y[1],M=Object(j.useState)(null),F=Object(a.a)(M,2),D=F[0],T=F[1],Y=function(){var e=Object(l.a)(s.a.mark((function e(n){var l;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n.preventDefault(),p(!0),!S.length){e.next=8;break}return e.next=5,Object(o.G)({files:S,setMsg:T});case 5:e.t0=e.sent,e.next=9;break;case 8:e.t0=[];case 9:l=e.t0,fetch("/api/fileDispute",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({issue:r,milestoneId:t._id,defendantId:t.client._id,_case:{dscr:g,files:l}})}).then((function(e){return e.json()})).then((function(e){p(!1),"ok"===e.code?null===c||void 0===c||c(e.milestone):403===e.code?T(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return T(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Insufficient fund! you have to have \u20b9500 in your wallet to file a dispute."})]})]})):T(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return T(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Could not file dispute."})]})]}))})).catch((function(e){p(!0),console.log(e),T(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return T(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Could not file dispute. make sure you're online."})]})]}))}));case 11:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return Object(h.jsxs)(h.Fragment,{children:[Object(h.jsxs)("form",{className:"disputeForm",onSubmit:Y,children:[Object(h.jsx)("h4",{children:"You feel like you are getting scammed?"}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"issue",children:"Issue"}),Object(h.jsx)(o.h,{name:"issue",options:"buyer"===t.role?[{label:"Buyer Not Releasing Payments",value:"Buyer Not Releasing Payments"}]:[{label:"Goods Not Received",value:"Goods Not Received"},{label:"Services Not Received",value:"Services Not Received"},{label:"Damaged",value:"Damaged"},{label:"Not As Agreed",value:"Not As Agreed"},{label:"Not As Displayed",value:"Not As Displayed"}],onChange:function(e){b(e.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"description",children:"Description"}),Object(h.jsx)(u.a,{name:"description",value:g,required:!0,onChange:function(e){return N(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"for",children:"Upload images to prove your case. ie: Product of image, proof of delivery."}),Object(h.jsx)(o.k,{multiple:!0,accept:"audio/*,video/*,image/*",onChange:function(e){return C(e)}})]}),Object(h.jsxs)("section",{className:"btns",children:[Object(h.jsx)("button",{className:"submit",type:"submit",children:"Submit"}),Object(h.jsx)("button",{className:"cancel",type:"button",children:"Cancel"})]}),Object(h.jsx)("div",{className:"pBtm"})]}),m&&Object(h.jsx)("div",{className:"spinnerContainer",children:Object(h.jsx)("div",{className:"spinner"})}),Object(h.jsx)(d.Modal,{open:D,className:"msg",children:D})]})},v=function(e){var t=e.onSuccess,c=Object(j.useState)(!1),n=Object(a.a)(c,2),i=n[0],r=n[1],b=Object(j.useState)(!1),O=Object(a.a)(b,2),x=O[0],m=O[1],p=Object(j.useState)(""),f=Object(a.a)(p,2),v=f[0],g=f[1],N=Object(j.useState)(""),k=Object(a.a)(N,2),y=k[0],S=k[1],C=Object(j.useState)(""),M=Object(a.a)(C,2),F=M[0],D=M[1],T=Object(j.useState)(""),Y=Object(a.a)(T,2),w=Y[0],q=Y[1],A=Object(j.useState)(""),P=Object(a.a)(A,2),R=P[0],I=P[1],_=function(){var e=Object(l.a)(s.a.mark((function e(c){var n;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(c.preventDefault(),r(!0),!w.length){e.next=8;break}return e.next=5,Object(o.G)({files:w,setMsg:m});case 5:e.t0=e.sent,e.next=9;break;case 8:e.t0=[];case 9:n=e.t0,fetch("/api/openTicket",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({issue:v,milestone:y,transaction:F,message:{body:R,files:n}})}).then((function(e){return e.json()})).then((function(e){r(!1),"ok"===e.code?null===t||void 0===t||t(e.ticket):"milestone ID is invalid"===e.message?m(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return m(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Milestone Id is invalid."})]})]})):m(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return m(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Ticket could not be submitted."})]})]}))})).catch((function(e){r(!1),console.log(e),m(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return m(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Ticket could not be submitted. Make sure you're online."})]})]}))}));case 11:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return Object(h.jsxs)(h.Fragment,{children:[Object(h.jsxs)("form",{className:"ticketForm",onSubmit:_,children:[Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Issue"}),Object(h.jsx)("input",{value:v,required:!0,onChange:function(e){return g(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Milestone ID (optional)"}),Object(h.jsx)("input",{value:y,onChange:function(e){return S(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Transaction ID (optional)"}),Object(h.jsx)("input",{value:F,onChange:function(e){return D(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Detail"}),Object(h.jsx)(u.a,{required:!0,value:R,onChange:function(e){return I(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"for",children:"Upload relevant files (optional)"}),Object(h.jsx)(o.k,{onChange:function(e){return q(e)}})]}),Object(h.jsxs)("section",{className:"btns",children:[Object(h.jsx)("button",{className:"submit",type:"submit",children:"Submit"}),Object(h.jsx)("button",{className:"cancel",type:"button",children:"Cancel"})]}),Object(h.jsx)("div",{className:"pBtm"})]}),i&&Object(h.jsx)("div",{className:"spinnerContainer",children:Object(h.jsx)("div",{className:"spinner"})}),Object(h.jsx)(d.Modal,{open:x,className:"msg",children:x})]})},g=function(e){var t=e._id,c=e.onSuccess,n=Object(j.useState)(!1),i=Object(a.a)(n,2),r=i[0],b=i[1],O=Object(j.useState)(!1),x=Object(a.a)(O,2),m=x[0],p=x[1],f=Object(j.useState)([]),v=Object(a.a)(f,2),g=v[0],N=v[1],k=Object(j.useState)(""),y=Object(a.a)(k,2),S=y[0],C=y[1],M=function(){var e=Object(l.a)(s.a.mark((function e(n){var l;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n.preventDefault(),b(!0),!g.length){e.next=8;break}return e.next=5,Object(o.G)({files:g,setMsg:p});case 5:e.t0=e.sent,e.next=9;break;case 8:e.t0=[];case 9:l=e.t0,fetch("/api/addTicketReply",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({_id:t,message:{body:S,files:l}})}).then((function(e){return e.json()})).then((function(e){b(!1),"ok"===e.code?null===c||void 0===c||c(e.ticket):p(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return p(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Reply could not be submitted."})]})]}))})).catch((function(e){b(!1),console.log(e),p(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return p(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(o.i,{}),Object(h.jsx)("h4",{children:"Reply could not be submitted. Make sure you're online."})]})]}))}));case 11:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();return Object(h.jsxs)(h.Fragment,{children:[Object(h.jsxs)("form",{className:"ticketReplyForm",onSubmit:M,children:[Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Message"}),Object(h.jsx)(u.a,{required:!0,value:S,onChange:function(e){return C(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{htmlFor:"for",children:"Upload relevant files (optional)"}),Object(h.jsx)(o.k,{accept:"audio/*,video/*,image/*",multiple:!0,onChange:function(e){return N(e)}})]}),Object(h.jsxs)("section",{className:"btns",children:[Object(h.jsx)("button",{className:"submit",type:"submit",children:"Submit"}),Object(h.jsx)("button",{className:"cancel",type:"button",children:"Cancel"})]}),Object(h.jsx)("div",{className:"pBtm"})]}),r&&Object(h.jsx)("div",{className:"spinnerContainer",children:Object(h.jsx)("div",{className:"spinner"})}),Object(h.jsx)(d.Modal,{open:m,className:"msg",children:m})]})}},168:function(e,t,c){"use strict";c.r(t),c.d(t,"Tickets",(function(){return m})),c.d(t,"SingleTicket",(function(){return p}));var n=c(13),s=c(48),l=c(10),i=c(3),a=c(1),j=c(12),r=c(2),o=c(4),b=c(17),d=c(8),u=c(159),O=c(174),h=c(0);c(241),c(242);var x=function(e){var t=e.onSuccess,c=Object(a.useContext)(j.d).user,n=Object(a.useState)(!1),s=Object(i.a)(n,2),l=s[0],r=s[1],o=Object(a.useState)(c?c.firstName+" "+c.lastName:""),u=Object(i.a)(o,2),x=u[0],m=u[1],p=Object(a.useState)(c?c.phone:""),f=Object(i.a)(p,2),v=f[0],g=f[1],N=Object(a.useState)(""),k=Object(i.a)(N,2),y=k[0],S=k[1],C=Object(a.useState)(""),M=Object(i.a)(C,2),F=M[0],D=M[1],T=Object(a.useState)(null),Y=Object(i.a)(T,2),w=Y[0],q=Y[1];return Object(h.jsxs)(h.Fragment,{children:[Object(h.jsxs)("form",{onSubmit:function(e){e.preventDefault(),r(!0),fetch("/api/bugReport",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:x,phone:v,issue:y,dscr:F})}).then((function(e){return e.json()})).then((function(e){r(!1),"ok"===e.code?null===t||void 0===t||t():q(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return q(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(d.i,{}),Object(h.jsx)("h4",{children:"Report could not be submitted."})]})]}))})).catch((function(e){r(!1),console.log(e),q(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return q(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(d.i,{}),Object(h.jsx)("h4",{children:"Report could not be submitted. Make sure you're online."})]})]}))}))},children:[Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Name"}),Object(h.jsx)("input",{value:x,onChange:function(e){return m(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Phone"}),Object(h.jsx)("input",{value:v,onChange:function(e){return g(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Issue"}),Object(h.jsx)("input",{value:y,onChange:function(e){return S(e.target.value)}})]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Description"}),Object(h.jsx)(O.a,{value:F,onChange:function(e){return D(e.target.value)}})]}),Object(h.jsx)("section",{className:"btns",children:Object(h.jsx)("button",{className:"submit",children:"Submit"})})]}),Object(h.jsx)(b.Modal,{open:w,className:"msg",children:w}),l&&Object(h.jsx)("div",{className:"spinnerContainer",children:Object(h.jsx)("div",{className:"spinner"})})]})},m=function(e){var t=e.history,c=(e.location,e.pathname,Object(a.useState)(!1)),j=Object(i.a)(c,2),r=j[0],o=j[1],O=Object(a.useState)(null),x=Object(i.a)(O,2),m=x[0],p=x[1],f=Object(a.useState)(0),v=Object(i.a)(f,2),g=v[0],N=v[1],k=Object(a.useState)([]),y=Object(i.a)(k,2),S=y[0],C=y[1],M=Object(a.useState)({column:"createdAt",order:"dsc"}),F=Object(i.a)(M,2),D=F[0],T=F[1],Y=Object(a.useState)(null),w=Object(i.a)(Y,2),q=w[0],A=w[1],P=Object(a.useState)(1),R=Object(i.a)(P,2),I=R[0],_=R[1],B=Object(a.useState)(""),G=Object(i.a)(B,2),J=G[0],L=G[1],H=Object(a.useState)(20),z=Object(i.a)(H,2),U=z[0],E=z[1];return Object(a.useEffect)((function(){var e,t=Object(d.M)({time:null===q||void 0===q?void 0:q.startDate,format:"YYYY-MM-DD"}),c=Object(d.M)({time:null===(e=new Date(null===q||void 0===q?void 0:q.endDate))||void 0===e?void 0:e.setHours(24,0,0,0),format:"YYYY-MM-DD"});fetch("/api/getTickets?".concat(new URLSearchParams(Object(l.a)(Object(l.a)(Object(s.a)({page:I,perPage:U,sort:D.column},"sort",D.order),J&&{q:J}),q&&{dateFrom:t,dateTo:c})).toString())).then((function(e){return e.json()})).then((function(e){var t;"ok"===e.code?(C(e.tickets.tickets),N((null===(t=e.tickets.pageInfo[0])||void 0===t?void 0:t.count)||0)):p(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return p(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(d.i,{}),Object(h.jsx)("h4",{children:"Could not get tickets."})]})]}))})).catch((function(e){console.log(e),p(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return p(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(d.i,{}),Object(h.jsx)("h4",{children:"Could not get tickets. Make sure you're online."})]})]}))}))}),[I,U,D.column,D.order,J,q]),Object(h.jsxs)("div",{className:"table ticketContainer",children:[Object(h.jsx)("div",{style:{display:"none"},children:Object(h.jsx)(d.I,{})}),Object(h.jsxs)("div",{className:"head",children:[Object(h.jsx)("h3",{children:"Tickets"}),Object(h.jsx)("button",{onClick:function(){return o(!0)},children:"Open Ticket"})]}),Object(h.jsxs)("div",{className:"filters",children:[Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Total:"}),g]}),Object(h.jsxs)("section",{children:[Object(h.jsx)("label",{children:"Per Page:"}),Object(h.jsx)(d.h,{defaultValue:0,options:[{label:"20",value:20},{label:"30",value:30},{label:"50",value:50}],onChange:function(e){return E(e.value)}})]}),Object(h.jsxs)("section",{className:"search",children:[Object(h.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"23",height:"23",viewBox:"0 0 23 23",children:Object(h.jsx)("path",{id:"Icon_ionic-ios-search","data-name":"Icon ionic-ios-search",d:"M27.23,25.828l-6.4-6.455a9.116,9.116,0,1,0-1.384,1.4L25.8,27.188a.985.985,0,0,0,1.39.036A.99.99,0,0,0,27.23,25.828ZM13.67,20.852a7.2,7.2,0,1,1,5.091-2.108A7.155,7.155,0,0,1,13.67,20.852Z",transform:"translate(-4.5 -4.493)",fill:"#707070",opacity:"0.74"})}),Object(h.jsx)("input",{value:J,onChange:function(e){return L(e.target.value)},placeholder:"Search issue"}),J&&Object(h.jsx)("button",{onClick:function(){return L("")},children:Object(h.jsx)(d.I,{})})]}),Object(h.jsx)("section",{className:"date",children:Object(h.jsx)(d.o,{dateRange:q,onChange:function(e){return A(e)}})})]}),Object(h.jsxs)("table",{cellSpacing:0,cellPadding:0,children:[Object(h.jsx)("thead",{children:Object(h.jsxs)("tr",{children:[Object(h.jsxs)("th",{className:"createdAt"===D.column?"sort "+D.order:"",onClick:function(){T((function(e){return{column:"createdAt",order:"dsc"===e.order?"asc":"dsc"}}))},children:["Date ",Object(h.jsx)(d.g,{})]}),Object(h.jsxs)("th",{className:"issue"===D.column?"sort "+D.order:"",onClick:function(){T((function(e){return{column:"issue",order:"dsc"===e.order?"asc":"dsc"}}))},children:["Issue ",Object(h.jsx)(d.g,{})]}),Object(h.jsxs)("th",{className:"status"===D.column?"sort "+D.order:"",onClick:function(){T((function(e){return{column:"status",order:"dsc"===e.order?"asc":"dsc"}}))},children:["Status ",Object(h.jsx)(d.g,{})]})]})}),Object(h.jsxs)("tbody",{children:[S.map((function(e){return Object(h.jsxs)("tr",{onClick:function(){return t.push("/account/support/ticket/".concat(e._id))},children:[Object(h.jsx)("td",{children:Object(h.jsx)(d.s,{format:"hh:mm a, DD MMM, YYYY",children:e.createdAt})}),Object(h.jsx)("td",{children:e.issue}),Object(h.jsx)("td",{children:e.status})]},e._id)})),0===S.length&&Object(h.jsx)("tr",{className:"placeholder",children:Object(h.jsx)("td",{children:"Nothing yet."})})]}),Object(h.jsx)("tfoot",{children:Object(h.jsx)("tr",{children:Object(h.jsx)(d.u,{total:g,perPage:U,currentPage:I,btns:5,setPage:_})})})]}),Object(h.jsx)(b.Modal,{open:m,className:"msg",children:m}),Object(h.jsx)(b.Modal,{open:r,head:!0,label:"Open Ticket",setOpen:o,className:"formModal ticketFormModal",children:Object(h.jsx)(u.TicketForm,{onSuccess:function(e){o(!1),p(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return p(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(d.D,{}),Object(h.jsx)("h4",{children:"Ticket successfully submitted."})]})]})),C((function(t){return[e].concat(Object(n.a)(t))}))}})})]})},p=function(e){var t=e.history,c=e.match,s=Object(a.useState)(null),j=Object(i.a)(s,2),o=j[0],O=j[1],x=Object(a.useState)(null),m=Object(i.a)(x,2),p=m[0],f=m[1],v=Object(a.useState)(!1),g=Object(i.a)(v,2),N=g[0],k=g[1];return Object(a.useEffect)((function(){fetch("/api/singleTicket?_id=".concat(c.params._id)).then((function(e){return e.json()})).then((function(e){"ok"===e.code?O(e.ticket):f(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return t.push("/account/support/ticket")},children:"Go Back"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(d.i,{}),Object(h.jsx)("h4",{children:"Ticket could not be found."})]})]}))})).catch((function(e){console.log(e),f(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return t.push("/account/support/ticket")},children:"Go Back"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(d.i,{}),Object(h.jsx)("h4",{children:"Ticket could not be found."})]})]}))}))}),[]),o?Object(h.jsxs)("div",{className:"ticket",children:[Object(h.jsxs)("div",{className:"detail",children:[Object(h.jsxs)(r.b,{to:"/account/support/ticket",className:"back",children:[Object(h.jsx)(d.c,{}),"Go Back"]}),Object(h.jsxs)("ul",{className:"summery",children:[Object(h.jsx)("li",{className:"head",children:"Ticket Summery"}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Issue:"}),Object(h.jsx)("p",{children:o.issue})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Status:"}),Object(h.jsx)("p",{children:o.status})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Created at:"}),Object(h.jsx)("p",{children:Object(h.jsx)(d.s,{format:"hh:mm a, DD MMM, YYYY",children:o.createdAt})})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Last Activity:"}),Object(h.jsx)("p",{children:Object(h.jsx)(d.s,{format:"hh:mm a, DD MMM, YYYY",children:o.updatedAt})})]})]}),Object(h.jsxs)("ul",{className:"milestoneDetail",children:[Object(h.jsx)("li",{className:"head",children:"Milestone Detail"}),o.milestone?Object(h.jsxs)(h.Fragment,{children:[Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Amount:"}),Object(h.jsx)("p",{children:o.milestone.amount})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Status:"}),Object(h.jsx)("p",{children:o.milestone.status})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Created at:"}),Object(h.jsx)("p",{children:Object(h.jsx)(d.s,{format:"hh:mm a, DD MMM, YYYY",children:o.milestone.createdAt})})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Verification Method:"}),Object(h.jsx)("p",{children:o.milestone.verification})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Seller:"}),Object(h.jsx)("p",{children:o.milestone.seller.firstName+" "+o.milestone.seller.lastName})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Buyer:"}),Object(h.jsx)("p",{children:o.milestone.buyer.firstName+" "+o.milestone.buyer.lastName})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Description:"}),Object(h.jsx)("p",{children:o.milestone.dscr})]})]}):Object(h.jsx)("li",{className:"placeholder",children:"No Detail provided"})]}),Object(h.jsxs)("ul",{className:"transactionDetail",children:[Object(h.jsx)("li",{className:"head",children:"Transaction Detail"}),o.transaction?Object(h.jsxs)(h.Fragment,{children:[Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Type:"}),Object(h.jsx)("p",{children:o.transaction.__t})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Amount:"}),Object(h.jsx)("p",{children:o.transaction.amount})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Note:"}),Object(h.jsx)("p",{children:o.transaction.note})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{children:"Created at:"}),Object(h.jsx)("p",{children:Object(h.jsx)(d.s,{format:"hh:mm a, DD MMM, YYYY",children:o.transaction.createdAt})})]})]}):Object(h.jsx)("li",{className:"placeholder",children:"No Detail provided"})]}),Object(h.jsx)("div",{className:"pBtm"})]}),Object(h.jsxs)("div",{className:"messages",children:[Object(h.jsxs)("div",{className:"head",children:["Messages ",Object(h.jsx)("button",{onClick:function(){return k(!0)},children:"Reply"})]}),Object(h.jsx)("ul",{children:Object(n.a)(o.messages).reverse().map((function(e,t){return Object(h.jsxs)("li",{children:[Object(h.jsx)("div",{className:"user",children:Object(h.jsxs)("p",{className:"name",children:[e.user.name,Object(h.jsx)("span",{children:"\u2022"}),Object(h.jsx)("span",{className:"role",children:e.user.role}),Object(h.jsx)("span",{className:"date",children:Object(h.jsx)(d.s,{format:"hh:mm a, DD MMM, YYYY",children:e.createdAt})})]})}),Object(h.jsx)("p",{className:"message",children:e.message.body}),e.message.files.length>0&&Object(h.jsx)("div",{className:"thumbs",children:Object(h.jsx)(d.q,{links:e.message.files})})]},t)}))})]}),Object(h.jsx)(b.Modal,{open:N,head:!0,label:"Add reply to Ticket",setOpen:k,className:"ticketReplyFormModal",children:Object(h.jsx)(u.TicketReplyForm,{_id:o._id,onSuccess:function(e){k(!1),O((function(t){return Object(l.a)(Object(l.a)({},t),{},{messages:e.messages})})),f(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return f(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(d.D,{}),Object(h.jsx)("h4",{children:"Reply has been submitted."})]})]}))}})}),Object(h.jsx)(b.Modal,{open:p,className:"msg",children:p})]}):Object(h.jsxs)("div",{className:"ticket loading",children:[Object(h.jsxs)("div",{className:"detail",children:[Object(h.jsxs)(r.b,{to:"/account/support/ticket",className:"back",children:[Object(h.jsx)(d.c,{}),"Go Back"]}),Object(h.jsxs)("ul",{className:"summery",children:[Object(h.jsx)("li",{className:"head",children:"Ticket Summery"}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{}),Object(h.jsx)("p",{})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{}),Object(h.jsx)("p",{})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{}),Object(h.jsx)("p",{})]})]}),Object(h.jsxs)("ul",{className:"milestoneDetail",children:[Object(h.jsx)("li",{className:"head",children:"Milestone Detail"}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{}),Object(h.jsx)("p",{})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{}),Object(h.jsx)("p",{})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{}),Object(h.jsx)("p",{})]})]}),Object(h.jsxs)("ul",{className:"transactionDetail",children:[Object(h.jsx)("li",{className:"head",children:"Transaction Detail"}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{}),Object(h.jsx)("p",{})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{}),Object(h.jsx)("p",{})]}),Object(h.jsxs)("li",{children:[Object(h.jsx)("label",{}),Object(h.jsx)("p",{})]})]})]}),Object(h.jsxs)("div",{className:"messages",children:[Object(h.jsx)("div",{className:"head",children:"Messages"}),Object(h.jsxs)("ul",{children:[Object(h.jsxs)("li",{children:[Object(h.jsxs)("div",{className:"user",children:[Object(h.jsx)("div",{className:"img"}),Object(h.jsx)("p",{className:"name"})]}),Object(h.jsx)("p",{className:"message",children:Object(h.jsx)("span",{})}),Object(h.jsxs)("div",{className:"thumbs",children:[Object(h.jsx)("div",{className:"img"}),Object(h.jsx)("div",{className:"img"})]})]}),Object(h.jsxs)("li",{children:[Object(h.jsxs)("div",{className:"user",children:[Object(h.jsx)("div",{className:"img"}),Object(h.jsx)("p",{className:"name"})]}),Object(h.jsx)("p",{className:"message",children:Object(h.jsx)("span",{})}),Object(h.jsxs)("div",{className:"thumbs",children:[Object(h.jsx)("div",{className:"img"}),Object(h.jsx)("div",{className:"img"}),Object(h.jsx)("div",{className:"img"})]})]})]})]}),Object(h.jsx)(b.Modal,{open:p,className:"msg",children:p})]})};t.default=function(e){e.history,e.location,e.match;var t=Object(a.useContext)(j.d).userType,c=Object(a.useState)(null),n=Object(i.a)(c,2),s=n[0],l=n[1],u=Object(a.useState)([]),O=Object(i.a)(u,2),f=O[0],v=O[1],g=Object(a.useState)(!1),N=Object(i.a)(g,2),k=N[0],y=N[1];return Object(a.useEffect)((function(){fetch("/api/faq?audience=".concat(t)).then((function(e){return e.json()})).then((function(e){"ok"===e.code&&v(e.faqs)}))}),[t]),Object(h.jsxs)(h.Fragment,{children:[Object(h.jsxs)(o.d,{children:[Object(h.jsx)(o.b,{path:"/account/support/ticket/:_id",component:p}),Object(h.jsx)(o.b,{path:"/account/support/ticket",component:m}),Object(h.jsx)(o.b,{path:"/",children:Object(h.jsxs)("div",{className:"supportContainer",children:[Object(h.jsxs)("div",{className:"benner",children:[Object(h.jsxs)("div",{className:"clas",children:[Object(h.jsx)(r.b,{className:"ticketLink",to:"/account/support/ticket",children:"My Tickets"}),Object(h.jsx)("button",{className:"ticketLink",onClick:function(){return y(!0)},children:"Report Bug"})]}),Object(h.jsx)("h1",{children:"Support portal"}),Object(h.jsx)("p",{children:"Search for an answer or browse help topics to create a ticket"}),Object(h.jsxs)("form",{onSubmit:function(e){return e.preventDefault()},children:[Object(h.jsx)("input",{type:"text",required:!0,placeholder:"Eg: How does the Delivery pay Hold Works",onChange:function(e){fetch("/api/faq?audience=".concat(t,"&q=").concat(e.target.value)).then((function(e){return e.json()})).then((function(e){"ok"===e.code&&v(e.faqs)}))}}),Object(h.jsx)("button",{type:"submit",children:Object(h.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"31.336",height:"31.336",viewBox:"0 0 31.336 31.336",children:Object(h.jsx)("path",{id:"Path_1935","data-name":"Path 1935",d:"M25.4,22.708H23.98l-.5-.484a11.663,11.663,0,1,0-1.254,1.254l.484.5V25.4l8.958,8.94,2.67-2.67Zm-10.75,0a8.062,8.062,0,1,1,8.063-8.063A8.052,8.052,0,0,1,14.646,22.708Z",transform:"translate(-3 -3)",fill:"#707070"})})})]})]}),Object(h.jsxs)("div",{className:"content",children:[Object(h.jsxs)("div",{className:"faq",children:[Object(h.jsxs)("h3",{className:"label",children:["FAQs ",t&&Object(h.jsxs)("span",{children:["(for ",t,"s)"]})]}),Object(h.jsx)("ul",{children:f.map((function(e){return Object(h.jsxs)("li",{children:[Object(h.jsx)("h4",{children:e.ques}),Object(h.jsx)("p",{className:"ans",children:e.ans})]},e._id)}))})]}),Object(h.jsxs)("div",{className:"feedback",children:[Object(h.jsxs)("form",{children:[Object(h.jsx)("textarea",{required:!0}),Object(h.jsx)("button",{children:"Submit"})]}),Object(h.jsx)(r.b,{className:"feedbackLink",to:"/support/myFeedbacks",children:"Submitted Feedbacks"})]})]})]})})]}),Object(h.jsx)(b.Modal,{open:k,setOpen:y,className:"bugReport",label:"Report Bug",head:!0,children:Object(h.jsx)(x,{onSuccess:function(){y(!1),l(Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("button",{onClick:function(){return l(null)},children:"Okay"}),Object(h.jsxs)("div",{children:[Object(h.jsx)(d.D,{}),Object(h.jsx)("h4",{children:"Report has been submitted."})]})]}))}})}),Object(h.jsx)(b.Modal,{open:s,className:"msg",children:s})]})}},241:function(e,t,c){},242:function(e,t,c){}}]);
//# sourceMappingURL=14.a6448ddd.chunk.js.map