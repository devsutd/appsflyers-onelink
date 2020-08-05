/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/image/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/blocksdk/blocksdk.js":
/*!*******************************************!*\
  !*** ./node_modules/blocksdk/blocksdk.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*\n * Copyright (c) 2018, salesforce.com, inc.\n * All rights reserved.\n * Licensed under the BSD 3-Clause license.\n * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause\n */\n\nvar SDK = function (config, whitelistOverride, sslOverride) {\n\t// config has been added as the primary parameter\n\t// If it is provided ensure that the other paramaters are correctly assigned\n\t// for backwards compatibility\n\tif (Array.isArray(config)) {\n\t\twhitelistOverride = config;\n\t\tsslOverride = whitelistOverride;\n\t\tconfig = undefined;\n\t}\n\n\tif (config && config.onEditClose) {\n\t\tthis.handlers = {\n\t\t\tonEditClose: config.onEditClose\n\t\t};\n\t\tconfig.onEditClose = true;\n\t}\n\n\tthis._whitelistOverride = whitelistOverride;\n\tthis._sslOverride = sslOverride;\n\tthis._messageId = 1;\n\tthis._messages = {\n\t\t0: function () {}\n\t};\n\tthis._readyToPost = false;\n\tthis._pendingMessages = [];\n\tthis._receiveMessage = this._receiveMessage.bind(this);\n\n\twindow.addEventListener('message', this._receiveMessage, false);\n\n\twindow.parent.postMessage({\n\t\tmethod: 'handShake',\n\t\torigin: window.location.origin,\n\t\tpayload: config\n\t}, '*');\n};\n\nSDK.prototype.execute = function execute (method, options) {\n\toptions = options || {};\n\n\tvar self = this;\n\tvar payload = options.data;\n\tvar callback = options.success;\n\n\tif (!this._readyToPost) {\n\t\tthis._pendingMessages.push({\n\t\t\tmethod: method,\n\t\t\tpayload: payload,\n\t\t\tcallback: callback\n\t\t});\n\t} else {\n\t\tthis._post({\n\t\t\tmethod: method,\n\t\t\tpayload: payload\n\t\t}, callback);\n\t}\n};\n\nSDK.prototype.getCentralData = function (cb) {\n\tthis.execute('getCentralData', {\n\t\tsuccess: cb\n\t});\n};\n\nSDK.prototype.getContent = function (cb) {\n\tthis.execute('getContent', {\n\t\tsuccess: cb\n\t});\n};\n\nSDK.prototype.getData = function (cb) {\n\tthis.execute('getData', {\n\t\tsuccess: cb\n\t});\n};\n\nSDK.prototype.getUserData = function (cb) {\n\tthis.execute('getUserData', {\n\t\tsuccess: cb\n\t});\n};\n\nSDK.prototype.getView = function (cb) {\n\tthis.execute('getView', {\n\t\tsuccess: cb\n\t});\n};\n\nSDK.prototype.setBlockEditorWidth = function (value, cb) {\n\tthis.execute('setBlockEditorWidth', {\n\t\tdata: value,\n\t\tsuccess: cb\n\t});\n};\n\nSDK.prototype.setCentralData = function (dataObj, cb) {\n\tthis.execute('setCentralData', {\n\t\tdata: dataObj,\n\t\tsuccess: cb\n\t});\n};\n\nSDK.prototype.setContent = function (content, cb) {\n\tthis.execute('setContent', {\n\t\tdata: content,\n\t\tsuccess: cb});\n};\n\nSDK.prototype.setData = function (dataObj, cb) {\n\tthis.execute('setData', {\n\t\tdata: dataObj,\n\t\tsuccess: cb\n\t});\n};\n\nSDK.prototype.setSuperContent = function (content, cb) {\n\tthis.execute('setSuperContent', {\n\t\tdata: content,\n\t\tsuccess: cb\n\t});\n};\n\nSDK.prototype.triggerAuth = function (appID) {\n\tthis.getUserData(function (userData) {\n\t\tvar stack = userData.stack;\n\t\tif (stack.indexOf('qa') === 0) {\n\t\t\tstack = stack.substring(3,5) + '.' + stack.substring(0,3);\n\t\t}\n\t\tvar iframe = document.createElement('IFRAME');\n\t\tiframe.src = 'https://mc.' + stack + '.exacttarget.com/cloud/tools/SSO.aspx?appId=' + appID + '&restToken=1&hub=1';\n\t\tiframe.style.width= '1px';\n\t\tiframe.style.height = '1px';\n\t\tiframe.style.position = 'absolute';\n\t\tiframe.style.top = '0';\n\t\tiframe.style.left = '0';\n\t\tiframe.style.visibility = 'hidden';\n\t\tiframe.className = 'authframe';\n\t\tdocument.body.appendChild(iframe);\n\t});\n};\n\nSDK.prototype.triggerAuth2 = function (authInfo) {\n\tvar iframe = document.createElement('IFRAME');\n\tvar scope = '';\n\tvar state = '';\n\tif(Array.isArray(authInfo.scope)) {\n\t\tscope = '&scope=' + authInfo.scope.join('%20');\n\t}\n\tif(authInfo.state) {\n\t\tstate = '&state=' + authInfo.state;\n\t}\n\tiframe.src = authInfo.authURL + (authInfo.authURL.endsWith('/') ? '':'/') + 'v2/authorize?response_type=code&client_id=' + authInfo.clientId + '&redirect_uri=' + encodeURIComponent(authInfo.redirectURL) + scope + state;\n\tiframe.style.width= '1px';\n\tiframe.style.height = '1px';\n\tiframe.style.position = 'absolute';\n\tiframe.style.top = '0';\n\tiframe.style.left = '0';\n\tiframe.style.visibility = 'hidden';\n\tiframe.className = 'authframe';\n\tdocument.body.appendChild(iframe);\n};\n\n/* Internal Methods */\n\nSDK.prototype._executePendingMessages = function _executePendingMessages () {\n\tvar self = this;\n\n\tthis._pendingMessages.forEach(function (thisMessage) {\n\t\tself.execute(thisMessage.method, {\n\t\t\tdata: thisMessage.payload,\n\t\t\tsuccess: thisMessage.callback\n\t\t});\n\t});\n\n\tthis._pendingMessages = [];\n};\n\nSDK.prototype._post = function _post (payload, callback) {\n\tthis._messages[this._messageId] = callback;\n\tpayload.id = this._messageId;\n\tthis._messageId += 1;\n\t// the actual postMessage always uses the validated origin\n\twindow.parent.postMessage(payload, this._parentOrigin);\n};\n\nSDK.prototype._receiveMessage = function _receiveMessage (message) {\n\tmessage = message || {};\n\tvar data = message.data || {};\n\n\tif (data.method === 'handShake') {\n\t\tif (this._validateOrigin(data.origin)) {\n\t\t\tthis._parentOrigin = data.origin;\n\t\t\tthis._readyToPost = true;\n\t\t\tthis._executePendingMessages();\n\t\t\treturn;\n\t\t}\n\t} else if (data.method === 'closeBlock') {\n\t\tif (this._validateOrigin(data.origin)) {\n\t\t\t// here execute the method before closing the  block editing\n\t\t\t//onEditClose();\n\t\t\tif (this.handlers && this.handlers.onEditClose) {\n\t\t\t\tthis.handlers.onEditClose();\n\t\t\t}\n\t\t\tthis.execute('blockReadyToClose');\n\t\t\treturn;\n\t\t}\n\t}\n\n\t// if the message is not from the validated origin it gets ignored\n\tif (!this._parentOrigin || this._parentOrigin !== message.origin) {\n\t\treturn;\n\t}\n\t// when the message has been received, we execute its callback\n\t(this._messages[data.id || 0] || function () {})(data.payload);\n\tdelete this._messages[data.id];\n};\n\n// the custom block should verify it is being called from the marketing cloud\nSDK.prototype._validateOrigin = function _validateOrigin (origin) {\n\t// Make sure to escape periods since these strings are used in a regular expression\n\tvar allowedDomains = this._whitelistOverride || ['exacttarget\\\\.com', 'marketingcloudapps\\\\.com', 'blocktester\\\\.herokuapp\\\\.com'];\n\n\tfor (var i = 0; i < allowedDomains.length; i++) {\n\t\t// Makes the s optional in https\n\t\tvar optionalSsl = this._sslOverride ? '?' : '';\n\t\tvar mcSubdomain = allowedDomains[i] === 'exacttarget\\\\.com' ? 'mc\\\\.' : '';\n\t\tvar whitelistRegex = new RegExp('^https' + optionalSsl + '://' + mcSubdomain + '([a-zA-Z0-9-]+\\\\.)*' + allowedDomains[i] + '(:[0-9]+)?$', 'i');\n\n\t\tif (whitelistRegex.test(origin)) {\n\t\t\treturn true;\n\t\t}\n\t}\n\n\treturn false;\n};\n\nif (typeof(window) === 'object') {\n\twindow.sfdc = window.sfdc || {};\n\twindow.sfdc.BlockSDK = SDK;\n}\nif (true) {\n\tmodule.exports = SDK;\n}\n\n\n//# sourceURL=webpack:///./node_modules/blocksdk/blocksdk.js?");

/***/ }),

