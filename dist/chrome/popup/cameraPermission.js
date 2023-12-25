/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./popup/cameraPermission.js":
/*!***********************************!*\
  !*** ./popup/cameraPermission.js ***!
  \***********************************/
/***/ (() => {

eval("if (navigator.userAgent.indexOf('Firefox') !== -1) {\n  if (navigator.mediaDevices.getUserMedia) {\n    navigator.mediaDevices.getUserMedia({\n      video: true\n    }).then(() => {\n      alert('You have allowed the firefox camera. Now, try again scan QR code');\n    }).catch(err => {\n      alert(err);\n    });\n  } else {\n    alert('Sorry, your browser does not support getUserMedia');\n  }\n} else if (navigator.userAgent.indexOf('Chrome') !== -1) {\n  if (navigator.getUserMedia) {\n    navigator.getUserMedia({\n      video: true\n    }, () => {\n      alert('You have allowed the chrome camera. Now, try again scan QR code');\n      window.close();\n    }, err => {\n      alert(`The following error occurred when trying to use getUserMedia: ${err}`);\n      window.close();\n    });\n  } else {\n    alert('Sorry, your browser does not support getUserMedia');\n    window.close();\n  }\n}\n\n//# sourceURL=webpack:///./popup/cameraPermission.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./popup/cameraPermission.js"]();
/******/ 	
/******/ })()
;