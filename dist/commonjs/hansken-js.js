(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HanskenClient = void 0;

var _sessionManager = require("./modules/sessionManager.js");

var _projectContext = require("./modules/projectContext.js");

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var HanskenClient = /*#__PURE__*/_createClass(
/**
 * Creates a client to obtain information via the Hansken REST API. SAML session handling is done by this client.
 *
 * @param {String} gatekeeperUrl The url to the Hansken gatekeeper
 * * @param {String} keystoreUrl The url to the Hansken keystore
 */
function HanskenClient(gatekeeperUrl, keystoreUrl) {
  var _this = this;

  _classCallCheck(this, HanskenClient);

  _defineProperty(this, "projects", function () {
    return _this.sessionManager.gatekeeper('/projects').then(function (response) {
      return response.json();
    });
  });

  _defineProperty(this, "singlefiles", function () {
    return _this.sessionManager.gatekeeper('/singlefiles').then(function (response) {
      return response.json();
    });
  });

  _defineProperty(this, "project", function (projectId) {
    return new _projectContext.ProjectContext(_this.sessionManager, projectId, 'projects');
  });

  _defineProperty(this, "singlefile", function (singlefileId) {
    return new _projectContext.ProjectContext(_this.sessionManager, singlefileId, 'singlefiles');
  });

  this.sessionManager = new _sessionManager.SessionManager(gatekeeperUrl, keystoreUrl);
}
/**
 * Get all projects.
 *
 * @returns All projects the current user is authorized for
 */
);

exports.HanskenClient = HanskenClient;
},{"./modules/projectContext.js":3,"./modules/sessionManager.js":6}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyManager = void 0;

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

var _cache = /*#__PURE__*/new WeakMap();

var KeyManager = /*#__PURE__*/_createClass(
/**
 * Create a keystore to retrieve and store keys for encrypted images.
 *
 * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
 */
function KeyManager(sessionManager) {
  var _this = this;

  _classCallCheck(this, KeyManager);

  _classPrivateFieldInitSpec(this, _cache, {
    writable: true,
    value: {}
  });

  _defineProperty(this, "get", function (imageId) {
    if (_classPrivateFieldGet(_this, _cache)[imageId]) {
      // Return key from cache
      return Promise.resolve(_classPrivateFieldGet(_this, _cache)[imageId]);
    }

    return _this.sessionManager.keystore('/session/whoami').then(_this.sessionManager.toJson).then(function (whoami) {
      return _this.sessionManager.keystore("/entries/".concat(imageId, "/").concat(whoami.uid), {
        method: 'GET'
      });
    }, function () {
      // Key not found, reject
      return Promise.reject();
    }).then(function (response) {
      return response.text();
    }).then(function (key) {
      // Store the key in the cache for any future requests
      _classPrivateFieldGet(_this, _cache)[imageId] = key;
      return key;
    });
  });

  _defineProperty(this, "getKeyHeaders", function (imageId) {
    return _this.get(imageId).then(function (key) {
      return {
        'Hansken-Image-Key': key
      };
    }, function () {
      // Key was not available, return an empty headers object
      return {};
    });
  });

  this.sessionManager = sessionManager;
}
/**
 * Retrieve a key.
 *
 * @param {string} imageId The image id for the image key
 * @returns The key or rejected promise
 */
);

exports.KeyManager = KeyManager;
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProjectContext = void 0;

var _projectImageContext = require("./projectImageContext.js");

var _projectSearchContext = require("./projectSearchContext.js");

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ProjectContext = /*#__PURE__*/_createClass(
/**
 * Create a context for a specific project. This can be used to search in a project or list its images.
 *
 * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
 * @param {UUID} id The project id or single file id
 * @param {'projects' | 'singlefiles'} collection 'projects' or 'singlefiles'
 */
function ProjectContext(sessionManager, id, collection) {
  var _this = this;

  _classCallCheck(this, ProjectContext);

  _defineProperty(this, "delete", function () {
    return _this.sessionManager.gatekeeper("/".concat(_this.collection, "/").concat(_this.id), {
      method: 'DELETE'
    });
  });

  _defineProperty(this, "get", function () {
    return _this.sessionManager.gatekeeper("/".concat(_this.collection, "/").concat(_this.id)).then(_this.sessionManager.toJson);
  });

  _defineProperty(this, "update", function (project) {
    return _this.sessionManager.gatekeeper("/".concat(_this.collection, "/").concat(_this.id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(project)
    });
  });

  _defineProperty(this, "images", function () {
    return _this.sessionManager.gatekeeper("/projects/".concat(_this.id, "/images")).then(_this.sessionManager.toJson);
  });

  _defineProperty(this, "image", function (imageId) {
    return new _projectImageContext.ProjectImageContext(_this.sessionManager, _this.id, imageId);
  });

  _defineProperty(this, "search", function () {
    return new _projectSearchContext.ProjectSearchContext(_this.sessionManager, _this.id);
  });

  this.sessionManager = sessionManager;
  this.id = id;
  this.collection = collection;
}
/**
 * Delete the project or singlefile.
 *
 * @returns A promise
 */
);

