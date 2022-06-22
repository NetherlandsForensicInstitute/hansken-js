define('modules/keyManager.js',["exports", "./sessionManager.js"], function (_exports, _sessionManager) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.KeyManager = void 0;

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

      return _this.sessionManager.keystore('/session/whoami').then(_sessionManager.SessionManager.json).then(function (whoami) {
        return _this.sessionManager.keystore("/entries/".concat(imageId, "/").concat(whoami.uid), {
          method: 'GET'
        });
      }).then(function (response) {
        if (response.status !== 200 || response.headers.get('Content-Type') !== 'text/plain') {
          // Key not found or other error, reject
          return Promise.reject();
        }

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

  _exports.KeyManager = KeyManager;
});
define('modules/sessionManager.js',["exports", "./keyManager.js"], function (_exports, _keyManager2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.SessionManager = void 0;

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

    this.gatekeeperUrl = gatekeeperUrl.replace(/\/+$/, '');
    this.keystoreUrl = keystoreUrl.replace(/\/+$/, '');
  });

  _exports.SessionManager = SessionManager;

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

  _defineProperty(SessionManager, "json", function (response) {
    if (response.status < 200 || response.status >= 300 || response.headers.get('Content-Type').indexOf('application/json') !== 0) {
      return Promise.reject(response);
    }

    return response.json();
  });

  _defineProperty(SessionManager, "parseLocationId", function (response) {
    if (response.status === 201) {
      var location = response.headers.get('Location');

      if (location) {
        var id = location.match(/^\/[a-z]+\/([a-z0-9-]+)$/);

        if (id && id.length === 2) {
          return Promise.resolve(id[1]);
        }
      }
    }

    return Promise.reject(response);
  });
});
define('modules/projectImageContext.js',["exports", "./sessionManager.js"], function (_exports, _sessionManager) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.ProjectImageContext = void 0;

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
      return _this.sessionManager.gatekeeper("/projects/".concat(_this.projectId, "/images/").concat(_this.imageId)).then(_sessionManager.SessionManager.json);
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

  _exports.ProjectImageContext = ProjectImageContext;
});
define('modules/projectSearchContext.js',["exports", "./sessionManager.js"], function (_exports, _sessionManager) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.ProjectSearchContext = void 0;

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
   * @param {UUID} collectionId The project id
   */
  function ProjectSearchContext(sessionManager, collectionId) {
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
        return _this.sessionManager.gatekeeper("/projects/".concat(_this.collectionId, "/traces/search"), {
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
      return _this.sessionManager.gatekeeper("/projects/".concat(_this.collectionId, "/traces/search"), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchRequest)
      }).then(_sessionManager.SessionManager.json);
    });

    this.sessionManager = sessionManager;
    this.collectionId = collectionId;
  });

  _exports.ProjectSearchContext = ProjectSearchContext;
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
});
define('modules/traceUid.js',["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.TraceUid = void 0;

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

  _exports.TraceUid = TraceUid;

  _defineProperty(TraceUid, "fromString", function (traceUid) {
    var semicolon = traceUid.indexOf(':');

    if (semicolon != 36 || traceUid.length < 37) {
      return;
    }

    return new TraceUid(traceUid.substring(0, semicolon), traceUid.substring(semicolon + 1));
  });
});
define('modules/traceContext.js',["exports", "./traceUid.js"], function (_exports, _traceUid) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.TraceContext = void 0;

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var TraceContext = /*#__PURE__*/_createClass(
  /**
   * Creates a context for a specific trace.
   *
   * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
   * @param {UUID} collectionId The project id or single file id
   * @param {string | TraceUid} traceUid The traceUid of the trace, format 'imageId:traceId', e.g. '093da8cb-77f8-46df-ac99-ea93aeede0be:0-1-1-a3f'
   */
  function TraceContext(sessionManager, collectionId, traceUid) {
    var _this = this;

    _classCallCheck(this, TraceContext);

    _defineProperty(this, "data", function (dataType) {
      var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var end = arguments.length > 2 ? arguments[2] : undefined;
      return _this.sessionManager.keyManager().getKeyHeaders(_this.traceUid.imageId).then(function (headers) {
        return _this.sessionManager.gatekeeper("/projects/".concat(_this.collectionId, "/traces/").concat(_this.traceUid.traceUid, "/data?dataType=").concat(dataType), {
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
    this.collectionId = collectionId;
    this.traceUid = typeof traceUid === 'string' ? _traceUid.TraceUid.fromString(traceUid) : traceUid;
  }
  /**
   * Get the data from a trace as array buffer.
   *
   * @param {string} dataType The name of the data stream, as described in the trace, e.g. 'raw', 'text', 'ocr'
   * @param {number} start Optional: The start of a subrange, inclusive. See spec https://tools.ietf.org/html/rfc7233#section-2.1
   * @param {number} end Optional: The end of a subrange, inclusive. See spec https://tools.ietf.org/html/rfc7233#section-2.1
   */
  );

  _exports.TraceContext = TraceContext;
});
define('modules/abstractProjectContext.js',["exports", "./projectImageContext.js", "./projectSearchContext.js", "./sessionManager.js", "./traceContext.js"], function (_exports, _projectImageContext, _projectSearchContext, _sessionManager, _traceContext) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.AbstractProjectContext = void 0;

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var AbstractProjectContext = /*#__PURE__*/_createClass(
  /**
   * Create a context for a specific project. This can be used to search in a project or list its images.
   *
   * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
   * @param {'projects' | 'singlefiles'} collection 'projects' or 'singlefiles'
   * @param {UUID} collectionId The project id or single file id
   */
  function AbstractProjectContext(sessionManager, collection, collectionId) {
    var _this = this;

    _classCallCheck(this, AbstractProjectContext);

    _defineProperty(this, "delete", function () {
      return _this.sessionManager.gatekeeper("/".concat(_this.collection, "/").concat(_this.collectionId), {
        method: 'DELETE'
      });
    });

    _defineProperty(this, "get", function () {
      return _this.sessionManager.gatekeeper("/".concat(_this.collection, "/").concat(_this.collectionId)).then(_sessionManager.SessionManager.json);
    });

    _defineProperty(this, "update", function (project) {
      return _this.sessionManager.gatekeeper("/".concat(_this.collection, "/").concat(_this.collectionId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
      });
    });

    _defineProperty(this, "image", function (imageId) {
      return new _projectImageContext.ProjectImageContext(_this.sessionManager, _this.collectionId, imageId);
    });

    _defineProperty(this, "images", function () {
      return _this.sessionManager.gatekeeper("/projects/".concat(_this.collectionId, "/images")).then(_sessionManager.SessionManager.json);
    });

    _defineProperty(this, "search", function () {
      return new _projectSearchContext.ProjectSearchContext(_this.sessionManager, _this.collectionId);
    });

    _defineProperty(this, "trace", function (traceUid) {
      return new _traceContext.TraceContext(_this.sessionManager, _this.collectionId, traceUid);
    });

    this.sessionManager = sessionManager;
    this.collection = collection;
    this.collectionId = collectionId;
  }
  /**
   * Delete the project or singlefile.
   *
   * @returns A promise
   */
  );

  _exports.AbstractProjectContext = AbstractProjectContext;
});
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

define('modules/projectContext.js',["exports", "./abstractProjectContext.js", "./sessionManager.js"], function (_exports, _abstractProjectContext, _sessionManager) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.ProjectContext = void 0;

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var ProjectContext = /*#__PURE__*/function (_AbstractProjectConte) {
    _inherits(ProjectContext, _AbstractProjectConte);

    var _super = _createSuper(ProjectContext);

    /**
     * Create a context for a specific project. This can be used to search in a project or list its images.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {UUID} collectionId The project id or single file id
     */
    function ProjectContext(sessionManager, collectionId) {
      var _this;

      _classCallCheck(this, ProjectContext);

      _this = _super.call(this, sessionManager, 'projects', collectionId);

      _defineProperty(_assertThisInitialized(_this), "createImage", function (image) {
        return _this.sessionManager.gatekeeper('/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(image)
        }).then(_sessionManager.SessionManager.parseLocationId).then(_this.linkImage);
      });

      _defineProperty(_assertThisInitialized(_this), "linkImage", function (imageId) {
        return _this.sessionManager.gatekeeper("/projects/".concat(_this.collectionId, "/images/").concat(imageId), {
          method: 'PUT'
        }).then(function () {
          return _this.image(imageId);
        });
      });

      _defineProperty(_assertThisInitialized(_this), "unlinkImage", function (imageId) {
        return _this.sessionManager.gatekeeper("/projects/".concat(_this.collectionId, "/images/").concat(imageId), {
          method: 'DELETE'
        });
      });

      return _this;
    }
    /**
     * Create an image and link it to the project.
     * This method should not be used with singlefiles.
     *
     * @param {object} image The image as specified in the REST API docs.
     * @returns The image id
     */


    return _createClass(ProjectContext);
  }(_abstractProjectContext.AbstractProjectContext);

  _exports.ProjectContext = ProjectContext;
});
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

define('modules/singefileContext.js',["exports", "./abstractProjectContext.js", "./sessionManager.js"], function (_exports, _abstractProjectContext, _sessionManager) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.SinglefileContext = void 0;

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

  var SinglefileContext = /*#__PURE__*/function (_AbstractProjectConte) {
    _inherits(SinglefileContext, _AbstractProjectConte);

    var _super = _createSuper(SinglefileContext);

    /**
     * Create a context for a singlefile. This can be used to search in it.
     *
     * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
     * @param {UUID} collectionId The project id or single file id
     */
    function SinglefileContext(sessionManager, collectionId) {
      _classCallCheck(this, SinglefileContext);

      return _super.call(this, sessionManager, 'singlefiles', collectionId);
    }

    return _createClass(SinglefileContext);
  }(_abstractProjectContext.AbstractProjectContext);

  _exports.SinglefileContext = SinglefileContext;
});
define('modules/scheduler.js',["exports", "./sessionManager.js"], function (_exports, _sessionManager) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.Scheduler = void 0;

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

  function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

  function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

  function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

  function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

  function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

  function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

  var _pollTaskStatus = /*#__PURE__*/new WeakMap();

  var Scheduler = /*#__PURE__*/_createClass(
  /**
   * Create scheduler to start tasks.
   *
   * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
   */
  function Scheduler(sessionManager) {
    var _this = this;

    _classCallCheck(this, Scheduler);

    _classPrivateFieldInitSpec(this, _pollTaskStatus, {
      writable: true,
      value: void 0
    });

    _defineProperty(this, "openTasks", function () {
      return _this.sessionManager.gatekeeper("/tasks/open").then(_sessionManager.SessionManager.json);
    });

    _defineProperty(this, "closedTasks", function () {
      return _this.sessionManager.gatekeeper("/tasks/closed").then(_sessionManager.SessionManager.json);
    });

    _defineProperty(this, "task", function (taskId) {
      return _this.sessionManager.gatekeeper("/tasks/".concat(taskId)).then(_sessionManager.SessionManager.json);
    });

    _defineProperty(this, "extractProjectImage", function (projectId, imageId, imageKey) {
      var request = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var headers = {
        'Content-Type': 'application/json'
      };

      if (imageKey) {
        headers['Hansken-Image-Key'] = imageKey;
      }

      request.image = imageId;
      return _this.sessionManager.gatekeeper("/projects/".concat(projectId, "/extractions"), {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(request)
      }).then(_sessionManager.SessionManager.parseLocationId);
    });

    _defineProperty(this, "extractSinglefile", function (singleFileId) {
      var request = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return _this.sessionManager.gatekeeper("/singlefiles/".concat(singleFileId, "/extract"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      }).then(_sessionManager.SessionManager.parseLocationId);
    });

    _defineProperty(this, "tools", function () {
      return _this.sessionManager.gatekeeper("/tools").then(_sessionManager.SessionManager.json);
    });

    _defineProperty(this, "toolsBuilder", function () {
      return _this.tools().then(function (tools) {
        var enabledTools = _objectSpread({}, tools);

        return {
          /**
           * Enable a tool to be used in an extraction.
           *
           * @param {string} name The name of the tool
           * @returns this builder
           */
          enable: function enable(name) {
            if (enabledTools[name]) {
              enabledTools[name].defaultEnabled = true;
            }

            return this;
          },

          /**
           * Disable a tool so it will not be used in an extraction.
           *
           * @param {string} name The name of the tool
           * @returns this builder
           */
          disable: function disable(name) {
            if (enabledTools[name]) {
              enabledTools[name].defaultEnabled = false;
            }

            return this;
          },

          /**
           * Build an array of all enabled tool names.
           *
           * @returns An array of all enabled tools names to be used in an extraction request: `{tools: builder.build()}`
           */
          build: function build() {
            return Object.keys(enabledTools).filter(function (tool) {
              return tools[tool].defaultEnabled;
            });
          }
        };
      });
    });

    _defineProperty(this, "waitForCompletion", function (taskId) {
      var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;
      return new Promise(function (resolve) {
        _classPrivateFieldGet(_this, _pollTaskStatus).call(_this, taskId, interval, resolve);
      });
    });

    this.sessionManager = sessionManager;
    var scheduler = this;

    _classPrivateFieldSet(this, _pollTaskStatus, function (taskId, interval, resolve) {
      scheduler.task(taskId).then(function (schedulerTask) {
        if (schedulerTask && schedulerTask.task && schedulerTask.task.endedOn) {
          resolve(schedulerTask);
          return;
        }

        window.setTimeout(_classPrivateFieldGet(scheduler, _pollTaskStatus), interval, taskId, interval, resolve);
      });
    });
  }
  /**
   * Get all open scheduler tasks.
   *
   * @returns An array of scheduler tasks
   */
  );

  _exports.Scheduler = Scheduler;
});
define('modules/traceModelContext.js',["exports", "./sessionManager.js"], function (_exports, _sessionManager) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.TraceModelContext = void 0;

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

  var _traceModel = /*#__PURE__*/new WeakMap();

  var TraceModelContext = /*#__PURE__*/_createClass(
  /**
   * Get the default trace model or a project trace model.
   *
   * @param {SessionManager} sessionManager The session manager, used for connections to the Hansken servers
   * @param {UUID} projectId The projectId to get the traceModel from, or undefined when accessing the default trace model.
   */
  function TraceModelContext(sessionManager, projectId) {
    var _this = this;

    _classCallCheck(this, TraceModelContext);

    _classPrivateFieldInitSpec(this, _traceModel, {
      writable: true,
      value: void 0
    });

    _defineProperty(this, "get", function () {
      if (!_classPrivateFieldGet(_this, _traceModel)) {
        _classPrivateFieldSet(_this, _traceModel, _this.sessionManager.gatekeeper(_this.url).then(_sessionManager.SessionManager.json));
      }

      return _classPrivateFieldGet(_this, _traceModel);
    });

    _defineProperty(this, "property", function (property) {
      return _this.get().then(function (model) {
        /*
        Simplified trace model to understand the code below:
         uid,
        name,
        siblingId,
        origins:
            categories:
                annotated:
                    properties:
                        tags: ?
                        privileged: ?
                extracted:
                    types:
                        data:
                            keys: [raw, text, ...]
                            properties:
                                size: ?
                                hash: {md5: ?}
                        email:
                            misc: {headerField: ?}
                        picture:
                            width: ?
        */
        var split = property.split('\.');

        if (split.length === 1) {
          // For example: uid, name, siblingId (intrinsics)
          if (model.properties[property]) {
            return model.properties[property];
          } // For example: tags, privileged


          for (var _i = 0, _Object$keys = Object.keys(model.origins.categories); _i < _Object$keys.length; _i++) {
            var category = _Object$keys[_i];
            var modelCategory = model.origins.categories[category];

            if (modelCategory.properties && modelCategory.properties[property]) {
              return modelCategory.properties[property];
            }
          }
        } else {
          for (var _i2 = 0, _Object$keys2 = Object.keys(model.origins.categories); _i2 < _Object$keys2.length; _i2++) {
            var _category = _Object$keys2[_i2];
            var _modelCategory = model.origins.categories[_category];

            if (_modelCategory.types && _modelCategory.types[split[0]] && _modelCategory.types[split[0]].properties) {
              var modelType = _modelCategory.types[split[0]];

              if (split.length === 2) {
                // For example: picture.width
                return modelType.properties[split[1]];
              }

              if (modelType.keys && (split.length === 3 || split.length === 4)) {
                // For example: data.raw.size or data.raw.hash.md5
                return modelType.properties[split[2]];
              }

              if (split.length == 3) {
                // For example: email.misc.headerField
                return modelType.properties[split[1]];
              }
            }
          }
        }

        return Promise.reject("Property ".concat(property, " not found in trace model"));
      });
    });

    _defineProperty(this, "type", function (type) {
      return _this.get().then(function (model) {
        for (var _i3 = 0, _Object$keys3 = Object.keys(model.origins.categories); _i3 < _Object$keys3.length; _i3++) {
          var category = _Object$keys3[_i3];
          var modelCategory = model.origins.categories[category];

          if (modelCategory.types && modelCategory.types[type]) {
            return modelCategory.types[type];
          }
        }
      });
    });

    this.sessionManager = sessionManager;
    this.url = projectId ? "/projects/".concat(projectId, "/tracemodel") : "/tracemodel";
  }
  /**
   * Get the trace model.
   *
   * @returns Promise for the trace model
   */
  );

  _exports.TraceModelContext = TraceModelContext;
});
define('hansken-js',["exports", "./modules/projectContext.js", "./modules/singefileContext.js", "./modules/scheduler.js", "./modules/sessionManager.js", "./modules/traceModelContext.js"], function (_exports, _projectContext, _singefileContext, _scheduler2, _sessionManager, _traceModelContext) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.HanskenClient = void 0;

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

  var _scheduler = /*#__PURE__*/new WeakMap();

  var _traceModelContexts = /*#__PURE__*/new WeakMap();

  var HanskenClient = /*#__PURE__*/_createClass( // {projectId, traceModelContext}

  /**
   * Creates a client to obtain information via the Hansken REST API. SAML session handling is done by this client.
   *
   * @param {string} gatekeeperUrl The url to the Hansken gatekeeper
   * @param {string} keystoreUrl The url to the Hansken keystore
   */
  function HanskenClient(gatekeeperUrl, keystoreUrl) {
    var _this = this;

    _classCallCheck(this, HanskenClient);

    _classPrivateFieldInitSpec(this, _scheduler, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _traceModelContexts, {
      writable: true,
      value: {}
    });

    _defineProperty(this, "createProject", function (project) {
      return _this.sessionManager.gatekeeper("/projects", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
      }).then(_sessionManager.SessionManager.parseLocationId).then(_this.project);
    });

    _defineProperty(this, "project", function (projectId) {
      return new _projectContext.ProjectContext(_this.sessionManager, projectId);
    });

    _defineProperty(this, "projects", function () {
      return _this.sessionManager.gatekeeper("/projects").then(function (response) {
        return response.json();
      });
    });

    _defineProperty(this, "createSinglefile", function (name, data) {
      return _this.sessionManager.gatekeeper("/singlefiles/upload/".concat(name), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: data
      }).then(_sessionManager.SessionManager.parseLocationId);
    });

    _defineProperty(this, "singlefile", function (singlefileId) {
      return new _singefileContext.SinglefileContext(_this.sessionManager, singlefileId);
    });

    _defineProperty(this, "singlefiles", function () {
      return _this.sessionManager.gatekeeper("/singlefiles").then(function (response) {
        return response.json();
      });
    });

    _defineProperty(this, "scheduler", function () {
      if (!_classPrivateFieldGet(_this, _scheduler)) {
        _classPrivateFieldSet(_this, _scheduler, new _scheduler2.Scheduler(_this.sessionManager));
      }

      return _classPrivateFieldGet(_this, _scheduler);
    });

    _defineProperty(this, "traceModel", function (projectId) {
      // Uses 'undefined' as string for the default model
      if (!_classPrivateFieldGet(_this, _traceModelContexts)["".concat(projectId)]) {
        _classPrivateFieldGet(_this, _traceModelContexts)["".concat(projectId)] = new _traceModelContext.TraceModelContext(_this.sessionManager, projectId);
      }

      return _classPrivateFieldGet(_this, _traceModelContexts)["".concat(projectId)];
    });

    this.sessionManager = new _sessionManager.SessionManager(gatekeeperUrl, keystoreUrl);
  }
  /**
   * Create a new project.
   *
   * @param {object} project The project as specified in the REST API docs.
   * @returns A ProjectContext for the new project
   */
  );

  _exports.HanskenClient = HanskenClient;
});