/***/ "./src/image/main.js":
/*!***************************!*\
  !*** ./src/image/main.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* eslint-disable no-mixed-operators */\r\n/* eslint-disable no-bitwise */\r\n/* eslint-disable no-undef */\r\n/* eslint-disable no-alert */\r\n/* eslint-disable no-use-before-define */\r\nconst SDK = __webpack_require__(/*! blocksdk */ \"./node_modules/blocksdk/blocksdk.js\");\r\n\r\nconst sdk = new SDK({ blockEditorWidth: 300, tabs: ['htmlblock'] });\r\nconst ContentBlockID = uuidv4();\r\n\r\nfunction componentes() {\r\n this.imagen = function(data) {\r\n  let html = '<table width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">';\r\n  html += '<tr>';\r\n  html += '<td align=\"center\">';\r\n  html += `<a href=\"${data.LinkUrl}\"><img src=\"${data.Url}\" width=\"${data.Width}\" height=\"${data.Height}\" alt=\"${data.AltText}\" style=\"display: block; text-align: center;\"/></a>`;\r\n  html += '</td>';\r\n  html += '</tr>';\r\n  html += '</table>';\r\n  return html;\r\n };\r\n}\r\n\r\n// eslint-disable-next-line no-undef\r\ndocument.getElementById('workspace').addEventListener('input', () => {\r\n console.log('workspace');\r\n\r\n const data = getInputsData();\r\n\r\n sdk.setData(data);\r\n\r\n save(data);\r\n});\r\n\r\nfunction getInputsData() {\r\n let filename = '';\r\n\r\n if ($('#onelinkImage')[0] !== undefined) {\r\n  if ($('#onelinkImage')[0].files[0] !== undefined) {\r\n   filename = $('#onelinkImage')[0].files[0].name;\r\n  }\r\n }\r\n return {\r\n  ContentBlockID,\r\n  filename,\r\n  Url: $('#urlImage').val(),\r\n  LinkID: $('#linkId').val(),\r\n  AltText: $('#imagealt').val(),\r\n  Width: $('#imagewidth').val(),\r\n  Height: $('#imageheight').val(),\r\n  LinkUrl: $('#urlLink').val(),\r\n  LinkName: $('#onelink').val(),\r\n  refresh_token: $('#rt').val(),\r\n };\r\n}\r\n\r\nsdk.getContent((content) => {\r\n sdk.setContent(content);\r\n sdk.setSuperContent(content);\r\n console.log('getContent');\r\n console.log(content);\r\n});\r\n\r\n\r\nsdk.getData(function(data) {\r\n this.ContentBlockID = data.contentBlockID === '' || data.contentBlockID === undefined ? uuidv4() : data.contentBlockID;\r\n $('#urlImage').val(data.url);\r\n $('#onelink').val(data.linkName);\r\n $('#imagealt').val(data.altText);\r\n $('#imagewidth').val(data.width);\r\n $('#imageheight').val(data.height);\r\n $('#urlLink').val(data.linkUrl);\r\n $('#linkId').val(data.linkID);\r\n});\r\n\r\n\r\nfunction save() {\r\n const data = getInputsData();\r\n console.log(data);\r\n // eslint-disable-next-line new-cap\r\n const cmp = new componentes();\r\n const html = cmp.imagen(data);\r\n sdk.setContent(html);\r\n sdk.setSuperContent(html);\r\n $('.spinner').hide();\r\n $('#step1').show();\r\n}\r\n\r\nfunction readURL(input) {\r\n if (input.files && input.files[0]) {\r\n  // eslint-disable-next-line no-undef\r\n  const reader = new FileReader();\r\n\r\n  reader.onload = function(e) {\r\n   $('#urlImage').val(e.target.result);\r\n   save();\r\n  };\r\n  $('#filename').val(input.files[0].name);\r\n  reader.readAsDataURL(input.files[0]);\r\n  save();\r\n }\r\n}\r\n\r\n$('#onelinkImage').on('change', function() {\r\n readURL(this);\r\n});\r\n\r\n$('#urlImage').on('change', () => {\r\n save();\r\n});\r\n\r\n$('#onelink').on('change', () => {\r\n save();\r\n});\r\n\r\n$('#imagealt').on('change', () => {\r\n save();\r\n});\r\n\r\n$('#imagewidth').on('change', () => {\r\n save();\r\n});\r\n\r\n$('#imageheight').on('change', () => {\r\n save();\r\n});\r\n\r\n$('#urlLink').on('change', () => {\r\n save();\r\n});\r\n\r\n$('#linkId').on('change', () => {\r\n save();\r\n});\r\n\r\n$(() => {\r\n $('#previewContent').click(() => {\r\n  $('.spinner').show();\r\n  $('#step1').hide();\r\n  const formData = JSON.stringify({\r\n   name: uuidv4(),\r\n   refresh_token: $('#rt').val(),\r\n   fileBase64: $('#urlImage').val(),\r\n   tssd: $('#tssd').val(),\r\n  });\r\n  // form_data.append('file', file_data);\r\n  // MOSTRAR SPINNER\r\n  $.ajax({\r\n   url: '/sfmc/SaveImage',\r\n   headers: {\r\n    'Content-Type': 'application/json',\r\n   },\r\n   data: formData,\r\n   method: 'POST',\r\n   success(response) {\r\n    $(\"#rt\").val(response.refresh_token);\r\n    if (response.data !== undefined && response.data !== '') {\r\n     const objResponse = JSON.parse(response.data);\r\n\r\n     if (objResponse.fileProperties !== undefined) {\r\n      const imageId = objResponse.id;\r\n      console.log(imageId);\r\n      const { publishedURL } = objResponse.fileProperties;\r\n      $('#urlImage').val(publishedURL);\r\n      checkImageStatus(imageId);\r\n     }\r\n\r\n     if (objResponse.validationErrors !== undefined) {\r\n      // eslint-disable-next-line no-alert\r\n      // eslint-disable-next-line no-undef\r\n      alert(objResponse.validationErrors[0].message);\r\n     }\r\n    }\r\n    console.log(response); // display success response from the server\r\n   },\r\n   error(response) {\r\n    console.log(response); // display error response from the server\r\n   },\r\n  });\r\n\r\n  SaveDataExtensionRow();\r\n });\r\n});\r\n\r\nfunction checkImageStatus(imageId) {\r\n setTimeout(() => {\r\n   $.post('/sfmc/GetImageStatus', { id: imageId, refresh_token: $('#rt').val(), tssd: $('#tssd').val() })\r\n    .done((data) => {\r\n     console.log('data .done', data);\r\n     if (data.refresh_token !== undefined) {\r\n      $('#rt').val(data.refresh_token);\r\n     }\r\n     const imageObj = data.body;\r\n     if (imageObj.items !== undefined) {\r\n      if (imageObj.items[0].status !== undefined) {\r\n       if (imageObj.items[0].status.name !== 'Published') {\r\n        checkImageStatus(imageId);\r\n       } else {\r\n        setTimeout(() => {\r\n         save();\r\n        }, 10000);\r\n       }\r\n      }\r\n     }\r\n    });\r\n  },\r\n  3000);\r\n}\r\n\r\nfunction uuidv4() {\r\n return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {\r\n  const r = Math.random() * 16 | 0;\r\n  const\r\n   v = c === 'x' ? r : (r & 0x3 | 0x8);\r\n  return v.toString(16);\r\n });\r\n}\r\n\r\nfunction SaveDataExtensionRow() {\r\n const data = getInputsData();\r\n\r\n // eslint-disable-next-line no-unused-vars\r\n sdk.getData((_data) => {\r\n  sdk.setData(getInputsData());\r\n });\r\n\r\n const link = {\r\n  LinkID: data.LinkID,\r\n  contentsCount: $('#contentsCount').val(),\r\n  tssd: $('#tssd').val(),\r\n  refresh_token: \"\"\r\n };\r\n data.tssd = $('#tssd').val(),\r\n  $.ajax({\r\n   url: '/sfmc/UpsertImageRow',\r\n   method: 'POST',\r\n   async: false,\r\n   data,\r\n   success(upsertImageRowData) {\r\n    $(\"#rt\").val(upsertImageRowData.refresh_token)\r\n    link.refresh_token = upsertImageRowData.refresh_token;\r\n    $.ajax({\r\n     url: '/sfmc/UpsertLink',\r\n     method: 'POST',\r\n     async: false,\r\n     data: link,\r\n     success(upsertLinkData) {\r\n      $(\"#rt\").val(upsertLinkData.refresh_token)\r\n      console.log(upsertLinkData);\r\n     },\r\n    });\r\n   },\r\n  });\r\n}\n\n//# sourceURL=webpack:///./src/image/main.js?");

/***/ })

/******/ });