exports.ProjectContext = ProjectContext;
},{"./projectImageContext.js":4,"./projectSearchContext.js":5}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProjectImageContext = void 0;

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ProjectImageContext = /*#__PURE__*/_createClass(
/**
 * Create a context for a specific project image. This can be used to update or get image metadata.
 *
 * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
 * @param {UUID} projectId The project id
 * @param {UUID} imageId The project image id
 */
function ProjectImageContext(sessionManager, projectId, imageId) {
  var _this = this;

  _classCallCheck(this, ProjectImageContext);

  _defineProperty(this, "get", function () {
    return _this.sessionManager.gatekeeper("/projects/".concat(_this.projectId, "/images/").concat(_this.imageId)).then(_this.sessionManager.toJson);
  });

  _defineProperty(this, "update", function (image) {
    return _this.sessionManager.gatekeeper("/projects/".concat(_this.projectId, "/images/").concat(_this.imageId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(image)
    });
  });

  this.sessionManager = sessionManager;
  this.projectId = projectId;
  this.imageId = imageId;
}
/**
 * Get the project image.
 *
 * @returns The project image
 */
);

exports.ProjectImageContext = ProjectImageContext;
},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProjectSearchContext = void 0;

var _traceUid = require("./traceUid.js");

var _keyManager = require("./keyManager.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classCheckPrivateStaticFieldDescriptor(descriptor, action) { if (descriptor === undefined) { throw new TypeError("attempted to " + action + " private static field before its declaration"); } }

function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

var _streamingTraces = /*#__PURE__*/new WeakMap();

var ProjectSearchContext = /*#__PURE__*/_createClass(
/**
 * Create a search context for a specific project. This can be used to search for traces.
 *
 * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
 * @param {UUID} projectId The project id
 */
function ProjectSearchContext(sessionManager, projectId) {
  var _this = this;

  _classCallCheck(this, ProjectSearchContext);

  _classPrivateFieldInitSpec(this, _streamingTraces, {
    writable: true,
    value: function value() {
      var request = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var callback = arguments.length > 1 ? arguments[1] : undefined;
      var searchRequest = typeof request === 'string' ? {
        query: {
          human: request
        }
      } : request;
      searchRequest.facets = []; // No facets allowed in streaming for now as the regex below doesn't understand them
      // Regex to read all search result fields until the "traces": [] field, where the array will be further processed

      var searchResultRegex = /^(\{("[a-z0-9]+"\:\s?("[a-z0-9]+"|[0-9]+|\[\]),?\s?)*"traces"\:\s?\[)/i;
      return _this.sessionManager.gatekeeper("/projects/".concat(_this.projectId, "/traces/search"), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchRequest)
      }).then(function (response) {
        var reader = response.body.getReader();
        var decoder = new TextDecoder();
        var buffer = '';
        var searchResult;
        return reader.read().then(function processData(_ref) {
          var done = _ref.done,
              value = _ref.value;

          if (done) {
            // The current buffer contains the closing json of the search result.
            // So let's complete this function with the json object without the trace objects
            return Promise.resolve(JSON.parse(searchResult + buffer));
          } // value for fetch streams is an Uint8Array


          buffer += decoder.decode(value); // Note: not every byte is a single character!

          if (!searchResult) {
            // The root element is the trace search result
            var result = buffer.match(searchResultRegex);

            if (!result) {
              return reader.read().then(processData);
            }

            buffer = buffer.substring(result[0].length);
            searchResult = result[0];
          }

          if (buffer.length === 0) {
            return reader.read().then(processData);
          }

          var start = _classStaticPrivateFieldSpecGet(ProjectSearchContext, ProjectSearchContext, _tryObjectParse).call(ProjectSearchContext, buffer, callback);

          buffer = buffer.substring(start);
          return reader.read().then(processData);
        });
      });
    }
  });

  _defineProperty(this, "traces", function () {
    var request = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var callback = arguments.length > 1 ? arguments[1] : undefined;

    if (typeof callback === 'function') {
      return _classPrivateFieldGet(_this, _streamingTraces).call(_this, request, callback);
    }

    var searchRequest = typeof request === 'string' ? {
      query: {
        human: request
      }
    } : request;
    return _this.sessionManager.gatekeeper("/projects/".concat(_this.projectId, "/traces/search"), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchRequest)
    }).then(_this.sessionManager.toJson);
  });

  _defineProperty(this, "data", function (traceUid, dataType) {
    var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var end = arguments.length > 3 ? arguments[3] : undefined;

    var uid = _traceUid.TraceUid.fromString(traceUid);

    return _this.sessionManager.keyManager().getKeyHeaders(uid.imageId).then(function (headers) {
      return _this.sessionManager.gatekeeper("/projects/".concat(_this.projectId, "/traces/").concat(uid.traceUid, "/data?dataType=").concat(dataType), {
        method: 'GET',
        headers: _objectSpread(_objectSpread({}, headers), {}, {
          Range: "bytes=".concat(start, "-").concat(end || '')
        })
      }).then(function (response) {
        return response.arrayBuffer();
      });
    });
  });

  this.sessionManager = sessionManager;
  this.projectId = projectId;
});

