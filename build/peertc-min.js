var Connector=function(){function e(n){return this instanceof e?(this.pc=n.pc,this.id=n.id,this.to=n.to,this.peertc=n.peertc,this.__init(n),this.queue=[],this.sending=!1,this.fileSenders={},void(this.fileRecievers={})):new e(n)}return e.prototype.__initDataChannel=function(e){var n=this;n.channel=e,e.onopen=function(){n.peertc.emit("open",n.to)},e.onmessage=function(e){var t=JSON.parse(e.data);"message"===t.type?n.__parseMessage(t.data,n.to):"file"===t.type&&n.__parseFileChunk(t.data,n.to)},e.onclose=function(){n.close(),n.peertc.emit("close",n.to)},e.onerror=function(e){n.peertc.emit("error",e,n.to)}},e.prototype.__parseMessage=function(e,n){this.peertc.emit("message",e,n)},e.prototype.__parseFileChunk=function(e,n){var t=this,o=t.fileRecievers;o[n]=o[n]||{};var i=o[n][e.id]=o[n][e.id]||new FileReciever(e.id,e.meta,n);i.addChunk(e.chunk),t.peertc.emit("fileChunk",e,n),e.sended===e.sum&&(i.download(),t.peertc.emit("file",i.meta,n),delete o[n][e.id])},e.prototype.__init=function(e){var n=this,t=n.pc,o=n.id,i=n.to;t.onicecandidate=function(e){e.candidate&&n.peertc.socket.send(JSON.stringify({event:"__ice_candidate",data:{label:e.candidate.sdpMLineIndex,candidate:e.candidate.candidate,from:o,to:i}}))},t.ondatachannel=function(e){n.__initDataChannel(e.channel)},e.channel&&n.__initDataChannel(t.createDataChannel(i))},e.prototype.sendFile=function(e){var n=this,t=t;if("string"==typeof e&&(e=document.querySelector(e)),!e.files||!e.files[0])throw Error("No file needs to be send");t=e.files[0];var o=new FileSender(t);o.chunkify(function(){function e(){var t=o.getChunk();t&&(n.queue.push({type:"file",data:{sum:o.sum,sended:o.sended,meta:o.meta,id:o.id,chunk:t}}),setTimeout(e,0)),n.sending||setTimeout(function(){n.__send()},0)}setTimeout(e,0)})},e.prototype.send=function(e){var n=this;return n.queue.push({type:"message",data:e}),n.sending||setTimeout(function(){n.__send()},0),n},e.prototype.__send=function(){var e=this,n=e.queue;if(0!==n.length){e.sending=!0;var t=n[0],o=e.channel;if(o){var i=o.readyState.toLowerCase();"open"===i?(t.from=e.id,t.to=e.to,o.send(JSON.stringify(t)),n.shift(),e.sending=!1):"connecting"===i?setTimeout(function(){e.__send()},0):e.close()}}},e.prototype.close=function(){var e=this;e.sending=!1,e.queue=[],e.channel&&"connecting"===e.channel.readyState.toLowerCase()&&e.channel.close(),e.channel=null,"closed"!==e.pc.signalingState&&e.pc.close(),delete e.peertc.connectors[e.to]},e}(),EventEmitter=function(){function e(){this.events={}}return e.prototype.on=function(e,n){return this.events[e]=this.events[e]||[],this.events[e].push(n),this},e.prototype.emit=function(e){var n,t,o=this.events[e],i=Array.prototype.slice.call(arguments,1);if(o){for(n=0,t=o.length;t>n;n++)o[n].apply(null,i);return this}},e.prototype.off=function(e,n){var t,o=this.events[e];return o&&(t=-1!==o.indexOf(n))&&o.splice(t,1),this},e}(),FileReciever=function(){function e(e,n){for(var t=atob(e.split(",")[1]),o=[],i=0;i<t.length;i++)o.push(t.charCodeAt(i));return new Blob([new Uint8Array(o)],{type:n})}function n(e,t,o){return this instanceof n?(this.id=e,this.chunks=[],this.meta=t,void(this.sended=0)):new n(e,t,o)}var t=(window.URL||window.webkitURL||window.mozURL||window.msURL||window.oURL,"Mozilla"===navigator.appCodeName);return n.prototype.addChunk=function(e){return this.chunks.push(e),this},n.prototype.download=function(){var n=this,o=n.chunks.join(""),i=document.createElement("a");document.body.appendChild(i),i.style="display: none";var r=e(o,"octet/stream"),s=window.URL.createObjectURL(r);i.href=s,i.download=n.meta.name,i.click(),!t&&window.URL.revokeObjectURL(s),i.parentNode.removeChild(i)},n}(),FileSender=function(){function e(){return(Math.random()*(new Date).getTime()).toString(36).toUpperCase().replace(/\./g,"-")}function n(n){var t=this;t.file=n,t.meta={name:n.name,size:n.size,type:n.type},t.chunks=[],t.sended=0,t.id=e(),t.sum}var t=1e3;return n.prototype.chunkify=function(e){var n=this,o=n.file,i=new window.FileReader(o);i.readAsDataURL(o),i.onload=function(o){var i=o.target.result,r=n.chunks;for(n.sum=i.length;i.length;){var s;r.push(i.length>t?s=i.slice(0,t):s=i),i=i.slice(s.length)}e.call(n)}},n.prototype.getChunk=function(){var e;if(this.chunks.length){var e=this.chunks.shift();return this.sended+=e.length,e}return null},n}(),Peertc=function(){"use strict";function e(n,t){return this instanceof e?(r||this.emit("error",new Error("WebSocket is not supported, Please upgrade your browser!")),i||this.emit("error",new Error("DataChannel is not supported, Please upgrade your browser!")),this.id=t,this.socket=new WebSocket(n),this.connectors={},void this.__init()):new e(n,t)}var n=window.PeerConnection||window.webkitPeerConnection00||window.webkitRTCPeerConnection||window.mozRTCPeerConnection,t=window.mozRTCIceCandidate||window.RTCIceCandidate,o=window.mozRTCSessionDescription||window.RTCSessionDescription,i=!1,r=!!WebSocket;!function(){var e;try{n||(i=!1),e=new webkitRTCPeerConnection(null),i=e&&e.createDataChannel?!0:!1}catch(t){i=!1}}();var s={iceServers:[{url:"stun:stun.l.google.com:19302"}]};return e.prototype=new EventEmitter,e.prototype.__init=function(){var e=this,n=e.id,i=e.connectors,r=e.socket;r.onopen=function(){r.send(JSON.stringify({event:"__init",data:{id:n}}))},r.onmessage=function(n){var t=JSON.parse(n.data);t.event?e.emit(t.event,t.data,r):e.emit("message",t.data,r)},r.onerror=function(n){e.emit("error",n,r)},r.onclose=function(){for(var e in i)i[e].pc&&i[e].pc.close();i={}},e.on("_init",function(){e.emit("init")}),e.on("_ice_candidate",function(e){var n=new t(e),o=i[e.from].pc;o.addIceCandidate(n)}),e.on("_offer",function(t){var i=e.__createConnector(t.from,!1),r=t.sdp,s=i.pc;s.setRemoteDescription(new o(r)),s.createAnswer(function(o){s.setLocalDescription(o),e.socket.send(JSON.stringify({event:"__answer",data:{from:n,to:t.from,sdp:o}}))},function(e){console.log(e)})}),e.on("_answer",function(e){var n=i[e.from].pc;n.setRemoteDescription(new o(e.sdp))})},e.prototype.connect=function(e){var n,t=this;return t.connectors[e]?n=t.connectors[e]:(n=t.__createConnector(e,!0),t.__sendOffer(e)),n},e.prototype.__sendOffer=function(e){function n(){var i=t.socket.readyState;1===i?o.createOffer(function(n){o.setLocalDescription(n),t.socket.send(JSON.stringify({event:"__offer",data:{sdp:n,to:e,from:t.id}}))},function(e){console.log(e)}):0===i&&setTimeout(n,0)}var t=this,o=t.connectors[e].pc;setTimeout(n,0)},e.prototype.__createConnector=function(e,t){var o=this,i=new n(s);return o.connectors[e]=new Connector({pc:i,to:e,id:o.id,peertc:o,channel:t})},e}();