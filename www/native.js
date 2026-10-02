(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // <define:RANGER_CONFIG>
  var define_RANGER_CONFIG_default;
  var init_define_RANGER_CONFIG = __esm({
    "<define:RANGER_CONFIG>"() {
      define_RANGER_CONFIG_default = { apiBase: "" };
    }
  });

  // node_modules/@capacitor/core/dist/index.js
  var ExceptionCode, CapacitorException, getPlatformId, createCapacitor, initCapacitorGlobal, Capacitor, registerPlugin, WebPlugin, encode, decode, CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64, normalizeHttpHeaders, buildUrlParams, buildRequestInit, CapacitorHttpPluginWeb, CapacitorHttp, SystemBarsStyle, SystemBarType, SystemBarsPluginWeb, SystemBars;
  var init_dist = __esm({
    "node_modules/@capacitor/core/dist/index.js"() {
      init_define_RANGER_CONFIG();
      (function(ExceptionCode2) {
        ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
        ExceptionCode2["Unavailable"] = "UNAVAILABLE";
      })(ExceptionCode || (ExceptionCode = {}));
      CapacitorException = class extends Error {
        constructor(message, code, data) {
          super(message);
          this.message = message;
          this.code = code;
          this.data = data;
        }
      };
      getPlatformId = (win) => {
        var _a, _b;
        if (win === null || win === void 0 ? void 0 : win.androidBridge) {
          return "android";
        } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
          return "ios";
        } else {
          return "web";
        }
      };
      createCapacitor = (win) => {
        const capCustomPlatform = win.CapacitorCustomPlatform || null;
        const cap = win.Capacitor || {};
        const Plugins = cap.Plugins = cap.Plugins || {};
        const getPlatform = () => {
          return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
        };
        const isNativePlatform = () => getPlatform() !== "web";
        const isPluginAvailable = (pluginName) => {
          const plugin = registeredPlugins.get(pluginName);
          if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            return true;
          }
          if (getPluginHeader(pluginName)) {
            return true;
          }
          return false;
        };
        const getPluginHeader = (pluginName) => {
          var _a;
          return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find((h) => h.name === pluginName);
        };
        const handleError = (err) => win.console.error(err);
        const registeredPlugins = /* @__PURE__ */ new Map();
        const registerPlugin2 = (pluginName, jsImplementations = {}) => {
          const registeredPlugin = registeredPlugins.get(pluginName);
          if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
          }
          const platform = getPlatform();
          const pluginHeader = getPluginHeader(pluginName);
          let jsImplementation;
          const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
              jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
            } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
              jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
            }
            return jsImplementation;
          };
          const createPluginMethod = (impl, prop) => {
            var _a, _b;
            if (pluginHeader) {
              const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
              if (methodHeader) {
                if (methodHeader.rtype === "promise") {
                  return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                } else {
                  return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                }
              } else if (impl) {
                return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
              }
            } else if (impl) {
              return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
            } else {
              throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
            }
          };
          const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
              const p = loadPluginImplementation().then((impl) => {
                const fn = createPluginMethod(impl, prop);
                if (fn) {
                  const p2 = fn(...args);
                  remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
                  return p2;
                } else {
                  throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                }
              });
              if (prop === "addListener") {
                p.remove = async () => remove();
              }
              return p;
            };
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, "name", {
              value: prop,
              writable: false,
              configurable: false
            });
            return wrapper;
          };
          const addListener = createPluginMethodWrapper("addListener");
          const removeListener = createPluginMethodWrapper("removeListener");
          const addListenerNative = (eventName, callback) => {
            const call = addListener({ eventName }, callback);
            const remove = async () => {
              const callbackId = await call;
              removeListener({
                eventName,
                callbackId
              }, callback);
            };
            const p = new Promise((resolve) => call.then(() => resolve({ remove })));
            p.remove = async () => {
              console.warn(`Using addListener() without 'await' is deprecated.`);
              await remove();
            };
            return p;
          };
          const proxy = new Proxy({}, {
            get(_, prop) {
              switch (prop) {
                // https://github.com/facebook/react/issues/20030
                case "$$typeof":
                  return void 0;
                case "toJSON":
                  return () => ({});
                case "addListener":
                  return pluginHeader ? addListenerNative : addListener;
                case "removeListener":
                  return removeListener;
                default:
                  return createPluginMethodWrapper(prop);
              }
            }
          });
          Plugins[pluginName] = proxy;
          registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: /* @__PURE__ */ new Set([...Object.keys(jsImplementations), ...pluginHeader ? [platform] : []])
          });
          return proxy;
        };
        if (!cap.convertFileSrc) {
          cap.convertFileSrc = (filePath) => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.registerPlugin = registerPlugin2;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        return cap;
      };
      initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
      Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      registerPlugin = Capacitor.registerPlugin;
      WebPlugin = class {
        constructor() {
          this.listeners = {};
          this.retainedEventArguments = {};
          this.windowListeners = {};
        }
        addListener(eventName, listenerFunc) {
          let firstListener = false;
          const listeners = this.listeners[eventName];
          if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
          }
          this.listeners[eventName].push(listenerFunc);
          const windowListener = this.windowListeners[eventName];
          if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
          }
          if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
          }
          const remove = async () => this.removeListener(eventName, listenerFunc);
          const p = Promise.resolve({ remove });
          return p;
        }
        async removeAllListeners() {
          this.listeners = {};
          for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
          }
          this.windowListeners = {};
        }
        notifyListeners(eventName, data, retainUntilConsumed) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            if (retainUntilConsumed) {
              let args = this.retainedEventArguments[eventName];
              if (!args) {
                args = [];
              }
              args.push(data);
              this.retainedEventArguments[eventName] = args;
            }
            return;
          }
          listeners.forEach((listener) => listener(data));
        }
        hasListeners(eventName) {
          var _a;
          return !!((_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.length);
        }
        registerWindowListener(windowEventName, pluginEventName) {
          this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: (event) => {
              this.notifyListeners(pluginEventName, event);
            }
          };
        }
        unimplemented(msg = "not implemented") {
          return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
        }
        unavailable(msg = "not available") {
          return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            return;
          }
          const index = listeners.indexOf(listenerFunc);
          if (index !== -1) {
            this.listeners[eventName].splice(index, 1);
          }
          if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
          }
        }
        addWindowListener(handle) {
          window.addEventListener(handle.windowEventName, handle.handler);
          handle.registered = true;
        }
        removeWindowListener(handle) {
          if (!handle) {
            return;
          }
          window.removeEventListener(handle.windowEventName, handle.handler);
          handle.registered = false;
        }
        sendRetainedArgumentsForEvent(eventName) {
          const args = this.retainedEventArguments[eventName];
          if (!args) {
            return;
          }
          delete this.retainedEventArguments[eventName];
          args.forEach((arg) => {
            this.notifyListeners(eventName, arg);
          });
        }
      };
      encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
      CapacitorCookiesPluginWeb = class extends WebPlugin {
        async getCookies() {
          const cookies = document.cookie;
          const cookieMap = {};
          cookies.split(";").forEach((cookie) => {
            if (cookie.length <= 0)
              return;
            let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
          });
          return cookieMap;
        }
        async setCookie(options) {
          try {
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            const expires = options.expires ? `; expires=${options.expires.replace("expires=", "")}` : "";
            const path = (options.path || "/").replace("path=", "");
            const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
            document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async deleteCookie(options) {
          try {
            document.cookie = `${options.key}=; Max-Age=0`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearCookies() {
          try {
            const cookies = document.cookie.split(";") || [];
            for (const cookie of cookies) {
              document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
            }
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearAllCookies() {
          try {
            await this.clearCookies();
          } catch (error) {
            return Promise.reject(error);
          }
        }
      };
      CapacitorCookies = registerPlugin("CapacitorCookies", {
        web: () => new CapacitorCookiesPluginWeb()
      });
      readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
      normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
          acc[key] = headers[originalKeys[index]];
          return acc;
        }, {});
        return normalized;
      };
      buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
          return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
          const [key, value] = entry;
          let encodedValue;
          let item;
          if (Array.isArray(value)) {
            item = "";
            value.forEach((str) => {
              encodedValue = shouldEncode ? encodeURIComponent(str) : str;
              item += `${key}=${encodedValue}&`;
            });
            item.slice(0, -1);
          } else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
          }
          return `${accumulator}&${item}`;
        }, "");
        return output.substr(1);
      };
      buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers["content-type"] || "";
        if (typeof options.data === "string") {
          output.body = options.data;
        } else if (type.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
          }
          output.body = params.toString();
        } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
          const form = new FormData();
          if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
              form.append(key, value);
            });
          } else {
            for (const key of Object.keys(options.data)) {
              form.append(key, options.data[key]);
            }
          }
          output.body = form;
          const headers2 = new Headers(output.headers);
          headers2.delete("content-type");
          output.headers = headers2;
        } else if (type.includes("application/json") || typeof options.data === "object") {
          output.body = JSON.stringify(options.data);
        }
        return output;
      };
      CapacitorHttpPluginWeb = class extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
          const requestInit = buildRequestInit(options, options.webFetchExtra);
          const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
          const url = urlParams ? `${options.url}?${urlParams}` : options.url;
          const response = await fetch(url, requestInit);
          const contentType = response.headers.get("content-type") || "";
          let { responseType = "text" } = response.ok ? options : {};
          if (contentType.includes("application/json")) {
            responseType = "json";
          }
          let data;
          let blob;
          switch (responseType) {
            case "arraybuffer":
            case "blob":
              blob = await response.blob();
              data = await readBlobAsBase64(blob);
              break;
            case "json":
              data = await response.json();
              break;
            case "document":
            case "text":
            default:
              data = await response.text();
          }
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return {
            data,
            headers,
            status: response.status,
            url: response.url
          };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
        }
      };
      CapacitorHttp = registerPlugin("CapacitorHttp", {
        web: () => new CapacitorHttpPluginWeb()
      });
      (function(SystemBarsStyle2) {
        SystemBarsStyle2["Dark"] = "DARK";
        SystemBarsStyle2["Light"] = "LIGHT";
        SystemBarsStyle2["Default"] = "DEFAULT";
      })(SystemBarsStyle || (SystemBarsStyle = {}));
      (function(SystemBarType2) {
        SystemBarType2["StatusBar"] = "StatusBar";
        SystemBarType2["NavigationBar"] = "NavigationBar";
      })(SystemBarType || (SystemBarType = {}));
      SystemBarsPluginWeb = class extends WebPlugin {
        async setStyle() {
          this.unavailable("not available for web");
        }
        async setAnimation() {
          this.unavailable("not available for web");
        }
        async show() {
          this.unavailable("not available for web");
        }
        async hide() {
          this.unavailable("not available for web");
        }
      };
      SystemBars = registerPlugin("SystemBars", {
        web: () => new SystemBarsPluginWeb()
      });
    }
  });

  // node_modules/@capacitor/preferences/dist/esm/web.js
  var web_exports = {};
  __export(web_exports, {
    PreferencesWeb: () => PreferencesWeb
  });
  var PreferencesWeb;
  var init_web = __esm({
    "node_modules/@capacitor/preferences/dist/esm/web.js"() {
      init_define_RANGER_CONFIG();
      init_dist();
      PreferencesWeb = class extends WebPlugin {
        constructor() {
          super(...arguments);
          this.group = "CapacitorStorage";
        }
        async configure({ group }) {
          if (typeof group === "string") {
            this.group = group;
          }
        }
        async get(options) {
          const value = this.impl.getItem(this.applyPrefix(options.key));
          return { value };
        }
        async set(options) {
          this.impl.setItem(this.applyPrefix(options.key), options.value);
        }
        async remove(options) {
          this.impl.removeItem(this.applyPrefix(options.key));
        }
        async keys() {
          const keys = this.rawKeys().map((k) => k.substring(this.prefix.length));
          return { keys };
        }
        async clear() {
          for (const key of this.rawKeys()) {
            this.impl.removeItem(key);
          }
        }
        async migrate() {
          var _a;
          const migrated = [];
          const existing = [];
          const oldprefix = "_cap_";
          const keys = Object.keys(this.impl).filter((k) => k.indexOf(oldprefix) === 0);
          for (const oldkey of keys) {
            const key = oldkey.substring(oldprefix.length);
            const value = (_a = this.impl.getItem(oldkey)) !== null && _a !== void 0 ? _a : "";
            const { value: currentValue } = await this.get({ key });
            if (typeof currentValue === "string") {
              existing.push(key);
            } else {
              await this.set({ key, value });
              migrated.push(key);
            }
          }
          return { migrated, existing };
        }
        async removeOld() {
          const oldprefix = "_cap_";
          const keys = Object.keys(this.impl).filter((k) => k.indexOf(oldprefix) === 0);
          for (const oldkey of keys) {
            this.impl.removeItem(oldkey);
          }
        }
        get impl() {
          return window.localStorage;
        }
        get prefix() {
          return this.group === "NativeStorage" ? "" : `${this.group}.`;
        }
        rawKeys() {
          return Object.keys(this.impl).filter((k) => k.indexOf(this.prefix) === 0);
        }
        applyPrefix(key) {
          return this.prefix + key;
        }
      };
    }
  });

  // node_modules/@capacitor/haptics/dist/esm/definitions.js
  var ImpactStyle, NotificationType;
  var init_definitions = __esm({
    "node_modules/@capacitor/haptics/dist/esm/definitions.js"() {
      init_define_RANGER_CONFIG();
      (function(ImpactStyle2) {
        ImpactStyle2["Heavy"] = "HEAVY";
        ImpactStyle2["Medium"] = "MEDIUM";
        ImpactStyle2["Light"] = "LIGHT";
      })(ImpactStyle || (ImpactStyle = {}));
      (function(NotificationType2) {
        NotificationType2["Success"] = "SUCCESS";
        NotificationType2["Warning"] = "WARNING";
        NotificationType2["Error"] = "ERROR";
      })(NotificationType || (NotificationType = {}));
    }
  });

  // node_modules/@capacitor/haptics/dist/esm/web.js
  var web_exports2 = {};
  __export(web_exports2, {
    HapticsWeb: () => HapticsWeb
  });
  var HapticsWeb;
  var init_web2 = __esm({
    "node_modules/@capacitor/haptics/dist/esm/web.js"() {
      init_define_RANGER_CONFIG();
      init_dist();
      init_definitions();
      HapticsWeb = class extends WebPlugin {
        constructor() {
          super(...arguments);
          this.selectionStarted = false;
        }
        async impact(options) {
          const pattern = this.patternForImpact(options === null || options === void 0 ? void 0 : options.style);
          this.vibrateWithPattern(pattern);
        }
        async notification(options) {
          const pattern = this.patternForNotification(options === null || options === void 0 ? void 0 : options.type);
          this.vibrateWithPattern(pattern);
        }
        async vibrate(options) {
          const duration = (options === null || options === void 0 ? void 0 : options.duration) || 300;
          this.vibrateWithPattern([duration]);
        }
        async selectionStart() {
          this.selectionStarted = true;
        }
        async selectionChanged() {
          if (this.selectionStarted) {
            this.vibrateWithPattern([70]);
          }
        }
        async selectionEnd() {
          this.selectionStarted = false;
        }
        patternForImpact(style = ImpactStyle.Heavy) {
          if (style === ImpactStyle.Medium) {
            return [43];
          } else if (style === ImpactStyle.Light) {
            return [20];
          }
          return [61];
        }
        patternForNotification(type = NotificationType.Success) {
          if (type === NotificationType.Warning) {
            return [30, 40, 30, 50, 60];
          } else if (type === NotificationType.Error) {
            return [27, 45, 50];
          }
          return [35, 65, 21];
        }
        vibrateWithPattern(pattern) {
          if (navigator.vibrate) {
            navigator.vibrate(pattern);
          } else {
            throw this.unavailable("Browser does not support the vibrate API");
          }
        }
      };
    }
  });

  // node_modules/@capacitor/share/dist/esm/web.js
  var web_exports3 = {};
  __export(web_exports3, {
    ShareWeb: () => ShareWeb
  });
  var ShareWeb;
  var init_web3 = __esm({
    "node_modules/@capacitor/share/dist/esm/web.js"() {
      init_define_RANGER_CONFIG();
      init_dist();
      ShareWeb = class extends WebPlugin {
        async canShare() {
          if (typeof navigator === "undefined" || !navigator.share) {
            return { value: false };
          } else {
            return { value: true };
          }
        }
        async share(options) {
          if (typeof navigator === "undefined" || !navigator.share) {
            throw this.unavailable("Share API not available in this browser");
          }
          await navigator.share({
            title: options.title,
            text: options.text,
            url: options.url
          });
          return {};
        }
      };
    }
  });

  // node_modules/@capacitor-community/speech-recognition/dist/esm/web.js
  var web_exports4 = {};
  __export(web_exports4, {
    SpeechRecognition: () => SpeechRecognition,
    SpeechRecognitionWeb: () => SpeechRecognitionWeb
  });
  var SpeechRecognitionWeb, SpeechRecognition;
  var init_web4 = __esm({
    "node_modules/@capacitor-community/speech-recognition/dist/esm/web.js"() {
      init_define_RANGER_CONFIG();
      init_dist();
      SpeechRecognitionWeb = class extends WebPlugin {
        available() {
          throw this.unimplemented("Method not implemented on web.");
        }
        start(_options) {
          throw this.unimplemented("Method not implemented on web.");
        }
        stop() {
          throw this.unimplemented("Method not implemented on web.");
        }
        getSupportedLanguages() {
          throw this.unimplemented("Method not implemented on web.");
        }
        hasPermission() {
          throw this.unimplemented("Method not implemented on web.");
        }
        isListening() {
          throw this.unimplemented("Method not implemented on web.");
        }
        requestPermission() {
          throw this.unimplemented("Method not implemented on web.");
        }
        checkPermissions() {
          throw this.unimplemented("Method not implemented on web.");
        }
        requestPermissions() {
          throw this.unimplemented("Method not implemented on web.");
        }
      };
      SpeechRecognition = new SpeechRecognitionWeb();
    }
  });

  // node_modules/@capacitor-community/text-to-speech/dist/esm/web.js
  var web_exports5 = {};
  __export(web_exports5, {
    TextToSpeechWeb: () => TextToSpeechWeb
  });
  var TextToSpeechWeb;
  var init_web5 = __esm({
    "node_modules/@capacitor-community/text-to-speech/dist/esm/web.js"() {
      init_define_RANGER_CONFIG();
      init_dist();
      TextToSpeechWeb = class extends WebPlugin {
        constructor() {
          super();
          this.speechSynthesis = null;
          if ("speechSynthesis" in window) {
            this.speechSynthesis = window.speechSynthesis;
            window.addEventListener("beforeunload", () => {
              this.stop();
            });
          }
        }
        async speak(options) {
          if (!this.speechSynthesis) {
            this.throwUnsupportedError();
          }
          await this.stop();
          const speechSynthesis2 = this.speechSynthesis;
          const utterance = this.createSpeechSynthesisUtterance(options);
          return new Promise((resolve, reject) => {
            utterance.onend = () => {
              resolve();
            };
            utterance.onerror = (event) => {
              reject(event);
            };
            speechSynthesis2.speak(utterance);
          });
        }
        async stop() {
          if (!this.speechSynthesis) {
            this.throwUnsupportedError();
          }
          this.speechSynthesis.cancel();
        }
        async getSupportedLanguages() {
          const voices = this.getSpeechSynthesisVoices();
          const languages = voices.map((voice) => voice.lang);
          const filteredLanguages = languages.filter((v, i, a) => a.indexOf(v) == i);
          return { languages: filteredLanguages };
        }
        async getSupportedVoices() {
          const voices = this.getSpeechSynthesisVoices();
          return { voices };
        }
        async isLanguageSupported(options) {
          const result = await this.getSupportedLanguages();
          const isLanguageSupported = result.languages.includes(options.lang);
          return { supported: isLanguageSupported };
        }
        async openInstall() {
          this.throwUnimplementedError();
        }
        createSpeechSynthesisUtterance(options) {
          const voices = this.getSpeechSynthesisVoices();
          const utterance = new SpeechSynthesisUtterance();
          const { text, lang, rate, pitch, volume, voice } = options;
          if (voice !== void 0) {
            utterance.voice = voices[voice];
          }
          if (volume !== void 0) {
            utterance.volume = volume >= 0 && volume <= 1 ? volume : 1;
          }
          if (rate !== void 0) {
            utterance.rate = rate >= 0.1 && rate <= 10 ? rate : 1;
          }
          if (pitch !== void 0) {
            utterance.pitch = pitch >= 0 && pitch <= 2 ? pitch : 2;
          }
          if (lang) {
            utterance.lang = lang;
          }
          utterance.text = text;
          return utterance;
        }
        getSpeechSynthesisVoices() {
          if (!this.speechSynthesis) {
            this.throwUnsupportedError();
          }
          if (!this.supportedVoices || this.supportedVoices.length < 1) {
            this.supportedVoices = this.speechSynthesis.getVoices();
          }
          return this.supportedVoices;
        }
        throwUnsupportedError() {
          throw this.unavailable("SpeechSynthesis API not available in this browser.");
        }
        throwUnimplementedError() {
          throw this.unimplemented("Not implemented on web.");
        }
      };
    }
  });

  // src/native.js
  init_define_RANGER_CONFIG();
  init_dist();

  // node_modules/@capacitor/preferences/dist/esm/index.js
  init_define_RANGER_CONFIG();
  init_dist();

  // node_modules/@capacitor/preferences/dist/esm/definitions.js
  init_define_RANGER_CONFIG();

  // node_modules/@capacitor/preferences/dist/esm/index.js
  var Preferences = registerPlugin("Preferences", {
    web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.PreferencesWeb())
  });

  // node_modules/@capacitor/haptics/dist/esm/index.js
  init_define_RANGER_CONFIG();
  init_dist();
  init_definitions();
  var Haptics = registerPlugin("Haptics", {
    web: () => Promise.resolve().then(() => (init_web2(), web_exports2)).then((m) => new m.HapticsWeb())
  });

  // node_modules/@capacitor/share/dist/esm/index.js
  init_define_RANGER_CONFIG();
  init_dist();

  // node_modules/@capacitor/share/dist/esm/definitions.js
  init_define_RANGER_CONFIG();

  // node_modules/@capacitor/share/dist/esm/index.js
  var Share = registerPlugin("Share", {
    web: () => Promise.resolve().then(() => (init_web3(), web_exports3)).then((m) => new m.ShareWeb())
  });

  // node_modules/@capacitor-community/speech-recognition/dist/esm/index.js
  init_define_RANGER_CONFIG();
  init_dist();

  // node_modules/@capacitor-community/speech-recognition/dist/esm/definitions.js
  init_define_RANGER_CONFIG();

  // node_modules/@capacitor-community/speech-recognition/dist/esm/index.js
  var SpeechRecognition2 = registerPlugin("SpeechRecognition", {
    web: () => Promise.resolve().then(() => (init_web4(), web_exports4)).then((m) => new m.SpeechRecognitionWeb())
  });

  // node_modules/@capacitor-community/text-to-speech/dist/esm/index.js
  init_define_RANGER_CONFIG();
  init_dist();

  // node_modules/@capacitor-community/text-to-speech/dist/esm/definitions.js
  init_define_RANGER_CONFIG();
  var QueueStrategy;
  (function(QueueStrategy2) {
    QueueStrategy2[QueueStrategy2["Flush"] = 0] = "Flush";
    QueueStrategy2[QueueStrategy2["Add"] = 1] = "Add";
  })(QueueStrategy || (QueueStrategy = {}));

  // node_modules/@capacitor-community/text-to-speech/dist/esm/index.js
  var TextToSpeech = registerPlugin("TextToSpeech", {
    web: () => Promise.resolve().then(() => (init_web5(), web_exports5)).then((m) => new m.TextToSpeechWeb())
  });
  if ("speechSynthesis" in window) {
    window.speechSynthesis;
  }

  // src/native.js
  window.RANGER_CONFIG = define_RANGER_CONFIG_default;
  var saveQueue = Promise.resolve();
  window.RangerNative = {
    isNative: Capacitor.isNativePlatform(),
    save(key, value) {
      saveQueue = saveQueue.then(() => Preferences.set({ key, value })).catch(() => window.dispatchEvent(new Event("ranger-save-error")));
      return saveQueue;
    },
    remove(key) {
      saveQueue = saveQueue.then(() => Preferences.remove({ key })).catch(() => {
      });
      return saveQueue;
    },
    async hydrate() {
      if (!Capacitor.isNativePlatform()) return;
      for (const key of ["celestialRangerSave", "rangerNotes"]) {
        const { value } = await Preferences.get({ key });
        if (value) localStorage.setItem(key, value);
      }
    },
    celebrate() {
      Haptics.notification({ type: NotificationType.Success }).catch(() => {
      });
    },
    async share(data) {
      if (Capacitor.isNativePlatform()) return Share.share(data);
      if (navigator.share) return navigator.share(data);
      const blob = new Blob([data.title + "\n\n" + data.text], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "Celestial-Ranger-Certificate.txt";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1e3);
    },
    speak(text, who) {
      if (!("speechSynthesis" in window)) return;
      this.stopSpeaking();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = who === "fernan" ? 1.04 : 0.9;
      u.pitch = who === "fernan" ? 1.15 : 0.92;
      speechSynthesis.speak(u);
    },
    stopSpeaking() {
      window.speechSynthesis?.cancel();
    }
  };
  window.rangerReady = window.RangerNative.hydrate().catch(() => {
  });
  var speechListeners = [];
  var speechTimeout;
  var browserRecognition;
  var stopping = false;
  var webSpeak = window.RangerNative.speak.bind(window.RangerNative);
  window.RangerNative.speak = async (text, who) => {
    if (!Capacitor.isNativePlatform()) return webSpeak(text, who);
    try {
      await TextToSpeech.stop();
      await TextToSpeech.speak({ text, lang: "en-US", rate: who === "fernan" ? 1.04 : 0.9, pitch: who === "fernan" ? 1.15 : 0.92, volume: 1, category: "playback" });
    } catch {
      window.dispatchEvent(new CustomEvent("ranger-voice-error"));
    }
  };
  window.RangerNative.stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    if (Capacitor.isNativePlatform()) TextToSpeech.stop().catch(() => {
    });
  };
  window.RangerNative.stopListening = async () => {
    if (stopping) return;
    stopping = true;
    try {
      clearTimeout(speechTimeout);
      const old = speechListeners;
      speechListeners = [];
      for (const listener of old) await listener.remove();
      browserRecognition?.abort();
      browserRecognition = null;
      if (Capacitor.isNativePlatform()) await SpeechRecognition2.stop().catch(() => {
      });
    } finally {
      stopping = false;
    }
  };
  window.RangerNative.listen = async (onText, onStop) => {
    window.RangerNative.stopSpeaking();
    if (Capacitor.isNativePlatform()) {
      if (!(await SpeechRecognition2.available()).available) throw Error("Speech unavailable");
      const permission = await SpeechRecognition2.requestPermissions();
      if (permission.speechRecognition !== "granted") throw Error("Speech permission denied");
      speechListeners.push(await SpeechRecognition2.addListener("partialResults", (r) => {
        if (r.matches?.[0]) onText(r.matches[0]);
      }));
      speechListeners.push(await SpeechRecognition2.addListener("listeningState", (r) => {
        if (r.status === "stopped") {
          window.RangerNative.stopListening().then(onStop);
        }
      }));
      await SpeechRecognition2.start({ language: "en-US", partialResults: true, popup: false, maxResults: 1 });
    } else {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) throw Error("Unsupported");
      browserRecognition = new Recognition();
      browserRecognition.lang = "en-US";
      browserRecognition.interimResults = true;
      browserRecognition.onresult = (e) => onText(Array.from(e.results).map((r) => r[0].transcript).join(" "));
      browserRecognition.onend = onStop;
      browserRecognition.onerror = onStop;
      browserRecognition.start();
    }
    speechTimeout = setTimeout(() => window.RangerNative.stopListening().then(onStop), 2e4);
  };
})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