exports.ProjectSearchContext = ProjectSearchContext;
var _tryObjectParse = {
  writable: true,
  value: function value(buffer, callback) {
    if (buffer.length <= 1) {
      return 0;
    }

    var start = 0;
    var depth = 1;
    var inEscape = false;
    var inQuote = false;

    for (var i = 1; i < buffer.length; i++) {
      var character = buffer[i];

      if (character === '\\') {
        inEscape = !inEscape;
      } else if (!inEscape) {
        if (character === '"') {
          inQuote = !inQuote;
        } else if (!inQuote) {
          if (character === '{') {
            if (depth === 0) {
              start = i;
            }

            depth++;
          } else if (character === '}') {
            depth--;

            if (depth === 0) {
              callback(JSON.parse(buffer.substring(start, i + 1)));
              start = i + 1;
            }
          }
        }
      } else {
        inEscape = false;
      }
    }

    return start;
  }
};
},{"./keyManager.js":2,"./traceUid.js":7}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SessionManager = void 0;

var _keyManager2 = require("./keyManager.js");

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classStaticPrivateMethodGet(receiver, classConstructor, method) { _classCheckPrivateStaticAccess(receiver, classConstructor); return method; }

function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

var _keyManager = /*#__PURE__*/new WeakMap();

var SessionManager = /*#__PURE__*/_createClass(
/**
 * Creates an object that handles the authentication of SAML services.
 *
 * @param {string} gatekeeperUrl The url to the Hansken gatekeeper
 * @param {string} keystoreUrl The url to the Hansken keystore
 */
function SessionManager(gatekeeperUrl, keystoreUrl) {
  var _this = this;

  _classCallCheck(this, SessionManager);

  _classPrivateFieldInitSpec(this, _keyManager, {
    writable: true,
    value: void 0
  });

  _defineProperty(this, "gatekeeper", function (path, request) {
    return _classStaticPrivateMethodGet(SessionManager, SessionManager, _fetch).call(SessionManager, _this.gatekeeperUrl, path, request);
  });

  _defineProperty(this, "keystore", function (path, request) {
    return _classStaticPrivateMethodGet(SessionManager, SessionManager, _fetch).call(SessionManager, _this.keystoreUrl, path, request);
  });

  _defineProperty(this, "keyManager", function () {
    if (!_classPrivateFieldGet(_this, _keyManager)) {
      _classPrivateFieldSet(_this, _keyManager, new _keyManager2.KeyManager(_this));
    }

    return _classPrivateFieldGet(_this, _keyManager);
  });

  _defineProperty(this, "toJson", function (response) {
    if (response.status < 200 || response.status >= 300 || response.headers.get('Content-Type').indexOf('application/json') !== 0) {
      return Promise.reject(response);
    }

    return response.json();
  });

  this.gatekeeperUrl = gatekeeperUrl.replace(/\/+$/, '');
  this.keystoreUrl = keystoreUrl;
});

