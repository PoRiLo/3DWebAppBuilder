/**
 * Copyright @ 2020 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/_base/lang","dojo/_base/array","esri/core/declare","esri/core/lang","esri/views/3d/webgl-engine/lib/Util","esri/core/libs/gl-matrix-2/vec3f64","esri/core/libs/gl-matrix-2/vec2f64","esri/core/libs/gl-matrix-2/vec3","esri/core/libs/gl-matrix-2/vec2","../../webgl-engine-extensions/VertexBufferLayout","../../webgl-engine-extensions/GLVertexArrayObject","../../webgl-engine-extensions/GLXBO","../../webgl-engine-extensions/GLVerTexture","../../support/fx3dUtils","../../support/fx3dUnits","../Effect","./JetTrailMaterial"],function(i,e,t,s,r,n,a,h,l,_,o,d,u,g,f,c,p){var m=n.vec3f64,h=h.vec3,v=a.vec2f64,l=l.vec2,x=1.11,w=m.create(),V=m.create(),O=m.create(),B=0,I=r.VertexAttrConstants,b={ALONG:0,AROUND:1},A={HEAD:1,TAIL:4},M=t([c],{declaredClass:"esri.views.3d.effects.JetTrail.JetTrailEffect",effectName:"JetTrail",constructor:function(e){i.hitch(this,e),this.orderId=2,this._needsAllLoaded=!0},_initRenderingInfo:function(){this.renderingInfo.radius=20,this.renderingInfo.pulseRadius=1e5,this.renderingInfo.colors=[g.rgbNames.cadetblue,g.rgbNames.yellowgreen,g.rgbNames.lightpink,g.rgbNames.orangered,g.rgbNames.green,g.rgbNames.indianred],this.renderingInfo.showEndPoints=!0,this._colorBarDirty=!0,this._renderingInfoDirty=!0,this._curveType=b.AROUND,this._vacDirty=!0,this._shapeDirty=!0,this._needsRenderPulse=!1,this.inherited(arguments)},_doRenderingInfoChange:function(i){this.inherited(arguments);for(var e in i)i.hasOwnProperty(e)&&this.renderingInfo.hasOwnProperty(e)&&(g.endsWith(e.toLowerCase(),"info")?g.isInforAttrChanged(this.renderingInfo[e],i[e])&&(this._renderingInfoDirty=!0):g.endsWith(e.toLowerCase(),"colors")?i[e]instanceof Array&&(this.renderingInfo[e]=i[e],this._colorBarDirty=!0,this._renderingInfoDirty=!0):"radius"===e.toLowerCase()||"pulseRadius"===e.toLowerCase()||"transparency"===e.toLowerCase()?(this._clampScope(i,e),"radius"==e&&this._radiusUnit?this.renderingInfo[e]=f.toMeters(this._radiusUnit,i[e],this._view.viewingMode):"pulseRadius"==e&&this._pulseRadiusUnit?this.renderingInfo[e]=f.toMeters(this._pulseRadiusUnit,i[e],this._view.viewingMode):this.renderingInfo[e]=i[e]):typeof i[e]==typeof this.renderingInfo[e]&&(this.renderingInfo[e]=i[e]))},setContext:function(t){this.inherited(arguments),this._effectConfig&&i.isArray(this._effectConfig.renderingInfo)&&(this._radiusUnit=null,this._pulseRadiusUnit=null,e.forEach(this._effectConfig.renderingInfo,function(i){"radius"===i.name.toLowerCase()?(this._radiusUnit=i.unit,this.renderingInfo.radius=f.toMeters(this._radiusUnit,this.renderingInfo.radius,this._view.viewingMode)):"pulseRadius"===i.name.toLowerCase()&&(this._pulseRadiusUnit=i.unit,this.renderingInfo.pulseRadius=f.toMeters(this._pulseRadiusUnit,this.renderingInfo.pulseRadius,this._view.viewingMode))}.bind(this)),this._aroundVerticesTexture=new u(this._gl),this._aroundVerticesTextureSize=v.create())},destroy:function(){this._resetXBOs(),this._dispose("_aroundVerticesTexture"),this._dispose("_headVAO"),this._dispose("_tailVAO"),this._dispose("_pulseVAO")},_resetXBOs:function(){this._dispose("_headVBO"),this._dispose("_tailVBO"),this._dispose("_tailIBO"),this._dispose("_pulseVBO"),this._dispose("_pulseIBO"),this._needsRenderPulse=!1},_initVertexLayout:function(){this._vertexAttrConstants=[I.AUXPOS1,I.AUXPOS2],this._vertexBufferLayout=new _(this._vertexAttrConstants,[2,3],[5126,5126])},_initRenderContext:function(){return this.inherited(arguments),this._vacDirty&&(this._initVertexLayout(),this._resetXBOs(),this._vacDirty=!1,this._headVAO&&(this._headVAO.unbind(),this._headVAO._initialized=!1),this._tailVAO&&(this._tailVAO.unbind(),this._tailVAO._initialized=!1),this._pulseVAO&&(this._pulseVAO.unbind(),this._pulseVAO._initialized=!1)),this._headVBO||(this._headVBO=new d(this._gl,(!0),this._vertexBufferLayout)),this._tailVBO||(this._tailVBO=new d(this._gl,(!0),this._vertexBufferLayout)),this._tailIBO||(this._tailIBO=new d(this._gl,(!1))),this._pulseVBO||(this._pulseVBO=new d(this._gl,(!0),this._vertexBufferLayout)),this._pulseIBO||(this._pulseIBO=new d(this._gl,(!1))),this._vaoExt&&(this._headVAO=new o(this._gl,this._vaoExt),this._tailVAO=new o(this._gl,this._vaoExt),this._pulseVAO=new o(this._gl,this._vaoExt)),this._localBindsCallback||(this._localBindsCallback=this._localBinds.bind(this)),this._curveType===b.AROUND?this._buildAroundPathGeometries():this._curveType===b.ALONG&&this._buildAlongPathGeometries()},_buildAroundPathGeometries:function(){if(!this._needsAllLoaded)return console.warn("All features should be loaded first."),!1;var i=this._allGraphics();if(i.length>0){var t,s,r,n,a,l,_,o=[],d=[],u=[],f=0,c=[];return this._pathIdNum=0,e.forEach(i,function(i,e){if(null!==i.geometry)for(a=i.geometry.paths,l=0;l<a.length;l++)if(!(a[l].length<2)){for(t=a[l][0],null==t[2]&&(t[2]=x),s=a[l][a[l].length-1],null==s[2]&&(s[2]=x),h.set(w,t[0],t[1],t[2]),"global"===this._view.viewingMode?g.wgs84ToSphericalEngineCoords(w,0,w,0):"local"===this._view.viewingMode&&g.wgs84ToWebMerc(w,0,w,0),h.set(V,s[0],s[1],s[2]),"global"===this._view.viewingMode?g.wgs84ToSphericalEngineCoords(V,0,V,0):"local"===this._view.viewingMode&&g.wgs84ToWebMerc(V,0,V,0),h.subtract(O,w,V),n=h.length(O),"global"===this._view.viewingMode?r=n<=1e3?32:n<=1e4?24:n<=5e5?18:n<=1e6?40:Math.floor(1e-5*n):"local"===this._view.viewingMode&&(r=n<=1e3?48:n<=1e4?42:n<=1e5?32:n<=1e6?24:n<=2e6?36:Math.floor(6e-6*n)),r=2*r-1,r=Math.max(5,Math.floor(.26*r)),o.push(this._pathIdNum,e,A.HEAD,r-1,r-1),c.push([t[0],t[1],t[2]]),c.push([s[0],s[1],s[2]]),_=0;_<r;_++)d.push(this._pathIdNum,e,A.TAIL,_,r-1),_<r-1&&u.push(f+_,f+_+1);this._pathIdNum++,f+=r}}.bind(this)),this._headVBO.addData(!1,new Float32Array(o)),this._tailVBO.addData(!1,new Float32Array(d)),this._tailIBO.addData(!1,new Uint32Array(u)),this._headVAO&&(this._headVAO._initialized=!1),this._tailVAO&&(this._tailVAO._initialized=!1),this._resetAddGeometries(),this._initAroundVerticesTexture(c)&&this._initPulseGeometries(c)}return!1},_buildAlongPathGeometries:function(){return!1},_initAroundVerticesTexture:function(i){if(2*this._pathIdNum!==i.length)return console.warn("The quantity of paths and points is invalid."),!1;var e=this._gl.getParameter(3379),t=2,s=this._pathIdNum*t,r=g.nextHighestPowerOfTwo(s);r>e&&(r=e,console.warn("Too many graphics, and some data will be discarded."));var n=Math.ceil(s/r);n=g.nextHighestPowerOfTwo(n),n>e&&(n=e,console.warn("Too many graphics, and some data will be discarded."));var a,h,_=new Float32Array(r*n*4);for(a=0;a<this._pathIdNum;a++)h=a*t*4,_[0+h]=a,_[1+h]=i[a*t][0],_[2+h]=i[a*t][1],_[3+h]=i[a*t][2],_[4+h]=a,_[5+h]=i[a*t+1][0],_[6+h]=i[a*t+1][1],_[7+h]=i[a*t+1][2];return this._aroundVerticesTexture.setData(r,n,_),l.set(this._aroundVerticesTextureSize,r,n),!0},_initPulseGeometries:function(i){if(2*this._pathIdNum!==i.length)return console.warn("The quantity of paths and points is invalid."),!1;if(i.length>0){var e,t,s,r,n,a,h,l=2,_=40,o=this._vertexBufferLayout.getStride(),d=new Float32Array((_+1)*o*this._pathIdNum),u=new Uint32Array(3*_*this._pathIdNum),g=2*Math.PI;for(e=0;e<this._pathIdNum;e++){for(r=e*(_+1)*o,n=i[e*l+1],d[r+2]=n[0],d[r+3]=n[1],d[r+4]=n[2],d[r+0]=-1,d[r+1]=e,r+=o,t=0;t<_;t++)s=r+o*t,d[s+2]=n[0],d[s+3]=n[1],d[s+4]=n[2],d[s+0]=g*(t/_),d[s+1]=e;for(h=e*(_+1),a=3*h,t=0;t<_-1;t++)s=a+3*t,u[s+0]=0+h,u[s+1]=t+1+h,u[s+2]=t+2+h;s=a+3*(_-1),u[s+0]=0+h,u[s+1]=_+h,u[s+2]=1+h}return this._pulseVBO.addData(!1,d),this._pulseIBO.addData(!1,u),this._pulseVAO&&(this._pulseVAO._initialized=!1),!0}return!1},_initColourMap:function(){this._colourMapTexture||(this._colourMapTexture=this._gl.createTexture());var i=new Image;i.src=g.spriteImg;var e=this;return i.onload=function(){var t=e._gl.getParameter(e._gl.TEXTURE_BINDING_2D);e._gl.bindTexture(3553,e._colourMapTexture),e._gl.pixelStorei(37440,!0),e._gl.texParameteri(3553,10240,9728),e._gl.texParameteri(3553,10241,9728),e._gl.texParameteri(3553,10242,33071),e._gl.texParameteri(3553,10243,33071),e._gl.texImage2D(3553,0,6408,6408,5121,i),e._gl.generateMipmap(3553),e._gl.bindTexture(3553,t)},0===this._gl.getError()},_loadShaders:function(){return this.inherited(arguments),this._material||(this._material=new p({pushState:this._pushState.bind(this),restoreState:this._restoreState.bind(this),gl:this._gl,viewingMode:this._view.viewingMode,shaderSnippets:this._shaderSnippets})),this._material.loadShaders()},_initColorBar:function(){if(!this._colorBarDirty)return!0;this._colorBarTexture||(this._colorBarTexture=this._gl.createTexture());var i=this._gl.getParameter(32873);this._gl.bindTexture(3553,this._colorBarTexture),this._gl.pixelStorei(37440,!0),this._gl.texParameteri(3553,10240,9728),this._gl.texParameteri(3553,10241,9728),this._gl.texParameteri(3553,10242,33071),this._gl.texParameteri(3553,10243,33071);var e=g.createColorBarTexture(32,1,this.renderingInfo.colors);return this._gl.texImage2D(3553,0,6408,6408,5121,e),this._gl.generateMipmap(3553),this._gl.bindTexture(3553,i),0===this._gl.getError()},_localBinds:function(i,e,t){i.bind(t),this._vertexBufferLayout.enableVertexAttribArrays(this._gl,t),e&&e.bind()},_bindBuffer:function(i,e,t,s){i?(i._initialized||i.initialize(this._localBindsCallback,[e,t,s]),i.bind()):this._localBinds(e,t,s)},_unBindBuffer:function(i,e,t,s){i?i.unbind():(e.unbind(),this._vertexBufferLayout.disableVertexAttribArrays(this._gl,s),t&&t.unbind())},render:function(e,t){this.inherited(arguments),this._layer.visible&&this.ready&&this._bindPramsReady()&&(this._hasSentReady||(this._layer.emit("fx3d-ready"),this._hasSentReady=!0),this._material.bind(i.mixin({},{ps:this._aroundVerticesTexture,ii:this._aroundVerticesTextureSize,il:this._colourMapTexture,ls:this._vizFieldVerTextures[this._vizFields[this._currentVizPage]],mo:this._vizFieldVerTextureSize,sl:this.renderingInfo.animationInterval,ml:this.renderingInfo.radius,io:this.renderingInfo.transparency,ei:this._vizFieldMinMaxs[this._vizFieldDefault].min>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min?this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min:this._vizFieldMinMaxs[this._vizFieldDefault].min,ss:this._vizFieldMinMaxs[this._vizFieldDefault].max>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max?this._vizFieldMinMaxs[this._vizFieldDefault].max:this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max,es:this._colorBarTexture},e),t),this._material.blend(!0,t),this._bindBuffer(this._tailVAO,this._tailVBO,this._tailIBO,this._material._program),this._gl.drawElements(1,this._tailIBO.getNum(),5125,0),this._unBindBuffer(this._tailVAO,this._tailVBO,this._tailIBO,this._material._program),this._material.blend(!1,t),this._bindBuffer(this._headVAO,this._headVBO,null,this._material._program),this._gl.drawArrays(0,0,this._headVBO.getNum()),this._unBindBuffer(this._headVAO,this._headVBO,null,this._material._program),this._needsRenderPulse||(B=this.time/this.renderingInfo.animationInterval,B-Math.floor(B)>.8&&(this._needsRenderPulse=!0)),this._needsRenderPulse&&(this.renderingInfo.showEndPoints&&(this._material.bindPulse(i.mixin({},{ls:this._vizFieldVerTextures[this._vizFields[this._currentVizPage]],mo:this._vizFieldVerTextureSize,sl:this.renderingInfo.animationInterval,is:[this._scopes.pulseRadius[0]>this._layerView._minDelta?this._layerView._minDelta||10:this._scopes.pulseRadius[0],this.renderingInfo.pulseRadius>this._layerView._minDelta?this._layerView._minDelta||10:this.renderingInfo.pulseRadius],io:this.renderingInfo.transparency,ei:this._vizFieldMinMaxs[this._vizFieldDefault].min>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min?this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min:this._vizFieldMinMaxs[this._vizFieldDefault].min,ss:this._vizFieldMinMaxs[this._vizFieldDefault].max>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max?this._vizFieldMinMaxs[this._vizFieldDefault].max:this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max,es:this._colorBarTexture},e),t),this._material.blend(!0,t),this._bindBuffer(this._pulseVAO,this._pulseVBO,this._pulseIBO,this._material._pulseProgram),this._gl.drawElements(4,this._pulseIBO.getNum(),5125,0),this._unBindBuffer(this._pulseVAO,this._pulseVBO,this._pulseIBO,this._material._pulseProgram)),B=this.time/this.renderingInfo.animationInterval,B-Math.floor(B)>.79&&(this._needsRenderPulse=!1)),this._material.release(t))}});return M});