exports.SessionManager = SessionManager;

function _login(base, entityID) {
  window.location.href = "".concat(base, "/saml/login?idp=").concat(encodeURIComponent(entityID), "&redirectUrl=").concat(encodeURIComponent(window.location.href));
  return Promise.reject(new Error('Redirecting to login page')); // We won't get here
}

function _fetch(base, path, req) {
  // Defaults for Cross Origin Resource Sharing
  var request = req || {};
  request.credentials = 'include';
  request.mode = 'cors'; // TODO accept Request as argument

  return window.fetch("".concat(base).concat(path), request).then(function (response) {
    var contentType = response.headers.get('Content-Type');

    if (response.status === 401 || response.status === 200 && contentType.indexOf('text/html') === 0) {
      return response.text().then(function (text) {
        if (text.indexOf('SAMLRequest') !== -1) {
          // This is an html form page redirecting you to the default Identity Provider.
          // Let's orchestrate that request ourself
          return window.fetch("".concat(base, "/saml/idps"), {
            credentials: 'include',
            mode: 'cors'
          }).then(function (idps) {
            return idps.json();
          }).then(function (idps) {
            if (idps.length === 1) {
              // Only one Identity Provider available, redirect to login page with redirectUrl
              return _classStaticPrivateMethodGet(SessionManager, SessionManager, _login).call(SessionManager, base, idps[0].entityID);
            } // Ask the user which Identity Provider should be used


            var descriptions = idps.map(function (idp) {
              return idp.description || idp.entityID;
            }).map(function (idp) {
              return "\"".concat(idp, "\"");
            }).join(', ');

            for (var i = 0; i < idps.length; i += 1) {
              var idp = idps[i]; // Disable these eslint rules to make sure we can use confirm().
              // This is an old browser component, but it is very useful for this case as it is UI Framework independent
              // and blocking the thread.
              // eslint-disable-next-line no-alert, no-restricted-globals

              if (confirm("Multiple Identity Providers found: ".concat(descriptions, ". Do you want to login with Identity Provider \"").concat(idp.description ? idp.description : idp.entityID, "\"?"))) {
                return _classStaticPrivateMethodGet(SessionManager, SessionManager, _login).call(SessionManager, base, idp.entityID);
              }
            }

            return Promise.reject(new Error('No Identity Provider chosen, unable to retrieve data'));
          });
        } // TODO recreate request and return?


        return Promise.reject(new Error('Body was of type "text/html" but no SAMLRequest was found in the text'));
      });
    }

    return response;
  });
}
},{"./keyManager.js":2}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TraceUid = void 0;

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TraceUid = /*#__PURE__*/_createClass(
/**
 * Create a TraceUid object from imageId and traceId.
 *
 * @param {string} imageId The imageId of the trace, e.g. '093da8cb-77f8-46df-ac99-ea93aeede0be'
 * @param {string} traceId The traceId of the trace, e.g. '0-1-1-a3f'
 */
function TraceUid(imageId, traceId) {
  _classCallCheck(this, TraceUid);

  this.imageId = imageId;
  this.traceId = traceId;
  this.traceUid = "".concat(this.imageId, ":").concat(this.traceId);
  Object.freeze(this); // Makes properties immutable
}
/**
 * Parse a traceUid string to a TraceUid object.
 *
 * @param {string} traceUid The traceUid of the trace, format 'imageId:traceId', e.g. '093da8cb-77f8-46df-ac99-ea93aeede0be:0-1-1-a3f'
 * @returns A TraceUid object or undefined
 */
);

exports.TraceUid = TraceUid;

_defineProperty(TraceUid, "fromString", function (traceUid) {
  var semicolon = traceUid.indexOf(':');

  if (semicolon != 36 || traceUid.length < 37) {
    return;
  }

  return new TraceUid(traceUid.substring(0, semicolon), traceUid.substring(semicolon + 1));
});
},{}]},{},[1]);
