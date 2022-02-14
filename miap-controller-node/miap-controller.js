#!/usr/bin/env node
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports, module2) {
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    function log2(message) {
      console.log(`[dotenv][DEBUG] ${message}`);
    }
    var NEWLINE = "\n";
    var RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
    var RE_NEWLINES = /\\n/g;
    var NEWLINES_MATCH = /\r\n|\n|\r/;
    function parse(src, options) {
      const debug = Boolean(options && options.debug);
      const obj = {};
      src.toString().split(NEWLINES_MATCH).forEach(function(line, idx) {
        const keyValueArr = line.match(RE_INI_KEY_VAL);
        if (keyValueArr != null) {
          const key = keyValueArr[1];
          let val = keyValueArr[2] || "";
          const end = val.length - 1;
          const isDoubleQuoted = val[0] === '"' && val[end] === '"';
          const isSingleQuoted = val[0] === "'" && val[end] === "'";
          if (isSingleQuoted || isDoubleQuoted) {
            val = val.substring(1, end);
            if (isDoubleQuoted) {
              val = val.replace(RE_NEWLINES, NEWLINE);
            }
          } else {
            val = val.trim();
          }
          obj[key] = val;
        } else if (debug) {
          log2(`did not match key and value when parsing line ${idx + 1}: ${line}`);
        }
      });
      return obj;
    }
    function resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function config2(options) {
      let dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      let debug = false;
      if (options) {
        if (options.path != null) {
          dotenvPath = resolveHome(options.path);
        }
        if (options.encoding != null) {
          encoding = options.encoding;
        }
        if (options.debug != null) {
          debug = true;
        }
      }
      try {
        const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug });
        Object.keys(parsed).forEach(function(key) {
          if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
            process.env[key] = parsed[key];
          } else if (debug) {
            log2(`"${key}" is already defined in \`process.env\` and will not be overwritten`);
          }
        });
        return { parsed };
      } catch (e) {
        return { error: e };
      }
    }
    module2.exports.config = config2;
    module2.exports.parse = parse;
  }
});

// node_modules/tinkerhub-discovery/lib/symbols.js
var require_symbols = __commonJS({
  "node_modules/tinkerhub-discovery/lib/symbols.js"(exports, module2) {
    "use strict";
    module2.exports.addService = Symbol("addService");
    module2.exports.removeService = Symbol("removeService");
    module2.exports.setServices = Symbol("setServices");
    module2.exports.refService = Symbol("refService");
    module2.exports.unrefService = Symbol("unrefService");
    module2.exports.events = Symbol("events");
    module2.exports.services = Symbol("services");
    module2.exports.search = Symbol("search");
    module2.exports.debug = Symbol("debug");
    module2.exports.parent = Symbol("parent");
  }
});

// node_modules/eventemitter3/index.js
var require_eventemitter3 = __commonJS({
  "node_modules/eventemitter3/index.js"(exports, module2) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var prefix = "~";
    function Events() {
    }
    if (Object.create) {
      Events.prototype = /* @__PURE__ */ Object.create(null);
      if (!new Events().__proto__)
        prefix = false;
    }
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
    function EventEmitter() {
      this._events = new Events();
      this._eventsCount = 0;
    }
    EventEmitter.prototype.eventNames = function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0)
        return names;
      for (name in events = this._events) {
        if (has.call(events, name))
          names.push(prefix ? name.slice(1) : name);
      }
      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }
      return names;
    };
    EventEmitter.prototype.listeners = function listeners(event, exists) {
      var evt = prefix ? prefix + event : event, available = this._events[evt];
      if (exists)
        return !!available;
      if (!available)
        return [];
      if (available.fn)
        return [available.fn];
      for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
        ee[i] = available[i].fn;
      }
      return ee;
    };
    EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt])
        return false;
      var listeners = this._events[evt], len = arguments.length, args, i;
      if (listeners.fn) {
        if (listeners.once)
          this.removeListener(event, listeners.fn, void 0, true);
        switch (len) {
          case 1:
            return listeners.fn.call(listeners.context), true;
          case 2:
            return listeners.fn.call(listeners.context, a1), true;
          case 3:
            return listeners.fn.call(listeners.context, a1, a2), true;
          case 4:
            return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for (i = 1, args = new Array(len - 1); i < len; i++) {
          args[i - 1] = arguments[i];
        }
        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length, j;
        for (i = 0; i < length; i++) {
          if (listeners[i].once)
            this.removeListener(event, listeners[i].fn, void 0, true);
          switch (len) {
            case 1:
              listeners[i].fn.call(listeners[i].context);
              break;
            case 2:
              listeners[i].fn.call(listeners[i].context, a1);
              break;
            case 3:
              listeners[i].fn.call(listeners[i].context, a1, a2);
              break;
            case 4:
              listeners[i].fn.call(listeners[i].context, a1, a2, a3);
              break;
            default:
              if (!args)
                for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }
              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }
      return true;
    };
    EventEmitter.prototype.on = function on(event, fn, context) {
      var listener = new EE(fn, context || this), evt = prefix ? prefix + event : event;
      if (!this._events[evt])
        this._events[evt] = listener, this._eventsCount++;
      else if (!this._events[evt].fn)
        this._events[evt].push(listener);
      else
        this._events[evt] = [this._events[evt], listener];
      return this;
    };
    EventEmitter.prototype.once = function once(event, fn, context) {
      var listener = new EE(fn, context || this, true), evt = prefix ? prefix + event : event;
      if (!this._events[evt])
        this._events[evt] = listener, this._eventsCount++;
      else if (!this._events[evt].fn)
        this._events[evt].push(listener);
      else
        this._events[evt] = [this._events[evt], listener];
      return this;
    };
    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt])
        return this;
      if (!fn) {
        if (--this._eventsCount === 0)
          this._events = new Events();
        else
          delete this._events[evt];
        return this;
      }
      var listeners = this._events[evt];
      if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
          if (--this._eventsCount === 0)
            this._events = new Events();
          else
            delete this._events[evt];
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
            events.push(listeners[i]);
          }
        }
        if (events.length)
          this._events[evt] = events.length === 1 ? events[0] : events;
        else if (--this._eventsCount === 0)
          this._events = new Events();
        else
          delete this._events[evt];
      }
      return this;
    };
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;
      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) {
          if (--this._eventsCount === 0)
            this._events = new Events();
          else
            delete this._events[evt];
        }
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }
      return this;
    };
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;
    EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
      return this;
    };
    EventEmitter.prefixed = prefix;
    EventEmitter.EventEmitter = EventEmitter;
    if (typeof module2 !== "undefined") {
      module2.exports = EventEmitter;
    }
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports, module2) {
    "use strict";
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      Object.keys(env).forEach(function(key) {
        createDebug[key] = env[key];
      });
      createDebug.instances = [];
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        var hash = 0;
        for (var i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        var prevTime;
        function debug() {
          if (!debug.enabled) {
            return;
          }
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          var self = debug;
          var curr = Number(new Date());
          var ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          var index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
            if (match === "%%") {
              return match;
            }
            index++;
            var formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              var val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          var logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.enabled = createDebug.enabled(namespace);
        debug.useColors = createDebug.useColors();
        debug.color = selectColor(namespace);
        debug.destroy = destroy;
        debug.extend = extend;
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        createDebug.instances.push(debug);
        return debug;
      }
      function destroy() {
        var index = createDebug.instances.indexOf(this);
        if (index !== -1) {
          createDebug.instances.splice(index, 1);
          return true;
        }
        return false;
      }
      function extend(namespace, delimiter) {
        return createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.names = [];
        createDebug.skips = [];
        var i;
        var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
        var len = split.length;
        for (i = 0; i < len; i++) {
          if (!split[i]) {
            continue;
          }
          namespaces = split[i].replace(/\*/g, ".*?");
          if (namespaces[0] === "-") {
            createDebug.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
          } else {
            createDebug.names.push(new RegExp("^" + namespaces + "$"));
          }
        }
        for (i = 0; i < createDebug.instances.length; i++) {
          var instance = createDebug.instances[i];
          instance.enabled = createDebug.enabled(instance.namespace);
        }
      }
      function disable() {
        createDebug.enable("");
      }
      function enabled(name) {
        if (name[name.length - 1] === "*") {
          return true;
        }
        var i;
        var len;
        for (i = 0, len = createDebug.skips.length; i < len; i++) {
          if (createDebug.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = createDebug.names.length; i < len; i++) {
          if (createDebug.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module2.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports, module2) {
    "use strict";
    function _typeof(obj) {
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    exports.log = log2;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.colors = ["#0000CC", "#0000FF", "#0033CC", "#0033FF", "#0066CC", "#0066FF", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#3300CC", "#3300FF", "#3333CC", "#3333FF", "#3366CC", "#3366FF", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#6600CC", "#6600FF", "#6633CC", "#6633FF", "#66CC00", "#66CC33", "#9900CC", "#9900FF", "#9933CC", "#9933FF", "#99CC00", "#99CC33", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC9900", "#CC9933", "#CCCC00", "#CCCC33", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF9900", "#FF9933", "#FFCC00", "#FFCC33"];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log2() {
      var _console;
      return (typeof console === "undefined" ? "undefined" : _typeof(console)) === "object" && console.log && (_console = console).log.apply(_console, arguments);
    }
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      var r;
      try {
        r = exports.storage.getItem("debug");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = require_common()(exports);
    var formatters = module2.exports.formatters;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/has-flag/index.js
var require_has_flag = __commonJS({
  "node_modules/has-flag/index.js"(exports, module2) {
    "use strict";
    module2.exports = (flag, argv) => {
      argv = argv || process.argv;
      const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
      const pos = argv.indexOf(prefix + flag);
      const terminatorPos = argv.indexOf("--");
      return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
    };
  }
});

// node_modules/supports-color/index.js
var require_supports_color = __commonJS({
  "node_modules/supports-color/index.js"(exports, module2) {
    "use strict";
    var os = require("os");
    var hasFlag = require_has_flag();
    var env = process.env;
    var forceColor;
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false")) {
      forceColor = false;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      forceColor = true;
    }
    if ("FORCE_COLOR" in env) {
      forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
    }
    function translateLevel(level) {
      if (level === 0) {
        return false;
      }
      return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
      };
    }
    function supportsColor(stream) {
      if (forceColor === false) {
        return 0;
      }
      if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
        return 3;
      }
      if (hasFlag("color=256")) {
        return 2;
      }
      if (stream && !stream.isTTY && forceColor !== true) {
        return 0;
      }
      const min = forceColor ? 1 : 0;
      if (process.platform === "win32") {
        const osRelease = os.release().split(".");
        if (Number(process.versions.node.split(".")[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
          return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
      }
      if ("CI" in env) {
        if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
          return 1;
        }
        return min;
      }
      if ("TEAMCITY_VERSION" in env) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
      }
      if (env.COLORTERM === "truecolor") {
        return 3;
      }
      if ("TERM_PROGRAM" in env) {
        const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
        switch (env.TERM_PROGRAM) {
          case "iTerm.app":
            return version >= 3 ? 3 : 2;
          case "Apple_Terminal":
            return 2;
        }
      }
      if (/-256(color)?$/i.test(env.TERM)) {
        return 2;
      }
      if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return 1;
      }
      if ("COLORTERM" in env) {
        return 1;
      }
      if (env.TERM === "dumb") {
        return min;
      }
      return min;
    }
    function getSupportLevel(stream) {
      const level = supportsColor(stream);
      return translateLevel(level);
    }
    module2.exports = {
      supportsColor: getSupportLevel,
      stdout: getSupportLevel(process.stdout),
      stderr: getSupportLevel(process.stderr)
    };
  }
});

// node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/debug/src/node.js"(exports, module2) {
    "use strict";
    var tty = require("tty");
    var util = require("util");
    exports.init = init;
    exports.log = log2;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.colors = [6, 2, 3, 4, 5, 1];
    try {
      supportsColor = require_supports_color();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221];
      }
    } catch (error) {
    }
    var supportsColor;
    exports.inspectOpts = Object.keys(process.env).filter(function(key) {
      return /^debug_/i.test(key);
    }).reduce(function(obj, key) {
      var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_, k) {
        return k.toUpperCase();
      });
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      var name = this.namespace, useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        var prefix = "  ".concat(colorCode, ";1m").concat(name, " \x1B[0m");
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports.inspectOpts.hideDate) {
        return "";
      }
      return new Date().toISOString() + " ";
    }
    function log2() {
      return process.stderr.write(util.format.apply(util, arguments) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug) {
      debug.inspectOpts = {};
      var keys = Object.keys(exports.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    module2.exports = require_common()(exports);
    var formatters = module2.exports.formatters;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  }
});

// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports, module2) {
    "use strict";
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module2.exports = require_browser();
    } else {
      module2.exports = require_node();
    }
  }
});

// node_modules/tinkerhub-discovery/lib/filtered.js
var require_filtered = __commonJS({
  "node_modules/tinkerhub-discovery/lib/filtered.js"(exports, module2) {
    "use strict";
    var util = require("util");
    var AbstractDiscovery = require_abstract();
    var { events, debug } = require_symbols();
    var parent = Symbol("parent");
    var filter = Symbol("filter");
    var available = Symbol("available");
    var unavailable = Symbol("unavailable");
    module2.exports = class FilteredDiscovery extends AbstractDiscovery {
      static get type() {
        return "filtered";
      }
      constructor(parent_, filter_) {
        super();
        this[parent] = parent_;
        this[filter] = filter_;
        this[available] = this[available].bind(this);
        this[unavailable] = this[unavailable].bind(this);
        if (parent_.active) {
          parent_.on("available", this[available]);
          parent_.on("unavailable", this[unavailable]);
        }
      }
      get services() {
        return this[parent].services.filter(this[filter]);
      }
      get active() {
        return this[parent].active;
      }
      start() {
        if (this[parent].active)
          return;
        this[parent].on("available", this[available]);
        this[parent].on("unavailable", this[unavailable]);
        this[parent].start();
      }
      stop() {
        this[parent].stop();
        this[parent].off("available", this[available]);
        this[parent].off("unavailable", this[unavailable]);
      }
      [available](service) {
        if (this[filter](service)) {
          this[debug]("Service with id", service.id, "now available via", this[parent]);
          this[events].emit("available", service, this);
        }
      }
      [unavailable](service) {
        if (this[filter](service)) {
          this[debug]("Service with id", service.id, "no longer available via", this[parent]);
          this[events].emit("unavailable", service, this);
        }
      }
      [util.inspect.custom](depth, options) {
        if (depth < 0) {
          return options.stylize("FilteredDiscovery", "special");
        }
        const newOptions = Object.assign({}, options, {
          depth: options.depth === null ? null : options.depth - 1
        });
        const p = util.inspect(this[parent], newOptions);
        return options.stylize("FilteredDiscovery", "special") + "{" + p + "}";
      }
    };
  }
});

// node_modules/tinkerhub-discovery/lib/basic.js
var require_basic = __commonJS({
  "node_modules/tinkerhub-discovery/lib/basic.js"(exports, module2) {
    "use strict";
    var AbstractDiscovery = require_abstract();
    var { addService, removeService, setServices, events, services, debug, parent } = require_symbols();
    module2.exports = class BasicDiscovery extends AbstractDiscovery {
      constructor() {
        super();
        this[services] = /* @__PURE__ */ new Map();
        this.active = false;
      }
      get services() {
        return Array.from(this[services].values()).filter((s) => s.available).map((s) => s.data);
      }
      start() {
        this.active = true;
      }
      stop() {
        this.active = false;
      }
      [addService](service) {
        if (typeof service !== "object" || service === null) {
          throw new Error("A service object is required");
        }
        if (!service.id) {
          throw new Error("Services must have an identifier");
        }
        let registration = this[services].get(service.id);
        if (!registration) {
          registration = {
            id: service.id,
            data: service
          };
          this[services].set(service.id, registration);
        }
        const wasAvailable = registration.available;
        registration.lastSeen = Date.now();
        registration.available = true;
        if (!wasAvailable) {
          const p = this[parent];
          if (p) {
            this[debug]("Service with id", service.id, "now available via", this[parent]);
          } else {
            this[debug]("Service with id", service.id, "now available");
          }
          this[events].emit("available", registration.data, this);
          return true;
        } else {
          return false;
        }
      }
      [removeService](service) {
        if (typeof service === "undefined" || service === null)
          return;
        const id = typeof service === "string" ? service : service.id;
        const registration = this[services].get(id);
        if (registration) {
          this[services].delete(id);
          if (registration.available) {
            this[events].emit("unavailable", registration.data, this);
            const p = this[parent];
            if (p) {
              this[debug]("Service with id", id, "no longer available via", this[parent]);
            } else {
              this[debug]("Service with id", id, "no longer available");
            }
            return true;
          }
        }
        return false;
      }
      [setServices](available) {
        const ids = /* @__PURE__ */ new Set();
        for (const service of available) {
          ids.add(service.id);
          this[addService](service);
        }
        for (const id of this[services].keys()) {
          if (!ids.has(id)) {
            this[removeService](id);
          }
        }
      }
    };
  }
});

// node_modules/tinkerhub-discovery/lib/mapped.js
var require_mapped = __commonJS({
  "node_modules/tinkerhub-discovery/lib/mapped.js"(exports, module2) {
    "use strict";
    var BasicDiscovery = require_basic();
    var { addService, removeService, parent, debug } = require_symbols();
    var mapper = Symbol("mapper");
    var available = Symbol("available");
    var unavailable = Symbol("unavailable");
    var mapAndAddService = Symbol("mapService");
    var mappedId = Symbol("mappedId");
    module2.exports = class MappedDiscovery extends BasicDiscovery {
      static get type() {
        return "mapped";
      }
      constructor(parent_, mapper_) {
        super();
        this[parent] = parent_;
        this[mapper] = mapper_;
        this[available] = this[available].bind(this);
        this[unavailable] = this[unavailable].bind(this);
        if (parent_.active) {
          parent_.on("available", this[available]);
          parent_.on("unavailable", this[unavailable]);
          for (const service of parent_.services) {
            this[mapAndAddService](service);
          }
          this.active = true;
        }
      }
      start() {
        if (this[parent].active)
          return;
        this[parent].on("available", this[available]);
        this[parent].on("unavailable", this[unavailable]);
        this[parent].start();
        super.start();
      }
      stop() {
        this[parent].stop();
        this[parent].off("available", this[available]);
        this[parent].off("unavailable", this[unavailable]);
        super.stop();
      }
      [mapAndAddService](service) {
        Promise.resolve(this[mapper](service)).then((mapped) => {
          if (mapped && mapped.id) {
            service[mappedId] = mapped.id;
            this[addService](mapped);
          }
        }).catch((error) => this[debug]("Could not map service", error));
      }
      [available](service) {
        this[mapAndAddService](service);
      }
      [unavailable](service) {
        const id = service[mappedId];
        if (!id)
          return;
        this[removeService](id);
      }
    };
  }
});

// node_modules/tinkerhub-discovery/lib/combined.js
var require_combined = __commonJS({
  "node_modules/tinkerhub-discovery/lib/combined.js"(exports, module2) {
    "use strict";
    var BasicDiscovery = require_basic();
    var { addService, removeService, parent, services } = require_symbols();
    var available = Symbol("available");
    var unavailable = Symbol("unavailable");
    module2.exports = class CombinedDiscovery extends BasicDiscovery {
      static get type() {
        return "combined";
      }
      constructor(instances) {
        super();
        this[parent] = instances;
        this[available] = this[available].bind(this);
        this[unavailable] = this[unavailable].bind(this);
        for (const instance of this[parent]) {
          if (instance.active) {
            instance.on("available", this[available]);
            instance.on("unavailable", this[unavailable]);
            for (const service of instance.services) {
              this[addService](service);
            }
          }
        }
      }
      start() {
        for (const instance of this[parent]) {
          if (!instance.active) {
            instance.start();
            instance.on("available", this[available]);
            instance.on("unavailable", this[unavailable]);
          }
        }
        super.start();
      }
      stop() {
        for (const instance of this[parent]) {
          instance.stop();
          instance.off("available", this[available]);
          instance.off("unavailable", this[unavailable]);
        }
        super.stop();
      }
      [available](service) {
        this[addService](service);
      }
      [unavailable](service) {
        for (const instance of this[parent]) {
          if (instance[services].has(service.id))
            return;
        }
        this[removeService](service);
      }
    };
  }
});

// node_modules/tinkerhub-discovery/lib/abstract.js
var require_abstract = __commonJS({
  "node_modules/tinkerhub-discovery/lib/abstract.js"(exports, module2) {
    "use strict";
    var EventEmitter = require_eventemitter3();
    var debugCreator = require_src();
    var { events, debug } = require_symbols();
    module2.exports = class AbstractDiscovery {
      constructor() {
        this[events] = new EventEmitter();
        this[debug] = debugCreator("th:discovery:" + (this.constructor.type || "???"));
      }
      on(event, listener) {
        this[events].on(event, listener);
        return this;
      }
      off(event, listener) {
        this[events].off(event, listener);
        return this;
      }
      start() {
      }
      stop() {
      }
      filter(filter) {
        const FilteredDiscovery = require_filtered();
        return new FilteredDiscovery(this, filter);
      }
      map(mapper) {
        const MappedDiscovery = require_mapped();
        return new MappedDiscovery(this, mapper);
      }
      and(other) {
        const CombinedDiscovery = require_combined();
        return new CombinedDiscovery([this, other]);
      }
    };
  }
});

// node_modules/tinkerhub-discovery/lib/manual.js
var require_manual = __commonJS({
  "node_modules/tinkerhub-discovery/lib/manual.js"(exports, module2) {
    "use strict";
    var { addService, removeService } = require_symbols();
    var BasicDiscovery = require_basic();
    module2.exports = class ManualDiscovery extends BasicDiscovery {
      constructor() {
        super();
        this.start();
      }
      stop() {
      }
      add(service) {
        return this[addService](service);
      }
      remove(service) {
        return this[removeService](service);
      }
    };
  }
});

// node_modules/tinkerhub-discovery/lib/expiring.js
var require_expiring = __commonJS({
  "node_modules/tinkerhub-discovery/lib/expiring.js"(exports, module2) {
    "use strict";
    var BasicDiscovery = require_basic();
    var { removeService, services, refService, unrefService } = require_symbols();
    var maxStaleTime = Symbol("maxStaleTime");
    var timer = Symbol("timer");
    module2.exports = class ExpiringDiscovery extends BasicDiscovery {
      constructor(options) {
        if (!options)
          throw new Error("options must be specified");
        if (!options.maxStaleTime || options.maxStaleTime <= 0)
          throw new Error("maxStaleTime option is required and needs to be a positive number");
        super();
        this[maxStaleTime] = options.maxStaleTime;
      }
      start() {
        super.start();
        this[timer] = setInterval(() => {
          const oldest = Date.now() - this[maxStaleTime];
          for (const service of this[services].values()) {
            if (service.lastSeen < oldest && !service.ref) {
              this[removeService](service.data);
            }
          }
        }, Math.max(1e3, this[maxStaleTime] / 3));
      }
      stop() {
        clearInterval(this[timer]);
        super.stop();
      }
      [refService](service) {
        const id = typeof service === "string" ? service : service.id;
        const registration = this[services].get(id);
        if (registration) {
          registration.ref = true;
        }
      }
      [unrefService](service) {
        const id = typeof service === "string" ? service : service.id;
        const registration = this[services].get(id);
        if (registration) {
          registration.ref = false;
        }
      }
    };
  }
});

// node_modules/tinkerhub-discovery/lib/timed.js
var require_timed = __commonJS({
  "node_modules/tinkerhub-discovery/lib/timed.js"(exports, module2) {
    "use strict";
    var ExpiringDiscovery = require_expiring();
    var { search, debug } = require_symbols();
    var searchTime = Symbol("searchTime");
    var timer = Symbol("timer");
    function resolveOptions(options) {
      const result = Object.assign({}, options);
      if (result.maxStaleTime && !result.searchTime) {
        result.searchTime = result.maxStaleTime / 3;
      }
      if (!result.maxStaleTime && result.searchTime) {
        result.maxStaleTime = result.searchTime * 3;
      }
      if (!result.searchTime) {
        throw new Error("Either maxStaleTime or searchTime needs to be specified");
      }
      return result;
    }
    module2.exports = class TimedDiscovery extends ExpiringDiscovery {
      constructor(options) {
        if (!options)
          throw new Error("options are required");
        options = resolveOptions(options);
        super(options);
        this[debug]("Searching every", options.searchTime, "ms");
        this[searchTime] = options.searchTime;
      }
      [search]() {
        throw new Error("Search has not been implemented");
      }
      start() {
        super.start();
        const s = () => {
          this[debug]("Searching for services");
          try {
            this[search]();
          } catch (ex) {
            this[debug]("Could not complete search", ex);
          }
        };
        this[timer] = setInterval(s, this[searchTime]);
        setImmediate(s);
      }
      stop() {
        clearInterval(this[timer]);
        super.stop();
      }
    };
  }
});

// node_modules/tinkerhub-discovery/index.js
var require_tinkerhub_discovery = __commonJS({
  "node_modules/tinkerhub-discovery/index.js"(exports, module2) {
    "use strict";
    var symbols = require_symbols();
    module2.exports.addService = symbols.addService;
    module2.exports.removeService = symbols.removeService;
    module2.exports.setServices = symbols.setServices;
    module2.exports.refService = symbols.refService;
    module2.exports.unrefService = symbols.unrefService;
    module2.exports.search = symbols.search;
    module2.exports.debug = symbols.debug;
    module2.exports.AbstractDiscovery = require_abstract();
    module2.exports.BasicDiscovery = require_basic();
    module2.exports.ManualDiscovery = require_manual();
    module2.exports.ExpiringDiscovery = require_expiring();
    module2.exports.TimedDiscovery = require_timed();
    var CombinedDiscovery = require_combined();
    module2.exports.combine = function(...instances) {
      return new CombinedDiscovery(instances);
    };
  }
});

// node_modules/foibles/decoration.js
var require_decoration = __commonJS({
  "node_modules/foibles/decoration.js"(exports, module2) {
    var reference = Symbol("decorator:ref");
    var application = Symbol("decorator:application");
    module2.exports.decorate = function decorate(mixin, decorator) {
      Object.setPrototypeOf(decorator, mixin);
      if (!mixin[reference]) {
        mixin[reference] = mixin;
      }
      return decorator;
    };
    function original(mixin) {
      return mixin[reference] || mixin;
    }
    module2.exports.original = original;
    module2.exports.apply = function apply(superclass, mixin) {
      const result = mixin(superclass);
      result.prototype[application] = original(mixin);
      return result;
    };
    module2.exports.has = function has(object, mixin) {
      const originalMixin = original(mixin);
      while (object != null) {
        if (object.hasOwnProperty(application) && object[application] == originalMixin) {
          return true;
        }
        object = Object.getPrototypeOf(object);
      }
      return false;
    };
  }
});

// node_modules/foibles/mixins.js
var require_mixins = __commonJS({
  "node_modules/foibles/mixins.js"(exports, module2) {
    var { decorate, apply, has } = require_decoration();
    function root(mixin2) {
      return decorate(mixin2, (superclass) => apply(superclass, mixin2));
    }
    module2.exports = root;
    function deduplication(mixin2) {
      return decorate(mixin2, (superclass) => {
        if (has(superclass.prototype, mixin2)) {
          return superclass;
        }
        return mixin2(superclass);
      });
    }
    function hasInstance(mixin2) {
      if (Symbol.hasInstance && !mixin2.hasOwnProperty(Symbol.hasInstance)) {
        Object.defineProperty(mixin2, Symbol.hasInstance, {
          value: function mixinHasInstance(other) {
            return has(other, mixin2);
          }
        });
      }
      mixin2.isInstance = function(other) {
        return has(other, mixin2);
      };
      return mixin2;
    }
    function mixin(func) {
      return deduplication(root(hasInstance(func)));
    }
    module2.exports.Mixin = mixin;
  }
});

// node_modules/foibles/index.js
var require_foibles = __commonJS({
  "node_modules/foibles/index.js"(exports, module2) {
    var AsMixin = Symbol("asMixin");
    var { Mixin } = require_mixins();
    module2.exports.Mixin = Mixin;
    module2.exports.Class = function(superclass, func) {
      const MixableType = performMixin(superclass, func);
      MixableType[AsMixin] = Mixin(func);
      return MixableType;
    };
    module2.exports.toExtendable = function(type) {
      type.with = function(...mixins) {
        return mix(type, ...mixins);
      };
      return type;
    };
    function mix(base, ...mixins) {
      let root = base;
      let chain = root.name;
      for (let i = 0; i < mixins.length; i++) {
        let mixin = mixins[i];
        if (!mixin) {
          throw new Error("Trying to apply non-existent mixin");
        }
        if (mixin[AsMixin]) {
          mixin = mixin[AsMixin];
        }
        if (!mixin) {
          throw new Error("Mixin implementation bug, resolved to non-existent mixin");
        }
        root = performMixin(root, mixin);
        chain = root.name + " > " + chain;
      }
      return root;
    }
    function performMixin(root, mixin) {
      const type = mixin(root);
      type.with = function(...mixins) {
        return mix(type, ...mixins);
      };
      return type;
    }
    module2.exports.mix = mix;
  }
});

// node_modules/abstract-things/events/index.js
var require_events = __commonJS({
  "node_modules/abstract-things/events/index.js"(exports, module2) {
    "use strict";
    var registeredListeners = Symbol("listeners");
    var anyListeners = Symbol("anyListeners");
    var context = Symbol("context");
    var triggerListenerChange = Symbol("triggerListenerChange");
    var listenersChanged = module2.exports.listenersChanged = Symbol("listenersChanged");
    module2.exports.EventEmitter = class EventEmitter {
      constructor(options) {
        this[registeredListeners] = {};
        this[anyListeners] = [];
        this[context] = options && options.context || this;
      }
      [triggerListenerChange]() {
        if (!this[listenersChanged])
          return;
        const hasListeners = Object.keys(this[registeredListeners]).length > 0 || this[anyListeners].length > 0;
        this[listenersChanged](hasListeners);
      }
      get hasListeners() {
        return Object.keys(this[registeredListeners]).length > 0 || this[anyListeners] > 0;
      }
      on(eventName, listener) {
        const allListeners = this[registeredListeners];
        const listeners = allListeners[eventName] || (allListeners[eventName] = []);
        listeners.push(listener);
        this[triggerListenerChange]();
        return {
          stop: () => {
            this.off(eventName, listener);
          }
        };
      }
      off(eventName, listener) {
        if (!listener)
          return;
        const listeners = this[registeredListeners][eventName];
        if (!listeners)
          return;
        var idx = listeners.indexOf(listener);
        if (idx < 0)
          return;
        listeners.splice(idx, 1);
        this[triggerListenerChange]();
      }
      onAny(listener) {
        this[anyListeners].push(listener);
        this[triggerListenerChange]();
        return {
          stop: () => this.offAny(listener)
        };
      }
      offAny(listener) {
        var idx = this[anyListeners].indexOf(listener);
        if (idx < 0)
          return;
        this[anyListeners].splice(idx, 1);
        this[triggerListenerChange]();
      }
      when(eventName, limit, listener) {
        const limitedListener = function(data) {
          if (limit(data)) {
            listener.call(this, data);
          }
        };
        this.on(eventName, limitedListener);
        return {
          stop: () => {
            this.off(eventName, limitedListener);
          }
        };
      }
      once(eventName, listener) {
        const removingListener = function() {
          this.off(eventName, removingListener);
          listener.apply(this, arguments);
        };
        this.on(eventName, removingListener);
        return {
          stop: () => {
            this.off(eventName, removingListener);
          }
        };
      }
      emit(event) {
        const ctx = this[context];
        const allArgs = arguments;
        const args = Array.prototype.slice.call(arguments).slice(1);
        const listeners = this[registeredListeners][event];
        if (listeners) {
          for (const listener of listeners) {
            listener.apply(ctx, args);
          }
        }
        for (const listener of this[anyListeners]) {
          listener.apply(ctx, allArgs);
        }
      }
      emitWithContext(ctx, event) {
        const allArgs = Array.prototype.slice.call(arguments, 1);
        const args = Array.prototype.slice.call(arguments, 2);
        const listeners = this[registeredListeners][event];
        if (listeners) {
          for (const listener of listeners) {
            listener.apply(ctx, args);
          }
        }
        for (const listener of this[anyListeners]) {
          listener.apply(ctx, allArgs);
        }
      }
    };
  }
});

// node_modules/abstract-things/utils/define-api.js
var require_define_api = __commonJS({
  "node_modules/abstract-things/utils/define-api.js"(exports, module2) {
    "use strict";
    var ActionBuilder = class {
      constructor(name, callback) {
        this._name = name;
        this._callback = callback;
        this._description = "";
        this._arguments = [];
        this._returnType = {
          type: "mixed",
          description: ""
        };
        this._getterFor = null;
      }
      description(description) {
        this._description = description || "";
        return this;
      }
      returns(type, description) {
        this._returnType = {
          type,
          description
        };
        return this;
      }
      argument(type, optional, description) {
        if (typeof optional !== "boolean") {
          description = optional;
          optional = false;
        }
        this._arguments.push({
          type,
          optional,
          description: description || ""
        });
        return this;
      }
      getterForState(state) {
        this._getterFor = state;
        return this;
      }
      done() {
        const def = {
          name: this._name,
          arguments: this._arguments,
          returnType: this._returnType
        };
        if (this._description) {
          def.description = this._description;
        }
        if (this._getterFor) {
          def.getterForState = this._getterFor;
        }
        return this._callback(def);
      }
    };
    var StateBuilder = class {
      constructor(name, callback) {
        this._name = name;
        this._callback = callback;
        this._description = "";
        this._type = "mixed";
      }
      description(description) {
        this._description = description || "";
        return this;
      }
      type(type) {
        this._type = type;
        return this;
      }
      done() {
        const def = {
          name: this._name,
          type: this._type
        };
        if (this._description) {
          def.description = this._description;
        }
        return this._callback(def);
      }
    };
    var EventBuilder = class {
      constructor(name, callback) {
        this._name = name;
        this._callback = callback;
        this._description = "";
        this._type = "mixed";
      }
      description(description) {
        this._description = description || "";
        return this;
      }
      type(type) {
        this._type = type;
        return this;
      }
      done() {
        const def = {
          name: this._name,
          type: this._type
        };
        if (this._description) {
          def.description = this._description;
        }
        return this._callback(def);
      }
    };
    var DefBuilder = class {
      constructor() {
        this._actions = {};
        this._events = {};
        this._state = {};
      }
      markWith(tags) {
        this._tags = tags;
      }
      action(name) {
        return new ActionBuilder(name, (def) => {
          const current = this._actions[name];
          if (current) {
            return this;
          }
          def.tags = this._tags;
          this._actions[name] = def;
          return this;
        });
      }
      event(name) {
        return new EventBuilder(name, (def) => {
          this._events[name] = def;
          def.tags = this._tags;
          return this;
        });
      }
      state(name) {
        return new StateBuilder(name, (def) => {
          this._state[name] = def;
          def.tags = this._tags;
          return this;
        });
      }
      done() {
        return {
          actions: this._actions,
          state: this._state,
          events: this._events
        };
      }
    };
    module2.exports = DefBuilder;
  }
});

// node_modules/abstract-things/utils/metadata.js
var require_metadata = __commonJS({
  "node_modules/abstract-things/utils/metadata.js"(exports, module2) {
    "use strict";
    var thing = Symbol("thing");
    var name = Symbol("name");
    module2.exports = class Metadata {
      constructor(instance) {
        this[thing] = instance;
        this.types = /* @__PURE__ */ new Set();
        this.capabilities = /* @__PURE__ */ new Set();
      }
      get name() {
        return this[name];
      }
      set name(n) {
        if (this[name] !== n) {
          this[name] = n;
          this[thing].emitEvent("thing:metadata", this);
        }
      }
      addTypes(...types) {
        for (let type of types) {
          this.types.add(type);
        }
        this[thing].emitEvent("thing:metadata", this);
        return this;
      }
      addCapabilities(...caps) {
        for (let cap of caps) {
          this.capabilities.add(cap);
        }
        this[thing].emitEvent("thing:metadata", this);
        return this;
      }
      removeCapabilities(...caps) {
        for (let cap of caps) {
          this.capabilities.delete(cap);
        }
        this[thing].emitEvent("thing:metadata", this);
        return this;
      }
      hasType(type) {
        return this.types.has(type);
      }
      hasCapability(cap) {
        return this.capabilities.has(cap);
      }
      matches(...tags) {
        for (const tag of tags) {
          if (tag.indexOf("type:") === 0) {
            if (!this.hasType(tag.substring(5))) {
              return false;
            }
          } else if (tag.indexOf("cap:") === 0) {
            if (!this.hasCapability(tag.substring(4))) {
              return false;
            }
          } else {
            return false;
          }
        }
        return true;
      }
    };
  }
});

// node_modules/abstract-things/utils/collectMetadata.js
var require_collectMetadata = __commonJS({
  "node_modules/abstract-things/utils/collectMetadata.js"(exports, module2) {
    "use strict";
    var DefinitionBuilder = require_define_api();
    var Metadata = require_metadata();
    function collect(metadata, tags, prefix, func, prototype, getter) {
      if (!prototype.hasOwnProperty(getter))
        return;
      const r = prototype[getter];
      if (typeof r === "undefined" || r === null)
        return;
      if (typeof r === "string") {
        metadata[func](r);
        tags.push(prefix + ":" + r);
      } else if (Array.isArray(r)) {
        metadata[func](...r);
        for (const i of r) {
          tags.push(prefix + ":" + i);
        }
      }
    }
    module2.exports = function collectMetadata(Parent, instance) {
      const metadata = new Metadata(instance);
      const builder = new DefinitionBuilder();
      let prototype = instance.constructor;
      while (prototype !== Parent) {
        const tags = [];
        collect(metadata, tags, "type", "addTypes", prototype, "types");
        collect(metadata, tags, "type", "addTypes", prototype, "type");
        collect(metadata, tags, "cap", "addCapabilities", prototype, "capabilities");
        collect(metadata, tags, "cap", "addCapabilities", prototype, "capability");
        builder.markWith(tags);
        const api = prototype.availableAPI;
        if (typeof api === "function") {
          prototype.availableAPI(builder);
        } else if (Array.isArray(api)) {
          for (const action of api) {
            builder.action(action).done();
          }
        }
        prototype = Object.getPrototypeOf(prototype);
      }
      Object.assign(metadata, builder.done());
      return metadata;
    };
  }
});

// node_modules/is-mergeable-object/index.js
var require_is_mergeable_object = __commonJS({
  "node_modules/is-mergeable-object/index.js"(exports, module2) {
    module2.exports = function isMergeableObject(value) {
      return isNonNullObject(value) && !isSpecial(value);
    };
    function isNonNullObject(value) {
      return !!value && typeof value === "object";
    }
    function isSpecial(value) {
      var stringValue = Object.prototype.toString.call(value);
      return stringValue === "[object RegExp]" || stringValue === "[object Date]" || isReactElement(value);
    }
    var canUseSymbol = typeof Symbol === "function" && Symbol.for;
    var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for("react.element") : 60103;
    function isReactElement(value) {
      return value.$$typeof === REACT_ELEMENT_TYPE;
    }
  }
});

// node_modules/abstract-things/utils/merge.js
var require_merge = __commonJS({
  "node_modules/abstract-things/utils/merge.js"(exports, module2) {
    "use strict";
    var isMergeableObject = require_is_mergeable_object();
    function merge(a, b) {
      if (Array.isArray(a)) {
        return mergeArray(a, b);
      } else if (a instanceof Set) {
        return mergeSet(a, b);
      } else if (isMergeableObject(a)) {
        return mergeObject(a, b);
      } else {
        return b;
      }
    }
    function mergeObject(a, b) {
      if (!b)
        return a;
      for (const key of Object.keys(b)) {
        const value = b[key];
        if (typeof a[key] === "undefined") {
          a[key] = value;
        } else {
          a[key] = merge(a[key], value);
        }
      }
      return a;
    }
    function mergeArray(a, b) {
      if (!b)
        return a;
      for (const value of b) {
        if (a.indexOf(value) < 0) {
          a.push(value);
        }
      }
      return a;
    }
    function mergeSet(a, b) {
      if (!b)
        return a;
      for (const value of b) {
        a.add(value);
      }
      return a;
    }
    module2.exports = merge;
    module2.exports.customMerge = Symbol("merge");
  }
});

// node_modules/abstract-things/thing.js
var require_thing = __commonJS({
  "node_modules/abstract-things/thing.js"(exports, module2) {
    "use strict";
    var { Class, Mixin, toExtendable, mix } = require_foibles();
    var { EventEmitter } = require_events();
    var debug = require_src();
    var collectMetadata = require_collectMetadata();
    var merge = require_merge();
    var id = Symbol("id");
    var debugProperty = Symbol("debug");
    var eventQueue = Symbol("eventQueue");
    var eventEmitter = Symbol("eventEmitter");
    var isInitialized = Symbol("isInitialized");
    var isDestroyed = Symbol("isDestroyed");
    module2.exports = toExtendable(class Thing {
      constructor() {
        this.metadata = collectMetadata(Thing, this);
        this[eventQueue] = [];
        this[eventEmitter] = new EventEmitter({
          context: this
        });
      }
      get id() {
        return this[id] || null;
      }
      set id(identifier) {
        if (this[isInitialized]) {
          throw new Error("Identifier can not be changed after initialization has been done");
        }
        if (typeof identifier !== "string") {
          throw new Error("Identifier should be a string");
        }
        this[id] = identifier;
      }
      init() {
        if (this[isInitialized])
          return Promise.resolve(this);
        this[isDestroyed] = false;
        return Promise.resolve(this.initCallback()).then(() => {
          if (typeof this.id !== "string") {
            throw new Error("Identifier needs to be set either during thing construction or during init");
          }
          if (this.id.indexOf(":") <= 0) {
            throw new Error("Identifier does not contain a namespace, currently: `" + this.id + "`");
          }
          this[isInitialized] = true;
          this.emitEvent("thing:initialized");
          return this;
        });
      }
      initCallback() {
        return Promise.resolve();
      }
      destroy() {
        if (!this[isInitialized] || this[isDestroyed])
          return Promise.resolve();
        this[isDestroyed] = true;
        this[isInitialized] = false;
        return Promise.resolve(this.destroyCallback()).then(() => {
          this.emitEvent("thing:destroyed");
        });
      }
      destroyCallback() {
        return Promise.resolve();
      }
      emitEvent(event, data, options) {
        const queue = this[eventQueue];
        if (!queue)
          return;
        const shouldQueueEmit = queue.length === 0;
        const multiple = options ? options.multiple : false;
        if (!multiple) {
          const idx = queue.findIndex((e) => e[0] === event);
          if (idx >= 0) {
            queue.splice(idx, 1);
          }
        } else if (typeof multiple === "function") {
          for (let i = 0; i < queue.length; i++) {
            const e = queue[i];
            if (e[0] === event && multiple(e[1])) {
              queue.splice(i, 1);
              break;
            }
          }
        }
        queue.push([event, data]);
        if (shouldQueueEmit) {
          setImmediate(() => {
            const emitter = this[eventEmitter];
            for (const e of queue) {
              emitter.emit(e[0], e[1], this);
            }
            this[eventQueue] = [];
          });
        }
      }
      on(event, listener) {
        return this[eventEmitter].on(event, listener);
      }
      off(event, listener) {
        return this[eventEmitter].off(event, listener);
      }
      onAny(listener) {
        return this[eventEmitter].onAny(listener);
      }
      offAny(listener) {
        return this[eventEmitter].offAny(listener);
      }
      debug() {
        if (!this[debugProperty]) {
          this[debugProperty] = debug("thing:" + this.id);
        }
        this[debugProperty].apply(this[debugProperty], arguments);
      }
      matches(...tags) {
        return this.metadata.matches(...tags);
      }
      static type(func) {
        return Class(Thing, func);
      }
      static mixin(func) {
        return Mixin(func);
      }
      static mixinDynamic(obj, ...mixins) {
        const direct = Object.getPrototypeOf(obj);
        const parent = Object.getPrototypeOf(direct);
        const proto = {};
        for (let name of Object.getOwnPropertyNames(direct)) {
          proto[name] = direct[name];
        }
        const base = mix(parent.constructor, ...mixins);
        Object.setPrototypeOf(proto, base.prototype);
        Object.setPrototypeOf(obj, proto);
        const data = new base();
        merge(obj, data);
      }
      extendWith(...mixins) {
        Thing.mixinDynamic(this, ...mixins);
      }
    });
  }
});

// node_modules/abstract-things/discovery.js
var require_discovery = __commonJS({
  "node_modules/abstract-things/discovery.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var { BasicDiscovery, addService, removeService, debug } = require_tinkerhub_discovery();
    var parent = Symbol("parent");
    var mapper = Symbol("mapper");
    var available = Symbol("available");
    var unavailable = Symbol("unavailable");
    var updated = Symbol("updated");
    var mapAndAddService = Symbol("mapService");
    var mappedId = Symbol("mappedId");
    function toMapper(m) {
      if (typeof m === "function") {
        return {
          create: m
        };
      } else if (typeof m === "object") {
        if (!m.create) {
          throw new Error("create(service) is needed in mapper");
        }
        return m;
      } else {
        throw new Error("Function or object (with create-method) needed for discovery");
      }
    }
    module2.exports = class ThingDiscovery extends BasicDiscovery {
      static get type() {
        return "thing";
      }
      constructor(parent_, mapper_) {
        super();
        this[parent] = parent_;
        this[mapper] = toMapper(mapper_);
        this[available] = this[available].bind(this);
        this[unavailable] = this[unavailable].bind(this);
        this[updated] = this[updated].bind(this);
        if (parent_.active) {
          parent_.on("available", this[available]);
          parent_.on("unavailable", this[unavailable]);
          parent_.on("updated", this[updated]);
          for (const service of parent_.services) {
            this[mapAndAddService](service);
          }
          this.active = true;
        }
      }
      start() {
        if (this[parent].active)
          return;
        this[parent].on("available", this[available]);
        this[parent].on("unavailable", this[unavailable]);
        this[parent].on("updated", this[updated]);
        this[parent].start();
        super.start();
      }
      stop() {
        this[parent].stop();
        this[parent].off("available", this[available]);
        this[parent].off("unavailable", this[unavailable]);
        this[parent].off("updated", this[updated]);
        super.stop();
      }
      [mapAndAddService](service) {
        Promise.resolve(this[mapper].create(service)).then((mapped) => mapped && mapped.init()).then((mapped) => {
          if (mapped) {
            if (mapped instanceof Thing) {
              const id = mapped.id;
              mapped.on("thing:destroy", () => this[removeService](id));
              service[mappedId] = mapped.id;
              this[addService](mapped);
            } else {
              this[debug]("Did not map into a thing:", mapped);
            }
          }
        }).catch((error) => this[debug]("Could not map service", error));
      }
      [available](service) {
        this[mapAndAddService](service);
      }
      [unavailable](service) {
        const id = service[mappedId];
        if (!id)
          return;
        this[removeService](id);
      }
      [updated](service) {
      }
    };
  }
});

// node_modules/amounts/lib/quantity.js
var require_quantity = __commonJS({
  "node_modules/amounts/lib/quantity.js"(exports, module2) {
    "use strict";
    function noop(value) {
      return value;
    }
    var prefixDefinitions = [
      {
        names: ["y", "yocto"],
        scale: 1e-24
      },
      {
        names: ["z", "zepto"],
        scale: 1e-21
      },
      {
        names: ["a", "atto"],
        scale: 1e-18
      },
      {
        names: ["f", "femto"],
        scale: 1e-15
      },
      {
        names: ["p", "pico"],
        scale: 1e-12
      },
      {
        names: ["n", "nano"],
        scale: 1e-9
      },
      {
        names: ["u", "micro", "mikro", "mc", "\u03BC", "\xB5"],
        scale: 1e-6
      },
      {
        names: ["m", "milli"],
        scale: 1e-3
      },
      {
        names: ["c", "centi"],
        scale: 0.01
      },
      {
        names: ["d", "deci"],
        scale: 0.1
      },
      {
        names: ["da", "deca", "deka"],
        scale: 10
      },
      {
        names: ["h", "hecto"],
        scale: 100
      },
      {
        names: ["k", "K", "kilo"],
        scale: 1e3
      },
      {
        names: ["M", "mega"],
        scale: 1e6
      },
      {
        names: ["G", "giga"],
        scale: 1e9
      },
      {
        names: ["T", "tera"],
        scale: 1e12
      },
      {
        names: ["P", "peta"],
        scale: 1e15
      },
      {
        names: ["E", "exa"],
        scale: 1e18
      },
      {
        names: ["Z", "zetta"],
        scale: 1e21
      },
      {
        names: ["Y", "yotta"],
        scale: 1e24
      }
    ];
    var prefixes = createUnits(prefixDefinitions, true);
    var SIGN = "[+-]";
    var INT = "\\d+";
    var SIGNED_INT = SIGN + "?" + INT;
    var FRACTION = "\\." + INT;
    var FLOAT = "(?:" + INT + "(?:" + FRACTION + ")?)|(?:" + FRACTION + ")";
    var EXP = "[Ee]" + SIGNED_INT;
    var EXP_NUMBER = "(?:" + FLOAT + ")(?:" + EXP + ")?";
    var NUMBER = SIGN + "?\\s*" + EXP_NUMBER;
    function normalizeUnitName(name) {
      return name.replace(/\s+(\w|$)/g, (m, c) => c.toUpperCase());
    }
    function unitToLower(name) {
      return name.length > 2 ? name.toLowerCase() : name;
    }
    function createUnits(conversions, withNames = false) {
      const result = {};
      conversions.forEach((c) => c.names.forEach((name) => result[unitToLower(normalizeUnitName(name))] = {
        name: c.names[0],
        prefix: c.prefix,
        scale: c.scale,
        toBase: c.toBase,
        fromBase: c.fromBase,
        names: withNames ? c.names : null
      }));
      return result;
    }
    function caseInsensitivePart(value) {
      let result = [];
      for (let i = 0; i < value.length; i++) {
        const c = value[i];
        const l = c.toLowerCase();
        const u = c.toUpperCase();
        if (l !== u) {
          result.push("[" + l + u + "]");
        } else {
          result.push(l);
        }
      }
      return result.join("");
    }
    function createUnitRegex(units) {
      return Object.keys(units).sort((a, b) => b.length - a.length).map((unit) => unit.length > 2 ? caseInsensitivePart(unit) : unit).join("|");
    }
    function createAs(unit) {
      return function() {
        return this.as(unit);
      };
    }
    var Factory = class {
      constructor(name, conversions, multiple) {
        this.name = name;
        this.base = conversions[0].names[0];
        this.conversions = conversions;
        this.units = createUnits(conversions);
        this.multiple = multiple;
        let parsing = this.parsing = {};
        parsing.unitPart = createUnitRegex(this.units);
        parsing.prefixPart = createUnitRegex(prefixes);
        parsing.single = new RegExp("^\\s*(" + NUMBER + ")\\s*(.+?)?\\s*$");
        parsing.multiple = new RegExp("\\s*" + NUMBER + "\\s*(?:[a-zA-Z0-9]+)?\\s*", "g");
        parsing.unit = new RegExp("^(" + parsing.prefixPart + ")?(" + parsing.unitPart + ")$");
        this.formatter = typeof Intl === "object" ? new Intl.NumberFormat() : {
          format: function(e) {
            return String(e);
          }
        };
        const Value = this[name] = new Function("return function " + name + "(value, unit){ this.value = value; this.unit = unit; }")();
        Object.defineProperty(Value.prototype, "amounts:type", {
          value: name
        });
        const self = this;
        Value.prototype.as = function(unit) {
          if (this.unit === unit) {
            return this.value;
          }
          return self.convert(this.value, this.unit, unit);
        };
        Value.prototype.to = function(unit) {
          unit = self._findConversion(unit).name;
          if (this.unit === unit) {
            return this;
          }
          const v = self.convert(this.value, this.unit, unit);
          return new Value(v, unit);
        };
        Value.prototype.is = function(unit) {
          unit = self._findConversion(unit, false);
          if (!unit)
            return false;
          return this.unit === unit.name;
        };
        Value.prototype.toString = function() {
          let result = self.formatter.format(this.value);
          if (this.unit.length > 0) {
            result += " " + this.unit;
          }
          return result;
        };
        for (let key of Object.keys(this.conversions)) {
          const conversion = this.conversions[key];
          for (let cName of conversion.names) {
            Object.defineProperty(Value.prototype, normalizeUnitName(cName), {
              get: createAs(cName)
            });
          }
          for (let pId of conversion.exposePrefixes) {
            const prefix = prefixes[pId];
            for (let pName of prefix.names) {
              for (let cName of conversion.names) {
                let unitName = pName + normalizeUnitName(cName);
                Object.defineProperty(Value.prototype, unitName, {
                  get: createAs(unitName)
                });
              }
            }
          }
        }
      }
      _instance(value, unit) {
        return new this[this.name](value, unit);
      }
      create(value, unit) {
        if (value instanceof this[this.name]) {
          return value;
        }
        const type = typeof value;
        if (type === "string") {
          if (typeof unit !== "undefined") {
            value = this._parseNumber(value);
            unit = this._findConversion(unit).name;
            return this._instance(value, unit);
          }
          return this._parse(value);
        } else if (type === "number") {
          if (unit) {
            unit = this._findConversion(unit).name;
          }
          return this._instance(value, unit || this.base);
        } else if (type === "object") {
          unit = this._findConversion(value.unit).name;
          return this.create(value.value, unit);
        } else {
          throw new Error("Unable to create value");
        }
      }
      _findConversion(unit, throwErrors = true) {
        const normalized = normalizeUnitName(unit);
        const c = this.units[normalized];
        if (c)
          return c;
        const parsed = this.parsing.unit.exec(normalized);
        if (!parsed) {
          if (throwErrors) {
            throw new Error("Unsupported unit: " + unit);
          } else {
            return null;
          }
        }
        const lastPart = unitToLower(parsed[parsed.length - 1]);
        const hasPrefix = parsed[parsed.length - 2] !== void 0;
        const baseUnit = this.units[lastPart];
        let shortUnit = baseUnit.name;
        let scale = 1;
        if (baseUnit.prefix) {
          if (hasPrefix) {
            const prefix = prefixes[unitToLower(parsed[1])];
            if (!prefix) {
              throw new Error("Unsupported unit, resolved to `" + baseUnit.name + "` but could not parse prefix of full unit: " + unit);
            }
            scale = baseUnit.prefix > 1 ? Math.pow(prefix.scale, baseUnit.prefix) : prefix.scale;
            shortUnit = prefix.name + shortUnit;
          }
        } else {
          if (hasPrefix) {
            if (throwErrors) {
              throw new Error("Unit `" + parsed[parsed.length - 1] + "` does not support prefixes, can not parse: " + unit);
            } else {
              return null;
            }
          }
        }
        if (scale == 1) {
          return baseUnit;
        } else {
          this.units[shortUnit] = {
            name: shortUnit,
            toBase: function(value) {
              return baseUnit.toBase(value * scale);
            },
            fromBase: function(value) {
              return baseUnit.fromBase(value) / scale;
            }
          };
          return this.units[shortUnit];
        }
      }
      convert(value, unit, newUnit) {
        if (unit === newUnit)
          return value;
        let from = this._findConversion(unit);
        let to = this._findConversion(newUnit);
        const base = from.toBase(value);
        return to.fromBase(base);
      }
      convertWithParse(newUnit, value, unit) {
        if (value instanceof this[this.name]) {
          return value.as(unit);
        }
        const type = typeof value;
        if (type === "string") {
          if (typeof unit !== "undefined") {
            value = this._parseNumber(value);
          } else {
            const parsed = this._parse(value);
            value = parsed.value;
            unit = parsed.unit;
          }
        } else if (type === "number") {
          if (unit) {
            unit = this._findConversion(unit);
          } else {
            unit = this.base;
          }
        } else if (type === "object") {
          unit = value.unit;
          value = value.value;
        } else {
          throw new Error("Unable to create value");
        }
        if (typeof unit === "string") {
          unit = this._findConversion(unit);
        }
        if (unit.name === newUnit.name)
          return value;
        const base = unit.toBase(value);
        return newUnit.fromBase(base);
      }
      _parseNumber(value) {
        const parts = this.parsing.single.exec(value);
        if (!parts) {
          throw new Error("Unable to parse " + this.name + ": " + value);
        }
        if (parts[2]) {
          throw new Error("Can not specify unit twice, use either a single string or a number + unit as arguments");
        }
        return parseFloat(parts[1]);
      }
      _parseSingle(value) {
        const parts = this.parsing.single.exec(value);
        if (!parts) {
          throw new Error("Unable to parse " + this.name + ": " + value);
        }
        const number = parts[1];
        let unit = parts[2];
        if (!unit) {
          unit = this.base;
        }
        unit = this._findConversion(unit).name;
        let amount = parseFloat(number);
        if (this.base === "") {
          amount = this.units[unit].toBase(amount);
          unit = "";
        }
        return [amount, unit];
      }
      _parse(value) {
        if (this.multiple) {
          this.parsing.multiple.lastIndex = 0;
          let baseValue = 0;
          let parsed;
          while (parsed = this.parsing.multiple.exec(value)) {
            let v = this._parseSingle(parsed[0]);
            baseValue += this.convert(v[0], v[1], this.base);
          }
          return this._instance(baseValue, this.base);
        } else {
          const v = this._parseSingle(value);
          return this._instance(v[0], v[1]);
        }
      }
      unit(unit) {
        unit = this._findConversion(unit);
        return {
          name: unit.name,
          convert: this.convertWithParse.bind(this, unit)
        };
      }
      listUnits() {
        return this.conversions.map((c, idx) => ({
          name: c.name,
          symbol: c.names[0],
          supportsPrefixes: !!c.prefix,
          isDefault: idx == 0,
          names: c.names
        }));
      }
    };
    var QuantityBuilder = class {
      constructor(name) {
        this.name = name;
        this.conversions = [];
      }
      multiple() {
        this._multiple = true;
        return this;
      }
      base(name, opts) {
        this._base = opts.names;
        this.conversions.push({
          name,
          names: opts.names,
          prefix: opts.prefix || false,
          exposePrefixes: opts.exposePrefixes || [],
          toBase: noop,
          fromBase: noop
        });
        return this;
      }
      add(name, opts) {
        let toBase;
        let fromBase;
        if (opts.scale) {
          toBase = function(value) {
            return value * opts.scale;
          };
          fromBase = function(value) {
            return value / opts.scale;
          };
        } else {
          toBase = opts.toBase;
          fromBase = opts.fromBase;
        }
        this.conversions.push({
          name,
          names: opts.names,
          prefix: opts.prefix || false,
          exposePrefixes: opts.exposePrefixes || [],
          toBase,
          fromBase
        });
        return this;
      }
      build() {
        if (!this._base) {
          this.base("", { names: [""], prefix: true });
        }
        const factory = new Factory(this.name, this.conversions, this._multiple);
        const result = factory.create.bind(factory);
        result.toJSON = function(value) {
          return {
            value: value.value,
            unit: value.unit
          };
        };
        result.is = function(value) {
          return value && factory.name === value["amounts:type"];
        };
        Object.defineProperty(result, "units", {
          get: factory.listUnits.bind(factory)
        });
        result.unit = factory.unit.bind(factory);
        return result;
      }
    };
    module2.exports = function(name) {
      return new QuantityBuilder(name);
    };
  }
});

// node_modules/amounts/lib/amount.js
var require_amount = __commonJS({
  "node_modules/amounts/lib/amount.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("GenericAmount").build();
  }
});

// node_modules/amounts/lib/angle.js
var require_angle = __commonJS({
  "node_modules/amounts/lib/angle.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Angle").base("Degrees", {
      names: ["deg", "degree", "degrees"]
    }).add("Radians", {
      names: ["rad", "radian", "radians"],
      scale: 360 / (2 * Math.PI),
      prefix: true
    }).build();
  }
});

// node_modules/amounts/lib/area.js
var require_area = __commonJS({
  "node_modules/amounts/lib/area.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Area").base("Square metre", {
      names: ["m\xB2", "m^2", "m2", "square metre", "square metres", "square meter", "square meters"],
      prefix: 2,
      exposePrefixes: ["centi", "kilo"]
    }).add("Square inch", {
      names: ["sq in", "square inch", "square inches"],
      scale: 64516e-8
    }).add("Square foot", {
      names: ["sq ft", "square foot", "square feet"],
      scale: 0.092903
    }).add("Square yard", {
      names: ["sq yard", "square yard", "square yards"],
      scale: 0.836127
    }).add("Square mile", {
      names: ["sq mi", "square mile", "square miles"],
      scale: 25899881e-1
    }).add("Hectare", {
      names: ["ha", "hectare", "hectares"],
      scale: 1e4
    }).add("Acre", {
      names: ["acre", "acres"],
      scale: 4046.86
    }).build();
  }
});

// node_modules/amounts/lib/duration.js
var require_duration = __commonJS({
  "node_modules/amounts/lib/duration.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Duration").multiple().base("Milliseconds", {
      names: ["ms", "millisecond", "milliseconds"]
    }).add("Seconds", {
      names: ["s", "second", "seconds"],
      scale: 1e3
    }).add("Minutes", {
      names: ["m", "minute", "minutes"],
      scale: 6e4
    }).add("Hours", {
      names: ["h", "hour", "hours"],
      scale: 6e4 * 60
    }).add("Days", {
      names: ["d", "day", "days"],
      scale: 6e4 * 60 * 24
    }).build();
  }
});

// node_modules/amounts/lib/energy.js
var require_energy = __commonJS({
  "node_modules/amounts/lib/energy.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Energy").base("Joule", {
      names: ["J", "j", "joule", "joules"],
      prefix: true,
      exposePrefixes: ["kilo", "mega"]
    }).add("Watt hour", {
      names: ["Wh", "wh", "watt hour", "watt hours"],
      scale: 3600,
      prefix: true,
      exposePrefixes: ["kilo", "mega"]
    }).build();
  }
});

// node_modules/amounts/lib/illuminance.js
var require_illuminance = __commonJS({
  "node_modules/amounts/lib/illuminance.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Illuminance").base("Lux", {
      names: ["lx", "lux"],
      prefix: true
    }).add("Phot", {
      names: ["ph", "phot"],
      scale: 1e3
    }).add("Nox", {
      names: ["nx", "nox"],
      scale: 1e-3
    }).add("Foot-candle", {
      names: ["fc", "lm/ft\xB2", "ft-c", "foot-candle", "foot-candles", "foot candle", "foot candles"],
      scale: 10.764
    }).build();
  }
});

// node_modules/amounts/lib/length.js
var require_length = __commonJS({
  "node_modules/amounts/lib/length.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Length").base("Meter", {
      names: ["m", "meter", "meters", "metre", "metres"],
      prefix: true,
      exposePrefixes: ["deci", "milli", "centi"]
    }).add("Inch", {
      names: ["in", "inch", "inches"],
      scale: 0.0254
    }).add("Foot", {
      names: ["ft", "foot", "feet"],
      scale: 0.3048
    }).add("Yard", {
      names: ["yd", "yard", "yards"],
      scale: 0.9144
    }).add("Mile", {
      names: ["mi", "mile", "miles"],
      scale: 1609.34
    }).build();
  }
});

// node_modules/amounts/lib/mass.js
var require_mass = __commonJS({
  "node_modules/amounts/lib/mass.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Mass").base("Gram", {
      names: ["g", "gram", "grams", "gramme", "grammes"],
      prefix: true,
      exposePrefixes: ["kilo"]
    }).add("Pound", {
      names: ["lb", "lbs", "pound", "pounds", "#"],
      scale: 453.592
    }).add("Ounce", {
      names: ["oz", "ounce", "ounces"],
      scale: 28.3495
    }).add("Stone", {
      names: ["st", "stone", "stones"],
      scale: 6350.29318
    }).build();
  }
});

// node_modules/amounts/lib/power.js
var require_power = __commonJS({
  "node_modules/amounts/lib/power.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Power").base("Watt", {
      names: ["w", "W", "watt", "watts"],
      prefix: true,
      exposePrefixes: ["kilo", "mega"]
    }).add("Horsepower", {
      names: ["hp", "horsepower", "horsepowers"],
      scale: 745.6998715822702
    }).build();
  }
});

// node_modules/amounts/lib/pressure.js
var require_pressure = __commonJS({
  "node_modules/amounts/lib/pressure.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Pressure").base("Pa", {
      names: ["Pa", "pa", "pascal", "pascals"],
      prefix: true,
      exposePrefixes: ["hecto", "kilo"]
    }).add("atm", {
      names: ["atm", "atmosphere", "atmospheres"],
      scale: 101325
    }).add("bar", {
      names: ["bar", "bars"],
      scale: 1e5
    }).add("psi", {
      names: ["psi", "pounds per square inch", "pound per square inch"],
      scale: 6894.76
    }).add("torr", {
      names: ["torr"],
      scale: 133.322
    }).add("mmHg", {
      names: ["mmHg", "millimetre of mercury", "millimetres of mercury", "millimeter of mercury", "millimeters of mercury"],
      scale: 133.322387415
    }).build();
  }
});

// node_modules/amounts/lib/soundPressureLevel.js
var require_soundPressureLevel = __commonJS({
  "node_modules/amounts/lib/soundPressureLevel.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("SoundPressure").base("Decibel", {
      names: ["dB", "db", "dbs", "decibel", "decibels"],
      prefix: true
    }).build();
  }
});

// node_modules/amounts/lib/speed.js
var require_speed = __commonJS({
  "node_modules/amounts/lib/speed.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Speed").base("Metres per second", {
      names: ["m/s", "mps", "metre per second", "metres per second", "meter per second", "meters per second", "metre/second", "metres/second", "meter/second", "meters/second"],
      prefix: true
    }).add("Kilometres per hour", {
      names: ["km/h", "kph", "kilometre per hour", "kilometres per hour", "kilometer per hour", "kilometers per hour", "kilometre/hour", "kilometres/hour", "kilometer/hour", "kilometers/hour"],
      scale: 1e3 / 3600
    }).add("Miles per hour", {
      names: ["mph", "mile per hour", "miles per hour", "mile/hour", "miles/hour"],
      scale: 0.44704
    }).add("Feet per second", {
      names: ["ft/s", "fps", "foot per second", "feet per second", "foot/second", "feet/second"],
      scale: 0.3048
    }).add("Knot", {
      names: ["kt", "knot", "knots"],
      scale: 0.514444
    }).build();
  }
});

// node_modules/amounts/lib/temperature.js
var require_temperature = __commonJS({
  "node_modules/amounts/lib/temperature.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Temperature").base("Celsius", {
      names: ["C", "c", "\xB0C", "celsius"]
    }).add("Kelvin", {
      names: ["K", "\xB0K", "kelvin", "kelvins"],
      prefix: true,
      toBase: function(value) {
        return value - 273.15;
      },
      fromBase: function(value) {
        return value + 273.15;
      }
    }).add("Fahrenheit", {
      names: ["F", "f", "\xB0F", "fahrenheit", "fahrenheits"],
      toBase: function(value) {
        return (value - 32) * (5 / 9);
      },
      fromBase: function(value) {
        return value * (9 / 5) + 32;
      }
    }).build();
  }
});

// node_modules/amounts/lib/voltage.js
var require_voltage = __commonJS({
  "node_modules/amounts/lib/voltage.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Voltage").base("Volt", {
      names: ["V", "v", "volt", "volts"],
      prefix: true
    }).build();
  }
});

// node_modules/amounts/lib/volume.js
var require_volume = __commonJS({
  "node_modules/amounts/lib/volume.js"(exports, module2) {
    "use strict";
    module2.exports = require_quantity()("Volume").base("Litre", {
      names: ["L", "l", "ltr", "liter", "liters", "litre", "litres"],
      prefix: true,
      exposePrefixes: ["deci", "milli", "centi"]
    }).add("Cubic metre", {
      names: ["m\xB3", "m^3", "m3", "cubic metre", "cubic metres", "cubic meter", "cubic meters"],
      prefix: 3,
      exposesPrefixes: ["centi"],
      scale: 1e3
    }).add("Gallon", {
      names: ["gal", "gallon", "gallons"],
      scale: 3.78541
    }).add("Quart", {
      names: ["qt", "quart", "quarts"],
      scale: 0.946353
    }).add("Pint", {
      names: ["pt", "pint", "pints"],
      scale: 0.373176
    }).add("Cup", {
      names: ["cu", "cup", "cups"],
      scale: 0.236588
    }).add("Fluid ounce", {
      names: ["floz", "oz", "fluid ounce", "ounce", "fluid ounces", "ounces"],
      scale: 0.0295735
    }).add("Tablespoon", {
      names: ["tb", "tbsp", "tbs", "tablespoon", "tablespoons"],
      scale: 0.0147868
    }).add("Teaspoon", {
      names: ["tsp", "teaspoon", "teaspoons"],
      scale: 492892e-8
    }).build();
  }
});

// node_modules/amounts/index.js
var require_amounts = __commonJS({
  "node_modules/amounts/index.js"(exports, module2) {
    "use strict";
    var amount = require_amount();
    var angle = require_angle();
    var area = require_area();
    var duration = require_duration();
    var energy = require_energy();
    var illuminance = require_illuminance();
    var length = require_length();
    var mass = require_mass();
    var power = require_power();
    var pressure = require_pressure();
    var soundPressureLevel = require_soundPressureLevel();
    var speed = require_speed();
    var temperature = require_temperature();
    var voltage = require_voltage();
    var volume = require_volume();
    module2.exports = {
      amount,
      generic: amount,
      area,
      angle,
      duration,
      energy,
      illuminance,
      length,
      mass,
      power,
      pressure,
      soundPressureLevel,
      speed,
      temperature,
      voltage,
      volume
    };
  }
});

// node_modules/color-temperature/index.js
var require_color_temperature = __commonJS({
  "node_modules/color-temperature/index.js"(exports, module2) {
    module2.exports.colorTemperature2rgbUsingTH = colorTemperature2rgbUsingTH = function(kelvin) {
      var temperature = kelvin / 100;
      var red, green, blue;
      if (temperature <= 66) {
        red = 255;
      } else {
        red = temperature - 60;
        red = 329.698727446 * Math.pow(red, -0.1332047592);
        if (red < 0)
          red = 0;
        if (red > 255)
          red = 255;
      }
      if (temperature <= 66) {
        green = temperature;
        green = 99.4708025861 * Math.log(green) - 161.1195681661;
        if (green < 0)
          green = 0;
        if (green > 255)
          green = 255;
      } else {
        green = temperature - 60;
        green = 288.1221695283 * Math.pow(green, -0.0755148492);
        if (green < 0)
          green = 0;
        if (green > 255)
          green = 255;
      }
      if (temperature >= 66) {
        blue = 255;
      } else {
        if (temperature <= 19) {
          blue = 0;
        } else {
          blue = temperature - 10;
          blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
          if (blue < 0)
            blue = 0;
          if (blue > 255)
            blue = 255;
        }
      }
      return { red: Math.round(red), blue: Math.round(blue), green: Math.round(green) };
    };
    module2.exports.colorTemperature2rgb = colorTemperature2rgb = function(kelvin) {
      var temperature = kelvin / 100;
      var red, green, blue;
      if (temperature < 66) {
        red = 255;
      } else {
        red = temperature - 55;
        red = 351.97690566805693 + 0.114206453784165 * red - 40.25366309332127 * Math.log(red);
        if (red < 0)
          red = 0;
        if (red > 255)
          red = 255;
      }
      if (temperature < 66) {
        green = temperature - 2;
        green = -155.25485562709179 - 0.44596950469579133 * green + 104.49216199393888 * Math.log(green);
        if (green < 0)
          green = 0;
        if (green > 255)
          green = 255;
      } else {
        green = temperature - 50;
        green = 325.4494125711974 + 0.07943456536662342 * green - 28.0852963507957 * Math.log(green);
        if (green < 0)
          green = 0;
        if (green > 255)
          green = 255;
      }
      if (temperature >= 66) {
        blue = 255;
      } else {
        if (temperature <= 20) {
          blue = 0;
        } else {
          blue = temperature - 10;
          blue = -254.76935184120902 + 0.8274096064007395 * blue + 115.67994401066147 * Math.log(blue);
          if (blue < 0)
            blue = 0;
          if (blue > 255)
            blue = 255;
        }
      }
      return { red: Math.round(red), blue: Math.round(blue), green: Math.round(green) };
    };
    module2.exports.rgb2colorTemperature = rgb2colorTemperature = function(rgb) {
      var temperature, testRGB;
      var epsilon = 0.4;
      var minTemperature = 1e3;
      var maxTemperature = 4e4;
      while (maxTemperature - minTemperature > epsilon) {
        temperature = (maxTemperature + minTemperature) / 2;
        testRGB = colorTemperature2rgb(temperature);
        if (testRGB.blue / testRGB.red >= rgb.blue / rgb.red) {
          maxTemperature = temperature;
        } else {
          minTemperature = temperature;
        }
      }
      return Math.round(temperature);
    };
  }
});

// node_modules/color-name/index.js
var require_color_name = __commonJS({
  "node_modules/color-name/index.js"(exports, module2) {
    "use strict";
    module2.exports = {
      "aliceblue": [240, 248, 255],
      "antiquewhite": [250, 235, 215],
      "aqua": [0, 255, 255],
      "aquamarine": [127, 255, 212],
      "azure": [240, 255, 255],
      "beige": [245, 245, 220],
      "bisque": [255, 228, 196],
      "black": [0, 0, 0],
      "blanchedalmond": [255, 235, 205],
      "blue": [0, 0, 255],
      "blueviolet": [138, 43, 226],
      "brown": [165, 42, 42],
      "burlywood": [222, 184, 135],
      "cadetblue": [95, 158, 160],
      "chartreuse": [127, 255, 0],
      "chocolate": [210, 105, 30],
      "coral": [255, 127, 80],
      "cornflowerblue": [100, 149, 237],
      "cornsilk": [255, 248, 220],
      "crimson": [220, 20, 60],
      "cyan": [0, 255, 255],
      "darkblue": [0, 0, 139],
      "darkcyan": [0, 139, 139],
      "darkgoldenrod": [184, 134, 11],
      "darkgray": [169, 169, 169],
      "darkgreen": [0, 100, 0],
      "darkgrey": [169, 169, 169],
      "darkkhaki": [189, 183, 107],
      "darkmagenta": [139, 0, 139],
      "darkolivegreen": [85, 107, 47],
      "darkorange": [255, 140, 0],
      "darkorchid": [153, 50, 204],
      "darkred": [139, 0, 0],
      "darksalmon": [233, 150, 122],
      "darkseagreen": [143, 188, 143],
      "darkslateblue": [72, 61, 139],
      "darkslategray": [47, 79, 79],
      "darkslategrey": [47, 79, 79],
      "darkturquoise": [0, 206, 209],
      "darkviolet": [148, 0, 211],
      "deeppink": [255, 20, 147],
      "deepskyblue": [0, 191, 255],
      "dimgray": [105, 105, 105],
      "dimgrey": [105, 105, 105],
      "dodgerblue": [30, 144, 255],
      "firebrick": [178, 34, 34],
      "floralwhite": [255, 250, 240],
      "forestgreen": [34, 139, 34],
      "fuchsia": [255, 0, 255],
      "gainsboro": [220, 220, 220],
      "ghostwhite": [248, 248, 255],
      "gold": [255, 215, 0],
      "goldenrod": [218, 165, 32],
      "gray": [128, 128, 128],
      "green": [0, 128, 0],
      "greenyellow": [173, 255, 47],
      "grey": [128, 128, 128],
      "honeydew": [240, 255, 240],
      "hotpink": [255, 105, 180],
      "indianred": [205, 92, 92],
      "indigo": [75, 0, 130],
      "ivory": [255, 255, 240],
      "khaki": [240, 230, 140],
      "lavender": [230, 230, 250],
      "lavenderblush": [255, 240, 245],
      "lawngreen": [124, 252, 0],
      "lemonchiffon": [255, 250, 205],
      "lightblue": [173, 216, 230],
      "lightcoral": [240, 128, 128],
      "lightcyan": [224, 255, 255],
      "lightgoldenrodyellow": [250, 250, 210],
      "lightgray": [211, 211, 211],
      "lightgreen": [144, 238, 144],
      "lightgrey": [211, 211, 211],
      "lightpink": [255, 182, 193],
      "lightsalmon": [255, 160, 122],
      "lightseagreen": [32, 178, 170],
      "lightskyblue": [135, 206, 250],
      "lightslategray": [119, 136, 153],
      "lightslategrey": [119, 136, 153],
      "lightsteelblue": [176, 196, 222],
      "lightyellow": [255, 255, 224],
      "lime": [0, 255, 0],
      "limegreen": [50, 205, 50],
      "linen": [250, 240, 230],
      "magenta": [255, 0, 255],
      "maroon": [128, 0, 0],
      "mediumaquamarine": [102, 205, 170],
      "mediumblue": [0, 0, 205],
      "mediumorchid": [186, 85, 211],
      "mediumpurple": [147, 112, 219],
      "mediumseagreen": [60, 179, 113],
      "mediumslateblue": [123, 104, 238],
      "mediumspringgreen": [0, 250, 154],
      "mediumturquoise": [72, 209, 204],
      "mediumvioletred": [199, 21, 133],
      "midnightblue": [25, 25, 112],
      "mintcream": [245, 255, 250],
      "mistyrose": [255, 228, 225],
      "moccasin": [255, 228, 181],
      "navajowhite": [255, 222, 173],
      "navy": [0, 0, 128],
      "oldlace": [253, 245, 230],
      "olive": [128, 128, 0],
      "olivedrab": [107, 142, 35],
      "orange": [255, 165, 0],
      "orangered": [255, 69, 0],
      "orchid": [218, 112, 214],
      "palegoldenrod": [238, 232, 170],
      "palegreen": [152, 251, 152],
      "paleturquoise": [175, 238, 238],
      "palevioletred": [219, 112, 147],
      "papayawhip": [255, 239, 213],
      "peachpuff": [255, 218, 185],
      "peru": [205, 133, 63],
      "pink": [255, 192, 203],
      "plum": [221, 160, 221],
      "powderblue": [176, 224, 230],
      "purple": [128, 0, 128],
      "rebeccapurple": [102, 51, 153],
      "red": [255, 0, 0],
      "rosybrown": [188, 143, 143],
      "royalblue": [65, 105, 225],
      "saddlebrown": [139, 69, 19],
      "salmon": [250, 128, 114],
      "sandybrown": [244, 164, 96],
      "seagreen": [46, 139, 87],
      "seashell": [255, 245, 238],
      "sienna": [160, 82, 45],
      "silver": [192, 192, 192],
      "skyblue": [135, 206, 235],
      "slateblue": [106, 90, 205],
      "slategray": [112, 128, 144],
      "slategrey": [112, 128, 144],
      "snow": [255, 250, 250],
      "springgreen": [0, 255, 127],
      "steelblue": [70, 130, 180],
      "tan": [210, 180, 140],
      "teal": [0, 128, 128],
      "thistle": [216, 191, 216],
      "tomato": [255, 99, 71],
      "turquoise": [64, 224, 208],
      "violet": [238, 130, 238],
      "wheat": [245, 222, 179],
      "white": [255, 255, 255],
      "whitesmoke": [245, 245, 245],
      "yellow": [255, 255, 0],
      "yellowgreen": [154, 205, 50]
    };
  }
});

// node_modules/color-convert/conversions.js
var require_conversions = __commonJS({
  "node_modules/color-convert/conversions.js"(exports, module2) {
    var cssKeywords = require_color_name();
    var reverseKeywords = {};
    for (key in cssKeywords) {
      if (cssKeywords.hasOwnProperty(key)) {
        reverseKeywords[cssKeywords[key]] = key;
      }
    }
    var key;
    var convert = module2.exports = {
      rgb: { channels: 3, labels: "rgb" },
      hsl: { channels: 3, labels: "hsl" },
      hsv: { channels: 3, labels: "hsv" },
      hwb: { channels: 3, labels: "hwb" },
      cmyk: { channels: 4, labels: "cmyk" },
      xyz: { channels: 3, labels: "xyz" },
      lab: { channels: 3, labels: "lab" },
      lch: { channels: 3, labels: "lch" },
      hex: { channels: 1, labels: ["hex"] },
      keyword: { channels: 1, labels: ["keyword"] },
      ansi16: { channels: 1, labels: ["ansi16"] },
      ansi256: { channels: 1, labels: ["ansi256"] },
      hcg: { channels: 3, labels: ["h", "c", "g"] },
      apple: { channels: 3, labels: ["r16", "g16", "b16"] },
      gray: { channels: 1, labels: ["gray"] }
    };
    for (model in convert) {
      if (convert.hasOwnProperty(model)) {
        if (!("channels" in convert[model])) {
          throw new Error("missing channels property: " + model);
        }
        if (!("labels" in convert[model])) {
          throw new Error("missing channel labels property: " + model);
        }
        if (convert[model].labels.length !== convert[model].channels) {
          throw new Error("channel and label counts mismatch: " + model);
        }
        channels = convert[model].channels;
        labels = convert[model].labels;
        delete convert[model].channels;
        delete convert[model].labels;
        Object.defineProperty(convert[model], "channels", { value: channels });
        Object.defineProperty(convert[model], "labels", { value: labels });
      }
    }
    var channels;
    var labels;
    var model;
    convert.rgb.hsl = function(rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      var min = Math.min(r, g, b);
      var max = Math.max(r, g, b);
      var delta = max - min;
      var h;
      var s;
      var l;
      if (max === min) {
        h = 0;
      } else if (r === max) {
        h = (g - b) / delta;
      } else if (g === max) {
        h = 2 + (b - r) / delta;
      } else if (b === max) {
        h = 4 + (r - g) / delta;
      }
      h = Math.min(h * 60, 360);
      if (h < 0) {
        h += 360;
      }
      l = (min + max) / 2;
      if (max === min) {
        s = 0;
      } else if (l <= 0.5) {
        s = delta / (max + min);
      } else {
        s = delta / (2 - max - min);
      }
      return [h, s * 100, l * 100];
    };
    convert.rgb.hsv = function(rgb) {
      var rdif;
      var gdif;
      var bdif;
      var h;
      var s;
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      var v = Math.max(r, g, b);
      var diff = v - Math.min(r, g, b);
      var diffc = function(c) {
        return (v - c) / 6 / diff + 1 / 2;
      };
      if (diff === 0) {
        h = s = 0;
      } else {
        s = diff / v;
        rdif = diffc(r);
        gdif = diffc(g);
        bdif = diffc(b);
        if (r === v) {
          h = bdif - gdif;
        } else if (g === v) {
          h = 1 / 3 + rdif - bdif;
        } else if (b === v) {
          h = 2 / 3 + gdif - rdif;
        }
        if (h < 0) {
          h += 1;
        } else if (h > 1) {
          h -= 1;
        }
      }
      return [
        h * 360,
        s * 100,
        v * 100
      ];
    };
    convert.rgb.hwb = function(rgb) {
      var r = rgb[0];
      var g = rgb[1];
      var b = rgb[2];
      var h = convert.rgb.hsl(rgb)[0];
      var w = 1 / 255 * Math.min(r, Math.min(g, b));
      b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
      return [h, w * 100, b * 100];
    };
    convert.rgb.cmyk = function(rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      var c;
      var m;
      var y;
      var k;
      k = Math.min(1 - r, 1 - g, 1 - b);
      c = (1 - r - k) / (1 - k) || 0;
      m = (1 - g - k) / (1 - k) || 0;
      y = (1 - b - k) / (1 - k) || 0;
      return [c * 100, m * 100, y * 100, k * 100];
    };
    function comparativeDistance(x, y) {
      return Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2);
    }
    convert.rgb.keyword = function(rgb) {
      var reversed = reverseKeywords[rgb];
      if (reversed) {
        return reversed;
      }
      var currentClosestDistance = Infinity;
      var currentClosestKeyword;
      for (var keyword in cssKeywords) {
        if (cssKeywords.hasOwnProperty(keyword)) {
          var value = cssKeywords[keyword];
          var distance = comparativeDistance(rgb, value);
          if (distance < currentClosestDistance) {
            currentClosestDistance = distance;
            currentClosestKeyword = keyword;
          }
        }
      }
      return currentClosestKeyword;
    };
    convert.keyword.rgb = function(keyword) {
      return cssKeywords[keyword];
    };
    convert.rgb.xyz = function(rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
      g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
      b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
      var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
      var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
      var z = r * 0.0193 + g * 0.1192 + b * 0.9505;
      return [x * 100, y * 100, z * 100];
    };
    convert.rgb.lab = function(rgb) {
      var xyz = convert.rgb.xyz(rgb);
      var x = xyz[0];
      var y = xyz[1];
      var z = xyz[2];
      var l;
      var a;
      var b;
      x /= 95.047;
      y /= 100;
      z /= 108.883;
      x = x > 8856e-6 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
      l = 116 * y - 16;
      a = 500 * (x - y);
      b = 200 * (y - z);
      return [l, a, b];
    };
    convert.hsl.rgb = function(hsl) {
      var h = hsl[0] / 360;
      var s = hsl[1] / 100;
      var l = hsl[2] / 100;
      var t1;
      var t2;
      var t3;
      var rgb;
      var val;
      if (s === 0) {
        val = l * 255;
        return [val, val, val];
      }
      if (l < 0.5) {
        t2 = l * (1 + s);
      } else {
        t2 = l + s - l * s;
      }
      t1 = 2 * l - t2;
      rgb = [0, 0, 0];
      for (var i = 0; i < 3; i++) {
        t3 = h + 1 / 3 * -(i - 1);
        if (t3 < 0) {
          t3++;
        }
        if (t3 > 1) {
          t3--;
        }
        if (6 * t3 < 1) {
          val = t1 + (t2 - t1) * 6 * t3;
        } else if (2 * t3 < 1) {
          val = t2;
        } else if (3 * t3 < 2) {
          val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
        } else {
          val = t1;
        }
        rgb[i] = val * 255;
      }
      return rgb;
    };
    convert.hsl.hsv = function(hsl) {
      var h = hsl[0];
      var s = hsl[1] / 100;
      var l = hsl[2] / 100;
      var smin = s;
      var lmin = Math.max(l, 0.01);
      var sv;
      var v;
      l *= 2;
      s *= l <= 1 ? l : 2 - l;
      smin *= lmin <= 1 ? lmin : 2 - lmin;
      v = (l + s) / 2;
      sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
      return [h, sv * 100, v * 100];
    };
    convert.hsv.rgb = function(hsv) {
      var h = hsv[0] / 60;
      var s = hsv[1] / 100;
      var v = hsv[2] / 100;
      var hi = Math.floor(h) % 6;
      var f = h - Math.floor(h);
      var p = 255 * v * (1 - s);
      var q = 255 * v * (1 - s * f);
      var t = 255 * v * (1 - s * (1 - f));
      v *= 255;
      switch (hi) {
        case 0:
          return [v, t, p];
        case 1:
          return [q, v, p];
        case 2:
          return [p, v, t];
        case 3:
          return [p, q, v];
        case 4:
          return [t, p, v];
        case 5:
          return [v, p, q];
      }
    };
    convert.hsv.hsl = function(hsv) {
      var h = hsv[0];
      var s = hsv[1] / 100;
      var v = hsv[2] / 100;
      var vmin = Math.max(v, 0.01);
      var lmin;
      var sl;
      var l;
      l = (2 - s) * v;
      lmin = (2 - s) * vmin;
      sl = s * vmin;
      sl /= lmin <= 1 ? lmin : 2 - lmin;
      sl = sl || 0;
      l /= 2;
      return [h, sl * 100, l * 100];
    };
    convert.hwb.rgb = function(hwb) {
      var h = hwb[0] / 360;
      var wh = hwb[1] / 100;
      var bl = hwb[2] / 100;
      var ratio = wh + bl;
      var i;
      var v;
      var f;
      var n;
      if (ratio > 1) {
        wh /= ratio;
        bl /= ratio;
      }
      i = Math.floor(6 * h);
      v = 1 - bl;
      f = 6 * h - i;
      if ((i & 1) !== 0) {
        f = 1 - f;
      }
      n = wh + f * (v - wh);
      var r;
      var g;
      var b;
      switch (i) {
        default:
        case 6:
        case 0:
          r = v;
          g = n;
          b = wh;
          break;
        case 1:
          r = n;
          g = v;
          b = wh;
          break;
        case 2:
          r = wh;
          g = v;
          b = n;
          break;
        case 3:
          r = wh;
          g = n;
          b = v;
          break;
        case 4:
          r = n;
          g = wh;
          b = v;
          break;
        case 5:
          r = v;
          g = wh;
          b = n;
          break;
      }
      return [r * 255, g * 255, b * 255];
    };
    convert.cmyk.rgb = function(cmyk) {
      var c = cmyk[0] / 100;
      var m = cmyk[1] / 100;
      var y = cmyk[2] / 100;
      var k = cmyk[3] / 100;
      var r;
      var g;
      var b;
      r = 1 - Math.min(1, c * (1 - k) + k);
      g = 1 - Math.min(1, m * (1 - k) + k);
      b = 1 - Math.min(1, y * (1 - k) + k);
      return [r * 255, g * 255, b * 255];
    };
    convert.xyz.rgb = function(xyz) {
      var x = xyz[0] / 100;
      var y = xyz[1] / 100;
      var z = xyz[2] / 100;
      var r;
      var g;
      var b;
      r = x * 3.2406 + y * -1.5372 + z * -0.4986;
      g = x * -0.9689 + y * 1.8758 + z * 0.0415;
      b = x * 0.0557 + y * -0.204 + z * 1.057;
      r = r > 31308e-7 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : r * 12.92;
      g = g > 31308e-7 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : g * 12.92;
      b = b > 31308e-7 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : b * 12.92;
      r = Math.min(Math.max(0, r), 1);
      g = Math.min(Math.max(0, g), 1);
      b = Math.min(Math.max(0, b), 1);
      return [r * 255, g * 255, b * 255];
    };
    convert.xyz.lab = function(xyz) {
      var x = xyz[0];
      var y = xyz[1];
      var z = xyz[2];
      var l;
      var a;
      var b;
      x /= 95.047;
      y /= 100;
      z /= 108.883;
      x = x > 8856e-6 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
      l = 116 * y - 16;
      a = 500 * (x - y);
      b = 200 * (y - z);
      return [l, a, b];
    };
    convert.lab.xyz = function(lab) {
      var l = lab[0];
      var a = lab[1];
      var b = lab[2];
      var x;
      var y;
      var z;
      y = (l + 16) / 116;
      x = a / 500 + y;
      z = y - b / 200;
      var y2 = Math.pow(y, 3);
      var x2 = Math.pow(x, 3);
      var z2 = Math.pow(z, 3);
      y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
      x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
      z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
      x *= 95.047;
      y *= 100;
      z *= 108.883;
      return [x, y, z];
    };
    convert.lab.lch = function(lab) {
      var l = lab[0];
      var a = lab[1];
      var b = lab[2];
      var hr;
      var h;
      var c;
      hr = Math.atan2(b, a);
      h = hr * 360 / 2 / Math.PI;
      if (h < 0) {
        h += 360;
      }
      c = Math.sqrt(a * a + b * b);
      return [l, c, h];
    };
    convert.lch.lab = function(lch) {
      var l = lch[0];
      var c = lch[1];
      var h = lch[2];
      var a;
      var b;
      var hr;
      hr = h / 360 * 2 * Math.PI;
      a = c * Math.cos(hr);
      b = c * Math.sin(hr);
      return [l, a, b];
    };
    convert.rgb.ansi16 = function(args) {
      var r = args[0];
      var g = args[1];
      var b = args[2];
      var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2];
      value = Math.round(value / 50);
      if (value === 0) {
        return 30;
      }
      var ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
      if (value === 2) {
        ansi += 60;
      }
      return ansi;
    };
    convert.hsv.ansi16 = function(args) {
      return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
    };
    convert.rgb.ansi256 = function(args) {
      var r = args[0];
      var g = args[1];
      var b = args[2];
      if (r === g && g === b) {
        if (r < 8) {
          return 16;
        }
        if (r > 248) {
          return 231;
        }
        return Math.round((r - 8) / 247 * 24) + 232;
      }
      var ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
      return ansi;
    };
    convert.ansi16.rgb = function(args) {
      var color = args % 10;
      if (color === 0 || color === 7) {
        if (args > 50) {
          color += 3.5;
        }
        color = color / 10.5 * 255;
        return [color, color, color];
      }
      var mult = (~~(args > 50) + 1) * 0.5;
      var r = (color & 1) * mult * 255;
      var g = (color >> 1 & 1) * mult * 255;
      var b = (color >> 2 & 1) * mult * 255;
      return [r, g, b];
    };
    convert.ansi256.rgb = function(args) {
      if (args >= 232) {
        var c = (args - 232) * 10 + 8;
        return [c, c, c];
      }
      args -= 16;
      var rem;
      var r = Math.floor(args / 36) / 5 * 255;
      var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
      var b = rem % 6 / 5 * 255;
      return [r, g, b];
    };
    convert.rgb.hex = function(args) {
      var integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
      var string = integer.toString(16).toUpperCase();
      return "000000".substring(string.length) + string;
    };
    convert.hex.rgb = function(args) {
      var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
      if (!match) {
        return [0, 0, 0];
      }
      var colorString = match[0];
      if (match[0].length === 3) {
        colorString = colorString.split("").map(function(char) {
          return char + char;
        }).join("");
      }
      var integer = parseInt(colorString, 16);
      var r = integer >> 16 & 255;
      var g = integer >> 8 & 255;
      var b = integer & 255;
      return [r, g, b];
    };
    convert.rgb.hcg = function(rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      var max = Math.max(Math.max(r, g), b);
      var min = Math.min(Math.min(r, g), b);
      var chroma = max - min;
      var grayscale;
      var hue;
      if (chroma < 1) {
        grayscale = min / (1 - chroma);
      } else {
        grayscale = 0;
      }
      if (chroma <= 0) {
        hue = 0;
      } else if (max === r) {
        hue = (g - b) / chroma % 6;
      } else if (max === g) {
        hue = 2 + (b - r) / chroma;
      } else {
        hue = 4 + (r - g) / chroma + 4;
      }
      hue /= 6;
      hue %= 1;
      return [hue * 360, chroma * 100, grayscale * 100];
    };
    convert.hsl.hcg = function(hsl) {
      var s = hsl[1] / 100;
      var l = hsl[2] / 100;
      var c = 1;
      var f = 0;
      if (l < 0.5) {
        c = 2 * s * l;
      } else {
        c = 2 * s * (1 - l);
      }
      if (c < 1) {
        f = (l - 0.5 * c) / (1 - c);
      }
      return [hsl[0], c * 100, f * 100];
    };
    convert.hsv.hcg = function(hsv) {
      var s = hsv[1] / 100;
      var v = hsv[2] / 100;
      var c = s * v;
      var f = 0;
      if (c < 1) {
        f = (v - c) / (1 - c);
      }
      return [hsv[0], c * 100, f * 100];
    };
    convert.hcg.rgb = function(hcg) {
      var h = hcg[0] / 360;
      var c = hcg[1] / 100;
      var g = hcg[2] / 100;
      if (c === 0) {
        return [g * 255, g * 255, g * 255];
      }
      var pure = [0, 0, 0];
      var hi = h % 1 * 6;
      var v = hi % 1;
      var w = 1 - v;
      var mg = 0;
      switch (Math.floor(hi)) {
        case 0:
          pure[0] = 1;
          pure[1] = v;
          pure[2] = 0;
          break;
        case 1:
          pure[0] = w;
          pure[1] = 1;
          pure[2] = 0;
          break;
        case 2:
          pure[0] = 0;
          pure[1] = 1;
          pure[2] = v;
          break;
        case 3:
          pure[0] = 0;
          pure[1] = w;
          pure[2] = 1;
          break;
        case 4:
          pure[0] = v;
          pure[1] = 0;
          pure[2] = 1;
          break;
        default:
          pure[0] = 1;
          pure[1] = 0;
          pure[2] = w;
      }
      mg = (1 - c) * g;
      return [
        (c * pure[0] + mg) * 255,
        (c * pure[1] + mg) * 255,
        (c * pure[2] + mg) * 255
      ];
    };
    convert.hcg.hsv = function(hcg) {
      var c = hcg[1] / 100;
      var g = hcg[2] / 100;
      var v = c + g * (1 - c);
      var f = 0;
      if (v > 0) {
        f = c / v;
      }
      return [hcg[0], f * 100, v * 100];
    };
    convert.hcg.hsl = function(hcg) {
      var c = hcg[1] / 100;
      var g = hcg[2] / 100;
      var l = g * (1 - c) + 0.5 * c;
      var s = 0;
      if (l > 0 && l < 0.5) {
        s = c / (2 * l);
      } else if (l >= 0.5 && l < 1) {
        s = c / (2 * (1 - l));
      }
      return [hcg[0], s * 100, l * 100];
    };
    convert.hcg.hwb = function(hcg) {
      var c = hcg[1] / 100;
      var g = hcg[2] / 100;
      var v = c + g * (1 - c);
      return [hcg[0], (v - c) * 100, (1 - v) * 100];
    };
    convert.hwb.hcg = function(hwb) {
      var w = hwb[1] / 100;
      var b = hwb[2] / 100;
      var v = 1 - b;
      var c = v - w;
      var g = 0;
      if (c < 1) {
        g = (v - c) / (1 - c);
      }
      return [hwb[0], c * 100, g * 100];
    };
    convert.apple.rgb = function(apple) {
      return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
    };
    convert.rgb.apple = function(rgb) {
      return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
    };
    convert.gray.rgb = function(args) {
      return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
    };
    convert.gray.hsl = convert.gray.hsv = function(args) {
      return [0, 0, args[0]];
    };
    convert.gray.hwb = function(gray) {
      return [0, 100, gray[0]];
    };
    convert.gray.cmyk = function(gray) {
      return [0, 0, 0, gray[0]];
    };
    convert.gray.lab = function(gray) {
      return [gray[0], 0, 0];
    };
    convert.gray.hex = function(gray) {
      var val = Math.round(gray[0] / 100 * 255) & 255;
      var integer = (val << 16) + (val << 8) + val;
      var string = integer.toString(16).toUpperCase();
      return "000000".substring(string.length) + string;
    };
    convert.rgb.gray = function(rgb) {
      var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
      return [val / 255 * 100];
    };
  }
});

// node_modules/color-convert/route.js
var require_route = __commonJS({
  "node_modules/color-convert/route.js"(exports, module2) {
    var conversions = require_conversions();
    function buildGraph() {
      var graph = {};
      var models = Object.keys(conversions);
      for (var len = models.length, i = 0; i < len; i++) {
        graph[models[i]] = {
          distance: -1,
          parent: null
        };
      }
      return graph;
    }
    function deriveBFS(fromModel) {
      var graph = buildGraph();
      var queue = [fromModel];
      graph[fromModel].distance = 0;
      while (queue.length) {
        var current = queue.pop();
        var adjacents = Object.keys(conversions[current]);
        for (var len = adjacents.length, i = 0; i < len; i++) {
          var adjacent = adjacents[i];
          var node = graph[adjacent];
          if (node.distance === -1) {
            node.distance = graph[current].distance + 1;
            node.parent = current;
            queue.unshift(adjacent);
          }
        }
      }
      return graph;
    }
    function link(from, to) {
      return function(args) {
        return to(from(args));
      };
    }
    function wrapConversion(toModel, graph) {
      var path = [graph[toModel].parent, toModel];
      var fn = conversions[graph[toModel].parent][toModel];
      var cur = graph[toModel].parent;
      while (graph[cur].parent) {
        path.unshift(graph[cur].parent);
        fn = link(conversions[graph[cur].parent][cur], fn);
        cur = graph[cur].parent;
      }
      fn.conversion = path;
      return fn;
    }
    module2.exports = function(fromModel) {
      var graph = deriveBFS(fromModel);
      var conversion = {};
      var models = Object.keys(graph);
      for (var len = models.length, i = 0; i < len; i++) {
        var toModel = models[i];
        var node = graph[toModel];
        if (node.parent === null) {
          continue;
        }
        conversion[toModel] = wrapConversion(toModel, graph);
      }
      return conversion;
    };
  }
});

// node_modules/color-convert/index.js
var require_color_convert = __commonJS({
  "node_modules/color-convert/index.js"(exports, module2) {
    var conversions = require_conversions();
    var route = require_route();
    var convert = {};
    var models = Object.keys(conversions);
    function wrapRaw(fn) {
      var wrappedFn = function(args) {
        if (args === void 0 || args === null) {
          return args;
        }
        if (arguments.length > 1) {
          args = Array.prototype.slice.call(arguments);
        }
        return fn(args);
      };
      if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
      }
      return wrappedFn;
    }
    function wrapRounded(fn) {
      var wrappedFn = function(args) {
        if (args === void 0 || args === null) {
          return args;
        }
        if (arguments.length > 1) {
          args = Array.prototype.slice.call(arguments);
        }
        var result = fn(args);
        if (typeof result === "object") {
          for (var len = result.length, i = 0; i < len; i++) {
            result[i] = Math.round(result[i]);
          }
        }
        return result;
      };
      if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
      }
      return wrappedFn;
    }
    models.forEach(function(fromModel) {
      convert[fromModel] = {};
      Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
      Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
      var routes = route(fromModel);
      var routeModels = Object.keys(routes);
      routeModels.forEach(function(toModel) {
        var fn = routes[toModel];
        convert[fromModel][toModel] = wrapRounded(fn);
        convert[fromModel][toModel].raw = wrapRaw(fn);
      });
    });
    module2.exports = convert;
  }
});

// node_modules/color-string/node_modules/color-name/index.js
var require_color_name2 = __commonJS({
  "node_modules/color-string/node_modules/color-name/index.js"(exports, module2) {
    "use strict";
    module2.exports = {
      "aliceblue": [240, 248, 255],
      "antiquewhite": [250, 235, 215],
      "aqua": [0, 255, 255],
      "aquamarine": [127, 255, 212],
      "azure": [240, 255, 255],
      "beige": [245, 245, 220],
      "bisque": [255, 228, 196],
      "black": [0, 0, 0],
      "blanchedalmond": [255, 235, 205],
      "blue": [0, 0, 255],
      "blueviolet": [138, 43, 226],
      "brown": [165, 42, 42],
      "burlywood": [222, 184, 135],
      "cadetblue": [95, 158, 160],
      "chartreuse": [127, 255, 0],
      "chocolate": [210, 105, 30],
      "coral": [255, 127, 80],
      "cornflowerblue": [100, 149, 237],
      "cornsilk": [255, 248, 220],
      "crimson": [220, 20, 60],
      "cyan": [0, 255, 255],
      "darkblue": [0, 0, 139],
      "darkcyan": [0, 139, 139],
      "darkgoldenrod": [184, 134, 11],
      "darkgray": [169, 169, 169],
      "darkgreen": [0, 100, 0],
      "darkgrey": [169, 169, 169],
      "darkkhaki": [189, 183, 107],
      "darkmagenta": [139, 0, 139],
      "darkolivegreen": [85, 107, 47],
      "darkorange": [255, 140, 0],
      "darkorchid": [153, 50, 204],
      "darkred": [139, 0, 0],
      "darksalmon": [233, 150, 122],
      "darkseagreen": [143, 188, 143],
      "darkslateblue": [72, 61, 139],
      "darkslategray": [47, 79, 79],
      "darkslategrey": [47, 79, 79],
      "darkturquoise": [0, 206, 209],
      "darkviolet": [148, 0, 211],
      "deeppink": [255, 20, 147],
      "deepskyblue": [0, 191, 255],
      "dimgray": [105, 105, 105],
      "dimgrey": [105, 105, 105],
      "dodgerblue": [30, 144, 255],
      "firebrick": [178, 34, 34],
      "floralwhite": [255, 250, 240],
      "forestgreen": [34, 139, 34],
      "fuchsia": [255, 0, 255],
      "gainsboro": [220, 220, 220],
      "ghostwhite": [248, 248, 255],
      "gold": [255, 215, 0],
      "goldenrod": [218, 165, 32],
      "gray": [128, 128, 128],
      "green": [0, 128, 0],
      "greenyellow": [173, 255, 47],
      "grey": [128, 128, 128],
      "honeydew": [240, 255, 240],
      "hotpink": [255, 105, 180],
      "indianred": [205, 92, 92],
      "indigo": [75, 0, 130],
      "ivory": [255, 255, 240],
      "khaki": [240, 230, 140],
      "lavender": [230, 230, 250],
      "lavenderblush": [255, 240, 245],
      "lawngreen": [124, 252, 0],
      "lemonchiffon": [255, 250, 205],
      "lightblue": [173, 216, 230],
      "lightcoral": [240, 128, 128],
      "lightcyan": [224, 255, 255],
      "lightgoldenrodyellow": [250, 250, 210],
      "lightgray": [211, 211, 211],
      "lightgreen": [144, 238, 144],
      "lightgrey": [211, 211, 211],
      "lightpink": [255, 182, 193],
      "lightsalmon": [255, 160, 122],
      "lightseagreen": [32, 178, 170],
      "lightskyblue": [135, 206, 250],
      "lightslategray": [119, 136, 153],
      "lightslategrey": [119, 136, 153],
      "lightsteelblue": [176, 196, 222],
      "lightyellow": [255, 255, 224],
      "lime": [0, 255, 0],
      "limegreen": [50, 205, 50],
      "linen": [250, 240, 230],
      "magenta": [255, 0, 255],
      "maroon": [128, 0, 0],
      "mediumaquamarine": [102, 205, 170],
      "mediumblue": [0, 0, 205],
      "mediumorchid": [186, 85, 211],
      "mediumpurple": [147, 112, 219],
      "mediumseagreen": [60, 179, 113],
      "mediumslateblue": [123, 104, 238],
      "mediumspringgreen": [0, 250, 154],
      "mediumturquoise": [72, 209, 204],
      "mediumvioletred": [199, 21, 133],
      "midnightblue": [25, 25, 112],
      "mintcream": [245, 255, 250],
      "mistyrose": [255, 228, 225],
      "moccasin": [255, 228, 181],
      "navajowhite": [255, 222, 173],
      "navy": [0, 0, 128],
      "oldlace": [253, 245, 230],
      "olive": [128, 128, 0],
      "olivedrab": [107, 142, 35],
      "orange": [255, 165, 0],
      "orangered": [255, 69, 0],
      "orchid": [218, 112, 214],
      "palegoldenrod": [238, 232, 170],
      "palegreen": [152, 251, 152],
      "paleturquoise": [175, 238, 238],
      "palevioletred": [219, 112, 147],
      "papayawhip": [255, 239, 213],
      "peachpuff": [255, 218, 185],
      "peru": [205, 133, 63],
      "pink": [255, 192, 203],
      "plum": [221, 160, 221],
      "powderblue": [176, 224, 230],
      "purple": [128, 0, 128],
      "rebeccapurple": [102, 51, 153],
      "red": [255, 0, 0],
      "rosybrown": [188, 143, 143],
      "royalblue": [65, 105, 225],
      "saddlebrown": [139, 69, 19],
      "salmon": [250, 128, 114],
      "sandybrown": [244, 164, 96],
      "seagreen": [46, 139, 87],
      "seashell": [255, 245, 238],
      "sienna": [160, 82, 45],
      "silver": [192, 192, 192],
      "skyblue": [135, 206, 235],
      "slateblue": [106, 90, 205],
      "slategray": [112, 128, 144],
      "slategrey": [112, 128, 144],
      "snow": [255, 250, 250],
      "springgreen": [0, 255, 127],
      "steelblue": [70, 130, 180],
      "tan": [210, 180, 140],
      "teal": [0, 128, 128],
      "thistle": [216, 191, 216],
      "tomato": [255, 99, 71],
      "turquoise": [64, 224, 208],
      "violet": [238, 130, 238],
      "wheat": [245, 222, 179],
      "white": [255, 255, 255],
      "whitesmoke": [245, 245, 245],
      "yellow": [255, 255, 0],
      "yellowgreen": [154, 205, 50]
    };
  }
});

// node_modules/is-arrayish/index.js
var require_is_arrayish = __commonJS({
  "node_modules/is-arrayish/index.js"(exports, module2) {
    module2.exports = function isArrayish(obj) {
      if (!obj || typeof obj === "string") {
        return false;
      }
      return obj instanceof Array || Array.isArray(obj) || obj.length >= 0 && (obj.splice instanceof Function || Object.getOwnPropertyDescriptor(obj, obj.length - 1) && obj.constructor.name !== "String");
    };
  }
});

// node_modules/simple-swizzle/index.js
var require_simple_swizzle = __commonJS({
  "node_modules/simple-swizzle/index.js"(exports, module2) {
    "use strict";
    var isArrayish = require_is_arrayish();
    var concat = Array.prototype.concat;
    var slice = Array.prototype.slice;
    var swizzle = module2.exports = function swizzle2(args) {
      var results = [];
      for (var i = 0, len = args.length; i < len; i++) {
        var arg = args[i];
        if (isArrayish(arg)) {
          results = concat.call(results, slice.call(arg));
        } else {
          results.push(arg);
        }
      }
      return results;
    };
    swizzle.wrap = function(fn) {
      return function() {
        return fn(swizzle(arguments));
      };
    };
  }
});

// node_modules/color-string/index.js
var require_color_string = __commonJS({
  "node_modules/color-string/index.js"(exports, module2) {
    var colorNames = require_color_name2();
    var swizzle = require_simple_swizzle();
    var hasOwnProperty = Object.hasOwnProperty;
    var reverseNames = {};
    for (name in colorNames) {
      if (hasOwnProperty.call(colorNames, name)) {
        reverseNames[colorNames[name]] = name;
      }
    }
    var name;
    var cs = module2.exports = {
      to: {},
      get: {}
    };
    cs.get = function(string) {
      var prefix = string.substring(0, 3).toLowerCase();
      var val;
      var model;
      switch (prefix) {
        case "hsl":
          val = cs.get.hsl(string);
          model = "hsl";
          break;
        case "hwb":
          val = cs.get.hwb(string);
          model = "hwb";
          break;
        default:
          val = cs.get.rgb(string);
          model = "rgb";
          break;
      }
      if (!val) {
        return null;
      }
      return { model, value: val };
    };
    cs.get.rgb = function(string) {
      if (!string) {
        return null;
      }
      var abbr = /^#([a-f0-9]{3,4})$/i;
      var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
      var rgba = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
      var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
      var keyword = /^(\w+)$/;
      var rgb = [0, 0, 0, 1];
      var match;
      var i;
      var hexAlpha;
      if (match = string.match(hex)) {
        hexAlpha = match[2];
        match = match[1];
        for (i = 0; i < 3; i++) {
          var i2 = i * 2;
          rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
        }
        if (hexAlpha) {
          rgb[3] = parseInt(hexAlpha, 16) / 255;
        }
      } else if (match = string.match(abbr)) {
        match = match[1];
        hexAlpha = match[3];
        for (i = 0; i < 3; i++) {
          rgb[i] = parseInt(match[i] + match[i], 16);
        }
        if (hexAlpha) {
          rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
        }
      } else if (match = string.match(rgba)) {
        for (i = 0; i < 3; i++) {
          rgb[i] = parseInt(match[i + 1], 0);
        }
        if (match[4]) {
          if (match[5]) {
            rgb[3] = parseFloat(match[4]) * 0.01;
          } else {
            rgb[3] = parseFloat(match[4]);
          }
        }
      } else if (match = string.match(per)) {
        for (i = 0; i < 3; i++) {
          rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
        }
        if (match[4]) {
          if (match[5]) {
            rgb[3] = parseFloat(match[4]) * 0.01;
          } else {
            rgb[3] = parseFloat(match[4]);
          }
        }
      } else if (match = string.match(keyword)) {
        if (match[1] === "transparent") {
          return [0, 0, 0, 0];
        }
        if (!hasOwnProperty.call(colorNames, match[1])) {
          return null;
        }
        rgb = colorNames[match[1]];
        rgb[3] = 1;
        return rgb;
      } else {
        return null;
      }
      for (i = 0; i < 3; i++) {
        rgb[i] = clamp(rgb[i], 0, 255);
      }
      rgb[3] = clamp(rgb[3], 0, 1);
      return rgb;
    };
    cs.get.hsl = function(string) {
      if (!string) {
        return null;
      }
      var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
      var match = string.match(hsl);
      if (match) {
        var alpha = parseFloat(match[4]);
        var h = (parseFloat(match[1]) % 360 + 360) % 360;
        var s = clamp(parseFloat(match[2]), 0, 100);
        var l = clamp(parseFloat(match[3]), 0, 100);
        var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
        return [h, s, l, a];
      }
      return null;
    };
    cs.get.hwb = function(string) {
      if (!string) {
        return null;
      }
      var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
      var match = string.match(hwb);
      if (match) {
        var alpha = parseFloat(match[4]);
        var h = (parseFloat(match[1]) % 360 + 360) % 360;
        var w = clamp(parseFloat(match[2]), 0, 100);
        var b = clamp(parseFloat(match[3]), 0, 100);
        var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
        return [h, w, b, a];
      }
      return null;
    };
    cs.to.hex = function() {
      var rgba = swizzle(arguments);
      return "#" + hexDouble(rgba[0]) + hexDouble(rgba[1]) + hexDouble(rgba[2]) + (rgba[3] < 1 ? hexDouble(Math.round(rgba[3] * 255)) : "");
    };
    cs.to.rgb = function() {
      var rgba = swizzle(arguments);
      return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ")" : "rgba(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ", " + rgba[3] + ")";
    };
    cs.to.rgb.percent = function() {
      var rgba = swizzle(arguments);
      var r = Math.round(rgba[0] / 255 * 100);
      var g = Math.round(rgba[1] / 255 * 100);
      var b = Math.round(rgba[2] / 255 * 100);
      return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + r + "%, " + g + "%, " + b + "%)" : "rgba(" + r + "%, " + g + "%, " + b + "%, " + rgba[3] + ")";
    };
    cs.to.hsl = function() {
      var hsla = swizzle(arguments);
      return hsla.length < 4 || hsla[3] === 1 ? "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)" : "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, " + hsla[3] + ")";
    };
    cs.to.hwb = function() {
      var hwba = swizzle(arguments);
      var a = "";
      if (hwba.length >= 4 && hwba[3] !== 1) {
        a = ", " + hwba[3];
      }
      return "hwb(" + hwba[0] + ", " + hwba[1] + "%, " + hwba[2] + "%" + a + ")";
    };
    cs.to.keyword = function(rgb) {
      return reverseNames[rgb.slice(0, 3)];
    };
    function clamp(num, min, max) {
      return Math.min(Math.max(min, num), max);
    }
    function hexDouble(num) {
      var str = Math.round(num).toString(16).toUpperCase();
      return str.length < 2 ? "0" + str : str;
    }
  }
});

// node_modules/abstract-things/utils/converters.js
var require_converters = __commonJS({
  "node_modules/abstract-things/utils/converters.js"(exports, module2) {
    "use strict";
    function combine(first, second) {
      return function(value) {
        return second(first(value));
      };
    }
    var Converters = class {
      constructor() {
        this._conversions = [];
        this._cached = {};
      }
      add(from, to, converter) {
        if (from === to)
          return;
        const c = {
          count: 1,
          from,
          to,
          converter
        };
        this._conversions.push(c);
        this._cached[from + "->" + to] = c;
        return this;
      }
      _converter(from, to) {
        const cached = this._cached[from + "->" + to];
        if (cached) {
          return cached.converter;
        }
        const checked = {};
        const queue = [];
        function insertIntoQueue(c) {
          if (c.from === c.to)
            return;
          const v = checked[c.from + "->" + c.to];
          if (v)
            return;
          checked[c.from + "->" + c.to] = true;
          const count = c.count;
          for (let i = 0; i < queue.length; i++) {
            if (queue[i].count > count) {
              queue.splice(i, 0, c);
              return;
            }
          }
          queue.push(c);
        }
        this._conversions.forEach((c) => {
          if (c.from === from) {
            insertIntoQueue(c);
          }
        });
        while (queue.length) {
          const item = queue.shift();
          if (item.to === to) {
            this._cached[from + "->" + to] = item;
            return item.converter;
          } else {
            this._conversions.forEach((c) => {
              if (c.from === item.to) {
                insertIntoQueue({
                  from: item.from,
                  to: c.to,
                  count: item.count + 1,
                  converter: combine(item.converter, c.converter)
                });
              }
            });
          }
        }
        this._cached[from + "->" + to] = {
          converter: null
        };
        return null;
      }
      convert(from, to, value) {
        if (from === to)
          return value;
        const c = this._converter(from, to);
        if (!c) {
          throw new Error("No suitable conversion between " + from + " and " + to);
        }
        return c(value);
      }
    };
    module2.exports = function() {
      return new Converters();
    };
  }
});

// node_modules/abstract-things/values/color.js
var require_color = __commonJS({
  "node_modules/abstract-things/values/color.js"(exports, module2) {
    "use strict";
    var temp = require_color_temperature();
    var convert = require_color_convert();
    var string = require_color_string();
    var TEMPERATURE = /\s*([0-9]+)\s*[kK]\s*/;
    var NAMED_TEMPERATURES = {
      "overcast": 6500,
      "daylight": 5500,
      "sunrise": 2400,
      "sunset": 2400,
      "candle": 2e3,
      "moonlight": 4100
    };
    var conversions = require_converters()();
    var values = ["rgb", "hsl", "hsv", "cmyk", "xyz"];
    values.forEach((a) => {
      values.forEach((b) => conversions.add(a, b, convert[a][b]));
    });
    conversions.add("temperature", "rgb", function(values2) {
      const v = temp.colorTemperature2rgb(values2[0]);
      return [v.red, v.green, v.blue];
    });
    conversions.add("rgb", "temperature", function(values2) {
      const t = temp.rgb2colorTemperature({
        red: values2[0],
        green: values2[1],
        blue: values2[2]
      });
      if (!t) {
        throw new Error("Can not convert to temperature");
      }
      return [t];
    });
    conversions.add("temperature", "mired", function(values2) {
      const t = values2[0];
      return [Math.round(1e6 / t)];
    });
    conversions.add("mired", "temperature", function(values2) {
      const m = values2[0];
      return [Math.round(1e6 / m)];
    });
    conversions.add("rgb", "hex", function(values2) {
      return string.to.hex(values2);
    });
    conversions.add("hex", "rgb", function(values2) {
      return string.get.rgb(values2);
    });
    conversions.add("xyz", "xyY", function(values2) {
      const X = values2[0];
      const Y = values2[1];
      const Z = values2[2];
      return [
        X / (X + Y + Z),
        Y / (X + Y + Z),
        Y
      ];
    });
    conversions.add("xyY", "xyz", function(values2) {
      const x = values2[0];
      const y = values2[1];
      const Y = values2[2];
      return [
        x * Y / y,
        Y,
        (1 - x - y) * Y / y
      ];
    });
    function parse(color) {
      const t = TEMPERATURE.exec(color);
      if (t) {
        return new Color([parseInt(t[1])], "temperature");
      } else {
        const namedTemp = NAMED_TEMPERATURES[color.toLowerCase()];
        if (namedTemp) {
          return new Color([namedTemp], "temperature");
        }
        const parsed = string.get(color);
        if (!parsed) {
          throw new Error("Unable to convert to color: " + color);
        }
        return new Color(parsed.value, parsed.model);
      }
    }
    function assertModel(current) {
      for (let i = 1; i < arguments.length; i++) {
        if (arguments[i] === current)
          return;
      }
      throw new Error("Need to convert to one of: " + Array.prototype.slice.call(arguments, 1));
    }
    var Color = class {
      constructor(values2, model) {
        this.values = values2;
        this.model = model;
      }
      _values(model) {
        return conversions.convert(this.model, model, this.values);
      }
      as(model) {
        if (this.model === model) {
          return this;
        }
        const values2 = this._values(model);
        return new Color(values2, model);
      }
      is(model) {
        return this.model === model;
      }
      get hex() {
        return this._values("hex");
      }
      get rgb() {
        return this.as("rgb");
      }
      get hsl() {
        return this.as("hsl");
      }
      get hsv() {
        return this.as("hsv");
      }
      get xyz() {
        return this.as("xyz");
      }
      get xyY() {
        return this.as("xyY");
      }
      get temperature() {
        return this.as("temperature");
      }
      get temp() {
        return this.as("temperature");
      }
      get mired() {
        return this.as("mired");
      }
      get red() {
        assertModel(this.model, "rgb");
        return this.values[0];
      }
      get green() {
        assertModel(this.model, "rgb");
        return this.values[1];
      }
      get blue() {
        assertModel(this.model, "rgb");
        return this.values[2];
      }
      get hue() {
        assertModel(this.model, "hsl", "hsv");
        return this.values[0];
      }
      get saturation() {
        assertModel(this.model, "hsl", "hsv");
        return this.values[1];
      }
      get lightness() {
        assertModel(this.model, "hsl");
        return this.values[2];
      }
      get value() {
        assertModel(this.model, "hsv", "mired");
        switch (this.model) {
          case "mired":
            return this.values[0];
          case "hsv":
            return this.values[2];
        }
      }
      get kelvins() {
        assertModel(this.model, "temperature");
        return this.values[0];
      }
      get x() {
        assertModel(this.model, "xyz", "xyY");
        return this.values[0];
      }
      get y() {
        assertModel(this.model, "xyz", "xyY");
        return this.values[1];
      }
      get Y() {
        assertModel(this.model, "xyY");
        return this.values[2];
      }
      get z() {
        assertModel(this.model, "xyz");
        return this.values[2];
      }
    };
    module2.exports = function(value, model) {
      if (value instanceof Color) {
        return value;
      }
      const type = typeof value;
      if (type === "string") {
        return parse(value);
      } else if (Array.isArray(value)) {
        return new Color(value, model);
      } else if (type === "object") {
        return new Color(value.values, value.model);
      } else {
        throw new Error("Unable to create color");
      }
    };
    module2.exports.toJSON = function(value) {
      return {
        values: value.values,
        model: value.model
      };
    };
    module2.exports.is = function(v) {
      return v instanceof Color;
    };
    ["cmyk", "rgb", "temperature", "mired", "xyz", "xyY", "hsl", "hsv"].forEach(function(name) {
      module2.exports[name] = function() {
        return new Color(Array.prototype.slice.call(arguments), name);
      };
    });
  }
});

// node_modules/abstract-things/values/code.js
var require_code = __commonJS({
  "node_modules/abstract-things/values/code.js"(exports, module2) {
    "use strict";
    module2.exports = class Code {
      constructor(id, description) {
        this.id = id;
        this.description = description;
      }
      static parse(value) {
        const idx = value.indexOf(":");
        if (idx >= 0) {
          return new Code(value.substring(0, idx).trim(), value.substring(idx + 1).trim());
        } else {
          return new Code(value.trim());
        }
      }
    };
  }
});

// node_modules/abstract-things/values/change.js
var require_change = __commonJS({
  "node_modules/abstract-things/values/change.js"(exports, module2) {
    "use strict";
    var Change = class {
      constructor(value, type) {
        this.value = value;
        this.type = type;
      }
      get isIncrease() {
        return this.type === "increase";
      }
      get isDecrease() {
        return this.type === "decrease";
      }
      get isSet() {
        return this.type === "set";
      }
    };
    var CHANGE = /^\s*([+-])(.+)$/;
    module2.exports = function(delegate) {
      const create = function(value) {
        if (typeof value === "string") {
          const parsed = CHANGE.exec(value);
          if (parsed) {
            const value2 = delegate.create(parsed[2]);
            return new Change(value2, parsed[1] === "+" ? "increase" : "decrease");
          }
          return new Change(delegate.create(value), "set");
        } else if (typeof value === "object") {
          return new Change(value.value, value.type);
        } else {
          throw new Error("Unable to create change for " + value);
        }
      };
      create.toJSON = function(value) {
        return {
          value: delegate.toJSON(value.value),
          type: value.type
        };
      };
      return create;
    };
  }
});

// node_modules/abstract-things/values/index.js
var require_values = __commonJS({
  "node_modules/abstract-things/values/index.js"(exports, module2) {
    "use strict";
    var amounts = require_amounts();
    var color = require_color();
    var Code = require_code();
    var IDENTITY = function(input) {
      return input;
    };
    var ALWAYS_FALSE = function() {
      return false;
    };
    var TYPE_TAG = "_:value-type";
    var change = require_change();
    function createPublicApi(def) {
      const api = function(value, options, required, msg) {
        if (typeof options !== "object") {
          msg = required;
          required = options;
        }
        if (typeof required !== "boolean") {
          msg = required;
          required = false;
        }
        if (required && (typeof value === "undefined" || value === null)) {
          throw new Error(msg || "Value required");
        }
        return def.create(value, options);
      };
      for (const m of Object.keys(def.create)) {
        api[m] = def.create[m];
      }
      return api;
    }
    var ValueRegistry = class {
      constructor() {
        this.defs = {};
      }
      register(type, def) {
        if (!def) {
          throw new Error("A definition with create (and optionally toJSON) needed for type " + type);
        }
        if (typeof def === "function") {
          def = {
            create: def,
            toJSON: def.toJSON,
            is: def.is
          };
        }
        if (!def.create) {
          throw new Error("create function required for type " + type);
        }
        if (!def.toJSON) {
          def.toJSON = IDENTITY;
        }
        if (def.comparable) {
          this.register(type + ":change", change(def));
        }
        if (!def.is) {
          def.is = ALWAYS_FALSE;
        }
        this.defs[type] = def;
        this[type] = createPublicApi(def);
      }
      get(type) {
        return this.defs[type];
      }
      _toJSON(converter, value) {
        if (value === null || typeof value === "undefined") {
          return null;
        }
        return converter.toJSON(converter.create(value));
      }
      fromJSON(type, value) {
        const def = this.defs[type] || this.defs.mixed;
        return def.create(value);
      }
      toJSON(type, value) {
        const def = this.defs[type] || this.defs.mixed;
        return def.toJSON(value);
      }
      createToJSON(types) {
        let mixed = this.get("mixed");
        if (Array.isArray(types)) {
          const converters = types.map((t) => {
            if (t.type)
              t = t.type;
            return this.defs[t];
          });
          return (data) => {
            return Array.prototype.map.call(data, (value, idx) => {
              const converter = converters[idx] || mixed;
              return this._toJSON(converter, value);
            });
          };
        } else {
          if (types.type)
            types = types.type;
          const converter = this.defs[types] || mixed;
          return (value) => this._toJSON(converter, value);
        }
      }
      createConversion(types) {
        let mixed = this.get("mixed");
        if (Array.isArray(types)) {
          const converters = types.map((t) => {
            if (t.type)
              t = t.type;
            return this.defs[t];
          });
          return function(data) {
            return Array.prototype.map.call(data, (value, idx) => {
              const converter = converters[idx] || mixed;
              return converter.create(value);
            });
          };
        } else {
          if (types.type)
            types = types.type;
          const converter = this.defs[types] || mixed;
          return function(data) {
            return converter.create(data);
          };
        }
      }
    };
    var values = module2.exports = new ValueRegistry();
    function parseNumber(v) {
      if (typeof v === "number")
        return v;
      if (typeof v !== "string") {
        throw new Error("Can not convert into a number, string is needed");
      }
      try {
        return amounts.amount(v).value;
      } catch (ex) {
        throw new Error("Could not convert into a number, invalid format for string: " + v);
      }
    }
    values.register("mixed", {
      create: function(value) {
        let type;
        if (value && value[TYPE_TAG]) {
          type = values.get(value[TYPE_TAG]);
        }
        if (!type && Array.isArray(value)) {
          type = values.get("array");
        } else if (!type && typeof value === "object" && value !== null) {
          let found = false;
          for (let key in values.defs) {
            const def = values.defs[key];
            if (def.is(value)) {
              type = def;
              found = true;
              break;
            }
          }
          if (!found) {
            type = values.get("object");
          }
        }
        if (type) {
          return type.create(value);
        }
        return value;
      },
      toJSON: function(value) {
        if (typeof value !== "undefined" && value !== null) {
          for (let key in values.defs) {
            const def = values.defs[key];
            if (def.is && def.is(value)) {
              const json = def.toJSON(value);
              if (typeof json === "object") {
                json[TYPE_TAG] = key;
              }
              return json;
            }
          }
        }
        if (Array.isArray(value)) {
          return values.get("array").toJSON(value);
        } else if (typeof value === "object") {
          return values.get("object").toJSON(value);
        }
        return value;
      }
    });
    values.register("object", {
      create: function(value) {
        if (!value)
          return null;
        const result = {};
        Object.keys(value).forEach((key) => {
          result[key] = values.fromJSON("mixed", value[key]);
        });
        return result;
      },
      toJSON: function(value) {
        if (!value)
          return null;
        const result = {};
        Object.keys(value).forEach((key) => {
          result[key] = values.toJSON("mixed", value[key]);
        });
        return result;
      }
    });
    values.register("array", {
      create: function(value) {
        if (!value)
          return null;
        if (!Array.isArray(value)) {
          value = [value];
        }
        return value.map((v) => values.fromJSON("mixed", v));
      },
      toJSON: function(value) {
        if (!value)
          return null;
        return value.map((v) => values.toJSON("mixed", v));
      }
    });
    values.register("buffer", {
      create: function(value) {
        if (value instanceof Buffer) {
          return value;
        }
        if (Array.isArray(value)) {
          return Buffer.from(value);
        } else if (typeof value === "object") {
          value = value.encoded;
        }
        if (typeof value === "string") {
          return Buffer.from(value, "base64");
        } else {
          throw new Error("Can not create buffer from value");
        }
      },
      is: function(value) {
        return value instanceof Buffer;
      },
      toJSON(value) {
        return {
          encoded: value.toString("base64")
        };
      }
    });
    values.register("boolean", {
      create: function(value) {
        if (typeof value === "boolean")
          return value;
        value = String(value).toLowerCase();
        switch (value) {
          case "true":
          case "yes":
          case "on":
          case "1":
            return true;
          case "false":
          case "no":
          case "off":
          case "0":
            return false;
          default:
            throw new Error("Can not translate `" + value + "` into a boolean");
        }
      },
      is: function(value) {
        return typeof value === "boolean";
      }
    });
    values.register("number", {
      create: function(value) {
        if (typeof value === "number")
          return value;
        return parseNumber(value);
      },
      is: function(value) {
        return typeof value === "number";
      }
    });
    values.register("string", {
      create: function(value) {
        return String(value);
      },
      is: function(value) {
        return typeof value === "string";
      }
    });
    values.register("percentage", {
      create: function(value, options) {
        if (typeof value === "string") {
          value = value.trim();
          if (value.endsWith("%")) {
            value = value.substring(0, value.length - 1);
          }
          value = parseNumber(value);
        } else if (typeof value !== "number") {
          throw new Error("Can not translate to a percentage");
        }
        if (typeof options !== "undefined") {
          const min = options.min;
          if (typeof min !== "undefined") {
            if (value < min) {
              value = min;
            }
          }
          const max = options.max;
          if (typeof max !== "undefined") {
            if (value > max) {
              value = max;
            }
          }
          const precision = options.precision;
          if (typeof precision !== "undefined") {
            const p = Math.pow(10, precision);
            value = Math.round(value * p) / p;
          }
        }
        return value;
      },
      comparable: true
    });
    values.register("code", {
      create: function(value) {
        if (typeof value === "object") {
          if (Array.isArray(value)) {
            return new Code(value[0], value[1]);
          } else {
            return new Code(value.id || value.code, value.description || value.message);
          }
        } else if (typeof value === "string") {
          return Code.parse(value);
        } else if (typeof value === "number") {
          return Code.parse(String(value));
        }
        throw new Error("Can not convert into code");
      },
      is: function(value) {
        return value instanceof Code;
      }
    });
    values.register("color", color);
    var quantities = [
      "angle",
      "area",
      "duration",
      "energy",
      "illuminance",
      "length",
      "mass",
      "power",
      "pressure",
      "soundPressureLevel",
      "speed",
      "temperature",
      "voltage",
      "volume"
    ];
    for (const quantity of quantities) {
      values.register(quantity, amounts[quantity]);
    }
  }
});

// node_modules/abstract-things/polling.js
var require_polling = __commonJS({
  "node_modules/abstract-things/polling.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var { duration } = require_values();
    var pollDuration = Symbol("pollDuration");
    var pollTimer = Symbol("pollTimer");
    var maxPollFailures = Symbol("maxpollFailures");
    var pollFailures = Symbol("pollFailures");
    module2.exports = Thing.mixin((Parent) => class extends Parent {
      constructor(...args) {
        super(...args);
        this[pollDuration] = 3e4;
        this.internalPoll = this.internalPoll.bind(this);
        this[maxPollFailures] = -1;
        this[pollFailures] = 0;
      }
      updatePollDuration(time) {
        time = this[pollDuration] = duration(time).ms;
        if (this[pollTimer]) {
          clearTimeout(this[pollTimer]);
          this[pollTimer] = setTimeout(this.internalPoll, time);
        }
      }
      updateMaxPollFailures(failures) {
        this[maxPollFailures] = failures;
      }
      initCallback() {
        return super.initCallback().then(() => {
          return this.internalPoll(true);
        });
      }
      destroyCallback() {
        return super.destroyCallback().then(() => clearTimeout(this[pollTimer]));
      }
      internalPoll(isInitial = false) {
        const time = Date.now();
        return Promise.resolve(this.poll(isInitial)).catch((ex) => {
          this.debug("Could not poll:", ex);
          return new Error("Polling issue");
        }).then((r) => {
          if (r instanceof Error) {
            this[pollFailures]++;
            if (this[maxPollFailures] > 0 && this[maxPollFailures] <= this[pollFailures]) {
              this.destroy();
            }
          } else {
            this[pollFailures] = 0;
          }
          const diff = Date.now() - time;
          const d = this[pollDuration];
          let nextTime = d - diff;
          while (nextTime < 0) {
            nextTime += d;
          }
          this[pollTimer] = setTimeout(this.internalPoll, nextTime);
        });
      }
      poll(isInitial) {
        throw new Error("Poll has not been implemented");
      }
    });
  }
});

// node_modules/object-keys/isArguments.js
var require_isArguments = __commonJS({
  "node_modules/object-keys/isArguments.js"(exports, module2) {
    "use strict";
    var toStr = Object.prototype.toString;
    module2.exports = function isArguments(value) {
      var str = toStr.call(value);
      var isArgs = str === "[object Arguments]";
      if (!isArgs) {
        isArgs = str !== "[object Array]" && value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && toStr.call(value.callee) === "[object Function]";
      }
      return isArgs;
    };
  }
});

// node_modules/object-keys/implementation.js
var require_implementation = __commonJS({
  "node_modules/object-keys/implementation.js"(exports, module2) {
    "use strict";
    var keysShim;
    if (!Object.keys) {
      has = Object.prototype.hasOwnProperty;
      toStr = Object.prototype.toString;
      isArgs = require_isArguments();
      isEnumerable = Object.prototype.propertyIsEnumerable;
      hasDontEnumBug = !isEnumerable.call({ toString: null }, "toString");
      hasProtoEnumBug = isEnumerable.call(function() {
      }, "prototype");
      dontEnums = [
        "toString",
        "toLocaleString",
        "valueOf",
        "hasOwnProperty",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "constructor"
      ];
      equalsConstructorPrototype = function(o) {
        var ctor = o.constructor;
        return ctor && ctor.prototype === o;
      };
      excludedKeys = {
        $applicationCache: true,
        $console: true,
        $external: true,
        $frame: true,
        $frameElement: true,
        $frames: true,
        $innerHeight: true,
        $innerWidth: true,
        $onmozfullscreenchange: true,
        $onmozfullscreenerror: true,
        $outerHeight: true,
        $outerWidth: true,
        $pageXOffset: true,
        $pageYOffset: true,
        $parent: true,
        $scrollLeft: true,
        $scrollTop: true,
        $scrollX: true,
        $scrollY: true,
        $self: true,
        $webkitIndexedDB: true,
        $webkitStorageInfo: true,
        $window: true
      };
      hasAutomationEqualityBug = function() {
        if (typeof window === "undefined") {
          return false;
        }
        for (var k in window) {
          try {
            if (!excludedKeys["$" + k] && has.call(window, k) && window[k] !== null && typeof window[k] === "object") {
              try {
                equalsConstructorPrototype(window[k]);
              } catch (e) {
                return true;
              }
            }
          } catch (e) {
            return true;
          }
        }
        return false;
      }();
      equalsConstructorPrototypeIfNotBuggy = function(o) {
        if (typeof window === "undefined" || !hasAutomationEqualityBug) {
          return equalsConstructorPrototype(o);
        }
        try {
          return equalsConstructorPrototype(o);
        } catch (e) {
          return false;
        }
      };
      keysShim = function keys(object) {
        var isObject = object !== null && typeof object === "object";
        var isFunction = toStr.call(object) === "[object Function]";
        var isArguments = isArgs(object);
        var isString = isObject && toStr.call(object) === "[object String]";
        var theKeys = [];
        if (!isObject && !isFunction && !isArguments) {
          throw new TypeError("Object.keys called on a non-object");
        }
        var skipProto = hasProtoEnumBug && isFunction;
        if (isString && object.length > 0 && !has.call(object, 0)) {
          for (var i = 0; i < object.length; ++i) {
            theKeys.push(String(i));
          }
        }
        if (isArguments && object.length > 0) {
          for (var j = 0; j < object.length; ++j) {
            theKeys.push(String(j));
          }
        } else {
          for (var name in object) {
            if (!(skipProto && name === "prototype") && has.call(object, name)) {
              theKeys.push(String(name));
            }
          }
        }
        if (hasDontEnumBug) {
          var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
          for (var k = 0; k < dontEnums.length; ++k) {
            if (!(skipConstructor && dontEnums[k] === "constructor") && has.call(object, dontEnums[k])) {
              theKeys.push(dontEnums[k]);
            }
          }
        }
        return theKeys;
      };
    }
    var has;
    var toStr;
    var isArgs;
    var isEnumerable;
    var hasDontEnumBug;
    var hasProtoEnumBug;
    var dontEnums;
    var equalsConstructorPrototype;
    var excludedKeys;
    var hasAutomationEqualityBug;
    var equalsConstructorPrototypeIfNotBuggy;
    module2.exports = keysShim;
  }
});

// node_modules/object-keys/index.js
var require_object_keys = __commonJS({
  "node_modules/object-keys/index.js"(exports, module2) {
    "use strict";
    var slice = Array.prototype.slice;
    var isArgs = require_isArguments();
    var origKeys = Object.keys;
    var keysShim = origKeys ? function keys(o) {
      return origKeys(o);
    } : require_implementation();
    var originalKeys = Object.keys;
    keysShim.shim = function shimObjectKeys() {
      if (Object.keys) {
        var keysWorksWithArguments = function() {
          var args = Object.keys(arguments);
          return args && args.length === arguments.length;
        }(1, 2);
        if (!keysWorksWithArguments) {
          Object.keys = function keys(object) {
            if (isArgs(object)) {
              return originalKeys(slice.call(object));
            }
            return originalKeys(object);
          };
        }
      } else {
        Object.keys = keysShim;
      }
      return Object.keys || keysShim;
    };
    module2.exports = keysShim;
  }
});

// node_modules/has-symbols/shams.js
var require_shams = __commonJS({
  "node_modules/has-symbols/shams.js"(exports, module2) {
    "use strict";
    module2.exports = function hasSymbols() {
      if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
        return false;
      }
      if (typeof Symbol.iterator === "symbol") {
        return true;
      }
      var obj = {};
      var sym = Symbol("test");
      var symObj = Object(sym);
      if (typeof sym === "string") {
        return false;
      }
      if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
        return false;
      }
      if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
        return false;
      }
      var symVal = 42;
      obj[sym] = symVal;
      for (sym in obj) {
        return false;
      }
      if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
        return false;
      }
      if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
        return false;
      }
      var syms = Object.getOwnPropertySymbols(obj);
      if (syms.length !== 1 || syms[0] !== sym) {
        return false;
      }
      if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
      }
      if (typeof Object.getOwnPropertyDescriptor === "function") {
        var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
          return false;
        }
      }
      return true;
    };
  }
});

// node_modules/has-tostringtag/shams.js
var require_shams2 = __commonJS({
  "node_modules/has-tostringtag/shams.js"(exports, module2) {
    "use strict";
    var hasSymbols = require_shams();
    module2.exports = function hasToStringTagShams() {
      return hasSymbols() && !!Symbol.toStringTag;
    };
  }
});

// node_modules/has-symbols/index.js
var require_has_symbols = __commonJS({
  "node_modules/has-symbols/index.js"(exports, module2) {
    "use strict";
    var origSymbol = typeof Symbol !== "undefined" && Symbol;
    var hasSymbolSham = require_shams();
    module2.exports = function hasNativeSymbols() {
      if (typeof origSymbol !== "function") {
        return false;
      }
      if (typeof Symbol !== "function") {
        return false;
      }
      if (typeof origSymbol("foo") !== "symbol") {
        return false;
      }
      if (typeof Symbol("bar") !== "symbol") {
        return false;
      }
      return hasSymbolSham();
    };
  }
});

// node_modules/function-bind/implementation.js
var require_implementation2 = __commonJS({
  "node_modules/function-bind/implementation.js"(exports, module2) {
    "use strict";
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var slice = Array.prototype.slice;
    var toStr = Object.prototype.toString;
    var funcType = "[object Function]";
    module2.exports = function bind(that) {
      var target = this;
      if (typeof target !== "function" || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
      }
      var args = slice.call(arguments, 1);
      var bound;
      var binder = function() {
        if (this instanceof bound) {
          var result = target.apply(this, args.concat(slice.call(arguments)));
          if (Object(result) === result) {
            return result;
          }
          return this;
        } else {
          return target.apply(that, args.concat(slice.call(arguments)));
        }
      };
      var boundLength = Math.max(0, target.length - args.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs.push("$" + i);
      }
      bound = Function("binder", "return function (" + boundArgs.join(",") + "){ return binder.apply(this,arguments); }")(binder);
      if (target.prototype) {
        var Empty = function Empty2() {
        };
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    };
  }
});

// node_modules/function-bind/index.js
var require_function_bind = __commonJS({
  "node_modules/function-bind/index.js"(exports, module2) {
    "use strict";
    var implementation = require_implementation2();
    module2.exports = Function.prototype.bind || implementation;
  }
});

// node_modules/has/src/index.js
var require_src2 = __commonJS({
  "node_modules/has/src/index.js"(exports, module2) {
    "use strict";
    var bind = require_function_bind();
    module2.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);
  }
});

// node_modules/get-intrinsic/index.js
var require_get_intrinsic = __commonJS({
  "node_modules/get-intrinsic/index.js"(exports, module2) {
    "use strict";
    var undefined2;
    var $SyntaxError = SyntaxError;
    var $Function = Function;
    var $TypeError = TypeError;
    var getEvalledConstructor = function(expressionSyntax) {
      try {
        return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
      } catch (e) {
      }
    };
    var $gOPD = Object.getOwnPropertyDescriptor;
    if ($gOPD) {
      try {
        $gOPD({}, "");
      } catch (e) {
        $gOPD = null;
      }
    }
    var throwTypeError = function() {
      throw new $TypeError();
    };
    var ThrowTypeError = $gOPD ? function() {
      try {
        arguments.callee;
        return throwTypeError;
      } catch (calleeThrows) {
        try {
          return $gOPD(arguments, "callee").get;
        } catch (gOPDthrows) {
          return throwTypeError;
        }
      }
    }() : throwTypeError;
    var hasSymbols = require_has_symbols()();
    var getProto = Object.getPrototypeOf || function(x) {
      return x.__proto__;
    };
    var needsEval = {};
    var TypedArray = typeof Uint8Array === "undefined" ? undefined2 : getProto(Uint8Array);
    var INTRINSICS = {
      "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
      "%Array%": Array,
      "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
      "%ArrayIteratorPrototype%": hasSymbols ? getProto([][Symbol.iterator]()) : undefined2,
      "%AsyncFromSyncIteratorPrototype%": undefined2,
      "%AsyncFunction%": needsEval,
      "%AsyncGenerator%": needsEval,
      "%AsyncGeneratorFunction%": needsEval,
      "%AsyncIteratorPrototype%": needsEval,
      "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
      "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
      "%Boolean%": Boolean,
      "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
      "%Date%": Date,
      "%decodeURI%": decodeURI,
      "%decodeURIComponent%": decodeURIComponent,
      "%encodeURI%": encodeURI,
      "%encodeURIComponent%": encodeURIComponent,
      "%Error%": Error,
      "%eval%": eval,
      "%EvalError%": EvalError,
      "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
      "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
      "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
      "%Function%": $Function,
      "%GeneratorFunction%": needsEval,
      "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
      "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
      "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
      "%isFinite%": isFinite,
      "%isNaN%": isNaN,
      "%IteratorPrototype%": hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined2,
      "%JSON%": typeof JSON === "object" ? JSON : undefined2,
      "%Map%": typeof Map === "undefined" ? undefined2 : Map,
      "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
      "%Math%": Math,
      "%Number%": Number,
      "%Object%": Object,
      "%parseFloat%": parseFloat,
      "%parseInt%": parseInt,
      "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
      "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
      "%RangeError%": RangeError,
      "%ReferenceError%": ReferenceError,
      "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
      "%RegExp%": RegExp,
      "%Set%": typeof Set === "undefined" ? undefined2 : Set,
      "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
      "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
      "%String%": String,
      "%StringIteratorPrototype%": hasSymbols ? getProto(""[Symbol.iterator]()) : undefined2,
      "%Symbol%": hasSymbols ? Symbol : undefined2,
      "%SyntaxError%": $SyntaxError,
      "%ThrowTypeError%": ThrowTypeError,
      "%TypedArray%": TypedArray,
      "%TypeError%": $TypeError,
      "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
      "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
      "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
      "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
      "%URIError%": URIError,
      "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
      "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
      "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet
    };
    var doEval = function doEval2(name) {
      var value;
      if (name === "%AsyncFunction%") {
        value = getEvalledConstructor("async function () {}");
      } else if (name === "%GeneratorFunction%") {
        value = getEvalledConstructor("function* () {}");
      } else if (name === "%AsyncGeneratorFunction%") {
        value = getEvalledConstructor("async function* () {}");
      } else if (name === "%AsyncGenerator%") {
        var fn = doEval2("%AsyncGeneratorFunction%");
        if (fn) {
          value = fn.prototype;
        }
      } else if (name === "%AsyncIteratorPrototype%") {
        var gen = doEval2("%AsyncGenerator%");
        if (gen) {
          value = getProto(gen.prototype);
        }
      }
      INTRINSICS[name] = value;
      return value;
    };
    var LEGACY_ALIASES = {
      "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
      "%ArrayPrototype%": ["Array", "prototype"],
      "%ArrayProto_entries%": ["Array", "prototype", "entries"],
      "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
      "%ArrayProto_keys%": ["Array", "prototype", "keys"],
      "%ArrayProto_values%": ["Array", "prototype", "values"],
      "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
      "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
      "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
      "%BooleanPrototype%": ["Boolean", "prototype"],
      "%DataViewPrototype%": ["DataView", "prototype"],
      "%DatePrototype%": ["Date", "prototype"],
      "%ErrorPrototype%": ["Error", "prototype"],
      "%EvalErrorPrototype%": ["EvalError", "prototype"],
      "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
      "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
      "%FunctionPrototype%": ["Function", "prototype"],
      "%Generator%": ["GeneratorFunction", "prototype"],
      "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
      "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
      "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
      "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
      "%JSONParse%": ["JSON", "parse"],
      "%JSONStringify%": ["JSON", "stringify"],
      "%MapPrototype%": ["Map", "prototype"],
      "%NumberPrototype%": ["Number", "prototype"],
      "%ObjectPrototype%": ["Object", "prototype"],
      "%ObjProto_toString%": ["Object", "prototype", "toString"],
      "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
      "%PromisePrototype%": ["Promise", "prototype"],
      "%PromiseProto_then%": ["Promise", "prototype", "then"],
      "%Promise_all%": ["Promise", "all"],
      "%Promise_reject%": ["Promise", "reject"],
      "%Promise_resolve%": ["Promise", "resolve"],
      "%RangeErrorPrototype%": ["RangeError", "prototype"],
      "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
      "%RegExpPrototype%": ["RegExp", "prototype"],
      "%SetPrototype%": ["Set", "prototype"],
      "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
      "%StringPrototype%": ["String", "prototype"],
      "%SymbolPrototype%": ["Symbol", "prototype"],
      "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
      "%TypedArrayPrototype%": ["TypedArray", "prototype"],
      "%TypeErrorPrototype%": ["TypeError", "prototype"],
      "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
      "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
      "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
      "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
      "%URIErrorPrototype%": ["URIError", "prototype"],
      "%WeakMapPrototype%": ["WeakMap", "prototype"],
      "%WeakSetPrototype%": ["WeakSet", "prototype"]
    };
    var bind = require_function_bind();
    var hasOwn = require_src2();
    var $concat = bind.call(Function.call, Array.prototype.concat);
    var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
    var $replace = bind.call(Function.call, String.prototype.replace);
    var $strSlice = bind.call(Function.call, String.prototype.slice);
    var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = function stringToPath2(string) {
      var first = $strSlice(string, 0, 1);
      var last = $strSlice(string, -1);
      if (first === "%" && last !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
      } else if (last === "%" && first !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
      }
      var result = [];
      $replace(string, rePropName, function(match, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
      });
      return result;
    };
    var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
      var intrinsicName = name;
      var alias;
      if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = "%" + alias[0] + "%";
      }
      if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
          value = doEval(intrinsicName);
        }
        if (typeof value === "undefined" && !allowMissing) {
          throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
        }
        return {
          alias,
          name: intrinsicName,
          value
        };
      }
      throw new $SyntaxError("intrinsic " + name + " does not exist!");
    };
    module2.exports = function GetIntrinsic(name, allowMissing) {
      if (typeof name !== "string" || name.length === 0) {
        throw new $TypeError("intrinsic name must be a non-empty string");
      }
      if (arguments.length > 1 && typeof allowMissing !== "boolean") {
        throw new $TypeError('"allowMissing" argument must be a boolean');
      }
      var parts = stringToPath(name);
      var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
      var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
      var intrinsicRealName = intrinsic.name;
      var value = intrinsic.value;
      var skipFurtherCaching = false;
      var alias = intrinsic.alias;
      if (alias) {
        intrinsicBaseName = alias[0];
        $spliceApply(parts, $concat([0, 1], alias));
      }
      for (var i = 1, isOwn = true; i < parts.length; i += 1) {
        var part = parts[i];
        var first = $strSlice(part, 0, 1);
        var last = $strSlice(part, -1);
        if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
          throw new $SyntaxError("property names with quotes must have matching quotes");
        }
        if (part === "constructor" || !isOwn) {
          skipFurtherCaching = true;
        }
        intrinsicBaseName += "." + part;
        intrinsicRealName = "%" + intrinsicBaseName + "%";
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
          value = INTRINSICS[intrinsicRealName];
        } else if (value != null) {
          if (!(part in value)) {
            if (!allowMissing) {
              throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
            }
            return void 0;
          }
          if ($gOPD && i + 1 >= parts.length) {
            var desc = $gOPD(value, part);
            isOwn = !!desc;
            if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
              value = desc.get;
            } else {
              value = value[part];
            }
          } else {
            isOwn = hasOwn(value, part);
            value = value[part];
          }
          if (isOwn && !skipFurtherCaching) {
            INTRINSICS[intrinsicRealName] = value;
          }
        }
      }
      return value;
    };
  }
});

// node_modules/call-bind/index.js
var require_call_bind = __commonJS({
  "node_modules/call-bind/index.js"(exports, module2) {
    "use strict";
    var bind = require_function_bind();
    var GetIntrinsic = require_get_intrinsic();
    var $apply = GetIntrinsic("%Function.prototype.apply%");
    var $call = GetIntrinsic("%Function.prototype.call%");
    var $reflectApply = GetIntrinsic("%Reflect.apply%", true) || bind.call($call, $apply);
    var $gOPD = GetIntrinsic("%Object.getOwnPropertyDescriptor%", true);
    var $defineProperty = GetIntrinsic("%Object.defineProperty%", true);
    var $max = GetIntrinsic("%Math.max%");
    if ($defineProperty) {
      try {
        $defineProperty({}, "a", { value: 1 });
      } catch (e) {
        $defineProperty = null;
      }
    }
    module2.exports = function callBind(originalFunction) {
      var func = $reflectApply(bind, $call, arguments);
      if ($gOPD && $defineProperty) {
        var desc = $gOPD(func, "length");
        if (desc.configurable) {
          $defineProperty(func, "length", { value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) });
        }
      }
      return func;
    };
    var applyBind = function applyBind2() {
      return $reflectApply(bind, $apply, arguments);
    };
    if ($defineProperty) {
      $defineProperty(module2.exports, "apply", { value: applyBind });
    } else {
      module2.exports.apply = applyBind;
    }
  }
});

// node_modules/call-bind/callBound.js
var require_callBound = __commonJS({
  "node_modules/call-bind/callBound.js"(exports, module2) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var callBind = require_call_bind();
    var $indexOf = callBind(GetIntrinsic("String.prototype.indexOf"));
    module2.exports = function callBoundIntrinsic(name, allowMissing) {
      var intrinsic = GetIntrinsic(name, !!allowMissing);
      if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
        return callBind(intrinsic);
      }
      return intrinsic;
    };
  }
});

// node_modules/is-arguments/index.js
var require_is_arguments = __commonJS({
  "node_modules/is-arguments/index.js"(exports, module2) {
    "use strict";
    var hasToStringTag = require_shams2()();
    var callBound = require_callBound();
    var $toString = callBound("Object.prototype.toString");
    var isStandardArguments = function isArguments(value) {
      if (hasToStringTag && value && typeof value === "object" && Symbol.toStringTag in value) {
        return false;
      }
      return $toString(value) === "[object Arguments]";
    };
    var isLegacyArguments = function isArguments(value) {
      if (isStandardArguments(value)) {
        return true;
      }
      return value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && $toString(value) !== "[object Array]" && $toString(value.callee) === "[object Function]";
    };
    var supportsStandardArguments = function() {
      return isStandardArguments(arguments);
    }();
    isStandardArguments.isLegacyArguments = isLegacyArguments;
    module2.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
  }
});

// node_modules/define-properties/index.js
var require_define_properties = __commonJS({
  "node_modules/define-properties/index.js"(exports, module2) {
    "use strict";
    var keys = require_object_keys();
    var hasSymbols = typeof Symbol === "function" && typeof Symbol("foo") === "symbol";
    var toStr = Object.prototype.toString;
    var concat = Array.prototype.concat;
    var origDefineProperty = Object.defineProperty;
    var isFunction = function(fn) {
      return typeof fn === "function" && toStr.call(fn) === "[object Function]";
    };
    var arePropertyDescriptorsSupported = function() {
      var obj = {};
      try {
        origDefineProperty(obj, "x", { enumerable: false, value: obj });
        for (var _ in obj) {
          return false;
        }
        return obj.x === obj;
      } catch (e) {
        return false;
      }
    };
    var supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported();
    var defineProperty = function(object, name, value, predicate) {
      if (name in object && (!isFunction(predicate) || !predicate())) {
        return;
      }
      if (supportsDescriptors) {
        origDefineProperty(object, name, {
          configurable: true,
          enumerable: false,
          value,
          writable: true
        });
      } else {
        object[name] = value;
      }
    };
    var defineProperties = function(object, map) {
      var predicates = arguments.length > 2 ? arguments[2] : {};
      var props = keys(map);
      if (hasSymbols) {
        props = concat.call(props, Object.getOwnPropertySymbols(map));
      }
      for (var i = 0; i < props.length; i += 1) {
        defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
      }
    };
    defineProperties.supportsDescriptors = !!supportsDescriptors;
    module2.exports = defineProperties;
  }
});

// node_modules/object-is/implementation.js
var require_implementation3 = __commonJS({
  "node_modules/object-is/implementation.js"(exports, module2) {
    "use strict";
    var numberIsNaN = function(value) {
      return value !== value;
    };
    module2.exports = function is(a, b) {
      if (a === 0 && b === 0) {
        return 1 / a === 1 / b;
      }
      if (a === b) {
        return true;
      }
      if (numberIsNaN(a) && numberIsNaN(b)) {
        return true;
      }
      return false;
    };
  }
});

// node_modules/object-is/polyfill.js
var require_polyfill = __commonJS({
  "node_modules/object-is/polyfill.js"(exports, module2) {
    "use strict";
    var implementation = require_implementation3();
    module2.exports = function getPolyfill() {
      return typeof Object.is === "function" ? Object.is : implementation;
    };
  }
});

// node_modules/object-is/shim.js
var require_shim = __commonJS({
  "node_modules/object-is/shim.js"(exports, module2) {
    "use strict";
    var getPolyfill = require_polyfill();
    var define = require_define_properties();
    module2.exports = function shimObjectIs() {
      var polyfill = getPolyfill();
      define(Object, { is: polyfill }, {
        is: function testObjectIs() {
          return Object.is !== polyfill;
        }
      });
      return polyfill;
    };
  }
});

// node_modules/object-is/index.js
var require_object_is = __commonJS({
  "node_modules/object-is/index.js"(exports, module2) {
    "use strict";
    var define = require_define_properties();
    var callBind = require_call_bind();
    var implementation = require_implementation3();
    var getPolyfill = require_polyfill();
    var shim = require_shim();
    var polyfill = callBind(getPolyfill(), Object);
    define(polyfill, {
      getPolyfill,
      implementation,
      shim
    });
    module2.exports = polyfill;
  }
});

// node_modules/is-regex/index.js
var require_is_regex = __commonJS({
  "node_modules/is-regex/index.js"(exports, module2) {
    "use strict";
    var callBound = require_callBound();
    var hasToStringTag = require_shams2()();
    var has;
    var $exec;
    var isRegexMarker;
    var badStringifier;
    if (hasToStringTag) {
      has = callBound("Object.prototype.hasOwnProperty");
      $exec = callBound("RegExp.prototype.exec");
      isRegexMarker = {};
      throwRegexMarker = function() {
        throw isRegexMarker;
      };
      badStringifier = {
        toString: throwRegexMarker,
        valueOf: throwRegexMarker
      };
      if (typeof Symbol.toPrimitive === "symbol") {
        badStringifier[Symbol.toPrimitive] = throwRegexMarker;
      }
    }
    var throwRegexMarker;
    var $toString = callBound("Object.prototype.toString");
    var gOPD = Object.getOwnPropertyDescriptor;
    var regexClass = "[object RegExp]";
    module2.exports = hasToStringTag ? function isRegex(value) {
      if (!value || typeof value !== "object") {
        return false;
      }
      var descriptor = gOPD(value, "lastIndex");
      var hasLastIndexDataProperty = descriptor && has(descriptor, "value");
      if (!hasLastIndexDataProperty) {
        return false;
      }
      try {
        $exec(value, badStringifier);
      } catch (e) {
        return e === isRegexMarker;
      }
    } : function isRegex(value) {
      if (!value || typeof value !== "object" && typeof value !== "function") {
        return false;
      }
      return $toString(value) === regexClass;
    };
  }
});

// node_modules/regexp.prototype.flags/implementation.js
var require_implementation4 = __commonJS({
  "node_modules/regexp.prototype.flags/implementation.js"(exports, module2) {
    "use strict";
    var $Object = Object;
    var $TypeError = TypeError;
    module2.exports = function flags() {
      if (this != null && this !== $Object(this)) {
        throw new $TypeError("RegExp.prototype.flags getter called on non-object");
      }
      var result = "";
      if (this.hasIndices) {
        result += "d";
      }
      if (this.global) {
        result += "g";
      }
      if (this.ignoreCase) {
        result += "i";
      }
      if (this.multiline) {
        result += "m";
      }
      if (this.dotAll) {
        result += "s";
      }
      if (this.unicode) {
        result += "u";
      }
      if (this.sticky) {
        result += "y";
      }
      return result;
    };
  }
});

// node_modules/regexp.prototype.flags/polyfill.js
var require_polyfill2 = __commonJS({
  "node_modules/regexp.prototype.flags/polyfill.js"(exports, module2) {
    "use strict";
    var implementation = require_implementation4();
    var supportsDescriptors = require_define_properties().supportsDescriptors;
    var $gOPD = Object.getOwnPropertyDescriptor;
    module2.exports = function getPolyfill() {
      if (supportsDescriptors && /a/mig.flags === "gim") {
        var descriptor = $gOPD(RegExp.prototype, "flags");
        if (descriptor && typeof descriptor.get === "function" && typeof /a/.dotAll === "boolean") {
          return descriptor.get;
        }
      }
      return implementation;
    };
  }
});

// node_modules/regexp.prototype.flags/shim.js
var require_shim2 = __commonJS({
  "node_modules/regexp.prototype.flags/shim.js"(exports, module2) {
    "use strict";
    var supportsDescriptors = require_define_properties().supportsDescriptors;
    var getPolyfill = require_polyfill2();
    var gOPD = Object.getOwnPropertyDescriptor;
    var defineProperty = Object.defineProperty;
    var TypeErr = TypeError;
    var getProto = Object.getPrototypeOf;
    var regex = /a/;
    module2.exports = function shimFlags() {
      if (!supportsDescriptors || !getProto) {
        throw new TypeErr("RegExp.prototype.flags requires a true ES5 environment that supports property descriptors");
      }
      var polyfill = getPolyfill();
      var proto = getProto(regex);
      var descriptor = gOPD(proto, "flags");
      if (!descriptor || descriptor.get !== polyfill) {
        defineProperty(proto, "flags", {
          configurable: true,
          enumerable: false,
          get: polyfill
        });
      }
      return polyfill;
    };
  }
});

// node_modules/regexp.prototype.flags/index.js
var require_regexp_prototype = __commonJS({
  "node_modules/regexp.prototype.flags/index.js"(exports, module2) {
    "use strict";
    var define = require_define_properties();
    var callBind = require_call_bind();
    var implementation = require_implementation4();
    var getPolyfill = require_polyfill2();
    var shim = require_shim2();
    var flagsBound = callBind(getPolyfill());
    define(flagsBound, {
      getPolyfill,
      implementation,
      shim
    });
    module2.exports = flagsBound;
  }
});

// node_modules/is-date-object/index.js
var require_is_date_object = __commonJS({
  "node_modules/is-date-object/index.js"(exports, module2) {
    "use strict";
    var getDay = Date.prototype.getDay;
    var tryDateObject = function tryDateGetDayCall(value) {
      try {
        getDay.call(value);
        return true;
      } catch (e) {
        return false;
      }
    };
    var toStr = Object.prototype.toString;
    var dateClass = "[object Date]";
    var hasToStringTag = require_shams2()();
    module2.exports = function isDateObject(value) {
      if (typeof value !== "object" || value === null) {
        return false;
      }
      return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
    };
  }
});

// node_modules/deep-equal/index.js
var require_deep_equal = __commonJS({
  "node_modules/deep-equal/index.js"(exports, module2) {
    var objectKeys = require_object_keys();
    var isArguments = require_is_arguments();
    var is = require_object_is();
    var isRegex = require_is_regex();
    var flags = require_regexp_prototype();
    var isDate = require_is_date_object();
    var getTime2 = Date.prototype.getTime;
    function deepEqual(actual, expected, options) {
      var opts = options || {};
      if (opts.strict ? is(actual, expected) : actual === expected) {
        return true;
      }
      if (!actual || !expected || typeof actual !== "object" && typeof expected !== "object") {
        return opts.strict ? is(actual, expected) : actual == expected;
      }
      return objEquiv(actual, expected, opts);
    }
    function isUndefinedOrNull(value) {
      return value === null || value === void 0;
    }
    function isBuffer(x) {
      if (!x || typeof x !== "object" || typeof x.length !== "number") {
        return false;
      }
      if (typeof x.copy !== "function" || typeof x.slice !== "function") {
        return false;
      }
      if (x.length > 0 && typeof x[0] !== "number") {
        return false;
      }
      return true;
    }
    function objEquiv(a, b, opts) {
      var i, key;
      if (typeof a !== typeof b) {
        return false;
      }
      if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) {
        return false;
      }
      if (a.prototype !== b.prototype) {
        return false;
      }
      if (isArguments(a) !== isArguments(b)) {
        return false;
      }
      var aIsRegex = isRegex(a);
      var bIsRegex = isRegex(b);
      if (aIsRegex !== bIsRegex) {
        return false;
      }
      if (aIsRegex || bIsRegex) {
        return a.source === b.source && flags(a) === flags(b);
      }
      if (isDate(a) && isDate(b)) {
        return getTime2.call(a) === getTime2.call(b);
      }
      var aIsBuffer = isBuffer(a);
      var bIsBuffer = isBuffer(b);
      if (aIsBuffer !== bIsBuffer) {
        return false;
      }
      if (aIsBuffer || bIsBuffer) {
        if (a.length !== b.length) {
          return false;
        }
        for (i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) {
            return false;
          }
        }
        return true;
      }
      if (typeof a !== typeof b) {
        return false;
      }
      try {
        var ka = objectKeys(a);
        var kb = objectKeys(b);
      } catch (e) {
        return false;
      }
      if (ka.length !== kb.length) {
        return false;
      }
      ka.sort();
      kb.sort();
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i]) {
          return false;
        }
      }
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!deepEqual(a[key], b[key], opts)) {
          return false;
        }
      }
      return true;
    }
    module2.exports = deepEqual;
  }
});

// node_modules/abstract-things/common/state.js
var require_state = __commonJS({
  "node_modules/abstract-things/common/state.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var deepEqual = require_deep_equal();
    var state = Symbol("state");
    module2.exports = Thing.mixin((Parent) => class extends Parent {
      static availableAPI(builder) {
        builder.event("stateChanged").type("object").description("The state of the appliance has changed").done();
        builder.action("state").description("Get the current state").returns("object").done();
      }
      static get capability() {
        return "state";
      }
      constructor(...args) {
        super(...args);
        this[state] = {};
      }
      state() {
        return Promise.resolve(this[state]);
      }
      updateState(key, value) {
        if (deepEqual(this[state][key], value)) {
          return false;
        } else {
          this[state][key] = value;
          const event = {
            key,
            value
          };
          this.emitEvent("stateChanged", event, {
            multiple: (e) => e.key === key
          });
          return true;
        }
      }
      removeState(key) {
        const emitEvent = typeof this[state][key] !== "undefined";
        delete this[state][key];
        if (emitEvent) {
          const event = {
            key,
            value: null
          };
          this.emitEvent("stateChanged", event, {
            multiple: (e) => e.key === key
          });
        }
      }
      getState(key, defaultValue = null) {
        const value = this[state][key];
        return typeof value === "undefined" ? defaultValue : value;
      }
    });
  }
});

// node_modules/abstract-things/common/restorable-state.js
var require_restorable_state = __commonJS({
  "node_modules/abstract-things/common/restorable-state.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static availableAPI(builder) {
        builder.action("restorableState").description("Get the properties that will be captured").returns("array").done();
        builder.action("captureState").description("Capture parts of the current state that can be restored").returns("object").done();
        builder.action("setState").description("Restore previously captured state").argument("object", false, "The state to restore").returns("object").done();
      }
      static get capability() {
        return "restorable-state";
      }
      constructor(...args) {
        super(...args);
      }
      get restorableState() {
        return [];
      }
      captureState() {
        const result = {};
        for (const property of this.restorableState) {
          result[property] = this.state[property];
        }
        return Promise.resolve(result);
      }
      setState(state) {
        try {
          return Promise.resolve(this.changeState(state)).then(() => this.state);
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      changeState(state) {
        return Promise.resolve();
      }
    });
  }
});

// node_modules/abstract-things/common/error-state.js
var require_error_state = __commonJS({
  "node_modules/abstract-things/common/error-state.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    var { code } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static availableAPI(builder) {
        builder.state("error").type("string").description("Error code, or null if no error").done();
        builder.event("errorChanged").type("code").description("If the current error code changes").done();
        builder.event("error").type("code").description("Thing has encountered an error").done();
        builder.event("errorCleared").description("Error of thing has been cleared").done();
        builder.action("error").description("Get the current error state").returns("code", "The current error state or null if no error").done();
      }
      static get capability() {
        return "error-state";
      }
      constructor(...args) {
        super(...args);
        this.updateState("error", null);
      }
      get error() {
        return Promise.resolve(this.getState("error"));
      }
      updateError(error) {
        if (error) {
          error = code(error);
        } else {
          error = null;
        }
        if (this.updateState("error", error)) {
          this.emitEvent("errorChanged", error);
          if (error) {
            this.emitEvent("error", error);
          } else {
            this.emitEvent("errorCleared");
          }
        }
      }
    });
  }
});

// node_modules/mkdirp/index.js
var require_mkdirp = __commonJS({
  "node_modules/mkdirp/index.js"(exports, module2) {
    var path = require("path");
    var fs = require("fs");
    var _0777 = parseInt("0777", 8);
    module2.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
    function mkdirP(p, opts, f, made) {
      if (typeof opts === "function") {
        f = opts;
        opts = {};
      } else if (!opts || typeof opts !== "object") {
        opts = { mode: opts };
      }
      var mode = opts.mode;
      var xfs = opts.fs || fs;
      if (mode === void 0) {
        mode = _0777;
      }
      if (!made)
        made = null;
      var cb = f || function() {
      };
      p = path.resolve(p);
      xfs.mkdir(p, mode, function(er) {
        if (!er) {
          made = made || p;
          return cb(null, made);
        }
        switch (er.code) {
          case "ENOENT":
            if (path.dirname(p) === p)
              return cb(er);
            mkdirP(path.dirname(p), opts, function(er2, made2) {
              if (er2)
                cb(er2, made2);
              else
                mkdirP(p, opts, cb, made2);
            });
            break;
          default:
            xfs.stat(p, function(er2, stat) {
              if (er2 || !stat.isDirectory())
                cb(er, made);
              else
                cb(null, made);
            });
            break;
        }
      });
    }
    mkdirP.sync = function sync(p, opts, made) {
      if (!opts || typeof opts !== "object") {
        opts = { mode: opts };
      }
      var mode = opts.mode;
      var xfs = opts.fs || fs;
      if (mode === void 0) {
        mode = _0777;
      }
      if (!made)
        made = null;
      p = path.resolve(p);
      try {
        xfs.mkdirSync(p, mode);
        made = made || p;
      } catch (err0) {
        switch (err0.code) {
          case "ENOENT":
            made = sync(path.dirname(p), opts, made);
            sync(p, opts, made);
            break;
          default:
            var stat;
            try {
              stat = xfs.statSync(p);
            } catch (err1) {
              throw err0;
            }
            if (!stat.isDirectory())
              throw err0;
            break;
        }
      }
      return made;
    };
  }
});

// node_modules/appdirectory/lib/helpers.js
var require_helpers = __commonJS({
  "node_modules/appdirectory/lib/helpers.js"(exports, module2) {
    var instanceOf = function(object, constructor) {
      if (typeof object != "object") {
        object = new object.constructor(object);
      }
      while (object != null) {
        if (object == constructor.prototype) {
          return true;
        }
        object = Object.getPrototypeOf(object);
      }
      return false;
    };
    var formatStr = function(format) {
      var args = Array.prototype.slice.call(arguments, 1);
      return format.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != "undefined" ? args[number] : match;
      });
    };
    module2.exports.instanceOf = instanceOf;
    module2.exports.formatStr = formatStr;
  }
});

// node_modules/appdirectory/lib/appdirectory.js
var require_appdirectory = __commonJS({
  "node_modules/appdirectory/lib/appdirectory.js"(exports, module2) {
    var path = require("path");
    var helpers = require_helpers();
    var userData = function(roaming, platform) {
      var dataPath, platform = platform || process.platform;
      if (platform === "darwin") {
        dataPath = path.join(process.env.HOME, "Library", "Application Support", "{0}");
      } else if (platform === "win32") {
        var sysVariable;
        if (roaming) {
          sysVariable = "APPDATA";
        } else {
          sysVariable = "LOCALAPPDATA";
        }
        dataPath = path.join(process.env[sysVariable] || process.env.APPDATA, "{1}", "{0}");
      } else {
        if (process.env.XDG_DATA_HOME) {
          dataPath = path.join(process.env.XDG_DATA_HOME, "{0}");
        } else {
          dataPath = path.join(process.env.HOME, ".local", "share", "{0}");
        }
      }
      return dataPath;
    };
    var userConfig = function(roaming, platform) {
      var dataPath, platform = platform || process.platform;
      if (platform === "darwin" || platform === "win32") {
        dataPath = userData(roaming, platform);
      } else {
        if (process.env.XDG_CONFIG_HOME) {
          dataPath = path.join(process.env.XDG_CONFIG_HOME, "{0}");
        } else {
          dataPath = path.join(process.env.HOME, ".config", "{0}");
        }
      }
      return dataPath;
    };
    var userCache = function(platform) {
      var dataPath, platform = platform || process.platform;
      if (platform === "win32") {
        dataPath = path.join(process.env.LOCALAPPDATA || process.env.APPDATA, "{1}", "{0}", "Cache");
      } else if (platform === "darwin") {
        dataPath = path.join(process.env.HOME, "Library", "Caches", "{0}");
      } else {
        if (process.env.XDG_CACHE_HOME) {
          dataPath = path.join(process.env.XDG_CACHE_HOME, "{0}");
        } else {
          dataPath = path.join(process.env.HOME, ".cache", "{0}");
        }
      }
      return dataPath;
    };
    var userLogs = function(platform) {
      var dataPath, platform = platform || process.platform;
      if (platform === "win32") {
        dataPath = path.join(userData(false, platform), "Logs");
      } else if (platform === "darwin") {
        dataPath = path.join(process.env.HOME, "Library", "Logs", "{0}");
      } else {
        dataPath = path.join(userCache(platform), "log");
      }
      return dataPath;
    };
    function AppDirectory(options) {
      if (helpers.instanceOf(options, String)) {
        options = { appName: options };
      }
      this.appName = options.appName;
      this.appAuthor = options.appAuthor || options.appName;
      this.appVersion = options.appVersion || null;
      this._useRoaming = options.useRoaming || false;
      this._platform = options.platform || null;
      this._setTemplates();
    }
    AppDirectory.prototype = {
      _setTemplates: function() {
        this._userDataTemplate = userData(this._useRoaming, this._platform);
        this._userConfigTemplate = userConfig(this._useRoaming, this._platform);
        this._userCacheTemplate = userCache(this._platform);
        this._userLogsTemplate = userLogs(this._platform);
      },
      get useRoaming() {
        return this._useRoaming;
      },
      set useRoaming(bool) {
        this._useRoaming = bool;
        this._setTemplates();
      },
      get platform() {
        return this._platform;
      },
      set platform(str) {
        this._platform = str;
        this._setTemplates();
      },
      userData: function() {
        var dataPath = this._userDataTemplate;
        if (this.appVersion !== null) {
          var dataPath = path.join(dataPath, this.appVersion);
        }
        return helpers.formatStr(dataPath, this.appName, this.appAuthor);
      },
      siteData: function() {
        var dataPath = this._siteDataTemplate;
        if (this.appVersion !== null) {
          var dataPath = path.join(dataPath, this.appVersion);
        }
        return helpers.formatStr(dataPath, this.appName, this.appAuthor);
      },
      userConfig: function() {
        var dataPath = this._userConfigTemplate;
        if (this.appVersion !== null) {
          var dataPath = path.join(dataPath, this.appVersion);
        }
        return helpers.formatStr(dataPath, this.appName, this.appAuthor);
      },
      siteConfig: function() {
        var dataPath = this._siteConfigTemplate;
        if (this.appVersion !== null) {
          var dataPath = path.join(dataPath, this.appVersion);
        }
        return helpers.formatStr(dataPath, this.appName, this.appAuthor);
      },
      userCache: function() {
        var dataPath = this._userCacheTemplate;
        if (this.appVersion !== null) {
          var dataPath = path.join(dataPath, this.appVersion);
        }
        return helpers.formatStr(dataPath, this.appName, this.appAuthor);
      },
      userLogs: function() {
        var dataPath = this._userLogsTemplate;
        if (this.appVersion !== null) {
          var dataPath = path.join(dataPath, this.appVersion);
        }
        return helpers.formatStr(dataPath, this.appName, this.appAuthor);
      }
    };
    module2.exports = AppDirectory;
  }
});

// node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS({
  "node_modules/wrappy/wrappy.js"(exports, module2) {
    module2.exports = wrappy;
    function wrappy(fn, cb) {
      if (fn && cb)
        return wrappy(fn)(cb);
      if (typeof fn !== "function")
        throw new TypeError("need wrapper function");
      Object.keys(fn).forEach(function(k) {
        wrapper[k] = fn[k];
      });
      return wrapper;
      function wrapper() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        var ret = fn.apply(this, args);
        var cb2 = args[args.length - 1];
        if (typeof ret === "function" && ret !== cb2) {
          Object.keys(cb2).forEach(function(k) {
            ret[k] = cb2[k];
          });
        }
        return ret;
      }
    }
  }
});

// node_modules/once/once.js
var require_once = __commonJS({
  "node_modules/once/once.js"(exports, module2) {
    var wrappy = require_wrappy();
    module2.exports = wrappy(once);
    module2.exports.strict = wrappy(onceStrict);
    once.proto = once(function() {
      Object.defineProperty(Function.prototype, "once", {
        value: function() {
          return once(this);
        },
        configurable: true
      });
      Object.defineProperty(Function.prototype, "onceStrict", {
        value: function() {
          return onceStrict(this);
        },
        configurable: true
      });
    });
    function once(fn) {
      var f = function() {
        if (f.called)
          return f.value;
        f.called = true;
        return f.value = fn.apply(this, arguments);
      };
      f.called = false;
      return f;
    }
    function onceStrict(fn) {
      var f = function() {
        if (f.called)
          throw new Error(f.onceError);
        f.called = true;
        return f.value = fn.apply(this, arguments);
      };
      var name = fn.name || "Function wrapped with `once`";
      f.onceError = name + " shouldn't be called more than once";
      f.called = false;
      return f;
    }
  }
});

// node_modules/end-of-stream/index.js
var require_end_of_stream = __commonJS({
  "node_modules/end-of-stream/index.js"(exports, module2) {
    var once = require_once();
    var noop = function() {
    };
    var isRequest = function(stream) {
      return stream.setHeader && typeof stream.abort === "function";
    };
    var isChildProcess = function(stream) {
      return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3;
    };
    var eos = function(stream, opts, callback) {
      if (typeof opts === "function")
        return eos(stream, null, opts);
      if (!opts)
        opts = {};
      callback = once(callback || noop);
      var ws = stream._writableState;
      var rs = stream._readableState;
      var readable = opts.readable || opts.readable !== false && stream.readable;
      var writable = opts.writable || opts.writable !== false && stream.writable;
      var cancelled = false;
      var onlegacyfinish = function() {
        if (!stream.writable)
          onfinish();
      };
      var onfinish = function() {
        writable = false;
        if (!readable)
          callback.call(stream);
      };
      var onend = function() {
        readable = false;
        if (!writable)
          callback.call(stream);
      };
      var onexit = function(exitCode) {
        callback.call(stream, exitCode ? new Error("exited with error code: " + exitCode) : null);
      };
      var onerror = function(err) {
        callback.call(stream, err);
      };
      var onclose = function() {
        process.nextTick(onclosenexttick);
      };
      var onclosenexttick = function() {
        if (cancelled)
          return;
        if (readable && !(rs && (rs.ended && !rs.destroyed)))
          return callback.call(stream, new Error("premature close"));
        if (writable && !(ws && (ws.ended && !ws.destroyed)))
          return callback.call(stream, new Error("premature close"));
      };
      var onrequest = function() {
        stream.req.on("finish", onfinish);
      };
      if (isRequest(stream)) {
        stream.on("complete", onfinish);
        stream.on("abort", onclose);
        if (stream.req)
          onrequest();
        else
          stream.on("request", onrequest);
      } else if (writable && !ws) {
        stream.on("end", onlegacyfinish);
        stream.on("close", onlegacyfinish);
      }
      if (isChildProcess(stream))
        stream.on("exit", onexit);
      stream.on("end", onend);
      stream.on("finish", onfinish);
      if (opts.error !== false)
        stream.on("error", onerror);
      stream.on("close", onclose);
      return function() {
        cancelled = true;
        stream.removeListener("complete", onfinish);
        stream.removeListener("abort", onclose);
        stream.removeListener("request", onrequest);
        if (stream.req)
          stream.req.removeListener("finish", onfinish);
        stream.removeListener("end", onlegacyfinish);
        stream.removeListener("close", onlegacyfinish);
        stream.removeListener("finish", onfinish);
        stream.removeListener("exit", onexit);
        stream.removeListener("end", onend);
        stream.removeListener("error", onerror);
        stream.removeListener("close", onclose);
      };
    };
    module2.exports = eos;
  }
});

// node_modules/pidlockfile/pidlockfile.js
var require_pidlockfile = __commonJS({
  "node_modules/pidlockfile/pidlockfile.js"(exports, module2) {
    var fs = require("fs");
    var pid = process.pid.toString();
    var check = function(filename, callback) {
      fs.readFile(filename, { encoding: "utf8" }, function(err, otherPid) {
        if (err)
          return callback(err);
        otherPid = parseInt(otherPid, 10);
        try {
          process.kill(otherPid, 0);
          callback(null, true);
        } catch (e) {
          callback(null, false);
        }
      });
    };
    var lock = function(filename, callback) {
      check(filename, function(err, locked) {
        if (err && err.code === "ENOENT") {
          fs.writeFile(filename, pid, { flag: "wx" }, callback);
        } else if (err || locked && (err = new Error("Lockfile already acquired"))) {
          callback(err);
        } else {
          fs.unlink(filename, function(err2) {
            if (err2) {
              callback(err2);
            } else {
              fs.writeFile(filename, pid, { flag: "wx" }, callback);
            }
          });
        }
      });
    };
    var unlock = function(filename, callback) {
      fs.unlink(filename, callback);
    };
    module2.exports = {
      lock,
      check,
      unlock
    };
  }
});

// node_modules/unix-socket-leader/index.js
var require_unix_socket_leader = __commonJS({
  "node_modules/unix-socket-leader/index.js"(exports, module2) {
    "use strict";
    var net = require("net");
    var fs = require("fs");
    var path = require("path");
    var EE = require("events").EventEmitter;
    var eos = require_end_of_stream();
    var lockfile = require_pidlockfile();
    function leader(file) {
      var that = new EE();
      var sockPath = path.resolve(process.cwd(), file);
      var lock = sockPath + ".lock";
      var client = null;
      var server = null;
      var sockets = [];
      var closed = false;
      if (process.platform === "win32") {
        sockPath = "\\\\" + sockPath;
      }
      that.close = close;
      tryConnect();
      return that;
      function tryConnect() {
        if (closed)
          return;
        var client2 = net.connect(sockPath);
        var removeEos;
        client2.on("error", function(err) {
          client2 = null;
          if (removeEos) {
            removeEos();
          }
          if (err.code === "ECONNREFUSED" || err.code === "ENOENT") {
            return setTimeout(unlinkAndStart, 50 + Math.random() * 100);
          }
          return that.emit("error", err);
        });
        client2.on("connect", function() {
          that.emit("client", client2);
          removeEos = eos(client2, tryConnect);
        });
      }
      function unlinkAndStart() {
        if (closed)
          return;
        lockfile.lock(lock, function(err) {
          if (err) {
            return tryConnect();
          }
          fs.unlink(sockPath, function() {
            startServer();
          });
        });
      }
      function startServer() {
        server = net.createServer(function(sock) {
          sock.unref();
          sockets.push(sock);
          that.emit("connection", sock);
          eos(sock, function() {
            sockets.splice(sockets.indexOf(sock), 1);
          });
        });
        server.listen(sockPath, function() {
          that.emit("leader");
          tryConnect();
        });
        server.on("error", tryConnect);
        server.unref();
      }
      function close(cb) {
        closed = true;
        if (server) {
          try {
            fs.unlinkSync(sockPath);
            fs.unlinkSync(lock);
          } catch (err) {
          }
          sockets.forEach(function(sock) {
            sock.destroy();
          });
          server.close(cb);
        } else if (client) {
          if (cb) {
            eos(client, cb);
          }
          client.destroy();
        } else {
          cb();
        }
      }
    }
    module2.exports = leader;
  }
});

// node_modules/msgpack-lite/lib/buffer-global.js
var require_buffer_global = __commonJS({
  "node_modules/msgpack-lite/lib/buffer-global.js"(exports, module2) {
    module2.exports = c(typeof Buffer !== "undefined" && Buffer) || c(exports.Buffer) || c(typeof window !== "undefined" && window.Buffer) || exports.Buffer;
    function c(B) {
      return B && B.isBuffer && B;
    }
  }
});

// node_modules/isarray/index.js
var require_isarray = __commonJS({
  "node_modules/isarray/index.js"(exports, module2) {
    var toString = {}.toString;
    module2.exports = Array.isArray || function(arr) {
      return toString.call(arr) == "[object Array]";
    };
  }
});

// node_modules/msgpack-lite/lib/bufferish-array.js
var require_bufferish_array = __commonJS({
  "node_modules/msgpack-lite/lib/bufferish-array.js"(exports, module2) {
    var Bufferish = require_bufferish();
    var exports = module2.exports = alloc(0);
    exports.alloc = alloc;
    exports.concat = Bufferish.concat;
    exports.from = from;
    function alloc(size) {
      return new Array(size);
    }
    function from(value) {
      if (!Bufferish.isBuffer(value) && Bufferish.isView(value)) {
        value = Bufferish.Uint8Array.from(value);
      } else if (Bufferish.isArrayBuffer(value)) {
        value = new Uint8Array(value);
      } else if (typeof value === "string") {
        return Bufferish.from.call(exports, value);
      } else if (typeof value === "number") {
        throw new TypeError('"value" argument must not be a number');
      }
      return Array.prototype.slice.call(value);
    }
  }
});

// node_modules/msgpack-lite/lib/bufferish-buffer.js
var require_bufferish_buffer = __commonJS({
  "node_modules/msgpack-lite/lib/bufferish-buffer.js"(exports, module2) {
    var Bufferish = require_bufferish();
    var Buffer2 = Bufferish.global;
    var exports = module2.exports = Bufferish.hasBuffer ? alloc(0) : [];
    exports.alloc = Bufferish.hasBuffer && Buffer2.alloc || alloc;
    exports.concat = Bufferish.concat;
    exports.from = from;
    function alloc(size) {
      return new Buffer2(size);
    }
    function from(value) {
      if (!Bufferish.isBuffer(value) && Bufferish.isView(value)) {
        value = Bufferish.Uint8Array.from(value);
      } else if (Bufferish.isArrayBuffer(value)) {
        value = new Uint8Array(value);
      } else if (typeof value === "string") {
        return Bufferish.from.call(exports, value);
      } else if (typeof value === "number") {
        throw new TypeError('"value" argument must not be a number');
      }
      if (Buffer2.from && Buffer2.from.length !== 1) {
        return Buffer2.from(value);
      } else {
        return new Buffer2(value);
      }
    }
  }
});

// node_modules/msgpack-lite/lib/bufferish-uint8array.js
var require_bufferish_uint8array = __commonJS({
  "node_modules/msgpack-lite/lib/bufferish-uint8array.js"(exports, module2) {
    var Bufferish = require_bufferish();
    var exports = module2.exports = Bufferish.hasArrayBuffer ? alloc(0) : [];
    exports.alloc = alloc;
    exports.concat = Bufferish.concat;
    exports.from = from;
    function alloc(size) {
      return new Uint8Array(size);
    }
    function from(value) {
      if (Bufferish.isView(value)) {
        var byteOffset = value.byteOffset;
        var byteLength = value.byteLength;
        value = value.buffer;
        if (value.byteLength !== byteLength) {
          if (value.slice) {
            value = value.slice(byteOffset, byteOffset + byteLength);
          } else {
            value = new Uint8Array(value);
            if (value.byteLength !== byteLength) {
              value = Array.prototype.slice.call(value, byteOffset, byteOffset + byteLength);
            }
          }
        }
      } else if (typeof value === "string") {
        return Bufferish.from.call(exports, value);
      } else if (typeof value === "number") {
        throw new TypeError('"value" argument must not be a number');
      }
      return new Uint8Array(value);
    }
  }
});

// node_modules/msgpack-lite/lib/buffer-lite.js
var require_buffer_lite = __commonJS({
  "node_modules/msgpack-lite/lib/buffer-lite.js"(exports) {
    exports.copy = copy;
    exports.toString = toString;
    exports.write = write;
    function write(string, offset) {
      var buffer = this;
      var index = offset || (offset |= 0);
      var length = string.length;
      var chr = 0;
      var i = 0;
      while (i < length) {
        chr = string.charCodeAt(i++);
        if (chr < 128) {
          buffer[index++] = chr;
        } else if (chr < 2048) {
          buffer[index++] = 192 | chr >>> 6;
          buffer[index++] = 128 | chr & 63;
        } else if (chr < 55296 || chr > 57343) {
          buffer[index++] = 224 | chr >>> 12;
          buffer[index++] = 128 | chr >>> 6 & 63;
          buffer[index++] = 128 | chr & 63;
        } else {
          chr = (chr - 55296 << 10 | string.charCodeAt(i++) - 56320) + 65536;
          buffer[index++] = 240 | chr >>> 18;
          buffer[index++] = 128 | chr >>> 12 & 63;
          buffer[index++] = 128 | chr >>> 6 & 63;
          buffer[index++] = 128 | chr & 63;
        }
      }
      return index - offset;
    }
    function toString(encoding, start, end) {
      var buffer = this;
      var index = start | 0;
      if (!end)
        end = buffer.length;
      var string = "";
      var chr = 0;
      while (index < end) {
        chr = buffer[index++];
        if (chr < 128) {
          string += String.fromCharCode(chr);
          continue;
        }
        if ((chr & 224) === 192) {
          chr = (chr & 31) << 6 | buffer[index++] & 63;
        } else if ((chr & 240) === 224) {
          chr = (chr & 15) << 12 | (buffer[index++] & 63) << 6 | buffer[index++] & 63;
        } else if ((chr & 248) === 240) {
          chr = (chr & 7) << 18 | (buffer[index++] & 63) << 12 | (buffer[index++] & 63) << 6 | buffer[index++] & 63;
        }
        if (chr >= 65536) {
          chr -= 65536;
          string += String.fromCharCode((chr >>> 10) + 55296, (chr & 1023) + 56320);
        } else {
          string += String.fromCharCode(chr);
        }
      }
      return string;
    }
    function copy(target, targetStart, start, end) {
      var i;
      if (!start)
        start = 0;
      if (!end && end !== 0)
        end = this.length;
      if (!targetStart)
        targetStart = 0;
      var len = end - start;
      if (target === this && start < targetStart && targetStart < end) {
        for (i = len - 1; i >= 0; i--) {
          target[i + targetStart] = this[i + start];
        }
      } else {
        for (i = 0; i < len; i++) {
          target[i + targetStart] = this[i + start];
        }
      }
      return len;
    }
  }
});

// node_modules/msgpack-lite/lib/bufferish-proto.js
var require_bufferish_proto = __commonJS({
  "node_modules/msgpack-lite/lib/bufferish-proto.js"(exports) {
    var BufferLite = require_buffer_lite();
    exports.copy = copy;
    exports.slice = slice;
    exports.toString = toString;
    exports.write = gen("write");
    var Bufferish = require_bufferish();
    var Buffer2 = Bufferish.global;
    var isBufferShim = Bufferish.hasBuffer && "TYPED_ARRAY_SUPPORT" in Buffer2;
    var brokenTypedArray = isBufferShim && !Buffer2.TYPED_ARRAY_SUPPORT;
    function copy(target, targetStart, start, end) {
      var thisIsBuffer = Bufferish.isBuffer(this);
      var targetIsBuffer = Bufferish.isBuffer(target);
      if (thisIsBuffer && targetIsBuffer) {
        return this.copy(target, targetStart, start, end);
      } else if (!brokenTypedArray && !thisIsBuffer && !targetIsBuffer && Bufferish.isView(this) && Bufferish.isView(target)) {
        var buffer = start || end != null ? slice.call(this, start, end) : this;
        target.set(buffer, targetStart);
        return buffer.length;
      } else {
        return BufferLite.copy.call(this, target, targetStart, start, end);
      }
    }
    function slice(start, end) {
      var f = this.slice || !brokenTypedArray && this.subarray;
      if (f)
        return f.call(this, start, end);
      var target = Bufferish.alloc.call(this, end - start);
      copy.call(this, target, 0, start, end);
      return target;
    }
    function toString(encoding, start, end) {
      var f = !isBufferShim && Bufferish.isBuffer(this) ? this.toString : BufferLite.toString;
      return f.apply(this, arguments);
    }
    function gen(method) {
      return wrap;
      function wrap() {
        var f = this[method] || BufferLite[method];
        return f.apply(this, arguments);
      }
    }
  }
});

// node_modules/msgpack-lite/lib/bufferish.js
var require_bufferish = __commonJS({
  "node_modules/msgpack-lite/lib/bufferish.js"(exports) {
    var Buffer2 = exports.global = require_buffer_global();
    var hasBuffer = exports.hasBuffer = Buffer2 && !!Buffer2.isBuffer;
    var hasArrayBuffer = exports.hasArrayBuffer = typeof ArrayBuffer !== "undefined";
    var isArray = exports.isArray = require_isarray();
    exports.isArrayBuffer = hasArrayBuffer ? isArrayBuffer : _false;
    var isBuffer = exports.isBuffer = hasBuffer ? Buffer2.isBuffer : _false;
    var isView = exports.isView = hasArrayBuffer ? ArrayBuffer.isView || _is("ArrayBuffer", "buffer") : _false;
    exports.alloc = alloc;
    exports.concat = concat;
    exports.from = from;
    var BufferArray = exports.Array = require_bufferish_array();
    var BufferBuffer = exports.Buffer = require_bufferish_buffer();
    var BufferUint8Array = exports.Uint8Array = require_bufferish_uint8array();
    var BufferProto = exports.prototype = require_bufferish_proto();
    function from(value) {
      if (typeof value === "string") {
        return fromString.call(this, value);
      } else {
        return auto(this).from(value);
      }
    }
    function alloc(size) {
      return auto(this).alloc(size);
    }
    function concat(list, length) {
      if (!length) {
        length = 0;
        Array.prototype.forEach.call(list, dryrun);
      }
      var ref = this !== exports && this || list[0];
      var result = alloc.call(ref, length);
      var offset = 0;
      Array.prototype.forEach.call(list, append);
      return result;
      function dryrun(buffer) {
        length += buffer.length;
      }
      function append(buffer) {
        offset += BufferProto.copy.call(buffer, result, offset);
      }
    }
    var _isArrayBuffer = _is("ArrayBuffer");
    function isArrayBuffer(value) {
      return value instanceof ArrayBuffer || _isArrayBuffer(value);
    }
    function fromString(value) {
      var expected = value.length * 3;
      var that = alloc.call(this, expected);
      var actual = BufferProto.write.call(that, value);
      if (expected !== actual) {
        that = BufferProto.slice.call(that, 0, actual);
      }
      return that;
    }
    function auto(that) {
      return isBuffer(that) ? BufferBuffer : isView(that) ? BufferUint8Array : isArray(that) ? BufferArray : hasBuffer ? BufferBuffer : hasArrayBuffer ? BufferUint8Array : BufferArray;
    }
    function _false() {
      return false;
    }
    function _is(name, key) {
      name = "[object " + name + "]";
      return function(value) {
        return value != null && {}.toString.call(key ? value[key] : value) === name;
      };
    }
  }
});

// node_modules/msgpack-lite/lib/ext-buffer.js
var require_ext_buffer = __commonJS({
  "node_modules/msgpack-lite/lib/ext-buffer.js"(exports) {
    exports.ExtBuffer = ExtBuffer;
    var Bufferish = require_bufferish();
    function ExtBuffer(buffer, type) {
      if (!(this instanceof ExtBuffer))
        return new ExtBuffer(buffer, type);
      this.buffer = Bufferish.from(buffer);
      this.type = type;
    }
  }
});

// node_modules/msgpack-lite/lib/ext-packer.js
var require_ext_packer = __commonJS({
  "node_modules/msgpack-lite/lib/ext-packer.js"(exports) {
    exports.setExtPackers = setExtPackers;
    var Bufferish = require_bufferish();
    var Buffer2 = Bufferish.global;
    var packTypedArray = Bufferish.Uint8Array.from;
    var _encode;
    var ERROR_COLUMNS = { name: 1, message: 1, stack: 1, columnNumber: 1, fileName: 1, lineNumber: 1 };
    function setExtPackers(codec) {
      codec.addExtPacker(14, Error, [packError, encode]);
      codec.addExtPacker(1, EvalError, [packError, encode]);
      codec.addExtPacker(2, RangeError, [packError, encode]);
      codec.addExtPacker(3, ReferenceError, [packError, encode]);
      codec.addExtPacker(4, SyntaxError, [packError, encode]);
      codec.addExtPacker(5, TypeError, [packError, encode]);
      codec.addExtPacker(6, URIError, [packError, encode]);
      codec.addExtPacker(10, RegExp, [packRegExp, encode]);
      codec.addExtPacker(11, Boolean, [packValueOf, encode]);
      codec.addExtPacker(12, String, [packValueOf, encode]);
      codec.addExtPacker(13, Date, [Number, encode]);
      codec.addExtPacker(15, Number, [packValueOf, encode]);
      if (typeof Uint8Array !== "undefined") {
        codec.addExtPacker(17, Int8Array, packTypedArray);
        codec.addExtPacker(18, Uint8Array, packTypedArray);
        codec.addExtPacker(19, Int16Array, packTypedArray);
        codec.addExtPacker(20, Uint16Array, packTypedArray);
        codec.addExtPacker(21, Int32Array, packTypedArray);
        codec.addExtPacker(22, Uint32Array, packTypedArray);
        codec.addExtPacker(23, Float32Array, packTypedArray);
        if (typeof Float64Array !== "undefined") {
          codec.addExtPacker(24, Float64Array, packTypedArray);
        }
        if (typeof Uint8ClampedArray !== "undefined") {
          codec.addExtPacker(25, Uint8ClampedArray, packTypedArray);
        }
        codec.addExtPacker(26, ArrayBuffer, packTypedArray);
        codec.addExtPacker(29, DataView, packTypedArray);
      }
      if (Bufferish.hasBuffer) {
        codec.addExtPacker(27, Buffer2, Bufferish.from);
      }
    }
    function encode(input) {
      if (!_encode)
        _encode = require_encode().encode;
      return _encode(input);
    }
    function packValueOf(value) {
      return value.valueOf();
    }
    function packRegExp(value) {
      value = RegExp.prototype.toString.call(value).split("/");
      value.shift();
      var out = [value.pop()];
      out.unshift(value.join("/"));
      return out;
    }
    function packError(value) {
      var out = {};
      for (var key in ERROR_COLUMNS) {
        out[key] = value[key];
      }
      return out;
    }
  }
});

// node_modules/int64-buffer/int64-buffer.js
var require_int64_buffer = __commonJS({
  "node_modules/int64-buffer/int64-buffer.js"(exports) {
    var Uint64BE;
    var Int64BE;
    var Uint64LE;
    var Int64LE;
    !function(exports2) {
      var UNDEFINED = "undefined";
      var BUFFER = UNDEFINED !== typeof Buffer && Buffer;
      var UINT8ARRAY = UNDEFINED !== typeof Uint8Array && Uint8Array;
      var ARRAYBUFFER = UNDEFINED !== typeof ArrayBuffer && ArrayBuffer;
      var ZERO = [0, 0, 0, 0, 0, 0, 0, 0];
      var isArray = Array.isArray || _isArray;
      var BIT32 = 4294967296;
      var BIT24 = 16777216;
      var storage;
      Uint64BE = factory("Uint64BE", true, true);
      Int64BE = factory("Int64BE", true, false);
      Uint64LE = factory("Uint64LE", false, true);
      Int64LE = factory("Int64LE", false, false);
      function factory(name, bigendian, unsigned) {
        var posH = bigendian ? 0 : 4;
        var posL = bigendian ? 4 : 0;
        var pos0 = bigendian ? 0 : 3;
        var pos1 = bigendian ? 1 : 2;
        var pos2 = bigendian ? 2 : 1;
        var pos3 = bigendian ? 3 : 0;
        var fromPositive = bigendian ? fromPositiveBE : fromPositiveLE;
        var fromNegative = bigendian ? fromNegativeBE : fromNegativeLE;
        var proto = Int64.prototype;
        var isName = "is" + name;
        var _isInt64 = "_" + isName;
        proto.buffer = void 0;
        proto.offset = 0;
        proto[_isInt64] = true;
        proto.toNumber = toNumber;
        proto.toString = toString;
        proto.toJSON = toNumber;
        proto.toArray = toArray;
        if (BUFFER)
          proto.toBuffer = toBuffer;
        if (UINT8ARRAY)
          proto.toArrayBuffer = toArrayBuffer;
        Int64[isName] = isInt64;
        exports2[name] = Int64;
        return Int64;
        function Int64(buffer, offset, value, raddix) {
          if (!(this instanceof Int64))
            return new Int64(buffer, offset, value, raddix);
          return init(this, buffer, offset, value, raddix);
        }
        function isInt64(b) {
          return !!(b && b[_isInt64]);
        }
        function init(that, buffer, offset, value, raddix) {
          if (UINT8ARRAY && ARRAYBUFFER) {
            if (buffer instanceof ARRAYBUFFER)
              buffer = new UINT8ARRAY(buffer);
            if (value instanceof ARRAYBUFFER)
              value = new UINT8ARRAY(value);
          }
          if (!buffer && !offset && !value && !storage) {
            that.buffer = newArray(ZERO, 0);
            return;
          }
          if (!isValidBuffer(buffer, offset)) {
            var _storage = storage || Array;
            raddix = offset;
            value = buffer;
            offset = 0;
            buffer = new _storage(8);
          }
          that.buffer = buffer;
          that.offset = offset |= 0;
          if (UNDEFINED === typeof value)
            return;
          if (typeof value === "string") {
            fromString(buffer, offset, value, raddix || 10);
          } else if (isValidBuffer(value, raddix)) {
            fromArray(buffer, offset, value, raddix);
          } else if (typeof raddix === "number") {
            writeInt32(buffer, offset + posH, value);
            writeInt32(buffer, offset + posL, raddix);
          } else if (value > 0) {
            fromPositive(buffer, offset, value);
          } else if (value < 0) {
            fromNegative(buffer, offset, value);
          } else {
            fromArray(buffer, offset, ZERO, 0);
          }
        }
        function fromString(buffer, offset, str, raddix) {
          var pos = 0;
          var len = str.length;
          var high = 0;
          var low = 0;
          if (str[0] === "-")
            pos++;
          var sign = pos;
          while (pos < len) {
            var chr = parseInt(str[pos++], raddix);
            if (!(chr >= 0))
              break;
            low = low * raddix + chr;
            high = high * raddix + Math.floor(low / BIT32);
            low %= BIT32;
          }
          if (sign) {
            high = ~high;
            if (low) {
              low = BIT32 - low;
            } else {
              high++;
            }
          }
          writeInt32(buffer, offset + posH, high);
          writeInt32(buffer, offset + posL, low);
        }
        function toNumber() {
          var buffer = this.buffer;
          var offset = this.offset;
          var high = readInt32(buffer, offset + posH);
          var low = readInt32(buffer, offset + posL);
          if (!unsigned)
            high |= 0;
          return high ? high * BIT32 + low : low;
        }
        function toString(radix) {
          var buffer = this.buffer;
          var offset = this.offset;
          var high = readInt32(buffer, offset + posH);
          var low = readInt32(buffer, offset + posL);
          var str = "";
          var sign = !unsigned && high & 2147483648;
          if (sign) {
            high = ~high;
            low = BIT32 - low;
          }
          radix = radix || 10;
          while (1) {
            var mod = high % radix * BIT32 + low;
            high = Math.floor(high / radix);
            low = Math.floor(mod / radix);
            str = (mod % radix).toString(radix) + str;
            if (!high && !low)
              break;
          }
          if (sign) {
            str = "-" + str;
          }
          return str;
        }
        function writeInt32(buffer, offset, value) {
          buffer[offset + pos3] = value & 255;
          value = value >> 8;
          buffer[offset + pos2] = value & 255;
          value = value >> 8;
          buffer[offset + pos1] = value & 255;
          value = value >> 8;
          buffer[offset + pos0] = value & 255;
        }
        function readInt32(buffer, offset) {
          return buffer[offset + pos0] * BIT24 + (buffer[offset + pos1] << 16) + (buffer[offset + pos2] << 8) + buffer[offset + pos3];
        }
      }
      function toArray(raw) {
        var buffer = this.buffer;
        var offset = this.offset;
        storage = null;
        if (raw !== false && offset === 0 && buffer.length === 8 && isArray(buffer))
          return buffer;
        return newArray(buffer, offset);
      }
      function toBuffer(raw) {
        var buffer = this.buffer;
        var offset = this.offset;
        storage = BUFFER;
        if (raw !== false && offset === 0 && buffer.length === 8 && Buffer.isBuffer(buffer))
          return buffer;
        var dest = new BUFFER(8);
        fromArray(dest, 0, buffer, offset);
        return dest;
      }
      function toArrayBuffer(raw) {
        var buffer = this.buffer;
        var offset = this.offset;
        var arrbuf = buffer.buffer;
        storage = UINT8ARRAY;
        if (raw !== false && offset === 0 && arrbuf instanceof ARRAYBUFFER && arrbuf.byteLength === 8)
          return arrbuf;
        var dest = new UINT8ARRAY(8);
        fromArray(dest, 0, buffer, offset);
        return dest.buffer;
      }
      function isValidBuffer(buffer, offset) {
        var len = buffer && buffer.length;
        offset |= 0;
        return len && offset + 8 <= len && typeof buffer[offset] !== "string";
      }
      function fromArray(destbuf, destoff, srcbuf, srcoff) {
        destoff |= 0;
        srcoff |= 0;
        for (var i = 0; i < 8; i++) {
          destbuf[destoff++] = srcbuf[srcoff++] & 255;
        }
      }
      function newArray(buffer, offset) {
        return Array.prototype.slice.call(buffer, offset, offset + 8);
      }
      function fromPositiveBE(buffer, offset, value) {
        var pos = offset + 8;
        while (pos > offset) {
          buffer[--pos] = value & 255;
          value /= 256;
        }
      }
      function fromNegativeBE(buffer, offset, value) {
        var pos = offset + 8;
        value++;
        while (pos > offset) {
          buffer[--pos] = -value & 255 ^ 255;
          value /= 256;
        }
      }
      function fromPositiveLE(buffer, offset, value) {
        var end = offset + 8;
        while (offset < end) {
          buffer[offset++] = value & 255;
          value /= 256;
        }
      }
      function fromNegativeLE(buffer, offset, value) {
        var end = offset + 8;
        value++;
        while (offset < end) {
          buffer[offset++] = -value & 255 ^ 255;
          value /= 256;
        }
      }
      function _isArray(val) {
        return !!val && Object.prototype.toString.call(val) == "[object Array]";
      }
    }(typeof exports === "object" && typeof exports.nodeName !== "string" ? exports : exports || {});
  }
});

// node_modules/ieee754/index.js
var require_ieee754 = __commonJS({
  "node_modules/ieee754/index.js"(exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer[offset + i - d] |= s * 128;
    };
  }
});

// node_modules/msgpack-lite/lib/write-uint8.js
var require_write_uint8 = __commonJS({
  "node_modules/msgpack-lite/lib/write-uint8.js"(exports) {
    var constant = exports.uint8 = new Array(256);
    for (i = 0; i <= 255; i++) {
      constant[i] = write0(i);
    }
    var i;
    function write0(type) {
      return function(encoder) {
        var offset = encoder.reserve(1);
        encoder.buffer[offset] = type;
      };
    }
  }
});

// node_modules/msgpack-lite/lib/write-token.js
var require_write_token = __commonJS({
  "node_modules/msgpack-lite/lib/write-token.js"(exports) {
    var ieee754 = require_ieee754();
    var Int64Buffer = require_int64_buffer();
    var Uint64BE = Int64Buffer.Uint64BE;
    var Int64BE = Int64Buffer.Int64BE;
    var uint8 = require_write_uint8().uint8;
    var Bufferish = require_bufferish();
    var Buffer2 = Bufferish.global;
    var IS_BUFFER_SHIM = Bufferish.hasBuffer && "TYPED_ARRAY_SUPPORT" in Buffer2;
    var NO_TYPED_ARRAY = IS_BUFFER_SHIM && !Buffer2.TYPED_ARRAY_SUPPORT;
    var Buffer_prototype = Bufferish.hasBuffer && Buffer2.prototype || {};
    exports.getWriteToken = getWriteToken;
    function getWriteToken(options) {
      if (options && options.uint8array) {
        return init_uint8array();
      } else if (NO_TYPED_ARRAY || Bufferish.hasBuffer && options && options.safe) {
        return init_safe();
      } else {
        return init_token();
      }
    }
    function init_uint8array() {
      var token = init_token();
      token[202] = writeN(202, 4, writeFloatBE);
      token[203] = writeN(203, 8, writeDoubleBE);
      return token;
    }
    function init_token() {
      var token = uint8.slice();
      token[196] = write1(196);
      token[197] = write2(197);
      token[198] = write4(198);
      token[199] = write1(199);
      token[200] = write2(200);
      token[201] = write4(201);
      token[202] = writeN(202, 4, Buffer_prototype.writeFloatBE || writeFloatBE, true);
      token[203] = writeN(203, 8, Buffer_prototype.writeDoubleBE || writeDoubleBE, true);
      token[204] = write1(204);
      token[205] = write2(205);
      token[206] = write4(206);
      token[207] = writeN(207, 8, writeUInt64BE);
      token[208] = write1(208);
      token[209] = write2(209);
      token[210] = write4(210);
      token[211] = writeN(211, 8, writeInt64BE);
      token[217] = write1(217);
      token[218] = write2(218);
      token[219] = write4(219);
      token[220] = write2(220);
      token[221] = write4(221);
      token[222] = write2(222);
      token[223] = write4(223);
      return token;
    }
    function init_safe() {
      var token = uint8.slice();
      token[196] = writeN(196, 1, Buffer2.prototype.writeUInt8);
      token[197] = writeN(197, 2, Buffer2.prototype.writeUInt16BE);
      token[198] = writeN(198, 4, Buffer2.prototype.writeUInt32BE);
      token[199] = writeN(199, 1, Buffer2.prototype.writeUInt8);
      token[200] = writeN(200, 2, Buffer2.prototype.writeUInt16BE);
      token[201] = writeN(201, 4, Buffer2.prototype.writeUInt32BE);
      token[202] = writeN(202, 4, Buffer2.prototype.writeFloatBE);
      token[203] = writeN(203, 8, Buffer2.prototype.writeDoubleBE);
      token[204] = writeN(204, 1, Buffer2.prototype.writeUInt8);
      token[205] = writeN(205, 2, Buffer2.prototype.writeUInt16BE);
      token[206] = writeN(206, 4, Buffer2.prototype.writeUInt32BE);
      token[207] = writeN(207, 8, writeUInt64BE);
      token[208] = writeN(208, 1, Buffer2.prototype.writeInt8);
      token[209] = writeN(209, 2, Buffer2.prototype.writeInt16BE);
      token[210] = writeN(210, 4, Buffer2.prototype.writeInt32BE);
      token[211] = writeN(211, 8, writeInt64BE);
      token[217] = writeN(217, 1, Buffer2.prototype.writeUInt8);
      token[218] = writeN(218, 2, Buffer2.prototype.writeUInt16BE);
      token[219] = writeN(219, 4, Buffer2.prototype.writeUInt32BE);
      token[220] = writeN(220, 2, Buffer2.prototype.writeUInt16BE);
      token[221] = writeN(221, 4, Buffer2.prototype.writeUInt32BE);
      token[222] = writeN(222, 2, Buffer2.prototype.writeUInt16BE);
      token[223] = writeN(223, 4, Buffer2.prototype.writeUInt32BE);
      return token;
    }
    function write1(type) {
      return function(encoder, value) {
        var offset = encoder.reserve(2);
        var buffer = encoder.buffer;
        buffer[offset++] = type;
        buffer[offset] = value;
      };
    }
    function write2(type) {
      return function(encoder, value) {
        var offset = encoder.reserve(3);
        var buffer = encoder.buffer;
        buffer[offset++] = type;
        buffer[offset++] = value >>> 8;
        buffer[offset] = value;
      };
    }
    function write4(type) {
      return function(encoder, value) {
        var offset = encoder.reserve(5);
        var buffer = encoder.buffer;
        buffer[offset++] = type;
        buffer[offset++] = value >>> 24;
        buffer[offset++] = value >>> 16;
        buffer[offset++] = value >>> 8;
        buffer[offset] = value;
      };
    }
    function writeN(type, len, method, noAssert) {
      return function(encoder, value) {
        var offset = encoder.reserve(len + 1);
        encoder.buffer[offset++] = type;
        method.call(encoder.buffer, value, offset, noAssert);
      };
    }
    function writeUInt64BE(value, offset) {
      new Uint64BE(this, offset, value);
    }
    function writeInt64BE(value, offset) {
      new Int64BE(this, offset, value);
    }
    function writeFloatBE(value, offset) {
      ieee754.write(this, value, offset, false, 23, 4);
    }
    function writeDoubleBE(value, offset) {
      ieee754.write(this, value, offset, false, 52, 8);
    }
  }
});

// node_modules/msgpack-lite/lib/write-type.js
var require_write_type = __commonJS({
  "node_modules/msgpack-lite/lib/write-type.js"(exports) {
    var IS_ARRAY = require_isarray();
    var Int64Buffer = require_int64_buffer();
    var Uint64BE = Int64Buffer.Uint64BE;
    var Int64BE = Int64Buffer.Int64BE;
    var Bufferish = require_bufferish();
    var BufferProto = require_bufferish_proto();
    var WriteToken = require_write_token();
    var uint8 = require_write_uint8().uint8;
    var ExtBuffer = require_ext_buffer().ExtBuffer;
    var HAS_UINT8ARRAY = typeof Uint8Array !== "undefined";
    var HAS_MAP = typeof Map !== "undefined";
    var extmap = [];
    extmap[1] = 212;
    extmap[2] = 213;
    extmap[4] = 214;
    extmap[8] = 215;
    extmap[16] = 216;
    exports.getWriteType = getWriteType;
    function getWriteType(options) {
      var token = WriteToken.getWriteToken(options);
      var useraw = options && options.useraw;
      var binarraybuffer = HAS_UINT8ARRAY && options && options.binarraybuffer;
      var isBuffer = binarraybuffer ? Bufferish.isArrayBuffer : Bufferish.isBuffer;
      var bin = binarraybuffer ? bin_arraybuffer : bin_buffer;
      var usemap = HAS_MAP && options && options.usemap;
      var map = usemap ? map_to_map : obj_to_map;
      var writeType = {
        "boolean": bool,
        "function": nil,
        "number": number,
        "object": useraw ? object_raw : object,
        "string": _string(useraw ? raw_head_size : str_head_size),
        "symbol": nil,
        "undefined": nil
      };
      return writeType;
      function bool(encoder, value) {
        var type = value ? 195 : 194;
        token[type](encoder, value);
      }
      function number(encoder, value) {
        var ivalue = value | 0;
        var type;
        if (value !== ivalue) {
          type = 203;
          token[type](encoder, value);
          return;
        } else if (-32 <= ivalue && ivalue <= 127) {
          type = ivalue & 255;
        } else if (0 <= ivalue) {
          type = ivalue <= 255 ? 204 : ivalue <= 65535 ? 205 : 206;
        } else {
          type = -128 <= ivalue ? 208 : -32768 <= ivalue ? 209 : 210;
        }
        token[type](encoder, ivalue);
      }
      function uint64(encoder, value) {
        var type = 207;
        token[type](encoder, value.toArray());
      }
      function int64(encoder, value) {
        var type = 211;
        token[type](encoder, value.toArray());
      }
      function str_head_size(length) {
        return length < 32 ? 1 : length <= 255 ? 2 : length <= 65535 ? 3 : 5;
      }
      function raw_head_size(length) {
        return length < 32 ? 1 : length <= 65535 ? 3 : 5;
      }
      function _string(head_size) {
        return string;
        function string(encoder, value) {
          var length = value.length;
          var maxsize = 5 + length * 3;
          encoder.offset = encoder.reserve(maxsize);
          var buffer = encoder.buffer;
          var expected = head_size(length);
          var start = encoder.offset + expected;
          length = BufferProto.write.call(buffer, value, start);
          var actual = head_size(length);
          if (expected !== actual) {
            var targetStart = start + actual - expected;
            var end = start + length;
            BufferProto.copy.call(buffer, buffer, targetStart, start, end);
          }
          var type = actual === 1 ? 160 + length : actual <= 3 ? 215 + actual : 219;
          token[type](encoder, length);
          encoder.offset += length;
        }
      }
      function object(encoder, value) {
        if (value === null)
          return nil(encoder, value);
        if (isBuffer(value))
          return bin(encoder, value);
        if (IS_ARRAY(value))
          return array(encoder, value);
        if (Uint64BE.isUint64BE(value))
          return uint64(encoder, value);
        if (Int64BE.isInt64BE(value))
          return int64(encoder, value);
        var packer = encoder.codec.getExtPacker(value);
        if (packer)
          value = packer(value);
        if (value instanceof ExtBuffer)
          return ext(encoder, value);
        map(encoder, value);
      }
      function object_raw(encoder, value) {
        if (isBuffer(value))
          return raw(encoder, value);
        object(encoder, value);
      }
      function nil(encoder, value) {
        var type = 192;
        token[type](encoder, value);
      }
      function array(encoder, value) {
        var length = value.length;
        var type = length < 16 ? 144 + length : length <= 65535 ? 220 : 221;
        token[type](encoder, length);
        var encode = encoder.codec.encode;
        for (var i = 0; i < length; i++) {
          encode(encoder, value[i]);
        }
      }
      function bin_buffer(encoder, value) {
        var length = value.length;
        var type = length < 255 ? 196 : length <= 65535 ? 197 : 198;
        token[type](encoder, length);
        encoder.send(value);
      }
      function bin_arraybuffer(encoder, value) {
        bin_buffer(encoder, new Uint8Array(value));
      }
      function ext(encoder, value) {
        var buffer = value.buffer;
        var length = buffer.length;
        var type = extmap[length] || (length < 255 ? 199 : length <= 65535 ? 200 : 201);
        token[type](encoder, length);
        uint8[value.type](encoder);
        encoder.send(buffer);
      }
      function obj_to_map(encoder, value) {
        var keys = Object.keys(value);
        var length = keys.length;
        var type = length < 16 ? 128 + length : length <= 65535 ? 222 : 223;
        token[type](encoder, length);
        var encode = encoder.codec.encode;
        keys.forEach(function(key) {
          encode(encoder, key);
          encode(encoder, value[key]);
        });
      }
      function map_to_map(encoder, value) {
        if (!(value instanceof Map))
          return obj_to_map(encoder, value);
        var length = value.size;
        var type = length < 16 ? 128 + length : length <= 65535 ? 222 : 223;
        token[type](encoder, length);
        var encode = encoder.codec.encode;
        value.forEach(function(val, key, m) {
          encode(encoder, key);
          encode(encoder, val);
        });
      }
      function raw(encoder, value) {
        var length = value.length;
        var type = length < 32 ? 160 + length : length <= 65535 ? 218 : 219;
        token[type](encoder, length);
        encoder.send(value);
      }
    }
  }
});

// node_modules/msgpack-lite/lib/codec-base.js
var require_codec_base = __commonJS({
  "node_modules/msgpack-lite/lib/codec-base.js"(exports) {
    var IS_ARRAY = require_isarray();
    exports.createCodec = createCodec;
    exports.install = install;
    exports.filter = filter;
    var Bufferish = require_bufferish();
    function Codec(options) {
      if (!(this instanceof Codec))
        return new Codec(options);
      this.options = options;
      this.init();
    }
    Codec.prototype.init = function() {
      var options = this.options;
      if (options && options.uint8array) {
        this.bufferish = Bufferish.Uint8Array;
      }
      return this;
    };
    function install(props) {
      for (var key in props) {
        Codec.prototype[key] = add(Codec.prototype[key], props[key]);
      }
    }
    function add(a, b) {
      return a && b ? ab : a || b;
      function ab() {
        a.apply(this, arguments);
        return b.apply(this, arguments);
      }
    }
    function join(filters) {
      filters = filters.slice();
      return function(value) {
        return filters.reduce(iterator, value);
      };
      function iterator(value, filter2) {
        return filter2(value);
      }
    }
    function filter(filter2) {
      return IS_ARRAY(filter2) ? join(filter2) : filter2;
    }
    function createCodec(options) {
      return new Codec(options);
    }
    exports.preset = createCodec({ preset: true });
  }
});

// node_modules/msgpack-lite/lib/write-core.js
var require_write_core = __commonJS({
  "node_modules/msgpack-lite/lib/write-core.js"(exports) {
    var ExtBuffer = require_ext_buffer().ExtBuffer;
    var ExtPacker = require_ext_packer();
    var WriteType = require_write_type();
    var CodecBase = require_codec_base();
    CodecBase.install({
      addExtPacker,
      getExtPacker,
      init
    });
    exports.preset = init.call(CodecBase.preset);
    function getEncoder(options) {
      var writeType = WriteType.getWriteType(options);
      return encode;
      function encode(encoder, value) {
        var func = writeType[typeof value];
        if (!func)
          throw new Error('Unsupported type "' + typeof value + '": ' + value);
        func(encoder, value);
      }
    }
    function init() {
      var options = this.options;
      this.encode = getEncoder(options);
      if (options && options.preset) {
        ExtPacker.setExtPackers(this);
      }
      return this;
    }
    function addExtPacker(etype, Class, packer) {
      packer = CodecBase.filter(packer);
      var name = Class.name;
      if (name && name !== "Object") {
        var packers = this.extPackers || (this.extPackers = {});
        packers[name] = extPacker;
      } else {
        var list = this.extEncoderList || (this.extEncoderList = []);
        list.unshift([Class, extPacker]);
      }
      function extPacker(value) {
        if (packer)
          value = packer(value);
        return new ExtBuffer(value, etype);
      }
    }
    function getExtPacker(value) {
      var packers = this.extPackers || (this.extPackers = {});
      var c = value.constructor;
      var e = c && c.name && packers[c.name];
      if (e)
        return e;
      var list = this.extEncoderList || (this.extEncoderList = []);
      var len = list.length;
      for (var i = 0; i < len; i++) {
        var pair = list[i];
        if (c === pair[0])
          return pair[1];
      }
    }
  }
});

// node_modules/msgpack-lite/lib/flex-buffer.js
var require_flex_buffer = __commonJS({
  "node_modules/msgpack-lite/lib/flex-buffer.js"(exports) {
    exports.FlexDecoder = FlexDecoder;
    exports.FlexEncoder = FlexEncoder;
    var Bufferish = require_bufferish();
    var MIN_BUFFER_SIZE = 2048;
    var MAX_BUFFER_SIZE = 65536;
    var BUFFER_SHORTAGE = "BUFFER_SHORTAGE";
    function FlexDecoder() {
      if (!(this instanceof FlexDecoder))
        return new FlexDecoder();
    }
    function FlexEncoder() {
      if (!(this instanceof FlexEncoder))
        return new FlexEncoder();
    }
    FlexDecoder.mixin = mixinFactory(getDecoderMethods());
    FlexDecoder.mixin(FlexDecoder.prototype);
    FlexEncoder.mixin = mixinFactory(getEncoderMethods());
    FlexEncoder.mixin(FlexEncoder.prototype);
    function getDecoderMethods() {
      return {
        bufferish: Bufferish,
        write: write2,
        fetch,
        flush,
        push,
        pull,
        read,
        reserve,
        offset: 0
      };
      function write2(chunk) {
        var prev = this.offset ? Bufferish.prototype.slice.call(this.buffer, this.offset) : this.buffer;
        this.buffer = prev ? chunk ? this.bufferish.concat([prev, chunk]) : prev : chunk;
        this.offset = 0;
      }
      function flush() {
        while (this.offset < this.buffer.length) {
          var start = this.offset;
          var value;
          try {
            value = this.fetch();
          } catch (e) {
            if (e && e.message != BUFFER_SHORTAGE)
              throw e;
            this.offset = start;
            break;
          }
          this.push(value);
        }
      }
      function reserve(length) {
        var start = this.offset;
        var end = start + length;
        if (end > this.buffer.length)
          throw new Error(BUFFER_SHORTAGE);
        this.offset = end;
        return start;
      }
    }
    function getEncoderMethods() {
      return {
        bufferish: Bufferish,
        write,
        fetch: fetch2,
        flush,
        push,
        pull: pull2,
        read,
        reserve,
        send,
        maxBufferSize: MAX_BUFFER_SIZE,
        minBufferSize: MIN_BUFFER_SIZE,
        offset: 0,
        start: 0
      };
      function fetch2() {
        var start = this.start;
        if (start < this.offset) {
          var end = this.start = this.offset;
          return Bufferish.prototype.slice.call(this.buffer, start, end);
        }
      }
      function flush() {
        while (this.start < this.offset) {
          var value = this.fetch();
          if (value)
            this.push(value);
        }
      }
      function pull2() {
        var buffers = this.buffers || (this.buffers = []);
        var chunk = buffers.length > 1 ? this.bufferish.concat(buffers) : buffers[0];
        buffers.length = 0;
        return chunk;
      }
      function reserve(length) {
        var req = length | 0;
        if (this.buffer) {
          var size = this.buffer.length;
          var start = this.offset | 0;
          var end = start + req;
          if (end < size) {
            this.offset = end;
            return start;
          }
          this.flush();
          length = Math.max(length, Math.min(size * 2, this.maxBufferSize));
        }
        length = Math.max(length, this.minBufferSize);
        this.buffer = this.bufferish.alloc(length);
        this.start = 0;
        this.offset = req;
        return 0;
      }
      function send(buffer) {
        var length = buffer.length;
        if (length > this.minBufferSize) {
          this.flush();
          this.push(buffer);
        } else {
          var offset = this.reserve(length);
          Bufferish.prototype.copy.call(buffer, this.buffer, offset);
        }
      }
    }
    function write() {
      throw new Error("method not implemented: write()");
    }
    function fetch() {
      throw new Error("method not implemented: fetch()");
    }
    function read() {
      var length = this.buffers && this.buffers.length;
      if (!length)
        return this.fetch();
      this.flush();
      return this.pull();
    }
    function push(chunk) {
      var buffers = this.buffers || (this.buffers = []);
      buffers.push(chunk);
    }
    function pull() {
      var buffers = this.buffers || (this.buffers = []);
      return buffers.shift();
    }
    function mixinFactory(source) {
      return mixin;
      function mixin(target) {
        for (var key in source) {
          target[key] = source[key];
        }
        return target;
      }
    }
  }
});

// node_modules/msgpack-lite/lib/encode-buffer.js
var require_encode_buffer = __commonJS({
  "node_modules/msgpack-lite/lib/encode-buffer.js"(exports) {
    exports.EncodeBuffer = EncodeBuffer;
    var preset = require_write_core().preset;
    var FlexEncoder = require_flex_buffer().FlexEncoder;
    FlexEncoder.mixin(EncodeBuffer.prototype);
    function EncodeBuffer(options) {
      if (!(this instanceof EncodeBuffer))
        return new EncodeBuffer(options);
      if (options) {
        this.options = options;
        if (options.codec) {
          var codec = this.codec = options.codec;
          if (codec.bufferish)
            this.bufferish = codec.bufferish;
        }
      }
    }
    EncodeBuffer.prototype.codec = preset;
    EncodeBuffer.prototype.write = function(input) {
      this.codec.encode(this, input);
    };
  }
});

// node_modules/msgpack-lite/lib/encode.js
var require_encode = __commonJS({
  "node_modules/msgpack-lite/lib/encode.js"(exports) {
    exports.encode = encode;
    var EncodeBuffer = require_encode_buffer().EncodeBuffer;
    function encode(input, options) {
      var encoder = new EncodeBuffer(options);
      encoder.write(input);
      return encoder.read();
    }
  }
});

// node_modules/msgpack-lite/lib/ext-unpacker.js
var require_ext_unpacker = __commonJS({
  "node_modules/msgpack-lite/lib/ext-unpacker.js"(exports) {
    exports.setExtUnpackers = setExtUnpackers;
    var Bufferish = require_bufferish();
    var Buffer2 = Bufferish.global;
    var _decode;
    var ERROR_COLUMNS = { name: 1, message: 1, stack: 1, columnNumber: 1, fileName: 1, lineNumber: 1 };
    function setExtUnpackers(codec) {
      codec.addExtUnpacker(14, [decode, unpackError(Error)]);
      codec.addExtUnpacker(1, [decode, unpackError(EvalError)]);
      codec.addExtUnpacker(2, [decode, unpackError(RangeError)]);
      codec.addExtUnpacker(3, [decode, unpackError(ReferenceError)]);
      codec.addExtUnpacker(4, [decode, unpackError(SyntaxError)]);
      codec.addExtUnpacker(5, [decode, unpackError(TypeError)]);
      codec.addExtUnpacker(6, [decode, unpackError(URIError)]);
      codec.addExtUnpacker(10, [decode, unpackRegExp]);
      codec.addExtUnpacker(11, [decode, unpackClass(Boolean)]);
      codec.addExtUnpacker(12, [decode, unpackClass(String)]);
      codec.addExtUnpacker(13, [decode, unpackClass(Date)]);
      codec.addExtUnpacker(15, [decode, unpackClass(Number)]);
      if (typeof Uint8Array !== "undefined") {
        codec.addExtUnpacker(17, unpackClass(Int8Array));
        codec.addExtUnpacker(18, unpackClass(Uint8Array));
        codec.addExtUnpacker(19, [unpackArrayBuffer, unpackClass(Int16Array)]);
        codec.addExtUnpacker(20, [unpackArrayBuffer, unpackClass(Uint16Array)]);
        codec.addExtUnpacker(21, [unpackArrayBuffer, unpackClass(Int32Array)]);
        codec.addExtUnpacker(22, [unpackArrayBuffer, unpackClass(Uint32Array)]);
        codec.addExtUnpacker(23, [unpackArrayBuffer, unpackClass(Float32Array)]);
        if (typeof Float64Array !== "undefined") {
          codec.addExtUnpacker(24, [unpackArrayBuffer, unpackClass(Float64Array)]);
        }
        if (typeof Uint8ClampedArray !== "undefined") {
          codec.addExtUnpacker(25, unpackClass(Uint8ClampedArray));
        }
        codec.addExtUnpacker(26, unpackArrayBuffer);
        codec.addExtUnpacker(29, [unpackArrayBuffer, unpackClass(DataView)]);
      }
      if (Bufferish.hasBuffer) {
        codec.addExtUnpacker(27, unpackClass(Buffer2));
      }
    }
    function decode(input) {
      if (!_decode)
        _decode = require_decode().decode;
      return _decode(input);
    }
    function unpackRegExp(value) {
      return RegExp.apply(null, value);
    }
    function unpackError(Class) {
      return function(value) {
        var out = new Class();
        for (var key in ERROR_COLUMNS) {
          out[key] = value[key];
        }
        return out;
      };
    }
    function unpackClass(Class) {
      return function(value) {
        return new Class(value);
      };
    }
    function unpackArrayBuffer(value) {
      return new Uint8Array(value).buffer;
    }
  }
});

// node_modules/msgpack-lite/lib/read-format.js
var require_read_format = __commonJS({
  "node_modules/msgpack-lite/lib/read-format.js"(exports) {
    var ieee754 = require_ieee754();
    var Int64Buffer = require_int64_buffer();
    var Uint64BE = Int64Buffer.Uint64BE;
    var Int64BE = Int64Buffer.Int64BE;
    exports.getReadFormat = getReadFormat;
    exports.readUint8 = uint8;
    var Bufferish = require_bufferish();
    var BufferProto = require_bufferish_proto();
    var HAS_MAP = typeof Map !== "undefined";
    var NO_ASSERT = true;
    function getReadFormat(options) {
      var binarraybuffer = Bufferish.hasArrayBuffer && options && options.binarraybuffer;
      var int64 = options && options.int64;
      var usemap = HAS_MAP && options && options.usemap;
      var readFormat = {
        map: usemap ? map_to_map : map_to_obj,
        array,
        str,
        bin: binarraybuffer ? bin_arraybuffer : bin_buffer,
        ext,
        uint8,
        uint16,
        uint32,
        uint64: read(8, int64 ? readUInt64BE_int64 : readUInt64BE),
        int8,
        int16,
        int32,
        int64: read(8, int64 ? readInt64BE_int64 : readInt64BE),
        float32: read(4, readFloatBE),
        float64: read(8, readDoubleBE)
      };
      return readFormat;
    }
    function map_to_obj(decoder, len) {
      var value = {};
      var i;
      var k = new Array(len);
      var v = new Array(len);
      var decode = decoder.codec.decode;
      for (i = 0; i < len; i++) {
        k[i] = decode(decoder);
        v[i] = decode(decoder);
      }
      for (i = 0; i < len; i++) {
        value[k[i]] = v[i];
      }
      return value;
    }
    function map_to_map(decoder, len) {
      var value = /* @__PURE__ */ new Map();
      var i;
      var k = new Array(len);
      var v = new Array(len);
      var decode = decoder.codec.decode;
      for (i = 0; i < len; i++) {
        k[i] = decode(decoder);
        v[i] = decode(decoder);
      }
      for (i = 0; i < len; i++) {
        value.set(k[i], v[i]);
      }
      return value;
    }
    function array(decoder, len) {
      var value = new Array(len);
      var decode = decoder.codec.decode;
      for (var i = 0; i < len; i++) {
        value[i] = decode(decoder);
      }
      return value;
    }
    function str(decoder, len) {
      var start = decoder.reserve(len);
      var end = start + len;
      return BufferProto.toString.call(decoder.buffer, "utf-8", start, end);
    }
    function bin_buffer(decoder, len) {
      var start = decoder.reserve(len);
      var end = start + len;
      var buf = BufferProto.slice.call(decoder.buffer, start, end);
      return Bufferish.from(buf);
    }
    function bin_arraybuffer(decoder, len) {
      var start = decoder.reserve(len);
      var end = start + len;
      var buf = BufferProto.slice.call(decoder.buffer, start, end);
      return Bufferish.Uint8Array.from(buf).buffer;
    }
    function ext(decoder, len) {
      var start = decoder.reserve(len + 1);
      var type = decoder.buffer[start++];
      var end = start + len;
      var unpack = decoder.codec.getExtUnpacker(type);
      if (!unpack)
        throw new Error("Invalid ext type: " + (type ? "0x" + type.toString(16) : type));
      var buf = BufferProto.slice.call(decoder.buffer, start, end);
      return unpack(buf);
    }
    function uint8(decoder) {
      var start = decoder.reserve(1);
      return decoder.buffer[start];
    }
    function int8(decoder) {
      var start = decoder.reserve(1);
      var value = decoder.buffer[start];
      return value & 128 ? value - 256 : value;
    }
    function uint16(decoder) {
      var start = decoder.reserve(2);
      var buffer = decoder.buffer;
      return buffer[start++] << 8 | buffer[start];
    }
    function int16(decoder) {
      var start = decoder.reserve(2);
      var buffer = decoder.buffer;
      var value = buffer[start++] << 8 | buffer[start];
      return value & 32768 ? value - 65536 : value;
    }
    function uint32(decoder) {
      var start = decoder.reserve(4);
      var buffer = decoder.buffer;
      return buffer[start++] * 16777216 + (buffer[start++] << 16) + (buffer[start++] << 8) + buffer[start];
    }
    function int32(decoder) {
      var start = decoder.reserve(4);
      var buffer = decoder.buffer;
      return buffer[start++] << 24 | buffer[start++] << 16 | buffer[start++] << 8 | buffer[start];
    }
    function read(len, method) {
      return function(decoder) {
        var start = decoder.reserve(len);
        return method.call(decoder.buffer, start, NO_ASSERT);
      };
    }
    function readUInt64BE(start) {
      return new Uint64BE(this, start).toNumber();
    }
    function readInt64BE(start) {
      return new Int64BE(this, start).toNumber();
    }
    function readUInt64BE_int64(start) {
      return new Uint64BE(this, start);
    }
    function readInt64BE_int64(start) {
      return new Int64BE(this, start);
    }
    function readFloatBE(start) {
      return ieee754.read(this, start, false, 23, 4);
    }
    function readDoubleBE(start) {
      return ieee754.read(this, start, false, 52, 8);
    }
  }
});

// node_modules/msgpack-lite/lib/read-token.js
var require_read_token = __commonJS({
  "node_modules/msgpack-lite/lib/read-token.js"(exports) {
    var ReadFormat = require_read_format();
    exports.getReadToken = getReadToken;
    function getReadToken(options) {
      var format = ReadFormat.getReadFormat(options);
      if (options && options.useraw) {
        return init_useraw(format);
      } else {
        return init_token(format);
      }
    }
    function init_token(format) {
      var i;
      var token = new Array(256);
      for (i = 0; i <= 127; i++) {
        token[i] = constant(i);
      }
      for (i = 128; i <= 143; i++) {
        token[i] = fix(i - 128, format.map);
      }
      for (i = 144; i <= 159; i++) {
        token[i] = fix(i - 144, format.array);
      }
      for (i = 160; i <= 191; i++) {
        token[i] = fix(i - 160, format.str);
      }
      token[192] = constant(null);
      token[193] = null;
      token[194] = constant(false);
      token[195] = constant(true);
      token[196] = flex(format.uint8, format.bin);
      token[197] = flex(format.uint16, format.bin);
      token[198] = flex(format.uint32, format.bin);
      token[199] = flex(format.uint8, format.ext);
      token[200] = flex(format.uint16, format.ext);
      token[201] = flex(format.uint32, format.ext);
      token[202] = format.float32;
      token[203] = format.float64;
      token[204] = format.uint8;
      token[205] = format.uint16;
      token[206] = format.uint32;
      token[207] = format.uint64;
      token[208] = format.int8;
      token[209] = format.int16;
      token[210] = format.int32;
      token[211] = format.int64;
      token[212] = fix(1, format.ext);
      token[213] = fix(2, format.ext);
      token[214] = fix(4, format.ext);
      token[215] = fix(8, format.ext);
      token[216] = fix(16, format.ext);
      token[217] = flex(format.uint8, format.str);
      token[218] = flex(format.uint16, format.str);
      token[219] = flex(format.uint32, format.str);
      token[220] = flex(format.uint16, format.array);
      token[221] = flex(format.uint32, format.array);
      token[222] = flex(format.uint16, format.map);
      token[223] = flex(format.uint32, format.map);
      for (i = 224; i <= 255; i++) {
        token[i] = constant(i - 256);
      }
      return token;
    }
    function init_useraw(format) {
      var i;
      var token = init_token(format).slice();
      token[217] = token[196];
      token[218] = token[197];
      token[219] = token[198];
      for (i = 160; i <= 191; i++) {
        token[i] = fix(i - 160, format.bin);
      }
      return token;
    }
    function constant(value) {
      return function() {
        return value;
      };
    }
    function flex(lenFunc, decodeFunc) {
      return function(decoder) {
        var len = lenFunc(decoder);
        return decodeFunc(decoder, len);
      };
    }
    function fix(len, method) {
      return function(decoder) {
        return method(decoder, len);
      };
    }
  }
});

// node_modules/msgpack-lite/lib/read-core.js
var require_read_core = __commonJS({
  "node_modules/msgpack-lite/lib/read-core.js"(exports) {
    var ExtBuffer = require_ext_buffer().ExtBuffer;
    var ExtUnpacker = require_ext_unpacker();
    var readUint8 = require_read_format().readUint8;
    var ReadToken = require_read_token();
    var CodecBase = require_codec_base();
    CodecBase.install({
      addExtUnpacker,
      getExtUnpacker,
      init
    });
    exports.preset = init.call(CodecBase.preset);
    function getDecoder(options) {
      var readToken = ReadToken.getReadToken(options);
      return decode;
      function decode(decoder) {
        var type = readUint8(decoder);
        var func = readToken[type];
        if (!func)
          throw new Error("Invalid type: " + (type ? "0x" + type.toString(16) : type));
        return func(decoder);
      }
    }
    function init() {
      var options = this.options;
      this.decode = getDecoder(options);
      if (options && options.preset) {
        ExtUnpacker.setExtUnpackers(this);
      }
      return this;
    }
    function addExtUnpacker(etype, unpacker) {
      var unpackers = this.extUnpackers || (this.extUnpackers = []);
      unpackers[etype] = CodecBase.filter(unpacker);
    }
    function getExtUnpacker(type) {
      var unpackers = this.extUnpackers || (this.extUnpackers = []);
      return unpackers[type] || extUnpacker;
      function extUnpacker(buffer) {
        return new ExtBuffer(buffer, type);
      }
    }
  }
});

// node_modules/msgpack-lite/lib/decode-buffer.js
var require_decode_buffer = __commonJS({
  "node_modules/msgpack-lite/lib/decode-buffer.js"(exports) {
    exports.DecodeBuffer = DecodeBuffer;
    var preset = require_read_core().preset;
    var FlexDecoder = require_flex_buffer().FlexDecoder;
    FlexDecoder.mixin(DecodeBuffer.prototype);
    function DecodeBuffer(options) {
      if (!(this instanceof DecodeBuffer))
        return new DecodeBuffer(options);
      if (options) {
        this.options = options;
        if (options.codec) {
          var codec = this.codec = options.codec;
          if (codec.bufferish)
            this.bufferish = codec.bufferish;
        }
      }
    }
    DecodeBuffer.prototype.codec = preset;
    DecodeBuffer.prototype.fetch = function() {
      return this.codec.decode(this);
    };
  }
});

// node_modules/msgpack-lite/lib/decode.js
var require_decode = __commonJS({
  "node_modules/msgpack-lite/lib/decode.js"(exports) {
    exports.decode = decode;
    var DecodeBuffer = require_decode_buffer().DecodeBuffer;
    function decode(input, options) {
      var decoder = new DecodeBuffer(options);
      decoder.write(input);
      return decoder.read();
    }
  }
});

// node_modules/event-lite/event-lite.js
var require_event_lite = __commonJS({
  "node_modules/event-lite/event-lite.js"(exports, module2) {
    function EventLite() {
      if (!(this instanceof EventLite))
        return new EventLite();
    }
    (function(EventLite2) {
      if (typeof module2 !== "undefined")
        module2.exports = EventLite2;
      var LISTENERS = "listeners";
      var methods = {
        on,
        once,
        off,
        emit
      };
      mixin(EventLite2.prototype);
      EventLite2.mixin = mixin;
      function mixin(target) {
        for (var key in methods) {
          target[key] = methods[key];
        }
        return target;
      }
      function on(type, func) {
        getListeners(this, type).push(func);
        return this;
      }
      function once(type, func) {
        var that = this;
        wrap.originalListener = func;
        getListeners(that, type).push(wrap);
        return that;
        function wrap() {
          off.call(that, type, wrap);
          func.apply(this, arguments);
        }
      }
      function off(type, func) {
        var that = this;
        var listners;
        if (!arguments.length) {
          delete that[LISTENERS];
        } else if (!func) {
          listners = that[LISTENERS];
          if (listners) {
            delete listners[type];
            if (!Object.keys(listners).length)
              return off.call(that);
          }
        } else {
          listners = getListeners(that, type, true);
          if (listners) {
            listners = listners.filter(ne);
            if (!listners.length)
              return off.call(that, type);
            that[LISTENERS][type] = listners;
          }
        }
        return that;
        function ne(test) {
          return test !== func && test.originalListener !== func;
        }
      }
      function emit(type, value) {
        var that = this;
        var listeners = getListeners(that, type, true);
        if (!listeners)
          return false;
        var arglen = arguments.length;
        if (arglen === 1) {
          listeners.forEach(zeroarg);
        } else if (arglen === 2) {
          listeners.forEach(onearg);
        } else {
          var args = Array.prototype.slice.call(arguments, 1);
          listeners.forEach(moreargs);
        }
        return !!listeners.length;
        function zeroarg(func) {
          func.call(that);
        }
        function onearg(func) {
          func.call(that, value);
        }
        function moreargs(func) {
          func.apply(that, args);
        }
      }
      function getListeners(that, type, readonly) {
        if (readonly && !that[LISTENERS])
          return;
        var listeners = that[LISTENERS] || (that[LISTENERS] = {});
        return listeners[type] || (listeners[type] = []);
      }
    })(EventLite);
  }
});

// node_modules/msgpack-lite/lib/encoder.js
var require_encoder = __commonJS({
  "node_modules/msgpack-lite/lib/encoder.js"(exports) {
    exports.Encoder = Encoder;
    var EventLite = require_event_lite();
    var EncodeBuffer = require_encode_buffer().EncodeBuffer;
    function Encoder(options) {
      if (!(this instanceof Encoder))
        return new Encoder(options);
      EncodeBuffer.call(this, options);
    }
    Encoder.prototype = new EncodeBuffer();
    EventLite.mixin(Encoder.prototype);
    Encoder.prototype.encode = function(chunk) {
      this.write(chunk);
      this.emit("data", this.read());
    };
    Encoder.prototype.end = function(chunk) {
      if (arguments.length)
        this.encode(chunk);
      this.flush();
      this.emit("end");
    };
  }
});

// node_modules/msgpack-lite/lib/decoder.js
var require_decoder = __commonJS({
  "node_modules/msgpack-lite/lib/decoder.js"(exports) {
    exports.Decoder = Decoder;
    var EventLite = require_event_lite();
    var DecodeBuffer = require_decode_buffer().DecodeBuffer;
    function Decoder(options) {
      if (!(this instanceof Decoder))
        return new Decoder(options);
      DecodeBuffer.call(this, options);
    }
    Decoder.prototype = new DecodeBuffer();
    EventLite.mixin(Decoder.prototype);
    Decoder.prototype.decode = function(chunk) {
      if (arguments.length)
        this.write(chunk);
      this.flush();
    };
    Decoder.prototype.push = function(chunk) {
      this.emit("data", chunk);
    };
    Decoder.prototype.end = function(chunk) {
      this.decode(chunk);
      this.emit("end");
    };
  }
});

// node_modules/msgpack-lite/lib/encode-stream.js
var require_encode_stream = __commonJS({
  "node_modules/msgpack-lite/lib/encode-stream.js"(exports) {
    exports.createEncodeStream = EncodeStream;
    var util = require("util");
    var Transform = require("stream").Transform;
    var EncodeBuffer = require_encode_buffer().EncodeBuffer;
    util.inherits(EncodeStream, Transform);
    var DEFAULT_OPTIONS = { objectMode: true };
    function EncodeStream(options) {
      if (!(this instanceof EncodeStream))
        return new EncodeStream(options);
      if (options) {
        options.objectMode = true;
      } else {
        options = DEFAULT_OPTIONS;
      }
      Transform.call(this, options);
      var stream = this;
      var encoder = this.encoder = new EncodeBuffer(options);
      encoder.push = function(chunk) {
        stream.push(chunk);
      };
    }
    EncodeStream.prototype._transform = function(chunk, encoding, callback) {
      this.encoder.write(chunk);
      if (callback)
        callback();
    };
    EncodeStream.prototype._flush = function(callback) {
      this.encoder.flush();
      if (callback)
        callback();
    };
  }
});

// node_modules/msgpack-lite/lib/decode-stream.js
var require_decode_stream = __commonJS({
  "node_modules/msgpack-lite/lib/decode-stream.js"(exports) {
    exports.createDecodeStream = DecodeStream;
    var util = require("util");
    var Transform = require("stream").Transform;
    var DecodeBuffer = require_decode_buffer().DecodeBuffer;
    util.inherits(DecodeStream, Transform);
    var DEFAULT_OPTIONS = { objectMode: true };
    function DecodeStream(options) {
      if (!(this instanceof DecodeStream))
        return new DecodeStream(options);
      if (options) {
        options.objectMode = true;
      } else {
        options = DEFAULT_OPTIONS;
      }
      Transform.call(this, options);
      var stream = this;
      var decoder = this.decoder = new DecodeBuffer(options);
      decoder.push = function(chunk) {
        stream.push(chunk);
      };
    }
    DecodeStream.prototype._transform = function(chunk, encoding, callback) {
      this.decoder.write(chunk);
      this.decoder.flush();
      if (callback)
        callback();
    };
  }
});

// node_modules/msgpack-lite/lib/ext.js
var require_ext = __commonJS({
  "node_modules/msgpack-lite/lib/ext.js"(exports) {
    require_read_core();
    require_write_core();
    exports.createCodec = require_codec_base().createCodec;
  }
});

// node_modules/msgpack-lite/lib/codec.js
var require_codec = __commonJS({
  "node_modules/msgpack-lite/lib/codec.js"(exports) {
    require_read_core();
    require_write_core();
    exports.codec = {
      preset: require_codec_base().preset
    };
  }
});

// node_modules/msgpack-lite/index.js
var require_msgpack_lite = __commonJS({
  "node_modules/msgpack-lite/index.js"(exports) {
    exports.encode = require_encode().encode;
    exports.decode = require_decode().decode;
    exports.Encoder = require_encoder().Encoder;
    exports.Decoder = require_decoder().Decoder;
    exports.createEncodeStream = require_encode_stream().createEncodeStream;
    exports.createDecodeStream = require_decode_stream().createDecodeStream;
    exports.createCodec = require_ext().createCodec;
    exports.codec = require_codec().codec;
  }
});

// node_modules/msgpack-sock/lib/constants.js
var require_constants = __commonJS({
  "node_modules/msgpack-sock/lib/constants.js"(exports, module2) {
    "use strict";
    module2.exports = {
      encodeStream$: Symbol("encodeStream"),
      decodeStream$: Symbol("decodeStream"),
      socket$: Symbol("socket"),
      isClosed$: Symbol("isClosed"),
      socketEventsTransfer: ["error", "connect", "drain", "lookup", "timeout", "OCSPResponse", "secureConnect"]
    };
  }
});

// node_modules/msgpack-sock/lib/index.js
var require_lib = __commonJS({
  "node_modules/msgpack-sock/lib/index.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events");
    var msgpack = require_msgpack_lite();
    var {
      encodeStream$,
      decodeStream$,
      socket$,
      isClosed$,
      socketEventsTransfer
    } = require_constants();
    var MsgpackSock = class extends EventEmitter {
      static wrap(socket, codec) {
        return new MsgpackSock(socket, codec);
      }
      static createConnectionHandler(callback, codec) {
        return function connectionHandler(socket) {
          callback(new MsgpackSock(socket, codec));
        };
      }
      static createCodec() {
        return msgpack.createCodec.apply(msgpack, arguments);
      }
      static encode() {
        return msgpack.encode.apply(msgpack, arguments);
      }
      static decode() {
        return msgpack.decode.apply(msgpack, arguments);
      }
      constructor(socket, codec) {
        super();
        if (codec) {
          this[encodeStream$] = msgpack.createEncodeStream({ codec });
          this[decodeStream$] = msgpack.createDecodeStream({ codec });
        } else {
          this[encodeStream$] = msgpack.createEncodeStream();
          this[decodeStream$] = msgpack.createDecodeStream();
        }
        const encodeStream = this[encodeStream$];
        const decodeStream = this[decodeStream$];
        this[socket$] = socket;
        encodeStream.pipe(socket);
        socket.pipe(decodeStream);
        decodeStream.on("data", (msg) => this.emit("message", msg));
        decodeStream.on("end", () => this.close());
        socket.on("close", () => this.close());
        socketEventsTransfer.forEach((event) => {
          socket.on(event, (...args) => this.emit(event, ...args));
        });
        encodeStream.on("error", (err) => this.emit("error", err));
        decodeStream.on("error", (err) => this.emit("error", err));
        this.once("close", () => {
          this[isClosed$] = true;
          this[encodeStream$].removeAllListeners();
          this[decodeStream$].removeAllListeners();
          this[socket$].removeAllListeners();
          this[encodeStream$] = null;
          this[decodeStream$] = null;
          this[socket$] = null;
        });
        this[isClosed$] = false;
      }
      send(msg) {
        if (this[isClosed$]) {
          throw new Error("Send message after close");
        }
        const encodeStream = this[encodeStream$];
        encodeStream.write(msg);
        encodeStream._flush();
        return this;
      }
      close() {
        if (this[isClosed$]) {
          return;
        }
        this[isClosed$] = true;
        this.removeAllListeners("message");
        this[encodeStream$].end();
        this.emit("close");
      }
      address() {
        return this[socket$].address();
      }
      setKeepAlive() {
        return this[socket$].setKeepAlive(...arguments);
      }
      setNoDelay() {
        return this[socket$].setNoDelay(...arguments);
      }
      setTimeout() {
        return this[socket$].setTimeout(...arguments);
      }
      ref() {
        return this[socket$].ref(...arguments);
      }
      unref() {
        return this[socket$].unref(...arguments);
      }
      getCipher() {
        if (!this[socket$].encrypted) {
          return null;
        }
        return this[socket$].getCipher(...arguments);
      }
      getEphemeralKeyInfo() {
        if (!this[socket$].encrypted) {
          return null;
        }
        return this[socket$].getEphemeralKeyInfo(...arguments);
      }
      getPeerCertificate() {
        if (!this[socket$].encrypted) {
          return null;
        }
        return this[socket$].getPeerCertificate(...arguments);
      }
      getProtocol() {
        if (!this[socket$].encrypted) {
          return "unknown";
        }
        return this[socket$].getProtocol(...arguments);
      }
      getSession() {
        if (!this[socket$].encrypted) {
          return;
        }
        return this[socket$].getSession(...arguments);
      }
      getTLSTicket() {
        if (!this[socket$].encrypted) {
          return;
        }
        return this[socket$].getTLSTicket(...arguments);
      }
      renegotiate() {
        if (!this[socket$].encrypted) {
          return;
        }
        return this[socket$].renegotiate(...arguments);
      }
      setMaxSendFragment() {
        if (!this[socket$].encrypted) {
          return;
        }
        return this[socket$].setMaxSendFragment(...arguments);
      }
      get encrypted() {
        return !!this[socket$].encrypted;
      }
      get authorized() {
        return !!this[socket$].authorized;
      }
      get bytesRead() {
        return this[socket$].bytesRead;
      }
      get bytesWritten() {
        return this[socket$].bytesWritten;
      }
      get localAddress() {
        return this[socket$].localAddress;
      }
      get localPort() {
        return this[socket$].localPort;
      }
      get remoteAddress() {
        return this[socket$].remoteAddress;
      }
      get remoteFamily() {
        return this[socket$].remoteFamily;
      }
      get remotePort() {
        return this[socket$].remotePort;
      }
    };
    module2.exports = MsgpackSock;
  }
});

// node_modules/dwaal/lib/network.js
var require_network = __commonJS({
  "node_modules/dwaal/lib/network.js"(exports, module2) {
    "use strict";
    var { EventEmitter } = require("events");
    var debug = require_src()("dwaal:network");
    var leader = require_unix_socket_leader();
    var MsgpackSock = require_lib();
    var eos = require_end_of_stream();
    module2.exports = class Network extends EventEmitter {
      constructor(path) {
        super();
        this.path = path;
      }
      open() {
        return new Promise((resolve, reject) => {
          let rejected = false;
          let connected = false;
          const connect = () => {
            this.leader = leader(this.path);
            this.leader.on("error", (err) => {
              debug("Trouble electing a storage leader;", err);
              try {
                this.leader.close();
              } catch (ex) {
              }
              if (!rejected) {
                debug("Retrying connection");
                connect();
              }
            });
            this.leader.on("connection", (socket) => {
              debug("Incoming connection from local process");
              const self = this;
              eos(socket, (err) => {
                if (err) {
                  debug("Connection from client closed with error;", err);
                } else {
                  debug("Connection from client closed cleanly");
                }
              });
              MsgpackSock.wrap(socket).on("message", function(msg) {
                self.emit("message", {
                  returnPath: this,
                  seq: msg[0],
                  type: msg[1],
                  payload: msg[2]
                });
              });
            });
            this.leader.on("client", (socket) => {
              debug("Connected to storage");
              connected = true;
              eos(socket, (err) => {
                if (err) {
                  debug("Connection to leader closed with error;", err);
                } else {
                  debug("Connection to leader closed cleanly");
                }
              });
              this.socket = MsgpackSock.wrap(socket);
              const self = this;
              this.socket.on("message", function(msg) {
                self.emit("message", {
                  returnPath: this,
                  seq: msg[0],
                  type: msg[1],
                  payload: msg[2]
                });
              });
              resolve();
            });
          };
          connect();
          setTimeout(() => {
            if (!connected) {
              rejected = true;
              reject();
            }
          }, 1e3);
        });
      }
      sendToLeader(seq, action, args) {
        this.socket.send([seq, action, args]);
      }
      close() {
        this.leader.close();
      }
    };
  }
});

// node_modules/graceful-fs/polyfills.js
var require_polyfills = __commonJS({
  "node_modules/graceful-fs/polyfills.js"(exports, module2) {
    var constants = require("constants");
    var origCwd = process.cwd;
    var cwd = null;
    var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
    process.cwd = function() {
      if (!cwd)
        cwd = origCwd.call(process);
      return cwd;
    };
    try {
      process.cwd();
    } catch (er) {
    }
    if (typeof process.chdir === "function") {
      chdir = process.chdir;
      process.chdir = function(d) {
        cwd = null;
        chdir.call(process, d);
      };
      if (Object.setPrototypeOf)
        Object.setPrototypeOf(process.chdir, chdir);
    }
    var chdir;
    module2.exports = patch;
    function patch(fs) {
      if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
        patchLchmod(fs);
      }
      if (!fs.lutimes) {
        patchLutimes(fs);
      }
      fs.chown = chownFix(fs.chown);
      fs.fchown = chownFix(fs.fchown);
      fs.lchown = chownFix(fs.lchown);
      fs.chmod = chmodFix(fs.chmod);
      fs.fchmod = chmodFix(fs.fchmod);
      fs.lchmod = chmodFix(fs.lchmod);
      fs.chownSync = chownFixSync(fs.chownSync);
      fs.fchownSync = chownFixSync(fs.fchownSync);
      fs.lchownSync = chownFixSync(fs.lchownSync);
      fs.chmodSync = chmodFixSync(fs.chmodSync);
      fs.fchmodSync = chmodFixSync(fs.fchmodSync);
      fs.lchmodSync = chmodFixSync(fs.lchmodSync);
      fs.stat = statFix(fs.stat);
      fs.fstat = statFix(fs.fstat);
      fs.lstat = statFix(fs.lstat);
      fs.statSync = statFixSync(fs.statSync);
      fs.fstatSync = statFixSync(fs.fstatSync);
      fs.lstatSync = statFixSync(fs.lstatSync);
      if (!fs.lchmod) {
        fs.lchmod = function(path, mode, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs.lchmodSync = function() {
        };
      }
      if (!fs.lchown) {
        fs.lchown = function(path, uid, gid, cb) {
          if (cb)
            process.nextTick(cb);
        };
        fs.lchownSync = function() {
        };
      }
      if (platform === "win32") {
        fs.rename = function(fs$rename) {
          return function(from, to, cb) {
            var start = Date.now();
            var backoff = 0;
            fs$rename(from, to, function CB(er) {
              if (er && (er.code === "EACCES" || er.code === "EPERM") && Date.now() - start < 6e4) {
                setTimeout(function() {
                  fs.stat(to, function(stater, st) {
                    if (stater && stater.code === "ENOENT")
                      fs$rename(from, to, CB);
                    else
                      cb(er);
                  });
                }, backoff);
                if (backoff < 100)
                  backoff += 10;
                return;
              }
              if (cb)
                cb(er);
            });
          };
        }(fs.rename);
      }
      fs.read = function(fs$read) {
        function read(fd, buffer, offset, length, position, callback_) {
          var callback;
          if (callback_ && typeof callback_ === "function") {
            var eagCounter = 0;
            callback = function(er, _, __) {
              if (er && er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                return fs$read.call(fs, fd, buffer, offset, length, position, callback);
              }
              callback_.apply(this, arguments);
            };
          }
          return fs$read.call(fs, fd, buffer, offset, length, position, callback);
        }
        if (Object.setPrototypeOf)
          Object.setPrototypeOf(read, fs$read);
        return read;
      }(fs.read);
      fs.readSync = function(fs$readSync) {
        return function(fd, buffer, offset, length, position) {
          var eagCounter = 0;
          while (true) {
            try {
              return fs$readSync.call(fs, fd, buffer, offset, length, position);
            } catch (er) {
              if (er.code === "EAGAIN" && eagCounter < 10) {
                eagCounter++;
                continue;
              }
              throw er;
            }
          }
        };
      }(fs.readSync);
      function patchLchmod(fs2) {
        fs2.lchmod = function(path, mode, callback) {
          fs2.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, function(err, fd) {
            if (err) {
              if (callback)
                callback(err);
              return;
            }
            fs2.fchmod(fd, mode, function(err2) {
              fs2.close(fd, function(err22) {
                if (callback)
                  callback(err2 || err22);
              });
            });
          });
        };
        fs2.lchmodSync = function(path, mode) {
          var fd = fs2.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
          var threw = true;
          var ret;
          try {
            ret = fs2.fchmodSync(fd, mode);
            threw = false;
          } finally {
            if (threw) {
              try {
                fs2.closeSync(fd);
              } catch (er) {
              }
            } else {
              fs2.closeSync(fd);
            }
          }
          return ret;
        };
      }
      function patchLutimes(fs2) {
        if (constants.hasOwnProperty("O_SYMLINK")) {
          fs2.lutimes = function(path, at, mt, cb) {
            fs2.open(path, constants.O_SYMLINK, function(er, fd) {
              if (er) {
                if (cb)
                  cb(er);
                return;
              }
              fs2.futimes(fd, at, mt, function(er2) {
                fs2.close(fd, function(er22) {
                  if (cb)
                    cb(er2 || er22);
                });
              });
            });
          };
          fs2.lutimesSync = function(path, at, mt) {
            var fd = fs2.openSync(path, constants.O_SYMLINK);
            var ret;
            var threw = true;
            try {
              ret = fs2.futimesSync(fd, at, mt);
              threw = false;
            } finally {
              if (threw) {
                try {
                  fs2.closeSync(fd);
                } catch (er) {
                }
              } else {
                fs2.closeSync(fd);
              }
            }
            return ret;
          };
        } else {
          fs2.lutimes = function(_a, _b, _c, cb) {
            if (cb)
              process.nextTick(cb);
          };
          fs2.lutimesSync = function() {
          };
        }
      }
      function chmodFix(orig) {
        if (!orig)
          return orig;
        return function(target, mode, cb) {
          return orig.call(fs, target, mode, function(er) {
            if (chownErOk(er))
              er = null;
            if (cb)
              cb.apply(this, arguments);
          });
        };
      }
      function chmodFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, mode) {
          try {
            return orig.call(fs, target, mode);
          } catch (er) {
            if (!chownErOk(er))
              throw er;
          }
        };
      }
      function chownFix(orig) {
        if (!orig)
          return orig;
        return function(target, uid, gid, cb) {
          return orig.call(fs, target, uid, gid, function(er) {
            if (chownErOk(er))
              er = null;
            if (cb)
              cb.apply(this, arguments);
          });
        };
      }
      function chownFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, uid, gid) {
          try {
            return orig.call(fs, target, uid, gid);
          } catch (er) {
            if (!chownErOk(er))
              throw er;
          }
        };
      }
      function statFix(orig) {
        if (!orig)
          return orig;
        return function(target, options, cb) {
          if (typeof options === "function") {
            cb = options;
            options = null;
          }
          function callback(er, stats) {
            if (stats) {
              if (stats.uid < 0)
                stats.uid += 4294967296;
              if (stats.gid < 0)
                stats.gid += 4294967296;
            }
            if (cb)
              cb.apply(this, arguments);
          }
          return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
        };
      }
      function statFixSync(orig) {
        if (!orig)
          return orig;
        return function(target, options) {
          var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
          if (stats) {
            if (stats.uid < 0)
              stats.uid += 4294967296;
            if (stats.gid < 0)
              stats.gid += 4294967296;
          }
          return stats;
        };
      }
      function chownErOk(er) {
        if (!er)
          return true;
        if (er.code === "ENOSYS")
          return true;
        var nonroot = !process.getuid || process.getuid() !== 0;
        if (nonroot) {
          if (er.code === "EINVAL" || er.code === "EPERM")
            return true;
        }
        return false;
      }
    }
  }
});

// node_modules/graceful-fs/legacy-streams.js
var require_legacy_streams = __commonJS({
  "node_modules/graceful-fs/legacy-streams.js"(exports, module2) {
    var Stream = require("stream").Stream;
    module2.exports = legacy;
    function legacy(fs) {
      return {
        ReadStream,
        WriteStream
      };
      function ReadStream(path, options) {
        if (!(this instanceof ReadStream))
          return new ReadStream(path, options);
        Stream.call(this);
        var self = this;
        this.path = path;
        this.fd = null;
        this.readable = true;
        this.paused = false;
        this.flags = "r";
        this.mode = 438;
        this.bufferSize = 64 * 1024;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.encoding)
          this.setEncoding(this.encoding);
        if (this.start !== void 0) {
          if (typeof this.start !== "number") {
            throw TypeError("start must be a Number");
          }
          if (this.end === void 0) {
            this.end = Infinity;
          } else if (typeof this.end !== "number") {
            throw TypeError("end must be a Number");
          }
          if (this.start > this.end) {
            throw new Error("start must be <= end");
          }
          this.pos = this.start;
        }
        if (this.fd !== null) {
          process.nextTick(function() {
            self._read();
          });
          return;
        }
        fs.open(this.path, this.flags, this.mode, function(err, fd) {
          if (err) {
            self.emit("error", err);
            self.readable = false;
            return;
          }
          self.fd = fd;
          self.emit("open", fd);
          self._read();
        });
      }
      function WriteStream(path, options) {
        if (!(this instanceof WriteStream))
          return new WriteStream(path, options);
        Stream.call(this);
        this.path = path;
        this.fd = null;
        this.writable = true;
        this.flags = "w";
        this.encoding = "binary";
        this.mode = 438;
        this.bytesWritten = 0;
        options = options || {};
        var keys = Object.keys(options);
        for (var index = 0, length = keys.length; index < length; index++) {
          var key = keys[index];
          this[key] = options[key];
        }
        if (this.start !== void 0) {
          if (typeof this.start !== "number") {
            throw TypeError("start must be a Number");
          }
          if (this.start < 0) {
            throw new Error("start must be >= zero");
          }
          this.pos = this.start;
        }
        this.busy = false;
        this._queue = [];
        if (this.fd === null) {
          this._open = fs.open;
          this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
          this.flush();
        }
      }
    }
  }
});

// node_modules/graceful-fs/clone.js
var require_clone = __commonJS({
  "node_modules/graceful-fs/clone.js"(exports, module2) {
    "use strict";
    module2.exports = clone;
    var getPrototypeOf = Object.getPrototypeOf || function(obj) {
      return obj.__proto__;
    };
    function clone(obj) {
      if (obj === null || typeof obj !== "object")
        return obj;
      if (obj instanceof Object)
        var copy = { __proto__: getPrototypeOf(obj) };
      else
        var copy = /* @__PURE__ */ Object.create(null);
      Object.getOwnPropertyNames(obj).forEach(function(key) {
        Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
      });
      return copy;
    }
  }
});

// node_modules/graceful-fs/graceful-fs.js
var require_graceful_fs = __commonJS({
  "node_modules/graceful-fs/graceful-fs.js"(exports, module2) {
    var fs = require("fs");
    var polyfills = require_polyfills();
    var legacy = require_legacy_streams();
    var clone = require_clone();
    var util = require("util");
    var gracefulQueue;
    var previousSymbol;
    if (typeof Symbol === "function" && typeof Symbol.for === "function") {
      gracefulQueue = Symbol.for("graceful-fs.queue");
      previousSymbol = Symbol.for("graceful-fs.previous");
    } else {
      gracefulQueue = "___graceful-fs.queue";
      previousSymbol = "___graceful-fs.previous";
    }
    function noop() {
    }
    function publishQueue(context, queue2) {
      Object.defineProperty(context, gracefulQueue, {
        get: function() {
          return queue2;
        }
      });
    }
    var debug = noop;
    if (util.debuglog)
      debug = util.debuglog("gfs4");
    else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
      debug = function() {
        var m = util.format.apply(util, arguments);
        m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
        console.error(m);
      };
    if (!fs[gracefulQueue]) {
      queue = global[gracefulQueue] || [];
      publishQueue(fs, queue);
      fs.close = function(fs$close) {
        function close(fd, cb) {
          return fs$close.call(fs, fd, function(err) {
            if (!err) {
              resetQueue();
            }
            if (typeof cb === "function")
              cb.apply(this, arguments);
          });
        }
        Object.defineProperty(close, previousSymbol, {
          value: fs$close
        });
        return close;
      }(fs.close);
      fs.closeSync = function(fs$closeSync) {
        function closeSync(fd) {
          fs$closeSync.apply(fs, arguments);
          resetQueue();
        }
        Object.defineProperty(closeSync, previousSymbol, {
          value: fs$closeSync
        });
        return closeSync;
      }(fs.closeSync);
      if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
        process.on("exit", function() {
          debug(fs[gracefulQueue]);
          require("assert").equal(fs[gracefulQueue].length, 0);
        });
      }
    }
    var queue;
    if (!global[gracefulQueue]) {
      publishQueue(global, fs[gracefulQueue]);
    }
    module2.exports = patch(clone(fs));
    if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
      module2.exports = patch(fs);
      fs.__patched = true;
    }
    function patch(fs2) {
      polyfills(fs2);
      fs2.gracefulify = patch;
      fs2.createReadStream = createReadStream;
      fs2.createWriteStream = createWriteStream;
      var fs$readFile = fs2.readFile;
      fs2.readFile = readFile;
      function readFile(path, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$readFile(path, options, cb);
        function go$readFile(path2, options2, cb2, startTime) {
          return fs$readFile(path2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$readFile, [path2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$writeFile = fs2.writeFile;
      fs2.writeFile = writeFile;
      function writeFile(path, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$writeFile(path, data, options, cb);
        function go$writeFile(path2, data2, options2, cb2, startTime) {
          return fs$writeFile(path2, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$writeFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$appendFile = fs2.appendFile;
      if (fs$appendFile)
        fs2.appendFile = appendFile;
      function appendFile(path, data, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$appendFile(path, data, options, cb);
        function go$appendFile(path2, data2, options2, cb2, startTime) {
          return fs$appendFile(path2, data2, options2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$appendFile, [path2, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$copyFile = fs2.copyFile;
      if (fs$copyFile)
        fs2.copyFile = copyFile;
      function copyFile(src, dest, flags, cb) {
        if (typeof flags === "function") {
          cb = flags;
          flags = 0;
        }
        return go$copyFile(src, dest, flags, cb);
        function go$copyFile(src2, dest2, flags2, cb2, startTime) {
          return fs$copyFile(src2, dest2, flags2, function(err) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      var fs$readdir = fs2.readdir;
      fs2.readdir = readdir;
      function readdir(path, options, cb) {
        if (typeof options === "function")
          cb = options, options = null;
        return go$readdir(path, options, cb);
        function go$readdir(path2, options2, cb2, startTime) {
          return fs$readdir(path2, options2, function(err, files) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$readdir, [path2, options2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (files && files.sort)
                files.sort();
              if (typeof cb2 === "function")
                cb2.call(this, err, files);
            }
          });
        }
      }
      if (process.version.substr(0, 4) === "v0.8") {
        var legStreams = legacy(fs2);
        ReadStream = legStreams.ReadStream;
        WriteStream = legStreams.WriteStream;
      }
      var fs$ReadStream = fs2.ReadStream;
      if (fs$ReadStream) {
        ReadStream.prototype = Object.create(fs$ReadStream.prototype);
        ReadStream.prototype.open = ReadStream$open;
      }
      var fs$WriteStream = fs2.WriteStream;
      if (fs$WriteStream) {
        WriteStream.prototype = Object.create(fs$WriteStream.prototype);
        WriteStream.prototype.open = WriteStream$open;
      }
      Object.defineProperty(fs2, "ReadStream", {
        get: function() {
          return ReadStream;
        },
        set: function(val) {
          ReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(fs2, "WriteStream", {
        get: function() {
          return WriteStream;
        },
        set: function(val) {
          WriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileReadStream = ReadStream;
      Object.defineProperty(fs2, "FileReadStream", {
        get: function() {
          return FileReadStream;
        },
        set: function(val) {
          FileReadStream = val;
        },
        enumerable: true,
        configurable: true
      });
      var FileWriteStream = WriteStream;
      Object.defineProperty(fs2, "FileWriteStream", {
        get: function() {
          return FileWriteStream;
        },
        set: function(val) {
          FileWriteStream = val;
        },
        enumerable: true,
        configurable: true
      });
      function ReadStream(path, options) {
        if (this instanceof ReadStream)
          return fs$ReadStream.apply(this, arguments), this;
        else
          return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
      }
      function ReadStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            if (that.autoClose)
              that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
            that.read();
          }
        });
      }
      function WriteStream(path, options) {
        if (this instanceof WriteStream)
          return fs$WriteStream.apply(this, arguments), this;
        else
          return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
      }
      function WriteStream$open() {
        var that = this;
        open(that.path, that.flags, that.mode, function(err, fd) {
          if (err) {
            that.destroy();
            that.emit("error", err);
          } else {
            that.fd = fd;
            that.emit("open", fd);
          }
        });
      }
      function createReadStream(path, options) {
        return new fs2.ReadStream(path, options);
      }
      function createWriteStream(path, options) {
        return new fs2.WriteStream(path, options);
      }
      var fs$open = fs2.open;
      fs2.open = open;
      function open(path, flags, mode, cb) {
        if (typeof mode === "function")
          cb = mode, mode = null;
        return go$open(path, flags, mode, cb);
        function go$open(path2, flags2, mode2, cb2, startTime) {
          return fs$open(path2, flags2, mode2, function(err, fd) {
            if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
              enqueue([go$open, [path2, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
            else {
              if (typeof cb2 === "function")
                cb2.apply(this, arguments);
            }
          });
        }
      }
      return fs2;
    }
    function enqueue(elem) {
      debug("ENQUEUE", elem[0].name, elem[1]);
      fs[gracefulQueue].push(elem);
      retry();
    }
    var retryTimer;
    function resetQueue() {
      var now = Date.now();
      for (var i = 0; i < fs[gracefulQueue].length; ++i) {
        if (fs[gracefulQueue][i].length > 2) {
          fs[gracefulQueue][i][3] = now;
          fs[gracefulQueue][i][4] = now;
        }
      }
      retry();
    }
    function retry() {
      clearTimeout(retryTimer);
      retryTimer = void 0;
      if (fs[gracefulQueue].length === 0)
        return;
      var elem = fs[gracefulQueue].shift();
      var fn = elem[0];
      var args = elem[1];
      var err = elem[2];
      var startTime = elem[3];
      var lastTime = elem[4];
      if (startTime === void 0) {
        debug("RETRY", fn.name, args);
        fn.apply(null, args);
      } else if (Date.now() - startTime >= 6e4) {
        debug("TIMEOUT", fn.name, args);
        var cb = args.pop();
        if (typeof cb === "function")
          cb.call(null, err);
      } else {
        var sinceAttempt = Date.now() - lastTime;
        var sinceStart = Math.max(lastTime - startTime, 1);
        var desiredDelay = Math.min(sinceStart * 1.2, 100);
        if (sinceAttempt >= desiredDelay) {
          debug("RETRY", fn.name, args);
          fn.apply(null, args.concat([startTime]));
        } else {
          fs[gracefulQueue].push(elem);
        }
      }
      if (retryTimer === void 0) {
        retryTimer = setTimeout(retry, 0);
      }
    }
  }
});

// node_modules/process-nextick-args/index.js
var require_process_nextick_args = __commonJS({
  "node_modules/process-nextick-args/index.js"(exports, module2) {
    "use strict";
    if (typeof process === "undefined" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0) {
      module2.exports = { nextTick };
    } else {
      module2.exports = process;
    }
    function nextTick(fn, arg1, arg2, arg3) {
      if (typeof fn !== "function") {
        throw new TypeError('"callback" argument must be a function');
      }
      var len = arguments.length;
      var args, i;
      switch (len) {
        case 0:
        case 1:
          return process.nextTick(fn);
        case 2:
          return process.nextTick(function afterTickOne() {
            fn.call(null, arg1);
          });
        case 3:
          return process.nextTick(function afterTickTwo() {
            fn.call(null, arg1, arg2);
          });
        case 4:
          return process.nextTick(function afterTickThree() {
            fn.call(null, arg1, arg2, arg3);
          });
        default:
          args = new Array(len - 1);
          i = 0;
          while (i < args.length) {
            args[i++] = arguments[i];
          }
          return process.nextTick(function afterTick() {
            fn.apply(null, args);
          });
      }
    }
  }
});

// node_modules/readable-stream/lib/internal/streams/stream.js
var require_stream = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/stream.js"(exports, module2) {
    module2.exports = require("stream");
  }
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports, module2) {
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/core-util-is/lib/util.js
var require_util = __commonJS({
  "node_modules/core-util-is/lib/util.js"(exports) {
    function isArray(arg) {
      if (Array.isArray) {
        return Array.isArray(arg);
      }
      return objectToString(arg) === "[object Array]";
    }
    exports.isArray = isArray;
    function isBoolean(arg) {
      return typeof arg === "boolean";
    }
    exports.isBoolean = isBoolean;
    function isNull(arg) {
      return arg === null;
    }
    exports.isNull = isNull;
    function isNullOrUndefined(arg) {
      return arg == null;
    }
    exports.isNullOrUndefined = isNullOrUndefined;
    function isNumber(arg) {
      return typeof arg === "number";
    }
    exports.isNumber = isNumber;
    function isString(arg) {
      return typeof arg === "string";
    }
    exports.isString = isString;
    function isSymbol(arg) {
      return typeof arg === "symbol";
    }
    exports.isSymbol = isSymbol;
    function isUndefined(arg) {
      return arg === void 0;
    }
    exports.isUndefined = isUndefined;
    function isRegExp(re) {
      return objectToString(re) === "[object RegExp]";
    }
    exports.isRegExp = isRegExp;
    function isObject(arg) {
      return typeof arg === "object" && arg !== null;
    }
    exports.isObject = isObject;
    function isDate(d) {
      return objectToString(d) === "[object Date]";
    }
    exports.isDate = isDate;
    function isError(e) {
      return objectToString(e) === "[object Error]" || e instanceof Error;
    }
    exports.isError = isError;
    function isFunction(arg) {
      return typeof arg === "function";
    }
    exports.isFunction = isFunction;
    function isPrimitive(arg) {
      return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || typeof arg === "undefined";
    }
    exports.isPrimitive = isPrimitive;
    exports.isBuffer = require("buffer").Buffer.isBuffer;
    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }
  }
});

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "node_modules/inherits/inherits_browser.js"(exports, module2) {
    if (typeof Object.create === "function") {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "node_modules/inherits/inherits.js"(exports, module2) {
    try {
      util = require("util");
      if (typeof util.inherits !== "function")
        throw "";
      module2.exports = util.inherits;
    } catch (e) {
      module2.exports = require_inherits_browser();
    }
    var util;
  }
});

// node_modules/readable-stream/lib/internal/streams/BufferList.js
var require_BufferList = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/BufferList.js"(exports, module2) {
    "use strict";
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var Buffer2 = require_safe_buffer().Buffer;
    var util = require("util");
    function copyBuffer(src, target, offset) {
      src.copy(target, offset);
    }
    module2.exports = function() {
      function BufferList() {
        _classCallCheck(this, BufferList);
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      BufferList.prototype.push = function push(v) {
        var entry = { data: v, next: null };
        if (this.length > 0)
          this.tail.next = entry;
        else
          this.head = entry;
        this.tail = entry;
        ++this.length;
      };
      BufferList.prototype.unshift = function unshift(v) {
        var entry = { data: v, next: this.head };
        if (this.length === 0)
          this.tail = entry;
        this.head = entry;
        ++this.length;
      };
      BufferList.prototype.shift = function shift() {
        if (this.length === 0)
          return;
        var ret = this.head.data;
        if (this.length === 1)
          this.head = this.tail = null;
        else
          this.head = this.head.next;
        --this.length;
        return ret;
      };
      BufferList.prototype.clear = function clear() {
        this.head = this.tail = null;
        this.length = 0;
      };
      BufferList.prototype.join = function join(s) {
        if (this.length === 0)
          return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next) {
          ret += s + p.data;
        }
        return ret;
      };
      BufferList.prototype.concat = function concat(n) {
        if (this.length === 0)
          return Buffer2.alloc(0);
        if (this.length === 1)
          return this.head.data;
        var ret = Buffer2.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      };
      return BufferList;
    }();
    if (util && util.inspect && util.inspect.custom) {
      module2.exports.prototype[util.inspect.custom] = function() {
        var obj = util.inspect({ length: this.length });
        return this.constructor.name + " " + obj;
      };
    }
  }
});

// node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS({
  "node_modules/readable-stream/lib/internal/streams/destroy.js"(exports, module2) {
    "use strict";
    var pna = require_process_nextick_args();
    function destroy(err, cb) {
      var _this = this;
      var readableDestroyed = this._readableState && this._readableState.destroyed;
      var writableDestroyed = this._writableState && this._writableState.destroyed;
      if (readableDestroyed || writableDestroyed) {
        if (cb) {
          cb(err);
        } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
          pna.nextTick(emitErrorNT, this, err);
        }
        return this;
      }
      if (this._readableState) {
        this._readableState.destroyed = true;
      }
      if (this._writableState) {
        this._writableState.destroyed = true;
      }
      this._destroy(err || null, function(err2) {
        if (!cb && err2) {
          pna.nextTick(emitErrorNT, _this, err2);
          if (_this._writableState) {
            _this._writableState.errorEmitted = true;
          }
        } else if (cb) {
          cb(err2);
        }
      });
      return this;
    }
    function undestroy() {
      if (this._readableState) {
        this._readableState.destroyed = false;
        this._readableState.reading = false;
        this._readableState.ended = false;
        this._readableState.endEmitted = false;
      }
      if (this._writableState) {
        this._writableState.destroyed = false;
        this._writableState.ended = false;
        this._writableState.ending = false;
        this._writableState.finished = false;
        this._writableState.errorEmitted = false;
      }
    }
    function emitErrorNT(self, err) {
      self.emit("error", err);
    }
    module2.exports = {
      destroy,
      undestroy
    };
  }
});

// node_modules/util-deprecate/node.js
var require_node2 = __commonJS({
  "node_modules/util-deprecate/node.js"(exports, module2) {
    module2.exports = require("util").deprecate;
  }
});

// node_modules/readable-stream/lib/_stream_writable.js
var require_stream_writable = __commonJS({
  "node_modules/readable-stream/lib/_stream_writable.js"(exports, module2) {
    "use strict";
    var pna = require_process_nextick_args();
    module2.exports = Writable;
    function CorkedRequest(state) {
      var _this = this;
      this.next = null;
      this.entry = null;
      this.finish = function() {
        onCorkedFinish(_this, state);
      };
    }
    var asyncWrite = !process.browser && ["v0.10", "v0.9."].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
    var Duplex;
    Writable.WritableState = WritableState;
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var internalUtil = {
      deprecate: require_node2()
    };
    var Stream = require_stream();
    var Buffer2 = require_safe_buffer().Buffer;
    var OurUint8Array = global.Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var destroyImpl = require_destroy();
    util.inherits(Writable, Stream);
    function nop() {
    }
    function WritableState(options, stream) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      var isDuplex = stream instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex)
        this.objectMode = this.objectMode || !!options.writableObjectMode;
      var hwm = options.highWaterMark;
      var writableHwm = options.writableHighWaterMark;
      var defaultHwm = this.objectMode ? 16 : 16 * 1024;
      if (hwm || hwm === 0)
        this.highWaterMark = hwm;
      else if (isDuplex && (writableHwm || writableHwm === 0))
        this.highWaterMark = writableHwm;
      else
        this.highWaterMark = defaultHwm;
      this.highWaterMark = Math.floor(this.highWaterMark);
      this.finalCalled = false;
      this.needDrain = false;
      this.ending = false;
      this.ended = false;
      this.finished = false;
      this.destroyed = false;
      var noDecode = options.decodeStrings === false;
      this.decodeStrings = !noDecode;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.length = 0;
      this.writing = false;
      this.corked = 0;
      this.sync = true;
      this.bufferProcessing = false;
      this.onwrite = function(er) {
        onwrite(stream, er);
      };
      this.writecb = null;
      this.writelen = 0;
      this.bufferedRequest = null;
      this.lastBufferedRequest = null;
      this.pendingcb = 0;
      this.prefinished = false;
      this.errorEmitted = false;
      this.bufferedRequestCount = 0;
      this.corkedRequestsFree = new CorkedRequest(this);
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      var current = this.bufferedRequest;
      var out = [];
      while (current) {
        out.push(current);
        current = current.next;
      }
      return out;
    };
    (function() {
      try {
        Object.defineProperty(WritableState.prototype, "buffer", {
          get: internalUtil.deprecate(function() {
            return this.getBuffer();
          }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
        });
      } catch (_) {
      }
    })();
    var realHasInstance;
    if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
      realHasInstance = Function.prototype[Symbol.hasInstance];
      Object.defineProperty(Writable, Symbol.hasInstance, {
        value: function(object) {
          if (realHasInstance.call(this, object))
            return true;
          if (this !== Writable)
            return false;
          return object && object._writableState instanceof WritableState;
        }
      });
    } else {
      realHasInstance = function(object) {
        return object instanceof this;
      };
    }
    function Writable(options) {
      Duplex = Duplex || require_stream_duplex();
      if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
        return new Writable(options);
      }
      this._writableState = new WritableState(options, this);
      this.writable = true;
      if (options) {
        if (typeof options.write === "function")
          this._write = options.write;
        if (typeof options.writev === "function")
          this._writev = options.writev;
        if (typeof options.destroy === "function")
          this._destroy = options.destroy;
        if (typeof options.final === "function")
          this._final = options.final;
      }
      Stream.call(this);
    }
    Writable.prototype.pipe = function() {
      this.emit("error", new Error("Cannot pipe, not readable"));
    };
    function writeAfterEnd(stream, cb) {
      var er = new Error("write after end");
      stream.emit("error", er);
      pna.nextTick(cb, er);
    }
    function validChunk(stream, state, chunk, cb) {
      var valid = true;
      var er = false;
      if (chunk === null) {
        er = new TypeError("May not write null values to stream");
      } else if (typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
        er = new TypeError("Invalid non-string/buffer chunk");
      }
      if (er) {
        stream.emit("error", er);
        pna.nextTick(cb, er);
        valid = false;
      }
      return valid;
    }
    Writable.prototype.write = function(chunk, encoding, cb) {
      var state = this._writableState;
      var ret = false;
      var isBuf = !state.objectMode && _isUint8Array(chunk);
      if (isBuf && !Buffer2.isBuffer(chunk)) {
        chunk = _uint8ArrayToBuffer(chunk);
      }
      if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (isBuf)
        encoding = "buffer";
      else if (!encoding)
        encoding = state.defaultEncoding;
      if (typeof cb !== "function")
        cb = nop;
      if (state.ended)
        writeAfterEnd(this, cb);
      else if (isBuf || validChunk(this, state, chunk, cb)) {
        state.pendingcb++;
        ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
      }
      return ret;
    };
    Writable.prototype.cork = function() {
      var state = this._writableState;
      state.corked++;
    };
    Writable.prototype.uncork = function() {
      var state = this._writableState;
      if (state.corked) {
        state.corked--;
        if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest)
          clearBuffer(this, state);
      }
    };
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === "string")
        encoding = encoding.toLowerCase();
      if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1))
        throw new TypeError("Unknown encoding: " + encoding);
      this._writableState.defaultEncoding = encoding;
      return this;
    };
    function decodeChunk(state, chunk, encoding) {
      if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
        chunk = Buffer2.from(chunk, encoding);
      }
      return chunk;
    }
    Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
      enumerable: false,
      get: function() {
        return this._writableState.highWaterMark;
      }
    });
    function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
      if (!isBuf) {
        var newChunk = decodeChunk(state, chunk, encoding);
        if (chunk !== newChunk) {
          isBuf = true;
          encoding = "buffer";
          chunk = newChunk;
        }
      }
      var len = state.objectMode ? 1 : chunk.length;
      state.length += len;
      var ret = state.length < state.highWaterMark;
      if (!ret)
        state.needDrain = true;
      if (state.writing || state.corked) {
        var last = state.lastBufferedRequest;
        state.lastBufferedRequest = {
          chunk,
          encoding,
          isBuf,
          callback: cb,
          next: null
        };
        if (last) {
          last.next = state.lastBufferedRequest;
        } else {
          state.bufferedRequest = state.lastBufferedRequest;
        }
        state.bufferedRequestCount += 1;
      } else {
        doWrite(stream, state, false, len, chunk, encoding, cb);
      }
      return ret;
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
      state.writelen = len;
      state.writecb = cb;
      state.writing = true;
      state.sync = true;
      if (writev)
        stream._writev(chunk, state.onwrite);
      else
        stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream, state, sync, er, cb) {
      --state.pendingcb;
      if (sync) {
        pna.nextTick(cb, er);
        pna.nextTick(finishMaybe, stream, state);
        stream._writableState.errorEmitted = true;
        stream.emit("error", er);
      } else {
        cb(er);
        stream._writableState.errorEmitted = true;
        stream.emit("error", er);
        finishMaybe(stream, state);
      }
    }
    function onwriteStateUpdate(state) {
      state.writing = false;
      state.writecb = null;
      state.length -= state.writelen;
      state.writelen = 0;
    }
    function onwrite(stream, er) {
      var state = stream._writableState;
      var sync = state.sync;
      var cb = state.writecb;
      onwriteStateUpdate(state);
      if (er)
        onwriteError(stream, state, sync, er, cb);
      else {
        var finished = needFinish(state);
        if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
          clearBuffer(stream, state);
        }
        if (sync) {
          asyncWrite(afterWrite, stream, state, finished, cb);
        } else {
          afterWrite(stream, state, finished, cb);
        }
      }
    }
    function afterWrite(stream, state, finished, cb) {
      if (!finished)
        onwriteDrain(stream, state);
      state.pendingcb--;
      cb();
      finishMaybe(stream, state);
    }
    function onwriteDrain(stream, state) {
      if (state.length === 0 && state.needDrain) {
        state.needDrain = false;
        stream.emit("drain");
      }
    }
    function clearBuffer(stream, state) {
      state.bufferProcessing = true;
      var entry = state.bufferedRequest;
      if (stream._writev && entry && entry.next) {
        var l = state.bufferedRequestCount;
        var buffer = new Array(l);
        var holder = state.corkedRequestsFree;
        holder.entry = entry;
        var count = 0;
        var allBuffers = true;
        while (entry) {
          buffer[count] = entry;
          if (!entry.isBuf)
            allBuffers = false;
          entry = entry.next;
          count += 1;
        }
        buffer.allBuffers = allBuffers;
        doWrite(stream, state, true, state.length, buffer, "", holder.finish);
        state.pendingcb++;
        state.lastBufferedRequest = null;
        if (holder.next) {
          state.corkedRequestsFree = holder.next;
          holder.next = null;
        } else {
          state.corkedRequestsFree = new CorkedRequest(state);
        }
        state.bufferedRequestCount = 0;
      } else {
        while (entry) {
          var chunk = entry.chunk;
          var encoding = entry.encoding;
          var cb = entry.callback;
          var len = state.objectMode ? 1 : chunk.length;
          doWrite(stream, state, false, len, chunk, encoding, cb);
          entry = entry.next;
          state.bufferedRequestCount--;
          if (state.writing) {
            break;
          }
        }
        if (entry === null)
          state.lastBufferedRequest = null;
      }
      state.bufferedRequest = entry;
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function(chunk, encoding, cb) {
      cb(new Error("_write() is not implemented"));
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function(chunk, encoding, cb) {
      var state = this._writableState;
      if (typeof chunk === "function") {
        cb = chunk;
        chunk = null;
        encoding = null;
      } else if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (chunk !== null && chunk !== void 0)
        this.write(chunk, encoding);
      if (state.corked) {
        state.corked = 1;
        this.uncork();
      }
      if (!state.ending && !state.finished)
        endWritable(this, state, cb);
    };
    function needFinish(state) {
      return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
    }
    function callFinal(stream, state) {
      stream._final(function(err) {
        state.pendingcb--;
        if (err) {
          stream.emit("error", err);
        }
        state.prefinished = true;
        stream.emit("prefinish");
        finishMaybe(stream, state);
      });
    }
    function prefinish(stream, state) {
      if (!state.prefinished && !state.finalCalled) {
        if (typeof stream._final === "function") {
          state.pendingcb++;
          state.finalCalled = true;
          pna.nextTick(callFinal, stream, state);
        } else {
          state.prefinished = true;
          stream.emit("prefinish");
        }
      }
    }
    function finishMaybe(stream, state) {
      var need = needFinish(state);
      if (need) {
        prefinish(stream, state);
        if (state.pendingcb === 0) {
          state.finished = true;
          stream.emit("finish");
        }
      }
      return need;
    }
    function endWritable(stream, state, cb) {
      state.ending = true;
      finishMaybe(stream, state);
      if (cb) {
        if (state.finished)
          pna.nextTick(cb);
        else
          stream.once("finish", cb);
      }
      state.ended = true;
      stream.writable = false;
    }
    function onCorkedFinish(corkReq, state, err) {
      var entry = corkReq.entry;
      corkReq.entry = null;
      while (entry) {
        var cb = entry.callback;
        state.pendingcb--;
        cb(err);
        entry = entry.next;
      }
      if (state.corkedRequestsFree) {
        state.corkedRequestsFree.next = corkReq;
      } else {
        state.corkedRequestsFree = corkReq;
      }
    }
    Object.defineProperty(Writable.prototype, "destroyed", {
      get: function() {
        if (this._writableState === void 0) {
          return false;
        }
        return this._writableState.destroyed;
      },
      set: function(value) {
        if (!this._writableState) {
          return;
        }
        this._writableState.destroyed = value;
      }
    });
    Writable.prototype.destroy = destroyImpl.destroy;
    Writable.prototype._undestroy = destroyImpl.undestroy;
    Writable.prototype._destroy = function(err, cb) {
      this.end();
      cb(err);
    };
  }
});

// node_modules/readable-stream/lib/_stream_duplex.js
var require_stream_duplex = __commonJS({
  "node_modules/readable-stream/lib/_stream_duplex.js"(exports, module2) {
    "use strict";
    var pna = require_process_nextick_args();
    var objectKeys = Object.keys || function(obj) {
      var keys2 = [];
      for (var key in obj) {
        keys2.push(key);
      }
      return keys2;
    };
    module2.exports = Duplex;
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var Readable = require_stream_readable();
    var Writable = require_stream_writable();
    util.inherits(Duplex, Readable);
    {
      keys = objectKeys(Writable.prototype);
      for (v = 0; v < keys.length; v++) {
        method = keys[v];
        if (!Duplex.prototype[method])
          Duplex.prototype[method] = Writable.prototype[method];
      }
    }
    var keys;
    var method;
    var v;
    function Duplex(options) {
      if (!(this instanceof Duplex))
        return new Duplex(options);
      Readable.call(this, options);
      Writable.call(this, options);
      if (options && options.readable === false)
        this.readable = false;
      if (options && options.writable === false)
        this.writable = false;
      this.allowHalfOpen = true;
      if (options && options.allowHalfOpen === false)
        this.allowHalfOpen = false;
      this.once("end", onend);
    }
    Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
      enumerable: false,
      get: function() {
        return this._writableState.highWaterMark;
      }
    });
    function onend() {
      if (this.allowHalfOpen || this._writableState.ended)
        return;
      pna.nextTick(onEndNT, this);
    }
    function onEndNT(self) {
      self.end();
    }
    Object.defineProperty(Duplex.prototype, "destroyed", {
      get: function() {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return false;
        }
        return this._readableState.destroyed && this._writableState.destroyed;
      },
      set: function(value) {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return;
        }
        this._readableState.destroyed = value;
        this._writableState.destroyed = value;
      }
    });
    Duplex.prototype._destroy = function(err, cb) {
      this.push(null);
      this.end();
      pna.nextTick(cb, err);
    };
  }
});

// node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS({
  "node_modules/string_decoder/lib/string_decoder.js"(exports) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var isEncoding = Buffer2.isEncoding || function(encoding) {
      encoding = "" + encoding;
      switch (encoding && encoding.toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
        case "raw":
          return true;
        default:
          return false;
      }
    };
    function _normalizeEncoding(enc) {
      if (!enc)
        return "utf8";
      var retried;
      while (true) {
        switch (enc) {
          case "utf8":
          case "utf-8":
            return "utf8";
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return "utf16le";
          case "latin1":
          case "binary":
            return "latin1";
          case "base64":
          case "ascii":
          case "hex":
            return enc;
          default:
            if (retried)
              return;
            enc = ("" + enc).toLowerCase();
            retried = true;
        }
      }
    }
    function normalizeEncoding(enc) {
      var nenc = _normalizeEncoding(enc);
      if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc)))
        throw new Error("Unknown encoding: " + enc);
      return nenc || enc;
    }
    exports.StringDecoder = StringDecoder;
    function StringDecoder(encoding) {
      this.encoding = normalizeEncoding(encoding);
      var nb;
      switch (this.encoding) {
        case "utf16le":
          this.text = utf16Text;
          this.end = utf16End;
          nb = 4;
          break;
        case "utf8":
          this.fillLast = utf8FillLast;
          nb = 4;
          break;
        case "base64":
          this.text = base64Text;
          this.end = base64End;
          nb = 3;
          break;
        default:
          this.write = simpleWrite;
          this.end = simpleEnd;
          return;
      }
      this.lastNeed = 0;
      this.lastTotal = 0;
      this.lastChar = Buffer2.allocUnsafe(nb);
    }
    StringDecoder.prototype.write = function(buf) {
      if (buf.length === 0)
        return "";
      var r;
      var i;
      if (this.lastNeed) {
        r = this.fillLast(buf);
        if (r === void 0)
          return "";
        i = this.lastNeed;
        this.lastNeed = 0;
      } else {
        i = 0;
      }
      if (i < buf.length)
        return r ? r + this.text(buf, i) : this.text(buf, i);
      return r || "";
    };
    StringDecoder.prototype.end = utf8End;
    StringDecoder.prototype.text = utf8Text;
    StringDecoder.prototype.fillLast = function(buf) {
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
      this.lastNeed -= buf.length;
    };
    function utf8CheckByte(byte) {
      if (byte <= 127)
        return 0;
      else if (byte >> 5 === 6)
        return 2;
      else if (byte >> 4 === 14)
        return 3;
      else if (byte >> 3 === 30)
        return 4;
      return byte >> 6 === 2 ? -1 : -2;
    }
    function utf8CheckIncomplete(self, buf, i) {
      var j = buf.length - 1;
      if (j < i)
        return 0;
      var nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0)
          self.lastNeed = nb - 1;
        return nb;
      }
      if (--j < i || nb === -2)
        return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0)
          self.lastNeed = nb - 2;
        return nb;
      }
      if (--j < i || nb === -2)
        return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) {
          if (nb === 2)
            nb = 0;
          else
            self.lastNeed = nb - 3;
        }
        return nb;
      }
      return 0;
    }
    function utf8CheckExtraBytes(self, buf, p) {
      if ((buf[0] & 192) !== 128) {
        self.lastNeed = 0;
        return "\uFFFD";
      }
      if (self.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128) {
          self.lastNeed = 1;
          return "\uFFFD";
        }
        if (self.lastNeed > 2 && buf.length > 2) {
          if ((buf[2] & 192) !== 128) {
            self.lastNeed = 2;
            return "\uFFFD";
          }
        }
      }
    }
    function utf8FillLast(buf) {
      var p = this.lastTotal - this.lastNeed;
      var r = utf8CheckExtraBytes(this, buf, p);
      if (r !== void 0)
        return r;
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, p, 0, buf.length);
      this.lastNeed -= buf.length;
    }
    function utf8Text(buf, i) {
      var total = utf8CheckIncomplete(this, buf, i);
      if (!this.lastNeed)
        return buf.toString("utf8", i);
      this.lastTotal = total;
      var end = buf.length - (total - this.lastNeed);
      buf.copy(this.lastChar, 0, end);
      return buf.toString("utf8", i, end);
    }
    function utf8End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed)
        return r + "\uFFFD";
      return r;
    }
    function utf16Text(buf, i) {
      if ((buf.length - i) % 2 === 0) {
        var r = buf.toString("utf16le", i);
        if (r) {
          var c = r.charCodeAt(r.length - 1);
          if (c >= 55296 && c <= 56319) {
            this.lastNeed = 2;
            this.lastTotal = 4;
            this.lastChar[0] = buf[buf.length - 2];
            this.lastChar[1] = buf[buf.length - 1];
            return r.slice(0, -1);
          }
        }
        return r;
      }
      this.lastNeed = 1;
      this.lastTotal = 2;
      this.lastChar[0] = buf[buf.length - 1];
      return buf.toString("utf16le", i, buf.length - 1);
    }
    function utf16End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) {
        var end = this.lastTotal - this.lastNeed;
        return r + this.lastChar.toString("utf16le", 0, end);
      }
      return r;
    }
    function base64Text(buf, i) {
      var n = (buf.length - i) % 3;
      if (n === 0)
        return buf.toString("base64", i);
      this.lastNeed = 3 - n;
      this.lastTotal = 3;
      if (n === 1) {
        this.lastChar[0] = buf[buf.length - 1];
      } else {
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
      }
      return buf.toString("base64", i, buf.length - n);
    }
    function base64End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed)
        return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
      return r;
    }
    function simpleWrite(buf) {
      return buf.toString(this.encoding);
    }
    function simpleEnd(buf) {
      return buf && buf.length ? this.write(buf) : "";
    }
  }
});

// node_modules/readable-stream/lib/_stream_readable.js
var require_stream_readable = __commonJS({
  "node_modules/readable-stream/lib/_stream_readable.js"(exports, module2) {
    "use strict";
    var pna = require_process_nextick_args();
    module2.exports = Readable;
    var isArray = require_isarray();
    var Duplex;
    Readable.ReadableState = ReadableState;
    var EE = require("events").EventEmitter;
    var EElistenerCount = function(emitter, type) {
      return emitter.listeners(type).length;
    };
    var Stream = require_stream();
    var Buffer2 = require_safe_buffer().Buffer;
    var OurUint8Array = global.Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    var debugUtil = require("util");
    var debug = void 0;
    if (debugUtil && debugUtil.debuglog) {
      debug = debugUtil.debuglog("stream");
    } else {
      debug = function() {
      };
    }
    var BufferList = require_BufferList();
    var destroyImpl = require_destroy();
    var StringDecoder;
    util.inherits(Readable, Stream);
    var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
    function prependListener(emitter, event, fn) {
      if (typeof emitter.prependListener === "function")
        return emitter.prependListener(event, fn);
      if (!emitter._events || !emitter._events[event])
        emitter.on(event, fn);
      else if (isArray(emitter._events[event]))
        emitter._events[event].unshift(fn);
      else
        emitter._events[event] = [fn, emitter._events[event]];
    }
    function ReadableState(options, stream) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      var isDuplex = stream instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex)
        this.objectMode = this.objectMode || !!options.readableObjectMode;
      var hwm = options.highWaterMark;
      var readableHwm = options.readableHighWaterMark;
      var defaultHwm = this.objectMode ? 16 : 16 * 1024;
      if (hwm || hwm === 0)
        this.highWaterMark = hwm;
      else if (isDuplex && (readableHwm || readableHwm === 0))
        this.highWaterMark = readableHwm;
      else
        this.highWaterMark = defaultHwm;
      this.highWaterMark = Math.floor(this.highWaterMark);
      this.buffer = new BufferList();
      this.length = 0;
      this.pipes = null;
      this.pipesCount = 0;
      this.flowing = null;
      this.ended = false;
      this.endEmitted = false;
      this.reading = false;
      this.sync = true;
      this.needReadable = false;
      this.emittedReadable = false;
      this.readableListening = false;
      this.resumeScheduled = false;
      this.destroyed = false;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.awaitDrain = 0;
      this.readingMore = false;
      this.decoder = null;
      this.encoding = null;
      if (options.encoding) {
        if (!StringDecoder)
          StringDecoder = require_string_decoder().StringDecoder;
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
      }
    }
    function Readable(options) {
      Duplex = Duplex || require_stream_duplex();
      if (!(this instanceof Readable))
        return new Readable(options);
      this._readableState = new ReadableState(options, this);
      this.readable = true;
      if (options) {
        if (typeof options.read === "function")
          this._read = options.read;
        if (typeof options.destroy === "function")
          this._destroy = options.destroy;
      }
      Stream.call(this);
    }
    Object.defineProperty(Readable.prototype, "destroyed", {
      get: function() {
        if (this._readableState === void 0) {
          return false;
        }
        return this._readableState.destroyed;
      },
      set: function(value) {
        if (!this._readableState) {
          return;
        }
        this._readableState.destroyed = value;
      }
    });
    Readable.prototype.destroy = destroyImpl.destroy;
    Readable.prototype._undestroy = destroyImpl.undestroy;
    Readable.prototype._destroy = function(err, cb) {
      this.push(null);
      cb(err);
    };
    Readable.prototype.push = function(chunk, encoding) {
      var state = this._readableState;
      var skipChunkCheck;
      if (!state.objectMode) {
        if (typeof chunk === "string") {
          encoding = encoding || state.defaultEncoding;
          if (encoding !== state.encoding) {
            chunk = Buffer2.from(chunk, encoding);
            encoding = "";
          }
          skipChunkCheck = true;
        }
      } else {
        skipChunkCheck = true;
      }
      return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
    };
    Readable.prototype.unshift = function(chunk) {
      return readableAddChunk(this, chunk, null, true, false);
    };
    function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
      var state = stream._readableState;
      if (chunk === null) {
        state.reading = false;
        onEofChunk(stream, state);
      } else {
        var er;
        if (!skipChunkCheck)
          er = chunkInvalid(state, chunk);
        if (er) {
          stream.emit("error", er);
        } else if (state.objectMode || chunk && chunk.length > 0) {
          if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
            chunk = _uint8ArrayToBuffer(chunk);
          }
          if (addToFront) {
            if (state.endEmitted)
              stream.emit("error", new Error("stream.unshift() after end event"));
            else
              addChunk(stream, state, chunk, true);
          } else if (state.ended) {
            stream.emit("error", new Error("stream.push() after EOF"));
          } else {
            state.reading = false;
            if (state.decoder && !encoding) {
              chunk = state.decoder.write(chunk);
              if (state.objectMode || chunk.length !== 0)
                addChunk(stream, state, chunk, false);
              else
                maybeReadMore(stream, state);
            } else {
              addChunk(stream, state, chunk, false);
            }
          }
        } else if (!addToFront) {
          state.reading = false;
        }
      }
      return needMoreData(state);
    }
    function addChunk(stream, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync) {
        stream.emit("data", chunk);
        stream.read(0);
      } else {
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront)
          state.buffer.unshift(chunk);
        else
          state.buffer.push(chunk);
        if (state.needReadable)
          emitReadable(stream);
      }
      maybeReadMore(stream, state);
    }
    function chunkInvalid(state, chunk) {
      var er;
      if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
        er = new TypeError("Invalid non-string/buffer chunk");
      }
      return er;
    }
    function needMoreData(state) {
      return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
    }
    Readable.prototype.isPaused = function() {
      return this._readableState.flowing === false;
    };
    Readable.prototype.setEncoding = function(enc) {
      if (!StringDecoder)
        StringDecoder = require_string_decoder().StringDecoder;
      this._readableState.decoder = new StringDecoder(enc);
      this._readableState.encoding = enc;
      return this;
    };
    var MAX_HWM = 8388608;
    function computeNewHighWaterMark(n) {
      if (n >= MAX_HWM) {
        n = MAX_HWM;
      } else {
        n--;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        n++;
      }
      return n;
    }
    function howMuchToRead(n, state) {
      if (n <= 0 || state.length === 0 && state.ended)
        return 0;
      if (state.objectMode)
        return 1;
      if (n !== n) {
        if (state.flowing && state.length)
          return state.buffer.head.data.length;
        else
          return state.length;
      }
      if (n > state.highWaterMark)
        state.highWaterMark = computeNewHighWaterMark(n);
      if (n <= state.length)
        return n;
      if (!state.ended) {
        state.needReadable = true;
        return 0;
      }
      return state.length;
    }
    Readable.prototype.read = function(n) {
      debug("read", n);
      n = parseInt(n, 10);
      var state = this._readableState;
      var nOrig = n;
      if (n !== 0)
        state.emittedReadable = false;
      if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
        debug("read: emitReadable", state.length, state.ended);
        if (state.length === 0 && state.ended)
          endReadable(this);
        else
          emitReadable(this);
        return null;
      }
      n = howMuchToRead(n, state);
      if (n === 0 && state.ended) {
        if (state.length === 0)
          endReadable(this);
        return null;
      }
      var doRead = state.needReadable;
      debug("need readable", doRead);
      if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true;
        debug("length less than watermark", doRead);
      }
      if (state.ended || state.reading) {
        doRead = false;
        debug("reading or ended", doRead);
      } else if (doRead) {
        debug("do read");
        state.reading = true;
        state.sync = true;
        if (state.length === 0)
          state.needReadable = true;
        this._read(state.highWaterMark);
        state.sync = false;
        if (!state.reading)
          n = howMuchToRead(nOrig, state);
      }
      var ret;
      if (n > 0)
        ret = fromList(n, state);
      else
        ret = null;
      if (ret === null) {
        state.needReadable = true;
        n = 0;
      } else {
        state.length -= n;
      }
      if (state.length === 0) {
        if (!state.ended)
          state.needReadable = true;
        if (nOrig !== n && state.ended)
          endReadable(this);
      }
      if (ret !== null)
        this.emit("data", ret);
      return ret;
    };
    function onEofChunk(stream, state) {
      if (state.ended)
        return;
      if (state.decoder) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) {
          state.buffer.push(chunk);
          state.length += state.objectMode ? 1 : chunk.length;
        }
      }
      state.ended = true;
      emitReadable(stream);
    }
    function emitReadable(stream) {
      var state = stream._readableState;
      state.needReadable = false;
      if (!state.emittedReadable) {
        debug("emitReadable", state.flowing);
        state.emittedReadable = true;
        if (state.sync)
          pna.nextTick(emitReadable_, stream);
        else
          emitReadable_(stream);
      }
    }
    function emitReadable_(stream) {
      debug("emit readable");
      stream.emit("readable");
      flow(stream);
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore) {
        state.readingMore = true;
        pna.nextTick(maybeReadMore_, stream, state);
      }
    }
    function maybeReadMore_(stream, state) {
      var len = state.length;
      while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
        debug("maybeReadMore read 0");
        stream.read(0);
        if (len === state.length)
          break;
        else
          len = state.length;
      }
      state.readingMore = false;
    }
    Readable.prototype._read = function(n) {
      this.emit("error", new Error("_read() is not implemented"));
    };
    Readable.prototype.pipe = function(dest, pipeOpts) {
      var src = this;
      var state = this._readableState;
      switch (state.pipesCount) {
        case 0:
          state.pipes = dest;
          break;
        case 1:
          state.pipes = [state.pipes, dest];
          break;
        default:
          state.pipes.push(dest);
          break;
      }
      state.pipesCount += 1;
      debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
      var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
      var endFn = doEnd ? onend : unpipe;
      if (state.endEmitted)
        pna.nextTick(endFn);
      else
        src.once("end", endFn);
      dest.on("unpipe", onunpipe);
      function onunpipe(readable, unpipeInfo) {
        debug("onunpipe");
        if (readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
            unpipeInfo.hasUnpiped = true;
            cleanup();
          }
        }
      }
      function onend() {
        debug("onend");
        dest.end();
      }
      var ondrain = pipeOnDrain(src);
      dest.on("drain", ondrain);
      var cleanedUp = false;
      function cleanup() {
        debug("cleanup");
        dest.removeListener("close", onclose);
        dest.removeListener("finish", onfinish);
        dest.removeListener("drain", ondrain);
        dest.removeListener("error", onerror);
        dest.removeListener("unpipe", onunpipe);
        src.removeListener("end", onend);
        src.removeListener("end", unpipe);
        src.removeListener("data", ondata);
        cleanedUp = true;
        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain))
          ondrain();
      }
      var increasedAwaitDrain = false;
      src.on("data", ondata);
      function ondata(chunk) {
        debug("ondata");
        increasedAwaitDrain = false;
        var ret = dest.write(chunk);
        if (ret === false && !increasedAwaitDrain) {
          if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
            debug("false write response, pause", src._readableState.awaitDrain);
            src._readableState.awaitDrain++;
            increasedAwaitDrain = true;
          }
          src.pause();
        }
      }
      function onerror(er) {
        debug("onerror", er);
        unpipe();
        dest.removeListener("error", onerror);
        if (EElistenerCount(dest, "error") === 0)
          dest.emit("error", er);
      }
      prependListener(dest, "error", onerror);
      function onclose() {
        dest.removeListener("finish", onfinish);
        unpipe();
      }
      dest.once("close", onclose);
      function onfinish() {
        debug("onfinish");
        dest.removeListener("close", onclose);
        unpipe();
      }
      dest.once("finish", onfinish);
      function unpipe() {
        debug("unpipe");
        src.unpipe(dest);
      }
      dest.emit("pipe", src);
      if (!state.flowing) {
        debug("pipe resume");
        src.resume();
      }
      return dest;
    };
    function pipeOnDrain(src) {
      return function() {
        var state = src._readableState;
        debug("pipeOnDrain", state.awaitDrain);
        if (state.awaitDrain)
          state.awaitDrain--;
        if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
          state.flowing = true;
          flow(src);
        }
      };
    }
    Readable.prototype.unpipe = function(dest) {
      var state = this._readableState;
      var unpipeInfo = { hasUnpiped: false };
      if (state.pipesCount === 0)
        return this;
      if (state.pipesCount === 1) {
        if (dest && dest !== state.pipes)
          return this;
        if (!dest)
          dest = state.pipes;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        if (dest)
          dest.emit("unpipe", this, unpipeInfo);
        return this;
      }
      if (!dest) {
        var dests = state.pipes;
        var len = state.pipesCount;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        for (var i = 0; i < len; i++) {
          dests[i].emit("unpipe", this, unpipeInfo);
        }
        return this;
      }
      var index = indexOf(state.pipes, dest);
      if (index === -1)
        return this;
      state.pipes.splice(index, 1);
      state.pipesCount -= 1;
      if (state.pipesCount === 1)
        state.pipes = state.pipes[0];
      dest.emit("unpipe", this, unpipeInfo);
      return this;
    };
    Readable.prototype.on = function(ev, fn) {
      var res = Stream.prototype.on.call(this, ev, fn);
      if (ev === "data") {
        if (this._readableState.flowing !== false)
          this.resume();
      } else if (ev === "readable") {
        var state = this._readableState;
        if (!state.endEmitted && !state.readableListening) {
          state.readableListening = state.needReadable = true;
          state.emittedReadable = false;
          if (!state.reading) {
            pna.nextTick(nReadingNextTick, this);
          } else if (state.length) {
            emitReadable(this);
          }
        }
      }
      return res;
    };
    Readable.prototype.addListener = Readable.prototype.on;
    function nReadingNextTick(self) {
      debug("readable nexttick read 0");
      self.read(0);
    }
    Readable.prototype.resume = function() {
      var state = this._readableState;
      if (!state.flowing) {
        debug("resume");
        state.flowing = true;
        resume(this, state);
      }
      return this;
    };
    function resume(stream, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        pna.nextTick(resume_, stream, state);
      }
    }
    function resume_(stream, state) {
      if (!state.reading) {
        debug("resume read 0");
        stream.read(0);
      }
      state.resumeScheduled = false;
      state.awaitDrain = 0;
      stream.emit("resume");
      flow(stream);
      if (state.flowing && !state.reading)
        stream.read(0);
    }
    Readable.prototype.pause = function() {
      debug("call pause flowing=%j", this._readableState.flowing);
      if (this._readableState.flowing !== false) {
        debug("pause");
        this._readableState.flowing = false;
        this.emit("pause");
      }
      return this;
    };
    function flow(stream) {
      var state = stream._readableState;
      debug("flow", state.flowing);
      while (state.flowing && stream.read() !== null) {
      }
    }
    Readable.prototype.wrap = function(stream) {
      var _this = this;
      var state = this._readableState;
      var paused = false;
      stream.on("end", function() {
        debug("wrapped end");
        if (state.decoder && !state.ended) {
          var chunk = state.decoder.end();
          if (chunk && chunk.length)
            _this.push(chunk);
        }
        _this.push(null);
      });
      stream.on("data", function(chunk) {
        debug("wrapped data");
        if (state.decoder)
          chunk = state.decoder.write(chunk);
        if (state.objectMode && (chunk === null || chunk === void 0))
          return;
        else if (!state.objectMode && (!chunk || !chunk.length))
          return;
        var ret = _this.push(chunk);
        if (!ret) {
          paused = true;
          stream.pause();
        }
      });
      for (var i in stream) {
        if (this[i] === void 0 && typeof stream[i] === "function") {
          this[i] = function(method) {
            return function() {
              return stream[method].apply(stream, arguments);
            };
          }(i);
        }
      }
      for (var n = 0; n < kProxyEvents.length; n++) {
        stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
      }
      this._read = function(n2) {
        debug("wrapped _read", n2);
        if (paused) {
          paused = false;
          stream.resume();
        }
      };
      return this;
    };
    Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
      enumerable: false,
      get: function() {
        return this._readableState.highWaterMark;
      }
    });
    Readable._fromList = fromList;
    function fromList(n, state) {
      if (state.length === 0)
        return null;
      var ret;
      if (state.objectMode)
        ret = state.buffer.shift();
      else if (!n || n >= state.length) {
        if (state.decoder)
          ret = state.buffer.join("");
        else if (state.buffer.length === 1)
          ret = state.buffer.head.data;
        else
          ret = state.buffer.concat(state.length);
        state.buffer.clear();
      } else {
        ret = fromListPartial(n, state.buffer, state.decoder);
      }
      return ret;
    }
    function fromListPartial(n, list, hasStrings) {
      var ret;
      if (n < list.head.data.length) {
        ret = list.head.data.slice(0, n);
        list.head.data = list.head.data.slice(n);
      } else if (n === list.head.data.length) {
        ret = list.shift();
      } else {
        ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
      }
      return ret;
    }
    function copyFromBufferString(n, list) {
      var p = list.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;
      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length)
          ret += str;
        else
          ret += str.slice(0, n);
        n -= nb;
        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next)
              list.head = p.next;
            else
              list.head = list.tail = null;
          } else {
            list.head = p;
            p.data = str.slice(nb);
          }
          break;
        }
        ++c;
      }
      list.length -= c;
      return ret;
    }
    function copyFromBuffer(n, list) {
      var ret = Buffer2.allocUnsafe(n);
      var p = list.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;
      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;
        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next)
              list.head = p.next;
            else
              list.head = list.tail = null;
          } else {
            list.head = p;
            p.data = buf.slice(nb);
          }
          break;
        }
        ++c;
      }
      list.length -= c;
      return ret;
    }
    function endReadable(stream) {
      var state = stream._readableState;
      if (state.length > 0)
        throw new Error('"endReadable()" called on non-empty stream');
      if (!state.endEmitted) {
        state.ended = true;
        pna.nextTick(endReadableNT, state, stream);
      }
    }
    function endReadableNT(state, stream) {
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit("end");
      }
    }
    function indexOf(xs, x) {
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x)
          return i;
      }
      return -1;
    }
  }
});

// node_modules/readable-stream/lib/_stream_transform.js
var require_stream_transform = __commonJS({
  "node_modules/readable-stream/lib/_stream_transform.js"(exports, module2) {
    "use strict";
    module2.exports = Transform;
    var Duplex = require_stream_duplex();
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    util.inherits(Transform, Duplex);
    function afterTransform(er, data) {
      var ts = this._transformState;
      ts.transforming = false;
      var cb = ts.writecb;
      if (!cb) {
        return this.emit("error", new Error("write callback called multiple times"));
      }
      ts.writechunk = null;
      ts.writecb = null;
      if (data != null)
        this.push(data);
      cb(er);
      var rs = this._readableState;
      rs.reading = false;
      if (rs.needReadable || rs.length < rs.highWaterMark) {
        this._read(rs.highWaterMark);
      }
    }
    function Transform(options) {
      if (!(this instanceof Transform))
        return new Transform(options);
      Duplex.call(this, options);
      this._transformState = {
        afterTransform: afterTransform.bind(this),
        needTransform: false,
        transforming: false,
        writecb: null,
        writechunk: null,
        writeencoding: null
      };
      this._readableState.needReadable = true;
      this._readableState.sync = false;
      if (options) {
        if (typeof options.transform === "function")
          this._transform = options.transform;
        if (typeof options.flush === "function")
          this._flush = options.flush;
      }
      this.on("prefinish", prefinish);
    }
    function prefinish() {
      var _this = this;
      if (typeof this._flush === "function") {
        this._flush(function(er, data) {
          done(_this, er, data);
        });
      } else {
        done(this, null, null);
      }
    }
    Transform.prototype.push = function(chunk, encoding) {
      this._transformState.needTransform = false;
      return Duplex.prototype.push.call(this, chunk, encoding);
    };
    Transform.prototype._transform = function(chunk, encoding, cb) {
      throw new Error("_transform() is not implemented");
    };
    Transform.prototype._write = function(chunk, encoding, cb) {
      var ts = this._transformState;
      ts.writecb = cb;
      ts.writechunk = chunk;
      ts.writeencoding = encoding;
      if (!ts.transforming) {
        var rs = this._readableState;
        if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark)
          this._read(rs.highWaterMark);
      }
    };
    Transform.prototype._read = function(n) {
      var ts = this._transformState;
      if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
        ts.transforming = true;
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
      } else {
        ts.needTransform = true;
      }
    };
    Transform.prototype._destroy = function(err, cb) {
      var _this2 = this;
      Duplex.prototype._destroy.call(this, err, function(err2) {
        cb(err2);
        _this2.emit("close");
      });
    };
    function done(stream, er, data) {
      if (er)
        return stream.emit("error", er);
      if (data != null)
        stream.push(data);
      if (stream._writableState.length)
        throw new Error("Calling transform done when ws.length != 0");
      if (stream._transformState.transforming)
        throw new Error("Calling transform done when still transforming");
      return stream.push(null);
    }
  }
});

// node_modules/readable-stream/lib/_stream_passthrough.js
var require_stream_passthrough = __commonJS({
  "node_modules/readable-stream/lib/_stream_passthrough.js"(exports, module2) {
    "use strict";
    module2.exports = PassThrough;
    var Transform = require_stream_transform();
    var util = Object.create(require_util());
    util.inherits = require_inherits();
    util.inherits(PassThrough, Transform);
    function PassThrough(options) {
      if (!(this instanceof PassThrough))
        return new PassThrough(options);
      Transform.call(this, options);
    }
    PassThrough.prototype._transform = function(chunk, encoding, cb) {
      cb(null, chunk);
    };
  }
});

// node_modules/readable-stream/readable.js
var require_readable = __commonJS({
  "node_modules/readable-stream/readable.js"(exports, module2) {
    var Stream = require("stream");
    if (process.env.READABLE_STREAM === "disable" && Stream) {
      module2.exports = Stream;
      exports = module2.exports = Stream.Readable;
      exports.Readable = Stream.Readable;
      exports.Writable = Stream.Writable;
      exports.Duplex = Stream.Duplex;
      exports.Transform = Stream.Transform;
      exports.PassThrough = Stream.PassThrough;
      exports.Stream = Stream;
    } else {
      exports = module2.exports = require_stream_readable();
      exports.Stream = Stream || exports;
      exports.Readable = exports;
      exports.Writable = require_stream_writable();
      exports.Duplex = require_stream_duplex();
      exports.Transform = require_stream_transform();
      exports.PassThrough = require_stream_passthrough();
    }
  }
});

// node_modules/imurmurhash/imurmurhash.js
var require_imurmurhash = __commonJS({
  "node_modules/imurmurhash/imurmurhash.js"(exports, module2) {
    (function() {
      var cache;
      function MurmurHash3(key, seed) {
        var m = this instanceof MurmurHash3 ? this : cache;
        m.reset(seed);
        if (typeof key === "string" && key.length > 0) {
          m.hash(key);
        }
        if (m !== this) {
          return m;
        }
      }
      ;
      MurmurHash3.prototype.hash = function(key) {
        var h1, k1, i, top, len;
        len = key.length;
        this.len += len;
        k1 = this.k1;
        i = 0;
        switch (this.rem) {
          case 0:
            k1 ^= len > i ? key.charCodeAt(i++) & 65535 : 0;
          case 1:
            k1 ^= len > i ? (key.charCodeAt(i++) & 65535) << 8 : 0;
          case 2:
            k1 ^= len > i ? (key.charCodeAt(i++) & 65535) << 16 : 0;
          case 3:
            k1 ^= len > i ? (key.charCodeAt(i) & 255) << 24 : 0;
            k1 ^= len > i ? (key.charCodeAt(i++) & 65280) >> 8 : 0;
        }
        this.rem = len + this.rem & 3;
        len -= this.rem;
        if (len > 0) {
          h1 = this.h1;
          while (1) {
            k1 = k1 * 11601 + (k1 & 65535) * 3432906752 & 4294967295;
            k1 = k1 << 15 | k1 >>> 17;
            k1 = k1 * 13715 + (k1 & 65535) * 461832192 & 4294967295;
            h1 ^= k1;
            h1 = h1 << 13 | h1 >>> 19;
            h1 = h1 * 5 + 3864292196 & 4294967295;
            if (i >= len) {
              break;
            }
            k1 = key.charCodeAt(i++) & 65535 ^ (key.charCodeAt(i++) & 65535) << 8 ^ (key.charCodeAt(i++) & 65535) << 16;
            top = key.charCodeAt(i++);
            k1 ^= (top & 255) << 24 ^ (top & 65280) >> 8;
          }
          k1 = 0;
          switch (this.rem) {
            case 3:
              k1 ^= (key.charCodeAt(i + 2) & 65535) << 16;
            case 2:
              k1 ^= (key.charCodeAt(i + 1) & 65535) << 8;
            case 1:
              k1 ^= key.charCodeAt(i) & 65535;
          }
          this.h1 = h1;
        }
        this.k1 = k1;
        return this;
      };
      MurmurHash3.prototype.result = function() {
        var k1, h1;
        k1 = this.k1;
        h1 = this.h1;
        if (k1 > 0) {
          k1 = k1 * 11601 + (k1 & 65535) * 3432906752 & 4294967295;
          k1 = k1 << 15 | k1 >>> 17;
          k1 = k1 * 13715 + (k1 & 65535) * 461832192 & 4294967295;
          h1 ^= k1;
        }
        h1 ^= this.len;
        h1 ^= h1 >>> 16;
        h1 = h1 * 51819 + (h1 & 65535) * 2246770688 & 4294967295;
        h1 ^= h1 >>> 13;
        h1 = h1 * 44597 + (h1 & 65535) * 3266445312 & 4294967295;
        h1 ^= h1 >>> 16;
        return h1 >>> 0;
      };
      MurmurHash3.prototype.reset = function(seed) {
        this.h1 = typeof seed === "number" ? seed : 0;
        this.rem = this.k1 = this.len = 0;
        return this;
      };
      cache = new MurmurHash3();
      if (typeof module2 != "undefined") {
        module2.exports = MurmurHash3;
      } else {
        this.MurmurHash3 = MurmurHash3;
      }
    })();
  }
});

// node_modules/iferr/index.js
var require_iferr = __commonJS({
  "node_modules/iferr/index.js"(exports, module2) {
    (function() {
      var exports2, iferr, printerr, throwerr, tiferr, __slice = [].slice;
      iferr = function(fail, succ) {
        return function() {
          var a, err;
          err = arguments[0], a = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          if (err != null) {
            return fail(err);
          } else {
            return typeof succ === "function" ? succ.apply(null, a) : void 0;
          }
        };
      };
      tiferr = function(fail, succ) {
        return iferr(fail, function() {
          var a, err;
          a = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          try {
            return succ.apply(null, a);
          } catch (_error) {
            err = _error;
            return fail(err);
          }
        });
      };
      throwerr = iferr.bind(null, function(err) {
        throw err;
      });
      printerr = iferr(function(err) {
        return console.error(err.stack || err);
      });
      module2.exports = exports2 = iferr;
      exports2.iferr = iferr;
      exports2.tiferr = tiferr;
      exports2.throwerr = throwerr;
      exports2.printerr = printerr;
    }).call(exports);
  }
});

// node_modules/fs-write-stream-atomic/index.js
var require_fs_write_stream_atomic = __commonJS({
  "node_modules/fs-write-stream-atomic/index.js"(exports, module2) {
    var fs = require_graceful_fs();
    var Writable = require_readable().Writable;
    var util = require("util");
    var MurmurHash3 = require_imurmurhash();
    var iferr = require_iferr();
    var crypto = require("crypto");
    function murmurhex() {
      var hash = MurmurHash3("");
      for (var ii = 0; ii < arguments.length; ++ii) {
        hash.hash("" + arguments[ii]);
      }
      return hash.result();
    }
    var invocations = 0;
    function getTmpname(filename) {
      return filename + "." + murmurhex(__filename, process.pid, ++invocations);
    }
    var setImmediate2 = global.setImmediate || setTimeout;
    module2.exports = WriteStreamAtomic;
    util.inherits(WriteStreamAtomic, Writable);
    function WriteStreamAtomic(path, options) {
      if (!(this instanceof WriteStreamAtomic)) {
        return new WriteStreamAtomic(path, options);
      }
      Writable.call(this, options);
      this.__isWin = options && options.hasOwnProperty("isWin") ? options.isWin : process.platform === "win32";
      this.__atomicTarget = path;
      this.__atomicTmp = getTmpname(path);
      this.__atomicChown = options && options.chown;
      this.__atomicClosed = false;
      this.__atomicStream = fs.WriteStream(this.__atomicTmp, options);
      this.__atomicStream.once("open", handleOpen(this));
      this.__atomicStream.once("close", handleClose(this));
      this.__atomicStream.once("error", handleError2(this));
    }
    WriteStreamAtomic.prototype.emit = function(event) {
      if (event === "finish")
        return this.__atomicStream.end();
      return Writable.prototype.emit.apply(this, arguments);
    };
    WriteStreamAtomic.prototype._write = function(buffer, encoding, cb) {
      var flushed = this.__atomicStream.write(buffer, encoding);
      if (flushed)
        return cb();
      this.__atomicStream.once("drain", cb);
    };
    function handleOpen(writeStream) {
      return function(fd) {
        writeStream.emit("open", fd);
      };
    }
    function handleClose(writeStream) {
      return function() {
        if (writeStream.__atomicClosed)
          return;
        writeStream.__atomicClosed = true;
        if (writeStream.__atomicChown) {
          var uid = writeStream.__atomicChown.uid;
          var gid = writeStream.__atomicChown.gid;
          return fs.chown(writeStream.__atomicTmp, uid, gid, iferr(cleanup, moveIntoPlace));
        } else {
          moveIntoPlace();
        }
      };
      function moveIntoPlace() {
        fs.rename(writeStream.__atomicTmp, writeStream.__atomicTarget, iferr(trapWindowsEPERM, end));
      }
      function trapWindowsEPERM(err) {
        if (writeStream.__isWin && err.syscall && err.syscall === "rename" && err.code && err.code === "EPERM") {
          checkFileHashes(err);
        } else {
          cleanup(err);
        }
      }
      function checkFileHashes(eperm) {
        var inprocess = 2;
        var tmpFileHash = crypto.createHash("sha512");
        var targetFileHash = crypto.createHash("sha512");
        fs.createReadStream(writeStream.__atomicTmp).on("data", function(data, enc) {
          tmpFileHash.update(data, enc);
        }).on("error", fileHashError).on("end", fileHashComplete);
        fs.createReadStream(writeStream.__atomicTarget).on("data", function(data, enc) {
          targetFileHash.update(data, enc);
        }).on("error", fileHashError).on("end", fileHashComplete);
        function fileHashError() {
          if (inprocess === 0)
            return;
          inprocess = 0;
          cleanup(eperm);
        }
        function fileHashComplete() {
          if (inprocess === 0)
            return;
          if (--inprocess)
            return;
          if (tmpFileHash.digest("hex") === targetFileHash.digest("hex")) {
            return cleanup();
          } else {
            return cleanup(eperm);
          }
        }
      }
      function cleanup(err) {
        fs.unlink(writeStream.__atomicTmp, function() {
          if (err) {
            writeStream.emit("error", err);
            writeStream.emit("close");
          } else {
            end();
          }
        });
      }
      function end() {
        Writable.prototype.emit.call(writeStream, "finish");
        setImmediate2(function() {
          writeStream.emit("close");
        });
      }
    }
    function handleError2(writeStream) {
      return function(er) {
        cleanupSync();
        writeStream.emit("error", er);
        writeStream.__atomicClosed = true;
        writeStream.emit("close");
      };
      function cleanupSync() {
        try {
          fs.unlinkSync(writeStream.__atomicTmp);
        } finally {
          return;
        }
      }
    }
  }
});

// node_modules/dwaal/lib/data.js
var require_data = __commonJS({
  "node_modules/dwaal/lib/data.js"(exports, module2) {
    "use strict";
    var fs = require("fs");
    var msgpack = require_msgpack_lite();
    var isDeepEqual = require_deep_equal();
    var fsWriteStreamAtomic = require_fs_write_stream_atomic();
    var TYPE_VERSION = 0;
    var TYPE_ENTRY = 1;
    module2.exports = class Data {
      constructor(root) {
        this.file = root;
        this.data = /* @__PURE__ */ new Map();
      }
      load() {
        if (this.loadPromise)
          return this.loadPromise;
        return this.loadPromise = new Promise((resolve, reject) => {
          if (!fs.existsSync(this.file)) {
            this.loadPromise = null;
            resolve();
            return;
          }
          const stream = fs.createReadStream(this.file);
          const decoder = msgpack.createDecodeStream();
          stream.pipe(decoder).on("data", (d) => {
            const type = d[0];
            if (type === TYPE_VERSION) {
              this.version = d[1];
              if (this.version != 1) {
                reject(new Error("Unsupported version of storage"));
              }
            } else if (type === TYPE_ENTRY) {
              this.data.set(d[1], d[2]);
            }
          }).on("end", () => resolve()).on("error", (err) => {
            this.loadPromise = null;
            reject(err);
          });
        });
      }
      store() {
        return new Promise((resolve, reject) => {
          const stream = fsWriteStreamAtomic(this.file);
          stream.on("error", (err) => reject(err));
          stream.on("end", resolve);
          const encoder = msgpack.createEncodeStream();
          encoder.pipe(stream);
          encoder.write([TYPE_VERSION, 1]);
          for (const [key, value] of this.data.entries()) {
            encoder.write([TYPE_ENTRY, key, value]);
          }
          encoder.end();
        });
      }
      close() {
        return this.store();
      }
      get(key) {
        return this.data.get(key);
      }
      set(key, value) {
        const d = this.data.get(key);
        if (isDeepEqual(d, value))
          return;
        this.data.set(key, value);
        if (!this.storeTimeout) {
          this.storeTimeout = setTimeout(() => {
            this.store();
            this.storeTimeout = 0;
          }, 500);
        }
      }
    };
  }
});

// node_modules/dwaal/index.js
var require_dwaal = __commonJS({
  "node_modules/dwaal/index.js"(exports, module2) {
    "use strict";
    var Network = require_network();
    var Data = require_data();
    var debug = require_src()("dwaal");
    var path = require("path");
    module2.exports = class Storage {
      constructor(options) {
        if (!options)
          throw new Error("Options need to be specified");
        if (typeof options.path !== "string")
          throw new Error("`path` to directory used for storage is required");
        this.id = options.id;
        this.isOpen = false;
        this.openPromise = null;
        this.path = options.path;
        this.seq = 0;
        this.requests = /* @__PURE__ */ new Map();
      }
      open() {
        if (this.isOpen)
          return Promise.resolve();
        if (this.openPromise)
          return this.openPromise;
        debug("Opening storage connection to", this.path);
        this.network = new Network(path.join(this.path, ".dwaal-socket"));
        this.network.on("message", this._handleMessage.bind(this));
        return this.openPromise = this.network.open().then(() => {
          debug("Storage connection has been opened to", this.path);
          this.isOpen = true;
          this.openPromise = null;
        });
      }
      close() {
        this.network.close();
        this.isOpen = false;
        if (this.data) {
          return this.data.close();
        } else {
          return Promise.resolve();
        }
      }
      _rpc(action, args) {
        return this.open().then(() => new Promise((resolve, reject) => {
          const seq = this.seq++;
          this.network.sendToLeader(seq, action, args);
          this.requests.set(seq, { resolve, reject });
          setTimeout(() => {
            reject();
            this.requests.delete(seq);
          }, 1500);
        }));
      }
      _data() {
        if (this.data)
          return this.data.load();
        this.data = new Data(path.join(this.path, "storage.dwaal.bin"));
        return this.data.load();
      }
      _replyError(socket, seq, err) {
        socket.send([seq, "error", err.message]);
      }
      _replySuccess(socket, seq, success) {
        socket.send([seq, "success", success]);
      }
      get(key) {
        return this._rpc("get", [key]);
      }
      set(key, value) {
        return this._rpc("set", [key, value]);
      }
      _handleMessage({ returnPath, seq, type, payload }) {
        if (type === "success") {
          const promise = this.requests.get(seq);
          if (!promise)
            return;
          this.requests.delete(seq);
          promise.resolve(payload);
        }
        if (type === "error") {
          const promise = this.requests.get(seq);
          if (!promise)
            return;
          this.requests.delete(seq);
          promise.reject(new Error(payload));
        } else if (type === "get") {
          this._data().then(() => {
            const value = this.data.get(payload[0]);
            this._replySuccess(returnPath, seq, value);
          }).catch((err) => {
            this._replyError(returnPath, seq, err);
          });
        } else if (type === "set") {
          this._data().then(() => {
            this.data.set(payload[0], payload[1]);
            this._replySuccess(returnPath, seq);
          }).catch((err) => {
            this._replyError(returnPath, seq, err);
          });
        }
      }
      _handleReply({ type, payload }) {
      }
    };
  }
});

// node_modules/abstract-things/storage/api.js
var require_api = __commonJS({
  "node_modules/abstract-things/storage/api.js"(exports, module2) {
    "use strict";
    var path = require("path");
    var mkdirp = require_mkdirp();
    var AppDirectory = require_appdirectory();
    var Storage = require_dwaal();
    var values = require_values();
    var storage;
    var parent;
    function resolveDataDir() {
      if (!parent) {
        if (process.env.THING_STORAGE) {
          parent = process.env.THING_STORAGE;
        } else {
          const dirs = new AppDirectory("abstract-things");
          parent = dirs.userData();
        }
        mkdirp.sync(parent);
      }
      return parent;
    }
    function resolveStorage() {
      if (storage)
        return storage;
      let parent2 = resolveDataDir();
      const p = path.join(parent2, "storage");
      mkdirp.sync(p);
      storage = new Storage({
        path: p
      });
      return storage;
    }
    var SubStorage = class {
      constructor(storage2, sub) {
        this._storage = storage2;
        this._path = sub;
      }
      get(key) {
        return this._storage.get(this._path + "/" + key).then((json) => values.fromJSON("mixed", json));
      }
      set(key, value) {
        return this._storage.set(this._path + "/" + key, values.toJSON("mixed", value));
      }
      sub(key) {
        return new SubStorage(this._storage, this._path + "/" + key);
      }
      inspect() {
        return "Storage[" + this._path + "]";
      }
      toString() {
        return this.inspect();
      }
    };
    module2.exports = {
      get dataDir() {
        return resolveDataDir();
      },
      global() {
        return new SubStorage(resolveStorage(), "global");
      },
      instance(id) {
        return new SubStorage(resolveStorage(), "instance/" + id);
      }
    };
  }
});

// node_modules/abstract-things/storage/index.js
var require_storage = __commonJS({
  "node_modules/abstract-things/storage/index.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var api = require_api();
    var storage = Symbol("storage");
    module2.exports = Thing.mixin((Parent) => class extends Parent {
      static get storage() {
        return api.global();
      }
      get storage() {
        if (!this[storage]) {
          this[storage] = api.instance(this.id);
        }
        return this[storage];
      }
    });
  }
});

// node_modules/abstract-things/common/children.js
var require_children = __commonJS({
  "node_modules/abstract-things/common/children.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var childrenSymbol = Symbol("children");
    module2.exports = Thing.mixin((Parent) => class extends Parent {
      static get capability() {
        return "children";
      }
      static availableAPI(builder) {
        builder.action("children").description("Get children of the thing").returns("array").done();
        builder.action("child").description("Get child based on identifier").argument("string", false, "The id of the child").returns("thing").done();
        builder.action("hasChild").description("Get if the this thing has the given child").argument("string", false, "The id of the child").returns("boolean").done();
      }
      constructor(...args) {
        super(...args);
        this[childrenSymbol] = /* @__PURE__ */ new Map();
      }
      addChild(thing) {
        if (typeof thing !== "object")
          throw new Error("Thing needs to be specified");
        if (!thing.id) {
          throw new Error("Child needs to have an `id`");
        }
        thing.metadata.parent = this;
        thing.metadata.addTypes("sub-thing");
        const children = this[childrenSymbol];
        const child = children.get(thing.id);
        if (child) {
          if (child !== thing) {
            children.set(thing.id, thing);
            this.emitEvent("thing:unavailable", child, { multiple: true });
            this.emitEvent("thing:available", thing, { multiple: true });
          }
        } else {
          children.set(thing.id, thing);
          this.emitEvent("thing:available", thing, { multiple: true });
        }
      }
      removeChild(thingOrId) {
        if (typeof thingOrId === "undefined")
          throw new Error("Thing or identifier needs to be specified");
        const id = typeof thingOrId === "string" ? thingOrId : thingOrId.id;
        const children = this[childrenSymbol];
        const child = this.child(id);
        if (child) {
          children.delete(id);
          this.emitEvent("thing:unavailable", child, { multiple: true });
        }
      }
      hasChild(thingOrId) {
        if (typeof thingOrId === "undefined")
          throw new Error("Thing or identifier needs to be specified");
        const id = typeof thingOrId === "string" ? thingOrId : thingOrId.id;
        return this[childrenSymbol].has(id) || this[childrenSymbol].has(this.id + ":" + id);
      }
      child(id) {
        return this[childrenSymbol].get(id) || this[childrenSymbol].get(this.id + ":" + id);
      }
      findChild(filter) {
        for (const child of this[childrenSymbol].values()) {
          if (filter(child)) {
            return child;
          }
        }
        return null;
      }
      children() {
        return this[childrenSymbol].values();
      }
    });
  }
});

// node_modules/abstract-things/common/nameable.js
var require_nameable = __commonJS({
  "node_modules/abstract-things/common/nameable.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static availableAPI(builder) {
        builder.action("setName").description("Set the name of this appliance").argument("string", "The name of the appliance").done();
      }
      static get capability() {
        return "nameable";
      }
      constructor(...args) {
        super(...args);
      }
      setName(name) {
        try {
          return Promise.resolve(this.changeName(name)).then(() => this.metadata.name);
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      changeName(name) {
        throw new Error("changeName has not been implemented");
      }
    });
  }
});

// node_modules/abstract-things/common/easy-nameable.js
var require_easy_nameable = __commonJS({
  "node_modules/abstract-things/common/easy-nameable.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Nameable = require_nameable();
    var Storage = require_storage();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Nameable, Storage) {
      constructor(...args) {
        super(...args);
      }
      initCallback() {
        return super.initCallback().then(() => this.storage.get("name")).then((name) => name && (this.metadata.name = name));
      }
      changeName(name) {
        return this.storage.set("name", name).then(() => this.metadata.name = name);
      }
    });
  }
});

// node_modules/abstract-things/common/power.js
var require_power2 = __commonJS({
  "node_modules/abstract-things/common/power.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static availableAPI(builder) {
        builder.state("power").type("boolean").description("The power state of this appliance").done();
        builder.event("powerChanged").type("boolean").description("The power state of the appliance has changed").done();
        builder.action("power").description("Get the power state of this appliance").returns("boolean", "The power state of the appliance").getterForState("power").done();
      }
      static get capability() {
        return "power";
      }
      constructor(...args) {
        super(...args);
        this.updateState("power", false);
      }
      power() {
        return Promise.resolve(this.getState("power"));
      }
      updatePower(power) {
        if (this.updateState("power", power)) {
          this.emitEvent("powerChanged", power);
        }
      }
    });
  }
});

// node_modules/abstract-things/common/switchable-power.js
var require_switchable_power = __commonJS({
  "node_modules/abstract-things/common/switchable-power.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Power = require_power2();
    var RestorableState = require_restorable_state();
    var { boolean } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Power, RestorableState) {
      static availableAPI(builder) {
        builder.action("power").description("Get or set the power state of this appliance").argument("boolean", true, "Optional power state to change to").returns("boolean", "The power state of the appliance").getterForState("power").done();
        builder.action("setPower").description("Set the power state of this appliance").argument("boolean", false, "The power state to change to").returns("boolean", "The power state of the appliance").done();
        builder.action("togglePower").description("Toggle the power of the appliance, turning it on if off and vice versa").returns("boolean", "The power state of the appliance").done();
        builder.action("turnOn").description("Turn this appliance on").returns("boolean", "The power state of the appliance").done();
        builder.action("turnOff").description("Turn this appliance off").returns("boolean", "The power state of the appliance").done();
      }
      static get capability() {
        return "switchable-power";
      }
      constructor(...args) {
        super(...args);
      }
      power(power = void 0) {
        if (typeof power !== "undefined") {
          return this.setPower(power);
        }
        return super.power();
      }
      setPower(power) {
        try {
          power = boolean(power);
          return Promise.resolve(this.changePower(power)).then(() => this.power());
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      togglePower() {
        return this.power().then((power) => this.setPower(!power));
      }
      turnOn() {
        return this.setPower(true);
      }
      turnOff() {
        return this.setPower(false);
      }
      changePower(power) {
        throw new Error("changePower has not been implemented");
      }
      changePowerState(power) {
        return this.changePower(power);
      }
      get restorableState() {
        return [...super.restorableState, "power"];
      }
      changeState(state) {
        return super.changeState(state).then(() => {
          if (typeof state.power !== "undefined") {
            return this.changePowerState(state.power);
          }
        });
      }
    });
  }
});

// node_modules/abstract-things/common/mode.js
var require_mode = __commonJS({
  "node_modules/abstract-things/common/mode.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    var { code } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static availableAPI(builder) {
        builder.state("mode").type("string").description("The current mode of this thing").done();
        builder.state("modes").type("array").description("The available modes of this thing").done();
        builder.event("modeChanged").type("string").description("The mode of the thing has changed").done();
        builder.event("modesChanged").type("array").description("The availables modes of the thing have changed").done();
        builder.action("mode").description("Get the mode of this thing").returns("mode", "The mode of the thing").getterForState("mode").done();
        builder.action("modes").description("Get the available modes").returns("array", "The modes that are supported").getterForState("modes").done();
      }
      static get capability() {
        return "mode";
      }
      constructor(...args) {
        super(...args);
        this.updateState("mode", null);
        this.updateState("modes", []);
      }
      mode() {
        return Promise.resolve(this.getState("mode"));
      }
      updateMode(mode) {
        if (this.updateState("mode", mode)) {
          this.emitEvent("modeChanged", mode);
        }
      }
      modes() {
        return Promise.resolve(this.getState("modes"));
      }
      updateModes(modes) {
        const mapped = [];
        for (const m of modes) {
          mapped.push(code(m));
        }
        if (this.updateState("modes", mapped)) {
          this.emitEvent("modesChanged", mapped);
        }
      }
    });
  }
});

// node_modules/abstract-things/common/switchable-mode.js
var require_switchable_mode = __commonJS({
  "node_modules/abstract-things/common/switchable-mode.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Mode = require_mode();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Mode) {
      static availableAPI(builder) {
        builder.action("mode").description("Get or set the mode of this appliance").argument("string", true, "Optional mode to change to").returns("mode", "The mode of the appliance").getterForState("mode").done();
        builder.action("setMode").description("Set the mode of this appliance").argument("string", true, "Mode to change to").returns("mode", "The mode of the appliance").done();
      }
      static get capability() {
        return "switchable-mode";
      }
      constructor(...args) {
        super(...args);
      }
      mode(mode = void 0) {
        if (typeof mode !== "undefined") {
          return this.setMode(mode);
        }
        return super.mode();
      }
      setMode(mode) {
        try {
          if (typeof mode === "undefined")
            throw new Error("Mode must be specified");
          mode = String(mode);
          return Promise.resolve(this.changeMode(mode)).then(() => this.getState("mode"));
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      changeMode(mode) {
        throw new Error("changeMode has not been implemented");
      }
    });
  }
});

// node_modules/abstract-things/common/battery-level.js
var require_battery_level = __commonJS({
  "node_modules/abstract-things/common/battery-level.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    var { percentage } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static availableAPI(builder) {
        builder.state("batteryLevel").type("percentage").description("Current battery level of the appliance").done();
        builder.event("batteryLevelChanged").type("percentage").description("Battery level of the appliance has changed").done();
        builder.action("batteryLevel").description("Get the battery level of the appliance").returns("percentage", "Current battery level").done();
      }
      static get capability() {
        return "battery-level";
      }
      constructor(...args) {
        super(...args);
        this.updateState("batteryLevel", -1);
      }
      batteryLevel() {
        return Promise.resolve(this.getState("batteryLevel"));
      }
      updateBatteryLevel(level) {
        level = percentage(level);
        if (this.updateState("batteryLevel", level)) {
          this.emitEvent("batteryLevelChanged", level);
        }
      }
    });
  }
});

// node_modules/abstract-things/common/charging-state.js
var require_charging_state = __commonJS({
  "node_modules/abstract-things/common/charging-state.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    var { boolean } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static availableAPI(builder) {
        builder.state("charging").type("boolean").description("If the thing is charging").done();
        builder.event("chargingChanged").type("boolean").description("Charging state of the thing has changed").done();
        builder.event("chargingStarted").description("Charging has started").done();
        builder.event("chargingStoppped").description("Charging has stopped").done();
        builder.action("charging").description("Get charging state").returns("boolean", "If thing is charging").done();
      }
      static get capability() {
        return "charging-state";
      }
      constructor(...args) {
        super(...args);
        this.updateState("charging", false);
      }
      get charging() {
        return Promise.resolve(this.getState("charging"));
      }
      updateCharging(charging) {
        charging = boolean(charging);
        if (this.updateState("charging", charging)) {
          this.emitEvent("chargingChanged", charging);
          if (charging) {
            this.emitEvent("chargingStarted");
          } else {
            this.emitEvent("chargingStopped");
          }
        }
      }
    });
  }
});

// node_modules/abstract-things/common/autonomous-charging.js
var require_autonomous_charging = __commonJS({
  "node_modules/abstract-things/common/autonomous-charging.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    var ChargingState = require_charging_state();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State, ChargingState) {
      static get capability() {
        return "autonomous-cleaning";
      }
      static availableAPI(builder) {
        builder.action("charge").description("Start charging thing").done();
      }
      charge() {
        try {
          return Promise.resolve(this.activateCharging()).then(() => null);
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      activateCharging() {
        throw new Error("activateCharging not implemented");
      }
    });
  }
});

// node_modules/abstract-things/placeholder.js
var require_placeholder = __commonJS({
  "node_modules/abstract-things/placeholder.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.mixin((Parent) => class extends Parent {
      static get type() {
        return "placeholder";
      }
    });
  }
});

// node_modules/abstract-things/index.js
var require_abstract_things = __commonJS({
  "node_modules/abstract-things/index.js"(exports, module2) {
    "use strict";
    module2.exports.Thing = require_thing();
    module2.exports.Discovery = require_discovery();
    module2.exports.Polling = require_polling();
    module2.exports.State = require_state();
    module2.exports.RestorableState = require_restorable_state();
    module2.exports.ErrorState = require_error_state();
    module2.exports.Storage = require_storage();
    module2.exports.Children = require_children();
    module2.exports.Nameable = require_nameable();
    module2.exports.EasyNameable = require_easy_nameable();
    module2.exports.Power = require_power2();
    module2.exports.SwitchablePower = require_switchable_power();
    module2.exports.Mode = require_mode();
    module2.exports.SwitchableMode = require_switchable_mode();
    module2.exports.BatteryLevel = require_battery_level();
    module2.exports.ChargingState = require_charging_state();
    module2.exports.AutonomousCharging = require_autonomous_charging();
    module2.exports.Placeholder = require_placeholder();
  }
});

// node_modules/miio/lib/packet.js
var require_packet = __commonJS({
  "node_modules/miio/lib/packet.js"(exports, module2) {
    "use strict";
    var crypto = require("crypto");
    var debug = require_src()("miio:packet");
    var Packet = class {
      constructor(discovery = false) {
        this.discovery = discovery;
        this.header = Buffer.alloc(2 + 2 + 4 + 4 + 4 + 16);
        this.header[0] = 33;
        this.header[1] = 49;
        for (let i = 4; i < 32; i++) {
          this.header[i] = 255;
        }
        this._serverStampTime = 0;
        this._token = null;
      }
      handshake() {
        this.data = null;
      }
      handleHandshakeReply() {
        if (this._token === null) {
          const token = this.checksum;
          if (token.toString("hex").match(/^[fF0]+$/)) {
            this._token = null;
          } else {
            this.token = this.checksum;
          }
        }
      }
      get needsHandshake() {
        return !this._token || Date.now() - this._serverStampTime > 12e4;
      }
      get raw() {
        if (this.data) {
          if (!this._token) {
            throw new Error("Token is required to send commands");
          }
          for (let i = 4; i < 8; i++) {
            this.header[i] = 0;
          }
          if (this._serverStampTime) {
            const secondsPassed = Math.floor(Date.now() - this._serverStampTime) / 1e3;
            this.header.writeUInt32BE(this._serverStamp + secondsPassed, 12);
          }
          let cipher = crypto.createCipheriv("aes-128-cbc", this._tokenKey, this._tokenIV);
          let encrypted = Buffer.concat([
            cipher.update(this.data),
            cipher.final()
          ]);
          this.header.writeUInt16BE(32 + encrypted.length, 2);
          let digest = crypto.createHash("md5").update(this.header.slice(0, 16)).update(this._token).update(encrypted).digest();
          digest.copy(this.header, 16);
          debug("->", this.header);
          return Buffer.concat([this.header, encrypted]);
        } else {
          this.header.writeUInt16BE(32, 2);
          for (let i = 4; i < 32; i++) {
            this.header[i] = 255;
          }
          debug("->", this.header);
          return this.header;
        }
      }
      set raw(msg) {
        msg.copy(this.header, 0, 0, 32);
        debug("<-", this.header);
        const stamp = this.stamp;
        if (stamp > 0) {
          this._serverStamp = this.stamp;
          this._serverStampTime = Date.now();
        }
        const encrypted = msg.slice(32);
        if (this.discovery) {
          this.data = encrypted.length > 0;
        } else {
          if (encrypted.length > 0) {
            if (!this._token) {
              debug("<- No token set, unable to handle packet");
              this.data = null;
              return;
            }
            const digest = crypto.createHash("md5").update(this.header.slice(0, 16)).update(this._token).update(encrypted).digest();
            const checksum = this.checksum;
            if (!checksum.equals(digest)) {
              debug("<- Invalid packet, checksum was", checksum, "should be", digest);
              this.data = null;
            } else {
              let decipher = crypto.createDecipheriv("aes-128-cbc", this._tokenKey, this._tokenIV);
              this.data = Buffer.concat([
                decipher.update(encrypted),
                decipher.final()
              ]);
            }
          } else {
            this.data = null;
          }
        }
      }
      get token() {
        return this._token;
      }
      set token(t) {
        this._token = Buffer.from(t);
        this._tokenKey = crypto.createHash("md5").update(t).digest();
        this._tokenIV = crypto.createHash("md5").update(this._tokenKey).update(t).digest();
      }
      get checksum() {
        return this.header.slice(16);
      }
      get deviceId() {
        return this.header.readUInt32BE(8);
      }
      get stamp() {
        return this.header.readUInt32BE(12);
      }
    };
    module2.exports = Packet;
  }
});

// node_modules/miio/lib/tokens.js
var require_tokens = __commonJS({
  "node_modules/miio/lib/tokens.js"(exports, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var mkdirp = require_mkdirp();
    var AppDirectory = require_appdirectory();
    var dirs = new AppDirectory("miio");
    var CHECK_TIME = 1e3;
    var MAX_STALE_TIME = 12e4;
    var debug = require_src()("miio:tokens");
    var Tokens = class {
      constructor() {
        this._file = path.join(dirs.userData(), "tokens.json");
        this._data = {};
        this._lastSync = 0;
      }
      get(deviceId) {
        const now = Date.now();
        const diff = now - this._lastSync;
        if (diff > CHECK_TIME) {
          return this._loadAndGet(deviceId);
        }
        return Promise.resolve(this._get(deviceId));
      }
      _get(deviceId) {
        return this._data[deviceId];
      }
      _loadAndGet(deviceId) {
        return this._load().then(() => this._get(deviceId)).catch(() => null);
      }
      _load() {
        if (this._loading)
          return this._loading;
        return this._loading = new Promise((resolve, reject) => {
          debug("Loading token storage from", this._file);
          fs.stat(this._file, (err, stat) => {
            if (err) {
              delete this._loading;
              if (err.code === "ENOENT") {
                debug("Token storage does not exist");
                this._lastSync = Date.now();
                resolve(this._data);
              } else {
                reject(err);
              }
              return;
            }
            if (!stat.isFile()) {
              delete this._loading;
              reject(new Error("tokens.json exists but is not a file"));
            } else if (Date.now() - this._lastSync > MAX_STALE_TIME || stat.mtime.getTime() > this._lastSync) {
              debug("Loading tokens");
              fs.readFile(this._file, (err2, result) => {
                this._data = JSON.parse(result.toString());
                this._lastSync = Date.now();
                delete this._loading;
                resolve(this._data);
              });
            } else {
              delete this._loading;
              this._lastSync = Date.now();
              resolve(this._data);
            }
          });
        });
      }
      update(deviceId, token) {
        return this._load().then(() => {
          this._data[deviceId] = token;
          if (this._saving) {
            this._dirty = true;
            return this._saving;
          }
          return this._saving = new Promise((resolve, reject) => {
            const save = () => {
              debug("About to save tokens");
              fs.writeFile(this._file, JSON.stringify(this._data, null, 2), (err) => {
                if (err) {
                  reject(err);
                } else {
                  if (this._dirty) {
                    debug("Redoing save due to multiple updates");
                    this._dirty = false;
                    save();
                  } else {
                    delete this._saving;
                    resolve();
                  }
                }
              });
            };
            mkdirp(dirs.userData(), (err) => {
              if (err) {
                reject(err);
                return;
              }
              save();
            });
          });
        });
      }
    };
    module2.exports = new Tokens();
  }
});

// node_modules/miio/lib/safeishJSON.js
var require_safeishJSON = __commonJS({
  "node_modules/miio/lib/safeishJSON.js"(exports, module2) {
    "use strict";
    module2.exports = function(str) {
      try {
        return JSON.parse(str);
      } catch (ex) {
        str = str.replace("[,]", "[null,null]");
        str = str.replace("[,,]", "[null,null,null]");
        return JSON.parse(str);
      }
    };
  }
});

// node_modules/miio/lib/network.js
var require_network2 = __commonJS({
  "node_modules/miio/lib/network.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events");
    var dgram = require("dgram");
    var debug = require_src();
    var Packet = require_packet();
    var tokens = require_tokens();
    var safeishJSON = require_safeishJSON();
    var PORT = 54321;
    var ERRORS = {
      "-5001": (method, args, err) => err.message === "invalid_arg" ? "Invalid argument" : err.message,
      "-5005": (method, args, err) => err.message === "params error" ? "Invalid argument" : err.message,
      "-10000": (method) => "Method `" + method + "` is not supported"
    };
    var Network = class extends EventEmitter {
      constructor() {
        super();
        this.packet = new Packet(true);
        this.addresses = /* @__PURE__ */ new Map();
        this.devices = /* @__PURE__ */ new Map();
        this.references = 0;
        this.debug = debug("miio:network");
      }
      search() {
        this.packet.handshake();
        const data = Buffer.from(this.packet.raw);
        this.socket.send(data, 0, data.length, PORT, "255.255.255.255");
        setTimeout(() => {
          this.socket.send(data, 0, data.length, PORT, "255.255.255.255");
        }, 500);
      }
      findDevice(id, rinfo) {
        let device = this.devices.get(id);
        if (!device && rinfo) {
          device = this.addresses.get(rinfo.address);
          if (!device) {
            device = new DeviceInfo(this, id, rinfo.address, rinfo.port);
            this.devices.set(id, device);
            this.addresses.set(rinfo.address, device);
            return device;
          }
        }
        return device;
      }
      findDeviceViaAddress(options) {
        if (!this.socket) {
          throw new Error("Implementation issue: Using network without a reference");
        }
        let device = this.addresses.get(options.address);
        if (!device) {
          device = new DeviceInfo(this, null, options.address, options.port || PORT);
          this.addresses.set(options.address, device);
        }
        if (typeof options.token === "string") {
          device.token = Buffer.from(options.token, "hex");
        } else if (options.token instanceof Buffer) {
          device.token = options.token;
        }
        if (!device.model && options.model) {
          device.model = options.model;
        }
        return device.handshake().catch((err) => {
          if (err.code === "missing-token") {
            return;
          }
          throw err;
        }).then(() => {
          if (!this.devices.has(device.id)) {
            this.devices.set(device.id, device);
            return device;
          } else {
            return this.devices.get(device.id);
          }
        }).then((device2) => {
          return device2.enrich();
        }).then(() => device);
      }
      createSocket() {
        this._socket = dgram.createSocket("udp4");
        this._socket.bind();
        this._socket.on("listening", () => {
          this._socket.setBroadcast(true);
          const address = this._socket.address();
          this.debug("Network bound to port", address.port);
        });
        this._socket.on("message", (msg, rinfo) => {
          const buf = Buffer.from(msg);
          try {
            this.packet.raw = buf;
          } catch (ex) {
            this.debug("Could not handle incoming message");
            return;
          }
          if (!this.packet.deviceId) {
            this.debug("No device identifier in incoming packet");
            return;
          }
          const device = this.findDevice(this.packet.deviceId, rinfo);
          device.onMessage(buf);
          if (!this.packet.data) {
            if (!device.enriched) {
              device.enrich().then(() => {
                this.emit("device", device);
              }).catch((err) => {
                this.emit("device", device);
              });
            } else {
              this.emit("device", device);
            }
          }
        });
      }
      list() {
        return this.devices.values();
      }
      ref() {
        this.debug("Grabbing reference to network");
        this.references++;
        this.updateSocket();
        let released = false;
        let self = this;
        return {
          release() {
            if (released)
              return;
            self.debug("Releasing reference to network");
            released = true;
            self.references--;
            self.updateSocket();
          }
        };
      }
      updateSocket() {
        if (this.references === 0) {
          if (this._socket) {
            this.debug("Network no longer active, destroying socket");
            this._socket.close();
            this._socket = null;
          }
        } else if (this.references === 1 && !this._socket) {
          this.debug("Making network active, creating socket");
          this.createSocket();
        }
      }
      get socket() {
        if (!this._socket) {
          throw new Error("Network communication is unavailable, device might be destroyed");
        }
        return this._socket;
      }
    };
    module2.exports = new Network();
    var DeviceInfo = class {
      constructor(parent, id, address, port) {
        this.parent = parent;
        this.packet = new Packet();
        this.address = address;
        this.port = port;
        this.promises = /* @__PURE__ */ new Map();
        this.lastId = 0;
        this.id = id;
        this.debug = id ? debug("thing:miio:" + id) : debug("thing:miio:pending");
        this.tokenChanged = false;
      }
      get token() {
        return this.packet.token;
      }
      set token(t) {
        this.debug("Using manual token:", t.toString("hex"));
        this.packet.token = t;
        this.tokenChanged = true;
      }
      enrich() {
        if (!this.id) {
          throw new Error("Device has no identifier yet, handshake needed");
        }
        if (this.model && !this.tokenChanged && this.packet.token) {
          return Promise.resolve();
        }
        if (this.enrichPromise) {
          return this.enrichPromise;
        }
        let promise;
        if (!this.packet.token) {
          this.debug("Loading token from storage, device hides token and no token set via options");
          this.autoToken = false;
          promise = tokens.get(this.id).then((token) => {
            this.debug("Using stored token:", token);
            this.packet.token = Buffer.from(token, "hex");
            this.tokenChanged = true;
          });
        } else {
          if (this.tokenChanged) {
            this.autoToken = false;
          } else {
            this.autoToken = true;
            this.debug("Using automatic token:", this.packet.token.toString("hex"));
          }
          promise = Promise.resolve();
        }
        return this.enrichPromise = promise.then(() => this.call("miIO.info")).then((data) => {
          this.enriched = true;
          this.model = data.model;
          this.tokenChanged = false;
          this.enrichPromise = null;
        }).catch((err) => {
          this.enrichPromise = null;
          this.enriched = true;
          if (err.code === "missing-token") {
            err.device = this;
            throw err;
          }
          if (this.packet.token) {
            const e = new Error("Could not connect to device, token might be wrong");
            e.code = "connection-failure";
            e.device = this;
            throw e;
          } else {
            const e = new Error("Could not connect to device, token needs to be specified");
            e.code = "missing-token";
            e.device = this;
            throw e;
          }
        });
      }
      onMessage(msg) {
        try {
          this.packet.raw = msg;
        } catch (ex) {
          this.debug("<- Unable to parse packet", ex);
          return;
        }
        let data = this.packet.data;
        if (data === null) {
          this.debug("<-", "Handshake reply:", this.packet.checksum);
          this.packet.handleHandshakeReply();
          if (this.handshakeResolve) {
            this.handshakeResolve();
          }
        } else {
          if (data[data.length - 1] === 0) {
            data = data.slice(0, data.length - 1);
          }
          let str = data.toString("utf8");
          str = str.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "");
          this.debug("<- Message: `" + str + "`");
          try {
            let object = safeishJSON(str);
            const p = this.promises.get(object.id);
            if (!p)
              return;
            if (typeof object.result !== "undefined") {
              p.resolve(object.result);
            } else {
              p.reject(object.error);
            }
          } catch (ex) {
            this.debug("<- Invalid JSON", ex);
          }
        }
      }
      handshake() {
        if (!this.packet.needsHandshake) {
          return Promise.resolve(this.token);
        }
        if (this.handshakePromise) {
          return this.handshakePromise;
        }
        return this.handshakePromise = new Promise((resolve, reject) => {
          this.packet.handshake();
          const data = this.packet.raw;
          this.parent.socket.send(data, 0, data.length, this.port, this.address, (err) => err && reject(err));
          this.handshakeResolve = () => {
            clearTimeout(this.handshakeTimeout);
            this.handshakeResolve = null;
            this.handshakeTimeout = null;
            this.handshakePromise = null;
            if (this.id !== this.packet.deviceId) {
              this.id = this.packet.deviceId;
              this.debug = debug("thing:miio:" + this.id);
              this.debug("Identifier of device updated");
            }
            if (this.packet.token) {
              resolve();
            } else {
              const err = new Error("Could not connect to device, token needs to be specified");
              err.code = "missing-token";
              reject(err);
            }
          };
          this.handshakeTimeout = setTimeout(() => {
            this.handshakeResolve = null;
            this.handshakeTimeout = null;
            this.handshakePromise = null;
            const err = new Error("Could not connect to device, handshake timeout");
            err.code = "timeout";
            reject(err);
          }, 2e3);
        });
      }
      call(method, args, options) {
        if (typeof args === "undefined") {
          args = [];
        }
        const request = {
          method,
          params: args
        };
        if (options && options.sid) {
          request.sid = options.sid;
        }
        return new Promise((resolve, reject) => {
          let resolved = false;
          const promise = {
            resolve: (res) => {
              resolved = true;
              this.promises.delete(request.id);
              resolve(res);
            },
            reject: (err) => {
              resolved = true;
              this.promises.delete(request.id);
              if (!(err instanceof Error) && typeof err.code !== "undefined") {
                const code = err.code;
                const handler = ERRORS[code];
                let msg;
                if (handler) {
                  msg = handler(method, args, err.message);
                } else {
                  msg = err.message || err.toString();
                }
                err = new Error(msg);
                err.code = code;
              }
              reject(err);
            }
          };
          let retriesLeft = options && options.retries || 5;
          const retry = () => {
            if (retriesLeft-- > 0) {
              send();
            } else {
              this.debug("Reached maximum number of retries, giving up");
              const err = new Error("Call to device timed out");
              err.code = "timeout";
              promise.reject(err);
            }
          };
          const send = () => {
            if (resolved)
              return;
            this.handshake().catch((err) => {
              if (err.code === "timeout") {
                this.debug("<- Handshake timed out");
                retry();
                return false;
              } else {
                throw err;
              }
            }).then((token) => {
              if (!token)
                return;
              let id;
              if (request.id) {
                id = this.lastId + 100;
                this.promises.delete(request.id);
              } else {
                id = this.lastId + 1;
              }
              if (id >= 1e4) {
                this.lastId = id = 1;
              } else {
                this.lastId = id;
              }
              request.id = id;
              this.promises.set(id, promise);
              const json = JSON.stringify(request);
              this.debug("-> (" + retriesLeft + ")", json);
              this.packet.data = Buffer.from(json, "utf8");
              const data = this.packet.raw;
              this.parent.socket.send(data, 0, data.length, this.port, this.address, (err) => err && promise.reject(err));
              setTimeout(retry, 2e3);
            }).catch(promise.reject);
          };
          send();
        });
      }
    };
  }
});

// node_modules/miio/lib/infoFromHostname.js
var require_infoFromHostname = __commonJS({
  "node_modules/miio/lib/infoFromHostname.js"(exports, module2) {
    "use strict";
    module2.exports = function(hostname) {
      const m = /(.+)_miio(\d+)/g.exec(hostname);
      if (!m) {
        if (/rockrobo/g.exec(hostname)) {
          return {
            model: "rockrobo.vacuum.v1",
            type: "vacuum"
          };
        }
        return null;
      }
      const model = m[1].replace(/-/g, ".");
      return {
        model,
        id: m[2]
      };
    };
  }
});

// node_modules/miio/lib/management.js
var require_management = __commonJS({
  "node_modules/miio/lib/management.js"(exports, module2) {
    "use strict";
    var tokens = require_tokens();
    var DeviceManagement = class {
      constructor(device) {
        this.api = device.handle.api;
      }
      get model() {
        return this.api.model;
      }
      get token() {
        const token = this.api.token;
        return token ? token.toString("hex") : null;
      }
      get autoToken() {
        return this.api.autoToken;
      }
      get address() {
        return this.api.address;
      }
      info() {
        return this.api.call("miIO.info");
      }
      updateWireless(options) {
        if (typeof options.ssid !== "string") {
          throw new Error("options.ssid must be a string");
        }
        if (typeof options.passwd !== "string") {
          throw new Error("options.passwd must be a string");
        }
        return this.api.call("miIO.config_router", options).then((result) => {
          if (result !== 0 && result !== "OK" && result !== "ok") {
            throw new Error("Failed updating wireless");
          }
          return true;
        });
      }
      wirelessState() {
        return this.api.call("miIO.wifi_assoc_state");
      }
      updateToken(token) {
        if (token instanceof Buffer) {
          token = token.toString("hex");
        } else if (typeof token !== "string") {
          return Promise.reject(new Error("Token must be a hex-string or a Buffer"));
        }
        const connectToDevice = require_connectToDevice();
        return connectToDevice({
          address: this.address,
          port: this.port,
          token
        }).then((device) => {
          return tokens.update(this.api.id, token).then(() => device.destroy()).then(() => true);
        }).catch((err) => {
          return false;
        });
      }
    };
    module2.exports = DeviceManagement;
  }
});

// node_modules/miio/lib/device.js
var require_device = __commonJS({
  "node_modules/miio/lib/device.js"(exports, module2) {
    "use strict";
    var util = require("util");
    var isDeepEqual = require_deep_equal();
    var { Thing, Polling } = require_abstract_things();
    var DeviceManagement = require_management();
    var IDENTITY_MAPPER = (v) => v;
    module2.exports = Thing.type((Parent) => class extends Parent.with(Polling) {
      static get type() {
        return "miio";
      }
      static availableAPI(builder) {
        builder.action("miioModel").description("Get the model identifier of this device").returns("string").done();
        builder.action("miioProperties").description("Get properties of this device").returns("string").done();
        builder.action("miioCall").description("Execute a raw miio-command to the device").argument("string", false, "The command to run").argument("array", true, "Arguments of the command").done();
      }
      constructor(handle) {
        super();
        this.handle = handle;
        this.id = "miio:" + handle.api.id;
        this.miioModel = handle.api.model;
        this._properties = {};
        this._propertiesToMonitor = [];
        this._propertyDefinitions = {};
        this._reversePropertyDefinitions = {};
        this.poll = this.poll.bind(this);
        this.updateMaxPollFailures(10);
        this.management = new DeviceManagement(this);
      }
      miioCall(method, args) {
        return this.call(method, args);
      }
      call(method, args, options) {
        return this.handle.api.call(method, args, options).then((res) => {
          if (options && options.refresh) {
            return new Promise((resolve) => setTimeout(() => {
              const properties = Array.isArray(options.refresh) ? options.refresh : this._propertiesToMonitor;
              this._loadProperties(properties).then(() => resolve(res)).catch(() => resolve(res));
            }, options && options.refreshDelay || 50));
          } else {
            return res;
          }
        });
      }
      defineProperty(name, def) {
        this._propertiesToMonitor.push(name);
        if (typeof def === "function") {
          def = {
            mapper: def
          };
        } else if (typeof def === "undefined") {
          def = {
            mapper: IDENTITY_MAPPER
          };
        }
        if (!def.mapper) {
          def.mapper = IDENTITY_MAPPER;
        }
        if (def.name) {
          this._reversePropertyDefinitions[def.name] = name;
        }
        this._propertyDefinitions[name] = def;
      }
      _pushProperty(result, name, value) {
        const def = this._propertyDefinitions[name];
        if (!def) {
          result[name] = value;
        } else if (def.handler) {
          def.handler(result, value);
        } else {
          result[def.name || name] = def.mapper(value);
        }
      }
      poll(isInitial) {
        return this._loadProperties();
      }
      _loadProperties(properties) {
        if (typeof properties === "undefined") {
          properties = this._propertiesToMonitor;
        }
        if (properties.length === 0)
          return Promise.resolve();
        return this.loadProperties(properties).then((values) => {
          Object.keys(values).forEach((key) => {
            this.setProperty(key, values[key]);
          });
        });
      }
      setProperty(key, value) {
        const oldValue = this._properties[key];
        if (!isDeepEqual(oldValue, value)) {
          this._properties[key] = value;
          this.debug("Property", key, "changed from", oldValue, "to", value);
          this.propertyUpdated(key, value, oldValue);
        }
      }
      propertyUpdated(key, value, oldValue) {
      }
      setRawProperty(name, value) {
        const def = this._propertyDefinitions[name];
        if (!def)
          return;
        if (def.handler) {
          const result = {};
          def.handler(result, value);
          Object.keys(result).forEach((key) => {
            this.setProperty(key, result[key]);
          });
        } else {
          this.setProperty(def.name || name, def.mapper(value));
        }
      }
      property(key) {
        return this._properties[key];
      }
      get properties() {
        return Object.assign({}, this._properties);
      }
      miioProperties() {
        return this.properties;
      }
      getProperties(props) {
        const result = {};
        props.forEach((key) => {
          result[key] = this._properties[key];
        });
        return result;
      }
      loadProperties(props) {
        props = props.map((key) => this._reversePropertyDefinitions[key] || key);
        return this.call("get_prop", props).then((result) => {
          const obj = {};
          for (let i = 0; i < result.length; i++) {
            this._pushProperty(obj, props[i], result[i]);
          }
          return obj;
        });
      }
      destroyCallback() {
        return super.destroyCallback().then(() => {
          this.handle.ref.release();
        });
      }
      [util.inspect.custom](depth, options) {
        if (depth === 0) {
          return options.stylize("MiioDevice", "special") + "[" + this.miioModel + "]";
        }
        return options.stylize("MiioDevice", "special") + " {\n  model=" + this.miioModel + ",\n  types=" + Array.from(this.metadata.types).join(", ") + ",\n  capabilities=" + Array.from(this.metadata.capabilities).join(", ") + "\n}";
      }
      static checkOk(result) {
        if (!result || typeof result === "string" && result.toLowerCase() !== "ok") {
          throw new Error("Could not perform operation");
        }
        return null;
      }
    });
  }
});

// node_modules/miio/lib/placeholder.js
var require_placeholder2 = __commonJS({
  "node_modules/miio/lib/placeholder.js"(exports, module2) {
    "use strict";
    var { Thing } = require_abstract_things();
    var MiioApi = require_device();
    module2.exports = class extends Thing.with(MiioApi) {
      static get type() {
        return "placeholder";
      }
    };
  }
});

// node_modules/abstract-things/climate/air-monitor.js
var require_air_monitor = __commonJS({
  "node_modules/abstract-things/climate/air-monitor.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "air-monitor";
      }
    });
  }
});

// node_modules/abstract-things/climate/air-purifier.js
var require_air_purifier = __commonJS({
  "node_modules/abstract-things/climate/air-purifier.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "air-purifier";
      }
    });
  }
});

// node_modules/abstract-things/climate/fan.js
var require_fan = __commonJS({
  "node_modules/abstract-things/climate/fan.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "fan";
      }
    });
  }
});

// node_modules/abstract-things/climate/humidifier.js
var require_humidifier = __commonJS({
  "node_modules/abstract-things/climate/humidifier.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "humidifer";
      }
    });
  }
});

// node_modules/abstract-things/climate/dehumidifier.js
var require_dehumidifier = __commonJS({
  "node_modules/abstract-things/climate/dehumidifier.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "dehumidifer";
      }
    });
  }
});

// node_modules/abstract-things/climate/vacuum.js
var require_vacuum = __commonJS({
  "node_modules/abstract-things/climate/vacuum.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "vaccuum";
      }
    });
  }
});

// node_modules/abstract-things/climate/target-humidity.js
var require_target_humidity = __commonJS({
  "node_modules/abstract-things/climate/target-humidity.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    var { percentage } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static get capability() {
        return "target-humidity";
      }
      static availableAPI(builder) {
        builder.event("targetHumidityChanged").type("percentage").description("The target humidity (relative) has changed").done();
        builder.action("targetHumidity").description("Get the target humidity").returns("percentage", "The target humidity").done();
      }
      targetHumidity() {
        return Promise.resolve(this.getState("targetHumidity"));
      }
      updateTargetHumidity(target) {
        target = percentage(target);
        if (this.updateState("targetHumidity", target)) {
          this.emitEvent("targetHumidityChanged", target);
        }
      }
    });
  }
});

// node_modules/abstract-things/climate/adjustable-target-humidity.js
var require_adjustable_target_humidity = __commonJS({
  "node_modules/abstract-things/climate/adjustable-target-humidity.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var TargetHumidity = require_target_humidity();
    var { percentage } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(TargetHumidity) {
      static get capability() {
        return "adjustable-target-humidity";
      }
      static availableAPI(builder) {
        builder.action("targetHumidity").description("Get or set the target humidity").argument("percentage", true, "Optional target humidity to set").returns("percentage", "The current or set target humidity").done();
        builder.action("setTargetHumidity").description("Set the target humidity").argument("percentage", false, "Target humidity to set").returns("percentage", "The target humidity").done();
      }
      targetHumidity(humidity) {
        if (typeof humidity === "undefined") {
          return super.targetHumidity();
        }
        return this.setTargetHumidity(humidity);
      }
      setTargetHumidity(humidity) {
        try {
          humidity = percentage(humidity, true);
          return Promise.resolve(this.changeTargetHumidity(humidity)).then(() => super.targetHumidity());
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      changeTargetHumidity(humidity) {
        throw new Error("changeTargetHumidity not implemented");
      }
    });
  }
});

// node_modules/abstract-things/climate/fan-speed.js
var require_fan_speed = __commonJS({
  "node_modules/abstract-things/climate/fan-speed.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    var { percentage } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static get capability() {
        return "fan-speed";
      }
      static availableAPI(builder) {
        builder.event("fanSpeedChanged").type("percentage").description("The fan speed has changed").done();
        builder.action("fanSpeed").description("Get the fan speed").returns("percentage", "Current fan speed").done();
      }
      fanSpeed() {
        return Promise.resolve(this.getState("fanSpeed"));
      }
      updateFanSpeed(fanSpeed) {
        fanSpeed = percentage(fanSpeed);
        if (this.updateState("fanSpeed", fanSpeed)) {
          this.emitEvent("fanSpeedChanged", fanSpeed);
        }
      }
    });
  }
});

// node_modules/abstract-things/climate/adjustable-fan-speed.js
var require_adjustable_fan_speed = __commonJS({
  "node_modules/abstract-things/climate/adjustable-fan-speed.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var FanSpeed = require_fan_speed();
    var { percentage } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(FanSpeed) {
      static get capability() {
        return "adjustable-fan-speed";
      }
      static availableAPI(builder) {
        builder.action("fanSpeed").description("Get or set the fan speed").argument("percentage", true, "Optional fan speed to set").returns("percentage", "The fan speed").done();
      }
      fanSpeed(speed) {
        if (typeof speed === "undefined") {
          return super.fanSpeed();
        }
        return this.setFanSpeed(speed);
      }
      setFanSpeed(speed) {
        speed = percentage(speed, true);
        try {
          return Promise.resolve(this.changeFanSpeed(speed)).then(() => super.fanSpeed());
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      changeFanSpeed(speed) {
        throw new Error("changeFanSpeed not implemented");
      }
    });
  }
});

// node_modules/abstract-things/climate/cleaning-state.js
var require_cleaning_state = __commonJS({
  "node_modules/abstract-things/climate/cleaning-state.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    var ErrorState = require_error_state();
    var { boolean } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(ErrorState, State) {
      static get capability() {
        return "cleaning-state";
      }
      static availableAPI(builder) {
        builder.state("cleaning").type("boolean").description("If the thing is currently cleaning").done();
        builder.event("cleaningChanged").type("boolean").description("Cleaning state of the thing has changed").done();
        builder.event("cleaningStarted").description("Cleaning has started").done();
        builder.event("cleaningDone").description("Cleaning is done without any errors").done();
        builder.event("cleaningError").description("Error encountered during cleaning").done();
        builder.event("cleaningStoppped").description("Cleaning has stopped").done();
        builder.action("cleaning").description("Get the cleaning state").returns("boolean", "If thing is currently cleaning").done();
      }
      constructor(...args) {
        super(...args);
        this.updateState("cleaning", false);
      }
      cleaning() {
        return Promise.resolve(this.getState("cleaning"));
      }
      updateCleaning(cleaning) {
        cleaning = boolean(cleaning);
        if (this.updateState("cleaning", cleaning)) {
          this.emitEvent("cleaningChanged", cleaning);
          if (cleaning) {
            this.emitEvent("cleaningStarted");
          } else {
            if (this.error !== null) {
              this.emitEvent("cleaningDone");
            } else {
              this.emitEvent("cleaningError", this.error);
            }
            this.emitEvent("cleaningStopped");
          }
        }
      }
      updateError(error) {
        super.updateError(error);
        this.updateCleaning(false);
      }
    });
  }
});

// node_modules/abstract-things/climate/autonomous-cleaning.js
var require_autonomous_cleaning = __commonJS({
  "node_modules/abstract-things/climate/autonomous-cleaning.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    var CleaningState = require_cleaning_state();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State, CleaningState) {
      static get capability() {
        return "autonomous-cleaning";
      }
      static availableAPI(builder) {
        builder.action("clean").description("Start cleaning").done();
        builder.action("stop").description("Stop cleaning").done();
      }
      clean() {
        try {
          return Promise.resolve(this.activateCleaning()).then(() => null);
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      stop() {
        try {
          return Promise.resolve(this.deactivateCleaning()).then(() => null);
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      activateCleaning() {
        throw new Error("activateCleaning not implemented");
      }
      deactivateCleaning() {
        throw new Error("deactivateCleaning not implemented");
      }
    });
  }
});

// node_modules/abstract-things/climate/spot-cleaning.js
var require_spot_cleaning = __commonJS({
  "node_modules/abstract-things/climate/spot-cleaning.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    var CleaningState = require_cleaning_state();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State, CleaningState) {
      static get capability() {
        return "spot-cleaning";
      }
      static availableAPI(builder) {
        builder.action("spotClean").description("Request that the thing performs spot cleaning").done();
      }
      spotClean() {
        try {
          return Promise.resolve(this.activateSpotClean()).then(() => null);
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      activateSpotClean() {
        throw new Error("activateSpotClean not implemented");
      }
    });
  }
});

// node_modules/abstract-things/climate/index.js
var require_climate = __commonJS({
  "node_modules/abstract-things/climate/index.js"(exports, module2) {
    "use strict";
    module2.exports.AirMonitor = require_air_monitor();
    module2.exports.AirPurifier = require_air_purifier();
    module2.exports.Fan = require_fan();
    module2.exports.Humidifier = require_humidifier();
    module2.exports.Dehumidifier = require_dehumidifier();
    module2.exports.Vacuum = require_vacuum();
    module2.exports.TargetHumidity = require_target_humidity();
    module2.exports.AdjustableTargetHumidity = require_adjustable_target_humidity();
    module2.exports.FanSpeed = require_fan_speed();
    module2.exports.AdjustableFanSpeed = require_adjustable_fan_speed();
    module2.exports.CleaningState = require_cleaning_state();
    module2.exports.AutonomousCleaning = require_autonomous_cleaning();
    module2.exports.SpotCleaning = require_spot_cleaning();
  }
});

// node_modules/miio/lib/devices/capabilities/power.js
var require_power3 = __commonJS({
  "node_modules/miio/lib/devices/capabilities/power.js"(exports, module2) {
    "use strict";
    var { Thing, SwitchablePower } = require_abstract_things();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(SwitchablePower) {
      propertyUpdated(key, value) {
        if (key === "power" && value !== void 0) {
          this.updatePower(value);
        }
        super.propertyUpdated(key, value);
      }
    });
  }
});

// node_modules/miio/lib/devices/capabilities/battery-level.js
var require_battery_level2 = __commonJS({
  "node_modules/miio/lib/devices/capabilities/battery-level.js"(exports, module2) {
    "use strict";
    var { Thing, BatteryLevel } = require_abstract_things();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(BatteryLevel) {
      propertyUpdated(key, value) {
        if (key === "batteryLevel") {
          this.updateBatteryLevel(value);
        }
        super.propertyUpdated(key, value);
      }
    });
  }
});

// node_modules/abstract-things/sensors/sensor.js
var require_sensor = __commonJS({
  "node_modules/abstract-things/sensors/sensor.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    module2.exports = Thing.type((Parent) => class extends Parent.with(State) {
      static get type() {
        return "sensor";
      }
      static availableAPI(builder) {
        builder.action("values").description("Get all sensor values").returns("object").done();
      }
      value(sensorType) {
        return Promise.resolve(this.getState(sensorType));
      }
      get sensorTypes() {
        return [];
      }
      values() {
        const result = {};
        for (const type of this.sensorTypes) {
          result[type] = this.getState(type);
        }
        return Promise.resolve(result);
      }
      updateValue(sensorType, value) {
        if (this.updateState(sensorType, value)) {
          this.emitEvent(sensorType + "Changed", value);
          return true;
        } else {
          return false;
        }
      }
    });
  }
});

// node_modules/abstract-things/sensors/atmospheric-pressure.js
var require_atmospheric_pressure = __commonJS({
  "node_modules/abstract-things/sensors/atmospheric-pressure.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { pressure } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "atmospheric-pressure";
      }
      static availableAPI(builder) {
        builder.event("atmosphericPressureChanged").type("pressure").description("Current atmospheric pressure has changed").done();
        builder.action("atmosphericPressure").description("Get the current atmospheric pressure").getterForState("pressure").returns("pressure", "Current atmospheric pressure").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "atmosphericPressure"];
      }
      get atmosphericPressure() {
        return this.value("atmosphericPressure");
      }
      updateAtmosphericPressure(value) {
        this.updateValue("atmosphericPressure", pressure(value));
      }
    });
  }
});

// node_modules/abstract-things/sensors/carbon-dioxide.js
var require_carbon_dioxide = __commonJS({
  "node_modules/abstract-things/sensors/carbon-dioxide.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { number } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "carbon-dioxide";
      }
      static availableAPI(builder) {
        builder.event("carbonDioxideChanged").type("number").description("Carbon dioxide level has changed").done();
        builder.action("carbonDioxide").description("Get the current carbon dioxide level").getterForState("carbonDioxide").returns("number", "Current carbon dixoide level").done();
        builder.action("co2").description("Get the current carbon dioxide level").getterForState("carbonDioxide").returns("number", "Current carbon dixoide level").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "carbonDioxide"];
      }
      carbonDioxide() {
        return this.value("carbonDioxide");
      }
      co2() {
        return this.value("carbonDioxide");
      }
      updateCarbonDioxide(value) {
        this.updateValue("carbonDioxide", number(value));
      }
    });
  }
});

// node_modules/abstract-things/sensors/carbon-monoxide.js
var require_carbon_monoxide = __commonJS({
  "node_modules/abstract-things/sensors/carbon-monoxide.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { number } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "carbon-monoxide";
      }
      static availableAPI(builder) {
        builder.event("carbonMonoxideChanged").type("number").description("Carbon monoxide level has changed").done();
        builder.action("carbonMonoxide").description("Get the current carbon monoxide level").getterForState("carbonMonoxide").returns("number", "Current carbon monoxide level").done();
        builder.action("co").description("Get the current carbon monoxide level").getterForState("carbonMonoxide").returns("number", "Current carbon monoxide level").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "carbonMonoxide"];
      }
      carbonMonoxide() {
        return this.value("carbonMonoxide");
      }
      co() {
        return this.value("carbonMonoxide");
      }
      updateCarbonMonoxide(value) {
        this.updateValue("carbonMonoxide", number(value));
      }
    });
  }
});

// node_modules/abstract-things/sensors/contact.js
var require_contact = __commonJS({
  "node_modules/abstract-things/sensors/contact.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { boolean } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "contact";
      }
      static availableAPI(builder) {
        builder.event("contactChanged").type("boolean").description("Change in detected contact").done();
        builder.event("opened").description("Contact sensor is open, contact has been lost").done();
        builder.event("closed").description("Contact sensor is closed, contact has been detected").done();
        builder.action("contact").description("Get if contact is currently detected").getterForState("contact").returns("boolean", "Current contact status").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "contact"];
      }
      contact() {
        return this.value("contact");
      }
      isOpen() {
        return this.contact().then((v) => !v);
      }
      isClosed() {
        return this.contact();
      }
      updateContact(contact) {
        contact = boolean(contact);
        if (this.updateValue("contact", contact)) {
          if (contact) {
            this.emitEvent("closed");
          } else {
            this.emitEvent("opened");
          }
        }
      }
    });
  }
});

// node_modules/abstract-things/sensors/illuminance.js
var require_illuminance2 = __commonJS({
  "node_modules/abstract-things/sensors/illuminance.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { illuminance } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "illuminance";
      }
      static availableAPI(builder) {
        builder.event("illuminanceChanged").type("illuminance").description("Current illuminance has changed").done();
        builder.action("illuminance").description("Get the current illuminance").getterForState("illuminance").returns("illuminance", "Current illuminance").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "illuminance"];
      }
      illuminance() {
        return this.value("illuminance");
      }
      updateIlluminance(value) {
        this.updateValue("illuminance", illuminance(value));
      }
    });
  }
});

// node_modules/abstract-things/sensors/motion.js
var require_motion = __commonJS({
  "node_modules/abstract-things/sensors/motion.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { boolean, duration } = require_values();
    var idleTimer = Symbol("autoIdle");
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "motion";
      }
      static availableAPI(builder) {
        builder.event("motionChanged").type("boolean").description("Change in detected motion").done();
        builder.event("movement").description("Movement has been detected").done();
        builder.event("inactivity").description("Inactivity has been detected, no motion detected").done();
        builder.action("motion").description("Get if motion is currently detected").getterForState("motion").returns("boolean", "Current motion detected status").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "motion"];
      }
      motion() {
        return this.value("motion");
      }
      updateMotion(motion, autoIdleTimeout = null) {
        motion = boolean(motion);
        if (this.updateValue("motion", motion)) {
          if (motion) {
            this.emitEvent("movement");
          } else {
            this.emitEvent("inactivity");
          }
        }
        clearTimeout(this[idleTimer]);
        if (motion && autoIdleTimeout) {
          const ms = duration(autoIdleTimeout).ms;
          this[idleTimer] = setTimeout(() => this.updateMotion(false), ms);
        }
      }
    });
  }
});

// node_modules/abstract-things/sensors/pm2_5.js
var require_pm2_5 = __commonJS({
  "node_modules/abstract-things/sensors/pm2_5.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { number } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "pm2.5";
      }
      static availableAPI(builder) {
        builder.event("pm2.5Changed").type("number").description("PM2.5 density has changed").done();
        builder.action("pm2_5").description("Get the current PM2.5 density").getterForState("pm2.5").returns("number", "Current PM2.5 density").done();
        builder.action("pm2.5").description("Get the current PM2.5 density").getterForState("pm2.5").returns("number", "Current PM2.5 density").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "pm2.5"];
      }
      pm2_5() {
        return this.value("pm2.5");
      }
      ["pm2.5"]() {
        return this.value("pm2.5");
      }
      updatePM2_5(value) {
        this.updateValue("pm2.5", number(value));
      }
    });
  }
});

// node_modules/abstract-things/sensors/pm10.js
var require_pm10 = __commonJS({
  "node_modules/abstract-things/sensors/pm10.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { number } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "pm10";
      }
      static availableAPI(builder) {
        builder.event("pm10Changed").type("number").description("PM10 density has changed").done();
        builder.action("pm10").description("Get the current PM10 density").getterForState("pm10").returns("number", "Current PM10 density").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "pm10"];
      }
      pm10() {
        return this.value("pm10");
      }
      updatePM10(value) {
        this.updateValue("pm10", number(value));
      }
    });
  }
});

// node_modules/abstract-things/sensors/power-consumed.js
var require_power_consumed = __commonJS({
  "node_modules/abstract-things/sensors/power-consumed.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { energy } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "power-consumed";
      }
      static availableAPI(builder) {
        builder.event("powerConsumedChanged").type("energy").description("The amount of power consumed").done();
        builder.action("powerConsumed").description("Get the amount of power consumed").getterForState("powerConsumed").returns("energy", "Amount of power consumed").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "powerConsumed"];
      }
      powerConsumed() {
        return this.value("powerConsumed");
      }
      updatePowerConsumed(value) {
        this.updateValue("powerConsumed", energy(value));
      }
    });
  }
});

// node_modules/abstract-things/sensors/power-load.js
var require_power_load = __commonJS({
  "node_modules/abstract-things/sensors/power-load.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { power } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "power-load";
      }
      static availableAPI(builder) {
        builder.event("powerLoadChanged").type("power").description("The power load has changed").done();
        builder.action("powerLoad").description("Get the current power load").getterForState("powerLoad").returns("power", "Current power load").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "powerLoad"];
      }
      powerLoad() {
        return this.value("powerLoad");
      }
      updatePowerLoad(value) {
        this.updateValue("powerLoad", power(value));
      }
    });
  }
});

// node_modules/abstract-things/sensors/relative-humidity.js
var require_relative_humidity = __commonJS({
  "node_modules/abstract-things/sensors/relative-humidity.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { percentage } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "relative-humidity";
      }
      static availableAPI(builder) {
        builder.event("relativeHumidityChanged").type("percentage").description("Current relative humidity has changed").done();
        builder.action("relativeHumidity").description("Get the current relative humidity").getterForState("relativeHumidity").returns("percentage", "Current relative humidity").done();
        builder.action("rh").description("Get the current relative humidity").getterForState("relativeHumidity").returns("percentage", "Current relative humidity").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "relativeHumidity"];
      }
      relativeHumidity() {
        return this.value("relativeHumidity");
      }
      rh() {
        return this.value("relativeHumidity");
      }
      updateRelativeHumidity(value) {
        this.updateValue("relativeHumidity", percentage(value));
      }
    });
  }
});

// node_modules/abstract-things/sensors/temperature.js
var require_temperature2 = __commonJS({
  "node_modules/abstract-things/sensors/temperature.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { temperature } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "temperature";
      }
      static availableAPI(builder) {
        builder.event("temperatureChanged").type("temperature").description("Current temperature has changed").done();
        builder.action("temperature").description("Get the current temperature").getterForState("temperature").returns("temperature", "Current temperature").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "temperature"];
      }
      temperature() {
        return this.value("temperature");
      }
      updateTemperature(temp) {
        this.updateValue("temperature", temperature(temp));
      }
    });
  }
});

// node_modules/abstract-things/sensors/voltage.js
var require_voltage2 = __commonJS({
  "node_modules/abstract-things/sensors/voltage.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Sensor = require_sensor();
    var { voltage } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Sensor) {
      static get capability() {
        return "voltage";
      }
      static availableAPI(builder) {
        builder.event("voltageChanged").type("voltage").description("Measured voltage changed").done();
        builder.action("voltage").description("Get the current measured voltage").getterForState("voltage").returns("voltage", "Current measured voltage").done();
      }
      get sensorTypes() {
        return [...super.sensorTypes, "voltage"];
      }
      voltage() {
        return this.value("voltage");
      }
      updateVoltage(value) {
        this.updateValue("voltage", voltage(value));
      }
    });
  }
});

// node_modules/abstract-things/sensors/index.js
var require_sensors = __commonJS({
  "node_modules/abstract-things/sensors/index.js"(exports, module2) {
    "use strict";
    module2.exports.Sensor = require_sensor();
    module2.exports.AtmosphericPressure = require_atmospheric_pressure();
    module2.exports.CarbonDioxide = require_carbon_dioxide();
    module2.exports.CarbonMonoxide = require_carbon_monoxide();
    module2.exports.Contact = require_contact();
    module2.exports.Illuminance = require_illuminance2();
    module2.exports.Motion = require_motion();
    module2.exports.PM2_5 = require_pm2_5();
    module2.exports.PM10 = require_pm10();
    module2.exports.PowerConsumed = require_power_consumed();
    module2.exports.PowerLoad = require_power_load();
    module2.exports.RelativeHumidity = require_relative_humidity();
    module2.exports.Temperature = require_temperature2();
    module2.exports.Voltage = require_voltage2();
  }
});

// node_modules/miio/lib/devices/capabilities/sensor.js
var require_sensor2 = __commonJS({
  "node_modules/miio/lib/devices/capabilities/sensor.js"(exports, module2) {
    "use strict";
    var { Thing } = require_abstract_things();
    var {
      Temperature,
      RelativeHumidity,
      PM2_5,
      Illuminance,
      AtmosphericPressure,
      PowerLoad,
      PowerConsumed
    } = require_sensors();
    function bind(Type, updateName, property) {
      return Thing.mixin((Parent) => class extends Parent.with(Type) {
        propertyUpdated(key, value) {
          if (key === property) {
            this[updateName](value);
          }
          super.propertyUpdated(key, value);
        }
      });
    }
    module2.exports.Temperature = bind(Temperature, "updateTemperature", "temperature");
    module2.exports.Humidity = bind(RelativeHumidity, "updateRelativeHumidity", "humidity");
    module2.exports.Illuminance = bind(Illuminance, "updateIlluminance", "illuminance");
    module2.exports.AQI = bind(PM2_5, "updatePM2_5", "aqi");
    module2.exports.AtmosphericPressure = bind(AtmosphericPressure, "updateAtmosphericPressure", "atmosphericPressure");
    module2.exports.PowerLoad = bind(PowerLoad, "updatePowerLoad", "powerLoad");
    module2.exports.PowerConsumed = bind(PowerConsumed, "updatePowerConsumed", "poweConsumed");
    function mixin(device, options) {
      if (device.capabilities.indexOf("sensor") < 0) {
        device.capabilities.push("sensor");
      }
      device.capabilities.push(options.name);
      Object.defineProperty(device, options.name, {
        get: function() {
          return this.property(options.name);
        }
      });
    }
    module2.exports.extend = mixin;
  }
});

// node_modules/miio/lib/devices/air-monitor.js
var require_air_monitor2 = __commonJS({
  "node_modules/miio/lib/devices/air-monitor.js"(exports, module2) {
    "use strict";
    var { ChargingState } = require_abstract_things();
    var { AirMonitor } = require_climate();
    var MiioApi = require_device();
    var Power = require_power3();
    var BatteryLevel = require_battery_level2();
    var { AQI } = require_sensor2();
    module2.exports = class extends AirMonitor.with(MiioApi, Power, AQI, BatteryLevel, ChargingState) {
      static get type() {
        return "miio:air-monitor";
      }
      constructor(options) {
        super(options);
        this.defineProperty("power", (v) => v === "on");
        this.defineProperty("aqi");
        this.defineProperty("battery", {
          name: "batteryLevel"
        });
        this.defineProperty("usb_state", {
          name: "charging",
          mapper: (v) => v === "on"
        });
      }
      propertyUpdated(key, value, oldValue) {
        if (key === "charging") {
          this.updateCharging(value);
        }
        super.propertyUpdated(key, value, oldValue);
      }
      changePower(power) {
        return this.call("set_power", [power ? "on" : "off"], {
          refresh: ["power", "mode"],
          refreshDelay: 200
        });
      }
    };
  }
});

// node_modules/miio/lib/devices/capabilities/mode.js
var require_mode2 = __commonJS({
  "node_modules/miio/lib/devices/capabilities/mode.js"(exports, module2) {
    "use strict";
    var { Thing, SwitchableMode } = require_abstract_things();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(SwitchableMode) {
      propertyUpdated(key, value) {
        if (key === "mode") {
          this.updateMode(value);
        }
        super.propertyUpdated(key, value);
      }
    });
  }
});

// node_modules/miio/lib/devices/capabilities/switchable-led.js
var require_switchable_led = __commonJS({
  "node_modules/miio/lib/devices/capabilities/switchable-led.js"(exports, module2) {
    "use strict";
    var { Thing, State } = require_abstract_things();
    var { boolean } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static get capability() {
        return "miio:switchable-led";
      }
      static availableAPI(builder) {
        builder.action("led").description("Get or set if the LED should be used").argument("boolean", true, "If provided, set the LED power to this value").returns("boolean", "If the LED is on").done();
      }
      propertyUpdated(key, value) {
        if (key === "led") {
          this.updateState("led", value);
        }
        super.propertyUpdated(key, value);
      }
      led(power) {
        if (typeof power === "undefined") {
          return this.getState("led");
        }
        power = boolean(power);
        return this.changeLED(power).then(() => this.getState("led"));
      }
      changeLED(power) {
        return this.call("set_led", [power ? "on" : "off"], { refresh: ["led"] }).then(() => null);
      }
    });
  }
});

// node_modules/miio/lib/devices/capabilities/changeable-led-brightness.js
var require_changeable_led_brightness = __commonJS({
  "node_modules/miio/lib/devices/capabilities/changeable-led-brightness.js"(exports, module2) {
    "use strict";
    var { Thing, State } = require_abstract_things();
    var { string } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static get capability() {
        return "miio:led-brightness";
      }
      static availableAPI(builder) {
        builder.action("ledBrightness").description("Get or set the LED brightness").argument("string", true, "If provided, set the LED brightness to this value").returns("string", "The LED brightness").done();
      }
      propertyUpdated(key, value) {
        if (key === "ledBrightness") {
          this.updateState("ledBrightness", value);
        }
        super.propertyUpdated(key, value);
      }
      ledBrightness(brightness) {
        if (typeof brightness === "undefined") {
          return this.getState("ledBrightness");
        }
        brightness = string(brightness);
        return this.changeLEDBrightness(brightness).then(() => this.getState("ledBrightness"));
      }
      changeLEDBrightness(brightness) {
        throw new Error("changeLEDBrightness not implemented");
      }
    });
  }
});

// node_modules/miio/lib/devices/capabilities/buzzer.js
var require_buzzer = __commonJS({
  "node_modules/miio/lib/devices/capabilities/buzzer.js"(exports, module2) {
    "use strict";
    var { Thing, State } = require_abstract_things();
    var { boolean } = require_values();
    var MiioApi = require_device();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static get capability() {
        return "miio:buzzer";
      }
      static availableAPI(builder) {
        builder.event("buzzerChanged").type("boolean").description("Buzzer state has changed").done();
        builder.action("buzzer").description("Get or set if the buzzer is active").argument("boolean", true, "If the device should beep").returns("boolean", "If the buzzer is on").done();
        builder.action("setBuzzer").description("Set if the buzzer is active").argument("boolean", false, "If the device should beep").returns("boolean", "If the buzzer is on").done();
        builder.action("getBuzzer").description("Get if the buzzer is active").returns("boolean", "If the buzzer is on").done();
      }
      propertyUpdated(key, value) {
        if (key === "buzzer") {
          if (this.updateState("buzzer", value)) {
            this.emitEvent("buzzerChanged", value);
          }
        }
        super.propertyUpdated(key, value);
      }
      buzzer(active) {
        if (typeof active === "undefined") {
          return this.getBuzzer();
        }
        return this.setBuzzer(active);
      }
      getBuzzer() {
        return this.getState("buzzer");
      }
      setBuzzer(active) {
        active = boolean(active);
        return this.changeBuzzer(active).then(() => this.getBuzzer());
      }
      changeBuzzer(active) {
        return this.call("set_buzzer", [active ? "on" : "off"], {
          refresh: ["buzzer"]
        }).then(MiioApi.checkOk);
      }
    });
  }
});

// node_modules/miio/lib/devices/air-purifier.js
var require_air_purifier2 = __commonJS({
  "node_modules/miio/lib/devices/air-purifier.js"(exports, module2) {
    "use strict";
    var { AirPurifier } = require_climate();
    var MiioApi = require_device();
    var Power = require_power3();
    var Mode = require_mode2();
    var SwitchableLED = require_switchable_led();
    var LEDBrightness = require_changeable_led_brightness();
    var Buzzer = require_buzzer();
    var { Temperature, Humidity, AQI } = require_sensor2();
    module2.exports = class extends AirPurifier.with(MiioApi, Power, Mode, Temperature, Humidity, AQI, SwitchableLED, LEDBrightness, Buzzer) {
      static get type() {
        return "miio:air-purifier";
      }
      constructor(options) {
        super(options);
        this.defineProperty("power", (v) => v === "on");
        this.defineProperty("mode");
        this.updateModes([
          "idle",
          "auto",
          "silent",
          "favorite"
        ]);
        this.defineProperty("temp_dec", {
          name: "temperature",
          mapper: (v) => v / 10
        });
        this.defineProperty("humidity");
        this.defineProperty("aqi");
        this.defineProperty("favorite_level", {
          name: "favoriteLevel"
        });
        this.defineProperty("filter1_life", {
          name: "filterLifeRemaining"
        });
        this.defineProperty("f1_hour_used", {
          name: "filterHoursUsed"
        });
        this.defineProperty("use_time", {
          name: "useTime"
        });
        this.defineProperty("led", {
          mapper: (v) => v === "on"
        });
        this.defineProperty("led_b", {
          name: "ledBrightness",
          mapper: (v) => {
            switch (v) {
              case 0:
                return "bright";
              case 1:
                return "dim";
              case 2:
                return "off";
              default:
                return "unknown";
            }
          }
        });
        this.defineProperty("buzzer", {
          mapper: (v) => v === "on"
        });
      }
      changePower(power) {
        return this.call("set_power", [power ? "on" : "off"], {
          refresh: ["power", "mode"],
          refreshDelay: 200
        });
      }
      changeMode(mode) {
        return this.call("set_mode", [mode], {
          refresh: ["power", "mode"],
          refreshDelay: 200
        }).then(MiioApi.checkOk).catch((err) => {
          throw err.code === -5001 ? new Error("Mode `" + mode + "` not supported") : err;
        });
      }
      favoriteLevel(level = void 0) {
        if (typeof level === "undefined") {
          return Promise.resolve(this.property("favoriteLevel"));
        }
        return this.setFavoriteLevel(level);
      }
      setFavoriteLevel(level) {
        return this.call("set_level_favorite", [level]).then(() => null);
      }
      changeLEDBrightness(level) {
        switch (level) {
          case "bright":
            level = 0;
            break;
          case "dim":
            level = 1;
            break;
          case "off":
            level = 2;
            break;
          default:
            return Promise.reject(new Error("Invalid LED brigthness: " + level));
        }
        return this.call("set_led_b", [level], { refresh: ["ledBrightness"] }).then(() => null);
      }
    };
  }
});

// node_modules/abstract-things/children/child-syncer.js
var require_child_syncer = __commonJS({
  "node_modules/abstract-things/children/child-syncer.js"(exports, module2) {
    "use strict";
    var defId = Symbol("defId");
    module2.exports = class ChildSyncer {
      constructor(parent, syncFunction) {
        this.parent = parent;
        this.syncFunction = syncFunction;
        this.children = /* @__PURE__ */ new Map();
        this.destroyListener = (_, thing) => {
          thing.off("thing:destroyed", this.destroyListener);
          this.children.delete(thing[defId]);
          this.parent.removeChild(thing);
        };
        this.parent.on("thing:destroyed", () => {
          for (const child of this.children.values()) {
            child.destroy();
          }
        });
      }
      update(definitions) {
        if (!definitions || !definitions[Symbol.iterator])
          throw new Error("Definitions that are iterable are needed to synchronize");
        const promises = [];
        const children = this.children;
        const allIds = /* @__PURE__ */ new Set();
        for (const def of definitions) {
          if (!def.id) {
            throw new Error("`id` is needed on definitions");
          }
          allIds.add(def.id);
          if (!children.has(def.id)) {
            const child = this.syncFunction(def, null);
            if (child) {
              child[defId] = def.id;
              const promise = child.init().then(() => {
                children.set(def.id, child);
                child.on("thing:destroyed", this.destroyListener);
                this.parent.addChild(child);
              });
              promises.push(promise);
            }
          } else {
            const child = this.syncFunction(def, children.get(def.id));
            if (!child) {
              const current = children.get(def.id);
              promises.push(current.destroy());
            }
          }
        }
        for (const id of children.keys()) {
          if (!allIds.has(id)) {
            const current = children.get(id);
            promises.push(current.destroy());
          }
        }
        return Promise.all(promises);
      }
    };
  }
});

// node_modules/abstract-things/children/index.js
var require_children2 = __commonJS({
  "node_modules/abstract-things/children/index.js"(exports, module2) {
    "use strict";
    module2.exports.Children = require_children();
    module2.exports.ChildSyncer = require_child_syncer();
  }
});

// node_modules/miio/lib/devices/gateway/developer-api.js
var require_developer_api = __commonJS({
  "node_modules/miio/lib/devices/gateway/developer-api.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events");
    var dgram = require("dgram");
    var os = require("os");
    var MULTICAST_ADDRESS = "224.0.0.50";
    var MULTICAST_PORT = 4321;
    var SERVER_PORT = 9898;
    module2.exports = class DeveloperApi extends EventEmitter {
      constructor(parent, address) {
        super();
        this.address = address;
        this.port = SERVER_PORT;
        this.debug = function() {
          parent.debug.apply(parent, arguments);
        };
        this.socket = dgram.createSocket({
          type: "udp4",
          reuseAddr: true
        });
        this.socket.on("message", this._onMessage.bind(this));
        this.socket.on("listening", () => {
          const interfaces = os.networkInterfaces();
          for (const name of Object.keys(interfaces)) {
            const addresses = interfaces[name];
            for (const addr of addresses) {
              if (addr.family === "IPv4") {
                this.socket.addMembership(MULTICAST_ADDRESS, addr.address);
              }
            }
          }
          const json = JSON.stringify({
            cmd: "whois"
          });
          this.debug("DEV BROADCAST ->", json);
          this.socket.send(json, 0, json.length, MULTICAST_PORT, MULTICAST_ADDRESS);
          setTimeout(() => {
            this.debug("DEV <- Timeout for whois");
            this.emit("ready");
          }, 1e3);
        });
        this.socket.bind({
          port: SERVER_PORT,
          exclusive: true
        });
      }
      destroy() {
        this.socket.close();
      }
      send(data) {
        const json = JSON.stringify(data);
        this.debug("DEV ->", json);
        this.socket.send(json, 0, json.length, this.port, this.address);
      }
      read(sid) {
        this.send({
          cmd: "read",
          sid
        });
      }
      _onMessage(msg) {
        let data;
        try {
          this.debug("DEV <-", msg.toString());
          data = JSON.parse(msg.toString());
        } catch (ex) {
          this.emit("error", ex);
          return;
        }
        switch (data.cmd) {
          case "iam":
            if (data.ip === this.address) {
              this.port = data.port;
              this.sid = data.sid;
              this.emit("ready");
            }
            break;
          case "read_ack":
          case "heartbeat":
          case "report": {
            if (!this.sid && data.model === "gateway") {
              this.sid = data.sid;
            }
            const parsed = JSON.parse(data.data);
            this.emit("propertiesChanged", {
              id: this.sid === data.sid ? "0" : data.sid,
              data: parsed
            });
            this.emit("properties:" + data.sid, parsed);
          }
        }
      }
    };
  }
});

// node_modules/abstract-things/lights/light.js
var require_light = __commonJS({
  "node_modules/abstract-things/lights/light.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var { duration } = require_values();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "light";
      }
      static get availableAPI() {
        return [];
      }
    });
    module2.exports.DURATION = duration(400);
  }
});

// node_modules/abstract-things/lights/light-bulb.js
var require_light_bulb = __commonJS({
  "node_modules/abstract-things/lights/light-bulb.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Light = require_light();
    module2.exports = Thing.type((Parent) => class extends Parent.with(Light) {
      static get type() {
        return "light-bulb";
      }
    });
  }
});

// node_modules/abstract-things/lights/light-strip.js
var require_light_strip = __commonJS({
  "node_modules/abstract-things/lights/light-strip.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Light = require_light();
    module2.exports = Thing.type((Parent) => class extends Parent.with(Light) {
      static get type() {
        return "light-strip";
      }
    });
  }
});

// node_modules/abstract-things/lights/fading.js
var require_fading = __commonJS({
  "node_modules/abstract-things/lights/fading.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var { duration } = require_values();
    var maxChangeTime = Symbol("maxChangeTime");
    module2.exports = Thing.mixin((Parent) => class extends Parent {
      static get capability() {
        return "fading";
      }
      static availableAPI(builder) {
        builder.action("maxChangeTime").description("Get the maximum duration a change can occur over").returns("duration").done();
      }
      maxChangeTime() {
        return Promise.resolve(this[maxChangeTime]);
      }
      updateMaxChangeTime(t) {
        this[maxChangeTime] = duration(t);
      }
    });
  }
});

// node_modules/abstract-things/lights/brightness.js
var require_brightness = __commonJS({
  "node_modules/abstract-things/lights/brightness.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    var { percentage } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static availableAPI(builder) {
        builder.state("brightness").type("percentage").description("The brightness of this light").done();
        builder.event("brightnessChanged").type("percentage").description("The brightness of the light has changed").done();
        builder.action("brightness").description("Get or set the brightness of this light").returns("percentage", "The brightness of the light").getterForState("brightness").done();
      }
      static get capabilities() {
        return ["brightness"];
      }
      brightness() {
        return this.getState("brightness", 0);
      }
      updateBrightness(brightness) {
        brightness = percentage(brightness, { min: 0, max: 100, precision: 1 });
        if (this.updateState("brightness", brightness)) {
          this.emitEvent("brightnessChanged", brightness);
        }
      }
    });
  }
});

// node_modules/abstract-things/lights/light-state.js
var require_light_state = __commonJS({
  "node_modules/abstract-things/lights/light-state.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var RestorableState = require_restorable_state();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(RestorableState) {
      setLightState(state) {
        return Promise.resolve();
      }
      mapLightState(state) {
      }
      changeState(state) {
        try {
          return Promise.resolve(super.changeState(state)).then(() => {
            const stateCopy = Object.assign({}, state);
            this.mapLightState(stateCopy);
            return this.setLightState(stateCopy);
          });
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
    });
  }
});

// node_modules/abstract-things/lights/dimmable.js
var require_dimmable = __commonJS({
  "node_modules/abstract-things/lights/dimmable.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Light = require_light();
    var LightState = require_light_state();
    var Brightness = require_brightness();
    var { boolean, duration, percentage, "percentage:change": change } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Brightness, LightState) {
      static availableAPI(builder) {
        builder.action("brightness").description("Get or set the brightness of this light").argument("percentage:change", true, "The change in brightness or absolute brightness").returns("percentage", "The brightness of the light").getterForState("brightness").done();
        builder.action("setBrightness").description("Set the brightness of this light").argument("percentage", false, "The brightness to set").returns("percentage", "The brightness of the light").done();
        builder.action("increaseBrightness").description("Increase the brightness of this light").argument("percentage", false, "The amount to increase the brightness").returns("percentage", "The brightness of the light").done();
        builder.action("decreaseBrightness").description("Decrease the brightness of this light").argument("percentage", false, "The amount to decrease the brightness").returns("percentage", "The brightness of the light").done();
      }
      static get capabilities() {
        return ["dimmable"];
      }
      brightness(brightness, duration2 = Light.DURATION) {
        try {
          let currentBrightness = this.getState("brightness", 0);
          if (typeof brightness !== "undefined") {
            brightness = change(brightness);
            let powerOn = true;
            let toSet;
            if (brightness.isIncrease) {
              toSet = currentBrightness + brightness.value;
            } else if (brightness.isDecrease) {
              toSet = currentBrightness - brightness.value;
              powerOn = false;
            } else {
              toSet = brightness.value;
            }
            return this.setBrightness(toSet, duration2, powerOn);
          }
          return Promise.resolve(currentBrightness);
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      increaseBrightness(amount, duration2 = Light.DURATION) {
        return this.setBrightness(Math.min(100, this.state.brightness + amount), duration2, true);
      }
      decreaseBrightness(amount, duration2 = Light.DURATION) {
        return this.setBrightness(Math.max(0, this.state.brightness - amount), duration2, false);
      }
      setBrightness(brightness, duration0 = Light.DURATION, powerOn = true) {
        try {
          if (typeof brightness === "undefined")
            throw new Error("Brightness must be specified");
          brightness = percentage(brightness, { min: 0, max: 100 });
          const options = {
            duration: duration(duration0),
            powerOn: brightness <= 0 ? false : boolean(powerOn)
          };
          return Promise.resolve(this.changeBrightness(brightness, options)).then(() => this.getState("brightness", 0));
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      changeBrightness(brightness, options) {
        throw new Error("changeBrightness not implemented");
      }
      get restorableState() {
        return [...super.restorableState, "brightness"];
      }
      setLightState(state) {
        return super.setLightState(state).then(() => {
          if (typeof state.brightness !== "undefined") {
            const options = {
              duration: Light.DURATION,
              powerOn: typeof state.power !== "undefined" ? state.power : true
            };
            return this.changeBrightness(state.brightness, options);
          }
        });
      }
      mapLightState(state) {
        super.mapLightState(state);
        if (typeof state.brightness !== "undefined") {
          state.brightness = percentage(state.brightness);
        }
      }
    });
  }
});

// node_modules/abstract-things/lights/colorable.js
var require_colorable = __commonJS({
  "node_modules/abstract-things/lights/colorable.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Light = require_light();
    var LightState = require_light_state();
    var { duration, color } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(LightState) {
      static availableAPI(builder) {
        builder.state("color").type("color").description("The color of the light").done();
        builder.action("color").description("Get or set the color of this light").argument("color", true, "Optional color to set").returns("color", "The color of the light").getterForState("color").done();
        builder.action("setColor").description("Set the color of this light").argument("color", false, "The color to set").returns("color", "The color of the light").done();
        builder.event("colorChanged").type("color").description("The color of the light has changed").done();
      }
      static get capabilities() {
        return ["colorable"];
      }
      color(color2, duration2 = Light.DURATION) {
        if (color2) {
          return this.setColor(color2, duration2);
        }
        return Promise.resolve(this.getState("color"));
      }
      setColor(color0, duration0 = Light.DURATION) {
        try {
          if (typeof color0 === "undefined")
            throw new Error("Color must be specified");
          color0 = color(color0);
          const options = {
            duration: duration(duration0)
          };
          return Promise.resolve(this.changeColor(color0, options)).then(() => this.getState("color"));
        } catch (ex) {
          return Promise.reject(ex);
        }
      }
      updateColor(color2) {
        if (this.updateState("color", color2)) {
          this.emitEvent("colorChanged", color2);
        }
      }
      changeColor(color2, options) {
        throw new Error("changeColor not implemented");
      }
      get restorableState() {
        return [...super.restorableState, "color"];
      }
      setLightState(state) {
        return super.setLightState(state).then(() => {
          if (typeof state.color !== "undefined") {
            return this.changeColor(state.color, Light.DURATION);
          }
        });
      }
      mapLightState(state) {
        super.mapLightState(state);
        if (typeof state.color !== "undefined") {
          state.color = color(state.color);
        }
      }
    });
  }
});

// node_modules/abstract-things/lights/color-temperature.js
var require_color_temperature2 = __commonJS({
  "node_modules/abstract-things/lights/color-temperature.js"(exports, module2) {
    "use strict";
    var isDeepEqual = require_deep_equal();
    var Thing = require_thing();
    var { number } = require_values();
    var colorTemperatureRange = Symbol("colorTemperatureRange");
    module2.exports = Thing.mixin((Parent) => class extends Parent {
      static get capability() {
        return "color:temperature";
      }
      static availableAPI(builder) {
        builder.action("colorTemperatureRange").description("Get the temperature range this light supports").returns("object").done();
        builder.event("colorTemperatureRangeChanged").type("object").description("The supported color temperature range has changed").done();
      }
      colorTemperatureRange() {
        const range = this[colorTemperatureRange];
        if (!range) {
          return Promise.reject(new Error("Temperature range has not been set"));
        }
        return Promise.resolve({
          min: range.min,
          max: range.max
        });
      }
      updateColorTemperatureRange(min, max) {
        min = number(min);
        max = number(max);
        if (min > max) {
          const temp = max;
          max = min;
          min = temp;
        }
        const range = { min, max };
        if (!isDeepEqual(this[colorTemperatureRange], range)) {
          this[colorTemperatureRange] = range;
          this.emitEvent("colorTemperatureRangeChanged", range);
        }
      }
    });
  }
});

// node_modules/abstract-things/lights/color-full.js
var require_color_full = __commonJS({
  "node_modules/abstract-things/lights/color-full.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.mixin((Parent) => class extends Parent {
      static get capability() {
        return "color:full";
      }
    });
  }
});

// node_modules/abstract-things/lights/switchable-power.js
var require_switchable_power2 = __commonJS({
  "node_modules/abstract-things/lights/switchable-power.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var SwitchablePower = require_switchable_power();
    var LightState = require_light_state();
    var { boolean } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(SwitchablePower, LightState) {
      changePowerState(state) {
      }
      setLightState(state) {
        return super.setLightState(state).then(() => {
          if (typeof state.power !== "undefined") {
            return this.changePower(state.power);
          }
        });
      }
      mapLightState(state) {
        super.mapLightState(state);
        if (typeof state.power !== "undefined") {
          state.power = boolean(state.power);
        }
      }
    });
  }
});

// node_modules/abstract-things/lights/index.js
var require_lights = __commonJS({
  "node_modules/abstract-things/lights/index.js"(exports, module2) {
    "use strict";
    module2.exports.Light = require_light();
    module2.exports.LightBulb = require_light_bulb();
    module2.exports.LightStrip = require_light_strip();
    module2.exports.Fading = require_fading();
    module2.exports.Brightness = require_brightness();
    module2.exports.Dimmable = require_dimmable();
    module2.exports.Colorable = require_colorable();
    module2.exports.ColorTemperature = require_color_temperature2();
    module2.exports.ColorFull = require_color_full();
    module2.exports.SwitchablePower = require_switchable_power2();
  }
});

// node_modules/miio/lib/devices/gateway/light-mixin.js
var require_light_mixin = __commonJS({
  "node_modules/miio/lib/devices/gateway/light-mixin.js"(exports, module2) {
    "use strict";
    var { Thing } = require_abstract_things();
    var { Light, SwitchablePower, Dimmable, Colorable } = require_lights();
    var { color } = require_values();
    module2.exports = Thing.mixin((Appliance) => class extends Appliance {
      initCallback() {
        this.addExtraChild(new GatewayLight(this));
        return super.initCallback();
      }
    });
    var GatewayLight = class extends Light.with(SwitchablePower, Dimmable, Colorable) {
      static get types() {
        return ["miio:subdevice", "miio:gateway-light"];
      }
      constructor(gateway) {
        super();
        this.model = gateway.miioModel + ".light";
        this.internalId = gateway.id.substring(5) + ":light";
        this.id = gateway.id + ":light";
        this.gateway = gateway;
        const propertyUpdated = this.gateway.propertyUpdated;
        this.gateway.propertyUpdated = (key, value, oldValue) => {
          propertyUpdated.call(this.gateway, key, value, oldValue);
          this.propertyUpdated(key, value);
        };
      }
      changePower(power) {
        return this.changeBrightness(power ? 50 : 0);
      }
      changeBrightness(brightness, options) {
        const color2 = this.gateway.property("rgb");
        const rgb = brightness << 24 | color2.red << 16 | color2.green << 8 | color2.blue;
        return this.gateway.call("set_rgb", [rgb >>> 0], { refresh: ["rgb"] });
      }
      changeColor(color2, options) {
        color2 = color2.rgb;
        const a = this.gateway.property("brightness");
        const rgb = a << 24 | color2.red << 16 | color2.green << 8 | color2.blue;
        return this.gateway.call("set_rgb", [rgb >>> 0], { refresh: ["rgb"] });
      }
      propertyUpdated(key, value) {
        if (key === "rgb") {
          this.updateColor(color.rgb(value.red, value.green, value.blue));
        } else if (key === "brightness") {
          this.updateBrightness(value);
          this.updatePower(value > 0);
        }
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/subdevice.js
var require_subdevice = __commonJS({
  "node_modules/miio/lib/devices/gateway/subdevice.js"(exports, module2) {
    "use strict";
    var util = require("util");
    var isDeepEqual = require_deep_equal();
    var { Thing } = require_abstract_things();
    var IDENTITY_MAPPER = (v) => v;
    var SubDeviceManagement = class {
      constructor(device, parent) {
        this._device = device;
        this.parent = parent;
      }
      get token() {
        return null;
      }
      get model() {
        return this._device.miioModel;
      }
      info() {
        const device = this._device;
        return Promise.resolve({
          id: device.id,
          model: device.model
        });
      }
    };
    module2.exports = Thing.type((Parent) => class SubDevice extends Parent {
      static get types() {
        return ["miio", "miio:subdevice"];
      }
      constructor(parent, info) {
        super();
        this.miioModel = info.model;
        this.id = info.id;
        this.internalId = info.id.substring(5);
        this._properties = {};
        this._propertiesToMonitor = [];
        this._propertyDefinitions = {};
        this._parent = parent;
        this._report = this._report.bind(this);
        this.management = new SubDeviceManagement(this, parent);
      }
      hasCapability(name) {
        return this.capabilities.indexOf(name) >= 0;
      }
      initCallback() {
        return super.initCallback().then(() => this._parent.devApi.on("properties:" + this.internalId, this._report)).then(() => this.loadProperties());
      }
      destroyCallback() {
        return super.destroyCallback().then(() => this._parent.devApi.removeListener("properties:" + this.internalId, this._report));
      }
      _report(data) {
        this._propertiesToMonitor.forEach((key) => {
          const def = this._propertyDefinitions[key];
          let name = key;
          let value = data[key];
          if (typeof value === "undefined")
            return;
          if (def) {
            name = def.name || name;
            value = def.mapper(value);
          }
          this.setProperty(name, value);
        });
        if (this._currentRead) {
          this._currentRead.resolve();
          this._currentRead = null;
        }
      }
      get properties() {
        return Object.assign({}, this._properties);
      }
      property(key) {
        return this._properties[key];
      }
      defineProperty(name, def) {
        if (!def || typeof def.poll === "undefined" || def.poll) {
          this._propertiesToMonitor.push(name);
        }
        if (typeof def === "function") {
          def = {
            mapper: def
          };
        } else if (typeof def === "undefined") {
          def = {
            mapper: IDENTITY_MAPPER
          };
        }
        if (!def.mapper) {
          def.mapper = IDENTITY_MAPPER;
        }
        this._propertyDefinitions[name] = def;
      }
      setProperty(key, value) {
        const oldValue = this._properties[key];
        if (!isDeepEqual(oldValue, value)) {
          this._properties[key] = value;
          this.debug("Property", key, "changed from", oldValue, "to", value);
          this.propertyUpdated(key, value, oldValue);
        }
      }
      propertyUpdated(key, value, oldValue) {
      }
      getProperties(props = []) {
        const result = {};
        props.forEach((key) => {
          result[key] = this._properties[key];
        });
        return result;
      }
      loadProperties(props) {
        if (this._propertiesToMonitor.length === 0)
          Promise.resolve();
        if (this._currentRead) {
          return this._currentRead.promise;
        }
        this._currentRead = {};
        this._currentRead.promise = new Promise((resolve, reject) => {
          this._parent.devApi.read(this.internalId);
          this._currentRead.resolve = () => {
            resolve(this.getProperties(props));
          };
          setTimeout(() => {
            this.debug("Read via DEV timed out, using fallback API");
            this._parent.call("get_device_prop_exp", [["lumi." + this.internalId, ...this._propertiesToMonitor]]).then((result) => {
              for (let i = 0; i < result[0].length; i++) {
                let name = this._propertiesToMonitor[i];
                const def = this._propertyDefinitions[name];
                let value = result[0][i];
                name = def.name || name;
                value = def.mapper(value);
                this.setProperty(name, value);
              }
              this._currentRead.resolve();
            }).catch((err) => {
              this._currentRead = null;
              reject(err);
            });
          }, 1e3);
        });
        return this._currentRead.promise;
      }
      call(method, args, options) {
        if (!options) {
          options = {};
        }
        options.sid = this.internalId;
        return this._parent.call(method, args, options);
      }
      [util.inspect.custom](depth, options) {
        if (depth === 0) {
          return options.stylize("MiioDevice", "special") + "[" + this.miioModel + "]";
        }
        return options.stylize("MiioDevice", "special") + " {\n  model=" + this.miioModel + ",\n  types=" + Array.from(this.metadata.types).join(", ") + ",\n  capabilities=" + Array.from(this.metadata.capabilities).join(", ") + "\n}";
      }
    });
  }
});

// node_modules/abstract-things/controllers/actions.js
var require_actions = __commonJS({
  "node_modules/abstract-things/controllers/actions.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var State = require_state();
    var { code } = require_values();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(State) {
      static get capability() {
        return "actions";
      }
      static availableAPI(builder) {
        builder.state("actions").description("Actions that the controller can emit").type("array").done();
        builder.event("actions").description("The supported actions have changed").type("array").done();
        builder.event("action").description("A certain action has been triggered").type("object").done();
        builder.event("action:<id>").description("Action with the given id has been triggered").done();
        builder.action("actionsChanged").description("Get the actions that this controller can emit").returns("array").done();
      }
      constructor(...args) {
        super(...args);
        this.updateState("actions", []);
      }
      emitAction(action, extra = {}) {
        this.emitEvent("action", { action, data: extra }, { multiple: true });
        this.emitEvent("action:" + action, extra, { multiple: true });
      }
      actions() {
        return Promise.resolve(this.getState("actions"));
      }
      updateActions(actions) {
        let mapped = [];
        for (const a of actions) {
          mapped.push(code(a));
        }
        if (this.updateState("actions", mapped)) {
          this.emitEvent("actionsChanged", mapped);
        }
      }
    });
  }
});

// node_modules/abstract-things/controllers/controller.js
var require_controller = __commonJS({
  "node_modules/abstract-things/controllers/controller.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "controller";
      }
    });
  }
});

// node_modules/abstract-things/controllers/button.js
var require_button = __commonJS({
  "node_modules/abstract-things/controllers/button.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Controller = require_controller();
    module2.exports = Thing.type((Parent) => class extends Parent.with(Controller) {
      static get type() {
        return "button";
      }
    });
  }
});

// node_modules/abstract-things/controllers/remote-control.js
var require_remote_control = __commonJS({
  "node_modules/abstract-things/controllers/remote-control.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Controller = require_controller();
    module2.exports = Thing.type((Parent) => class extends Parent.with(Controller) {
      static get type() {
        return "remote-control";
      }
    });
  }
});

// node_modules/abstract-things/controllers/wall-controller.js
var require_wall_controller = __commonJS({
  "node_modules/abstract-things/controllers/wall-controller.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    var Controller = require_controller();
    module2.exports = Thing.type((Parent) => class extends Parent.with(Controller) {
      static get type() {
        return "wall-controller";
      }
    });
  }
});

// node_modules/abstract-things/controllers/index.js
var require_controllers = __commonJS({
  "node_modules/abstract-things/controllers/index.js"(exports, module2) {
    "use strict";
    module2.exports.Actions = require_actions();
    module2.exports.Controller = require_controller();
    module2.exports.Button = require_button();
    module2.exports.RemoteControl = require_remote_control();
    module2.exports.WallController = require_wall_controller();
  }
});

// node_modules/miio/lib/devices/gateway/voltage.js
var require_voltage3 = __commonJS({
  "node_modules/miio/lib/devices/gateway/voltage.js"(exports, module2) {
    "use strict";
    var { Thing, BatteryLevel } = require_abstract_things();
    var VOLTAGE_MIN = 2800;
    var VOLTAGE_MAX = 3300;
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(BatteryLevel) {
      constructor(...args) {
        super(...args);
        this.defineProperty("voltage");
      }
      propertyUpdated(key, value, oldValue) {
        if (key === "voltage" && value) {
          this.updateBatteryLevel(Number((value - VOLTAGE_MIN) / (VOLTAGE_MAX - VOLTAGE_MIN) * 100).toFixed(2));
        }
        super.propertyUpdated(key, value, oldValue);
      }
    });
  }
});

// node_modules/miio/lib/devices/gateway/switch.js
var require_switch = __commonJS({
  "node_modules/miio/lib/devices/gateway/switch.js"(exports, module2) {
    "use strict";
    var SubDevice = require_subdevice();
    var { Button, Actions } = require_controllers();
    var Voltage = require_voltage3();
    module2.exports = class Switch extends SubDevice.with(Button, Actions, Voltage) {
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.switch";
        this.updateActions([
          "click",
          "double_click",
          "long_click_press",
          "long_click_release"
        ]);
      }
      _report(data) {
        super._report(data);
        if (typeof data.status !== "undefined") {
          this.debug("Action performed:", data.status);
          this.emitAction(data.status);
        }
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/motion.js
var require_motion2 = __commonJS({
  "node_modules/miio/lib/devices/gateway/motion.js"(exports, module2) {
    "use strict";
    var SubDevice = require_subdevice();
    var { Motion } = require_sensors();
    var Voltage = require_voltage3();
    module2.exports = class extends SubDevice.with(Motion, Voltage) {
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.motion";
        this.updateMotion(false);
      }
      _report(data) {
        super._report(data);
        if (typeof data.status !== "undefined" && data.status === "motion") {
          this.updateMotion(true, "1m");
        }
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/magnet.js
var require_magnet = __commonJS({
  "node_modules/miio/lib/devices/gateway/magnet.js"(exports, module2) {
    "use strict";
    var SubDevice = require_subdevice();
    var { Contact } = require_sensors();
    var Voltage = require_voltage3();
    module2.exports = class Magnet extends SubDevice.with(Contact, Voltage) {
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.magnet";
        this.defineProperty("status");
      }
      propertyUpdated(key, value, oldValue) {
        if (key === "status") {
          const isContact = value === "close";
          this.updateContact(isContact);
        }
        super.propertyUpdated(key, value, oldValue);
      }
    };
  }
});

// node_modules/abstract-things/electrical/power-outlet.js
var require_power_outlet = __commonJS({
  "node_modules/abstract-things/electrical/power-outlet.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "power-outlet";
      }
    });
  }
});

// node_modules/abstract-things/electrical/power-channel.js
var require_power_channel = __commonJS({
  "node_modules/abstract-things/electrical/power-channel.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "power-channel";
      }
    });
  }
});

// node_modules/abstract-things/electrical/power-plug.js
var require_power_plug = __commonJS({
  "node_modules/abstract-things/electrical/power-plug.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "power-plug";
      }
    });
  }
});

// node_modules/abstract-things/electrical/power-strip.js
var require_power_strip = __commonJS({
  "node_modules/abstract-things/electrical/power-strip.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "power-strip";
      }
    });
  }
});

// node_modules/abstract-things/electrical/wall-outlet.js
var require_wall_outlet = __commonJS({
  "node_modules/abstract-things/electrical/wall-outlet.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "wall-outlet";
      }
    });
  }
});

// node_modules/abstract-things/electrical/power-switch.js
var require_power_switch = __commonJS({
  "node_modules/abstract-things/electrical/power-switch.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "power-switch";
      }
    });
  }
});

// node_modules/abstract-things/electrical/wall-switch.js
var require_wall_switch = __commonJS({
  "node_modules/abstract-things/electrical/wall-switch.js"(exports, module2) {
    "use strict";
    var Thing = require_thing();
    module2.exports = Thing.type((Parent) => class extends Parent {
      static get type() {
        return "wall-switch";
      }
    });
  }
});

// node_modules/abstract-things/electrical/index.js
var require_electrical = __commonJS({
  "node_modules/abstract-things/electrical/index.js"(exports, module2) {
    "use strict";
    module2.exports.PowerOutlet = require_power_outlet();
    module2.exports.PowerChannel = require_power_channel();
    module2.exports.PowerPlug = require_power_plug();
    module2.exports.PowerStrip = require_power_strip();
    module2.exports.WallOutlet = require_wall_outlet();
    module2.exports.PowerSwitch = require_power_switch();
    module2.exports.WallSwitch = require_wall_switch();
  }
});

// node_modules/miio/lib/devices/gateway/light-channel.js
var require_light_channel = __commonJS({
  "node_modules/miio/lib/devices/gateway/light-channel.js"(exports, module2) {
    "use strict";
    var { Light, SwitchablePower } = require_lights();
    module2.exports = class LightChannel extends Light.with(SwitchablePower) {
      static get types() {
        return ["miio:subdevice", "miio:power-channel", "miio:light"];
      }
      constructor(parent, channel) {
        super();
        this.id = parent.id + ":" + channel;
        this.parent = parent;
        this.channel = channel;
        this.updateName();
      }
      updateName() {
        this.metadata.name = this.parent.name + " - " + this.channel;
      }
      changePower(power) {
        return this.parent.changePowerChannel(this.channel, power);
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/ctrl_neutral2.js
var require_ctrl_neutral2 = __commonJS({
  "node_modules/miio/lib/devices/gateway/ctrl_neutral2.js"(exports, module2) {
    "use strict";
    var { Children } = require_abstract_things();
    var { WallSwitch } = require_electrical();
    var SubDevice = require_subdevice();
    var LightChannel = require_light_channel();
    module2.exports = class CtrlNeutral2 extends WallSwitch.with(SubDevice, Children) {
      static get type() {
        return "miio:power-switch";
      }
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.ctrl_neutral2";
        this.defineProperty("channel_0", {
          name: "powerChannel0",
          mapper: (v) => v === "on"
        });
        this.defineProperty("channel_1", {
          name: "powerChannel1",
          mapper: (v) => v === "on"
        });
        this.addChild(new LightChannel(this, 0));
        this.addChild(new LightChannel(this, 1));
      }
      changePowerChannel(channel, power) {
        return this.call("toggle_ctrl_neutral", ["neutral_" + channel, power ? "on" : "off"]);
      }
      propertyUpdated(key, value) {
        super.propertyUpdated(key, value);
        switch (key) {
          case "powerChannel0":
            this.child("0").updatePower(value);
            break;
          case "powerChannel1":
            this.child("1").updatePower(value);
            break;
        }
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/cube.js
var require_cube = __commonJS({
  "node_modules/miio/lib/devices/gateway/cube.js"(exports, module2) {
    "use strict";
    var SubDevice = require_subdevice();
    var { Controller, Actions } = require_controllers();
    module2.exports = class Cube extends SubDevice.with(Controller, Actions) {
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.cube";
        this.updateActions([
          "alert",
          "flip90",
          "flip180",
          "move",
          "tap_twice",
          "shake_air",
          "free_fall",
          "rotate"
        ]);
      }
      _report(data) {
        super._report(data);
        if (typeof data.status !== "undefined") {
          this.debug("Action performed:", data.status);
          this.emitAction(data.status);
        }
        if (typeof data.rotate !== "undefined") {
          const r = data.rotate;
          const idx = r.indexOf(",");
          const amount = parseInt(r.substring(0, idx));
          this.debug("Action performed:", "rotate", amount);
          this.emitAction("rotate", {
            amount
          });
        }
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/ctrl_neutral1.js
var require_ctrl_neutral1 = __commonJS({
  "node_modules/miio/lib/devices/gateway/ctrl_neutral1.js"(exports, module2) {
    "use strict";
    var { Children } = require_abstract_things();
    var { WallSwitch } = require_electrical();
    var SubDevice = require_subdevice();
    var LightChannel = require_light_channel();
    module2.exports = class CtrlNeutral1 extends WallSwitch.with(SubDevice, Children) {
      static get type() {
        return "miio:power-switch";
      }
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.ctrl_neutral1";
        this.defineProperty("channel_0", {
          name: "powerChannel0",
          mapper: (v) => v === "on"
        });
        this.addChild(new LightChannel(this, 0));
      }
      changePowerChannel(channel, power) {
        return this.call("toggle_ctrl_neutral", ["neutral_" + channel, power ? "on" : "off"]);
      }
      propertyUpdated(key, value) {
        super.propertyUpdated(key, value);
        switch (key) {
          case "powerChannel0":
            this.child("0").updatePower(value);
            break;
        }
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/sensor_ht.js
var require_sensor_ht = __commonJS({
  "node_modules/miio/lib/devices/gateway/sensor_ht.js"(exports, module2) {
    "use strict";
    var SubDevice = require_subdevice();
    var { Temperature, Humidity } = require_sensor2();
    var Voltage = require_voltage3();
    module2.exports = class SensorHT extends SubDevice.with(Temperature, Humidity, Voltage) {
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.sensor_ht";
        this.defineProperty("temperature", (v) => v / 100);
        this.defineProperty("humidity", (v) => v / 100);
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/plug.js
var require_plug = __commonJS({
  "node_modules/miio/lib/devices/gateway/plug.js"(exports, module2) {
    "use strict";
    var { PowerPlug, PowerOutlet } = require_electrical();
    var SubDevice = require_subdevice();
    var Power = require_power3();
    var { PowerLoad, PowerConsumed } = require_sensor2();
    module2.exports = class Plug extends SubDevice.with(PowerPlug, PowerOutlet, Power, PowerLoad, PowerConsumed) {
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.plug";
        this.defineProperty("status", {
          name: "power",
          mapper: (v) => v === "" ? void 0 : v === "on"
        });
        this.defineProperty("load_voltage", {
          name: "loadVoltage",
          mapper: parseInt
        });
        this.defineProperty("load_power", {
          name: "powerLoad",
          mapper: parseInt
        });
        this.defineProperty("power_consumed", {
          name: "powerConsumed",
          mapper: parseFloat
        });
      }
      changePower(power) {
        return this.call("toggle_plug", ["neutral_0", power ? "on" : "off"]);
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/weather.js
var require_weather = __commonJS({
  "node_modules/miio/lib/devices/gateway/weather.js"(exports, module2) {
    "use strict";
    var SubDevice = require_subdevice();
    var { Temperature, Humidity, AtmosphericPressure } = require_sensor2();
    var Voltage = require_voltage3();
    module2.exports = class WeatherSensor extends SubDevice.with(Temperature, Humidity, AtmosphericPressure, Voltage) {
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.weather";
        this.defineProperty("temperature", (v) => v / 100);
        this.defineProperty("humidity", (v) => v / 100);
        this.defineProperty("pressure", {
          name: "atmosphericPressure"
        });
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/ctrl_ln1.js
var require_ctrl_ln1 = __commonJS({
  "node_modules/miio/lib/devices/gateway/ctrl_ln1.js"(exports, module2) {
    "use strict";
    var { Children } = require_abstract_things();
    var { WallSwitch } = require_electrical();
    var SubDevice = require_subdevice();
    var LightChannel = require_light_channel();
    module2.exports = class CtrlLN1 extends WallSwitch.with(SubDevice, Children) {
      static get type() {
        return "miio:power-switch";
      }
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.ctrl_ln1";
        this.defineProperty("channel_0", {
          name: "powerChannel0",
          mapper: (v) => v === "on"
        });
        this.addChild(new LightChannel(this, 0));
      }
      changePowerChannel(channel, power) {
        return this.call("toggle_ctrl_neutral", ["neutral_" + channel, power ? "on" : "off"]);
      }
      propertyUpdated(key, value) {
        super.propertyUpdated(key, value);
        switch (key) {
          case "powerChannel0":
            this.child("0").updatePower(value);
            break;
        }
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/ctrl_ln2.js
var require_ctrl_ln2 = __commonJS({
  "node_modules/miio/lib/devices/gateway/ctrl_ln2.js"(exports, module2) {
    "use strict";
    var { Children } = require_abstract_things();
    var { WallSwitch } = require_electrical();
    var SubDevice = require_subdevice();
    var LightChannel = require_light_channel();
    module2.exports = class CtrlLN2 extends WallSwitch.with(SubDevice, Children) {
      static get type() {
        return "miio:power-switch";
      }
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.ctrl_ln2";
        this.defineProperty("channel_0", {
          name: "powerChannel0",
          mapper: (v) => v === "on"
        });
        this.defineProperty("channel_1", {
          name: "powerChannel1",
          mapper: (v) => v === "on"
        });
        this.addChild(new LightChannel(this, 0));
        this.addChild(new LightChannel(this, 1));
      }
      changePowerChannel(channel, power) {
        return this.call("toggle_ctrl_neutral", ["neutral_" + channel, power ? "on" : "off"]);
      }
      propertyUpdated(key, value) {
        super.propertyUpdated(key, value);
        switch (key) {
          case "powerChannel0":
            this.child("0").updatePower(value);
            break;
          case "powerChannel1":
            this.child("1").updatePower(value);
            break;
        }
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/switch2.js
var require_switch2 = __commonJS({
  "node_modules/miio/lib/devices/gateway/switch2.js"(exports, module2) {
    "use strict";
    var SubDevice = require_subdevice();
    var { Button, Actions } = require_controllers();
    var Voltage = require_voltage3();
    module2.exports = class Switch extends SubDevice.with(Button, Actions, Voltage) {
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.switch.v2";
        this.updateActions([
          "click",
          "double_click"
        ]);
      }
      _report(data) {
        super._report(data);
        if (typeof data.status !== "undefined") {
          this.debug("Action performed:", data.status);
          this.emitAction(data.status);
        }
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/motion2.js
var require_motion22 = __commonJS({
  "node_modules/miio/lib/devices/gateway/motion2.js"(exports, module2) {
    "use strict";
    var SubDevice = require_subdevice();
    var { Motion } = require_sensors();
    var { Illuminance } = require_sensor2();
    var Voltage = require_voltage3();
    module2.exports = class extends SubDevice.with(Motion, Illuminance, Voltage) {
      constructor(parent, info) {
        super(parent, info);
        this.miioModel = "lumi.motion.aq2";
        this.defineProperty("status");
        this.defineProperty("lux", {
          name: "illuminance"
        });
      }
      _report(data) {
        super._report(data);
        if (typeof data.status !== "undefined" && data.status === "motion") {
          this.updateMotion(true, "1m");
        }
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/magnet2.js
var require_magnet2 = __commonJS({
  "node_modules/miio/lib/devices/gateway/magnet2.js"(exports, module2) {
    "use strict";
    var Magnet = require_magnet();
    module2.exports = class Magnet2 extends Magnet {
      constructor(...args) {
        super(...args);
        this.miioModel = "lumi.magnet.aq2";
      }
    };
  }
});

// node_modules/miio/lib/devices/gateway/subdevices.js
var require_subdevices = __commonJS({
  "node_modules/miio/lib/devices/gateway/subdevices.js"(exports, module2) {
    "use strict";
    module2.exports = {
      1: require_switch(),
      2: require_motion2(),
      3: require_magnet(),
      7: require_ctrl_neutral2(),
      8: require_cube(),
      9: require_ctrl_neutral1(),
      10: require_sensor_ht(),
      11: require_plug(),
      19: require_weather(),
      20: require_ctrl_ln1(),
      21: require_ctrl_ln2(),
      51: require_switch2(),
      52: require_motion22(),
      53: require_magnet2()
    };
  }
});

// node_modules/miio/lib/devices/gateway.js
var require_gateway = __commonJS({
  "node_modules/miio/lib/devices/gateway.js"(exports, module2) {
    "use strict";
    var { Thing, Children } = require_abstract_things();
    var { ChildSyncer } = require_children2();
    var MiioApi = require_device();
    var { Illuminance } = require_sensor2();
    var DeveloperApi = require_developer_api();
    var CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";
    var LightMixin = require_light_mixin();
    var SubDevice = require_subdevice();
    var types = require_subdevices();
    function generateKey() {
      let result = "";
      for (let i = 0; i < 16; i++) {
        let idx = Math.floor(Math.random() * CHARS.length);
        result += CHARS[idx];
      }
      return result;
    }
    var Gateway = Thing.type((Parent) => class Gateway extends Parent.with(MiioApi, Children) {
      static get type() {
        return "miio:gateway";
      }
      static get SubDevice() {
        return SubDevice;
      }
      static registerSubDevice(id, deviceClass) {
        types[id] = deviceClass;
      }
      static availableAPI(builder) {
        builder.action("addDevice").done();
        builder.action("stopAddDevice").done();
        builder.action("removeDevice").done();
      }
      constructor(options) {
        super(options);
        this.defineProperty("illumination", {
          name: "illuminance"
        });
        this.defineProperty("rgb", {
          handler: (result, rgba) => {
            result["rgb"] = {
              red: 255 & rgba >> 16,
              green: 255 & rgba >> 8,
              blue: 255 & rgba
            };
            result["brightness"] = Math.round(255 & rgba >> 24);
          }
        });
        this.extraChildren = [];
        this._monitorInterval = 60 * 1e3;
        this.syncer = new ChildSyncer(this, (def, current) => {
          if (def.metadata && def.id)
            return def;
          if (!def.online)
            return;
          if (current)
            return current;
          const type = types[def.type] || SubDevice;
          const device = new type(this, {
            id: def.id,
            model: "lumi.generic." + def.type
          });
          return device;
        });
      }
      _report(properties) {
        Object.keys(properties).forEach((key) => {
          this.setRawProperty(key, properties[key]);
        });
      }
      initCallback() {
        return super.initCallback().then(() => this._findDeveloperKey()).then(() => this._updateDeviceList()).then(() => {
          this._deviceListTimer = setInterval(this._updateDeviceList.bind(this), 30 * 60 * 1e3);
        });
      }
      destroyCallback() {
        return super.destroyCallback().then(() => {
          if (this.devApi) {
            this.devApi.destroy();
          }
          clearInterval(this._deviceListTimer);
        });
      }
      addExtraChild(child) {
        this.extraChildren.push(child);
      }
      _updateDeviceList() {
        function stripLumiFromId(id) {
          if (id.indexOf("lumi.") === 0) {
            return id.substring(5);
          }
          return id;
        }
        return this.call("get_device_prop", ["lumi.0", "device_list"]).then((list) => {
          const defs = [...this.extraChildren];
          for (let i = 0; i < list.length; i += 5) {
            const id = stripLumiFromId(list[i]);
            const type = list[i + 1];
            const online = list[i + 2] === 1;
            if (id === "0")
              continue;
            defs.push({
              id: "miio:" + id,
              type,
              online
            });
          }
          return this.syncer.update(defs);
        });
      }
      _findDeveloperKey() {
        if (this._developerKey)
          return Promise.resolve(this._developerKey);
        return this.call("get_lumi_dpf_aes_key").then((result) => {
          let key = result[0];
          if (key && key.length === 16) {
            return key;
          }
          key = generateKey();
          return this.call("set_lumi_dpf_aes_key", [key]);
        }).then((key) => this._setDeveloperKey(key));
      }
      _setDeveloperKey(key) {
        this._developerKey = key;
        if (this.devApi)
          return Promise.resolve();
        return new Promise((resolve, reject) => {
          this.devApi = new DeveloperApi(this, this.management.address);
          this.devApi.on("propertiesChanged", (e) => {
            if (e.id === "0") {
              this._report(e.data);
            }
          });
          this.devApi.on("ready", resolve);
          setTimeout(reject, 1e4);
        });
      }
      addDevice() {
        return this.call("start_zigbee_join", [30]).then(MiioApi.checkOk).then(() => setTimeout(this._updateDeviceList.bind(this), 3e4)).then(() => void 0);
      }
      stopAddDevice() {
        return this.call("start_zigbee_join", [0]).then(MiioApi.checkOk).then(() => void 0);
      }
      removeDevice(id) {
        return this.call("remove_device", [id]).then(MiioApi.checkOk).then(this._updateDeviceList.bind(this)).then(() => void 0);
      }
    });
    module2.exports.Basic = Gateway;
    module2.exports.WithLightAndSensor = Gateway.with(LightMixin, Illuminance);
  }
});

// node_modules/miio/lib/devices/vacuum.js
var require_vacuum2 = __commonJS({
  "node_modules/miio/lib/devices/vacuum.js"(exports, module2) {
    "use strict";
    var { ChargingState, AutonomousCharging } = require_abstract_things();
    var {
      Vacuum,
      AdjustableFanSpeed,
      AutonomousCleaning,
      SpotCleaning
    } = require_climate();
    var MiioApi = require_device();
    var BatteryLevel = require_battery_level2();
    function checkResult(r) {
      if (r !== 0 && r[0] !== "ok") {
        throw new Error("Could not complete call to device");
      }
    }
    module2.exports = class extends Vacuum.with(MiioApi, BatteryLevel, AutonomousCharging, AutonomousCleaning, SpotCleaning, AdjustableFanSpeed, ChargingState) {
      static get type() {
        return "miio:vacuum";
      }
      constructor(options) {
        super(options);
        this.defineProperty("error_code", {
          name: "error",
          mapper: (e) => {
            switch (e) {
              case 0:
                return null;
              default:
                return {
                  code: e,
                  message: "Unknown error " + e
                };
            }
          }
        });
        this.defineProperty("state", (s) => {
          switch (s) {
            case 1:
              return "initiating";
            case 2:
              return "charger-offline";
            case 3:
              return "waiting";
            case 5:
              return "cleaning";
            case 6:
              return "returning";
            case 8:
              return "charging";
            case 9:
              return "charging-error";
            case 10:
              return "paused";
            case 11:
              return "spot-cleaning";
            case 12:
              return "error";
            case 13:
              return "shutting-down";
            case 14:
              return "updating";
            case 15:
              return "docking";
            case 17:
              return "zone-cleaning";
            case 100:
              return "full";
          }
          return "unknown-" + s;
        });
        this.defineProperty("battery", {
          name: "batteryLevel"
        });
        this.defineProperty("clean_time", {
          name: "cleanTime"
        });
        this.defineProperty("clean_area", {
          name: "cleanArea",
          mapper: (v) => v / 1e6
        });
        this.defineProperty("fan_power", {
          name: "fanSpeed"
        });
        this.defineProperty("in_cleaning");
        this.defineProperty("main_brush_work_time", {
          name: "mainBrushWorkTime"
        });
        this.defineProperty("side_brush_work_time", {
          name: "sideBrushWorkTime"
        });
        this.defineProperty("filter_work_time", {
          name: "filterWorkTime"
        });
        this.defineProperty("sensor_dirty_time", {
          name: "sensorDirtyTime"
        });
        this._monitorInterval = 6e4;
      }
      propertyUpdated(key, value, oldValue) {
        if (key === "state") {
          this.updateCharging(value === "charging");
          switch (value) {
            case "cleaning":
            case "spot-cleaning":
            case "zone-cleaning":
              this.updateCleaning(true);
              break;
            case "paused":
              break;
            case "error":
              this.updateError(this.property("error"));
              break;
            case "charging-error":
              this.updateError({
                code: "charging-error",
                message: "Error during charging"
              });
              break;
            case "charger-offline":
              this.updateError({
                code: "charger-offline",
                message: "Charger is offline"
              });
              break;
            default:
              this.updateCleaning(false);
              break;
          }
        } else if (key === "fanSpeed") {
          this.updateFanSpeed(value);
        }
        super.propertyUpdated(key, value, oldValue);
      }
      activateCleaning() {
        return this.call("app_start", [], {
          refresh: ["state"],
          refreshDelay: 1e3
        }).then(checkResult);
      }
      pause() {
        return this.call("app_pause", [], {
          refresh: ["state "]
        }).then(checkResult);
      }
      deactivateCleaning() {
        return this.call("app_stop", [], {
          refresh: ["state"],
          refreshDelay: 1e3
        }).then(checkResult);
      }
      activateCharging() {
        return this.call("app_stop", []).then(checkResult).then(() => this.call("app_charge", [], {
          refresh: ["state"],
          refreshDelay: 1e3
        })).then(checkResult);
      }
      activateSpotClean() {
        return this.call("app_spot", [], {
          refresh: ["state"]
        }).then(checkResult);
      }
      changeFanSpeed(speed) {
        return this.call("set_custom_mode", [speed], {
          refresh: ["fanSpeed"]
        }).then(checkResult);
      }
      find() {
        return this.call("find_me", [""]).then(() => null);
      }
      getHistory() {
        return this.call("get_clean_summary").then((result) => {
          return {
            count: result[2],
            days: result[3].map((ts) => new Date(ts * 1e3))
          };
        });
      }
      getHistoryForDay(day) {
        let record = day;
        if (record instanceof Date) {
          record = Math.floor(record.getTime() / 1e3);
        }
        return this.call("get_clean_record", [record]).then((result) => ({
          day,
          history: result.map((data) => ({
            start: new Date(data[0] * 1e3),
            end: new Date(data[1] * 1e3),
            duration: data[2],
            area: data[3] / 1e6,
            complete: data[5] === 1
          }))
        }));
      }
      loadProperties(props) {
        props = props.map((key) => this._reversePropertyDefinitions[key] || key);
        return Promise.all([
          this.call("get_status"),
          this.call("get_consumable")
        ]).then((result) => {
          const status = result[0][0];
          const consumables = result[1][0];
          const mapped = {};
          props.forEach((prop) => {
            let value = status[prop];
            if (typeof value === "undefined") {
              value = consumables[prop];
            }
            this._pushProperty(mapped, prop, value);
          });
          return mapped;
        });
      }
    };
  }
});

// node_modules/miio/lib/devices/power-plug.js
var require_power_plug2 = __commonJS({
  "node_modules/miio/lib/devices/power-plug.js"(exports, module2) {
    "use strict";
    var { Thing } = require_abstract_things();
    var { PowerPlug, PowerOutlet } = require_electrical();
    var MiioApi = require_device();
    var Power = require_power3();
    module2.exports = class extends Thing.with(PowerPlug, PowerOutlet, MiioApi, Power) {
      static get type() {
        return "miio:power-plug";
      }
      constructor(options) {
        super(options);
        this.defineProperty("power", {
          mapper: (v) => v === "on"
        });
      }
      changePower(power) {
        return this.call("set_power", [power ? "on" : "off"], { refresh: ["power"] });
      }
    };
  }
});

// node_modules/miio/lib/devices/power-strip.js
var require_power_strip2 = __commonJS({
  "node_modules/miio/lib/devices/power-strip.js"(exports, module2) {
    "use strict";
    var { PowerStrip } = require_electrical();
    var MiioApi = require_device();
    var Power = require_power3();
    var Mode = require_mode2();
    module2.exports = class extends PowerStrip.with(MiioApi, Power, Mode) {
      static get type() {
        return "miio:power-strip";
      }
      constructor(options) {
        super(options);
        this.defineProperty("power", {
          mapper: (v) => v === "n"
        });
        this.updateModes([
          "green",
          "normal"
        ]);
        this.defineProperty("mode");
      }
      changePower(power) {
        return this.call("set_power", [power ? "on" : "off"], { refresh: ["power"] });
      }
      changeMode(mode) {
        return this.call("set_power_mode", [mode]);
      }
    };
  }
});

// node_modules/miio/lib/devices/humidifier.js
var require_humidifier2 = __commonJS({
  "node_modules/miio/lib/devices/humidifier.js"(exports, module2) {
    "use strict";
    var { SwitchableMode } = require_abstract_things();
    var { Humidifier, AdjustableTargetHumidity } = require_climate();
    var MiioApi = require_device();
    var Power = require_power3();
    var Buzzer = require_buzzer();
    var LEDBrightness = require_changeable_led_brightness();
    var { Temperature, Humidity } = require_sensor2();
    module2.exports = class extends Humidifier.with(MiioApi, Power, SwitchableMode, AdjustableTargetHumidity, Temperature, Humidity, Buzzer, LEDBrightness) {
      static get type() {
        return "miio:humidifier";
      }
      constructor(options) {
        super(options);
        this.defineProperty("power", (v) => v === "on");
        this.defineProperty("mode");
        this.updateModes([
          "idle",
          "silent",
          "medium",
          "high"
        ]);
        this.defineProperty("limit_hum", {
          name: "targetHumidity"
        });
        this.defineProperty("temp_dec", {
          name: "temperature",
          mapper: (v) => v / 10
        });
        this.defineProperty("humidity");
        this.defineProperty("buzzer", {
          mapper: (v) => v === "on"
        });
        this.defineProperty("led_b", {
          name: "ledBrightness",
          mapper: (v) => {
            switch (v) {
              case 0:
                return "bright";
              case 1:
                return "dim";
              case 2:
                return "off";
              default:
                return "unknown";
            }
          }
        });
      }
      propertyUpdated(key, value) {
        if (key === "power") {
          if (value) {
            const mode = this.property("mode");
            this.updateMode(mode);
          } else {
            this.updateMode("idle");
          }
        } else if (key === "mode") {
          const power = this.property("power");
          if (power) {
            this.updateMode(value);
          } else {
            this.updateMode("idle");
          }
        } else if (key === "targetHumidity") {
          this.updateTargetHumidity(value);
        }
        super.propertyUpdated(key, value);
      }
      changePower(power) {
        return this.call("set_power", [power ? "on" : "off"], {
          refresh: ["power", "mode"],
          refreshDelay: 200
        });
      }
      changeMode(mode) {
        let promise;
        if (mode === "idle") {
          return this.setPower(false);
        } else {
          if (this.power()) {
            promise = Promise.resolve();
          } else {
            promise = this.setPower(true);
          }
        }
        return promise.then(() => {
          return this.call("set_mode", [mode], {
            refresh: ["power", "mode"],
            refreshDelay: 200
          }).then(MiioApi.checkOk).catch((err) => {
            throw err.code === -5001 ? new Error("Mode `" + mode + "` not supported") : err;
          });
        });
      }
      changeTargetHumidity(humidity) {
        return this.call("set_limit_hum", [humidity], {
          refresh: ["targetHumidity"]
        }).then(MiioApi.checkOk);
      }
      changeLEDBrightness(level) {
        switch (level) {
          case "bright":
            level = 0;
            break;
          case "dim":
            level = 1;
            break;
          case "off":
            level = 2;
            break;
          default:
            return Promise.reject(new Error("Invalid LED brigthness: " + level));
        }
        return this.call("set_led_b", [level], { refresh: ["ledBrightness"] }).then(() => null);
      }
    };
  }
});

// node_modules/miio/lib/devices/capabilities/dimmable.js
var require_dimmable2 = __commonJS({
  "node_modules/miio/lib/devices/capabilities/dimmable.js"(exports, module2) {
    "use strict";
    var { Thing } = require_abstract_things();
    var { Dimmable } = require_lights();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Dimmable) {
      propertyUpdated(key, value) {
        if (key === "brightness") {
          this.updateBrightness(value);
        }
        super.propertyUpdated(key, value);
      }
    });
  }
});

// node_modules/miio/lib/devices/yeelight.js
var require_yeelight = __commonJS({
  "node_modules/miio/lib/devices/yeelight.js"(exports, module2) {
    "use strict";
    var { Thing, Nameable } = require_abstract_things();
    var { Light, Fading, Colorable, ColorTemperature, ColorFull } = require_lights();
    var { color } = require_values();
    var MiioApi = require_device();
    var Power = require_power3();
    var Dimmable = require_dimmable2();
    var DEFAULT_EFFECT = "smooth";
    var DEFAULT_DURATION = 500;
    var Yeelight = Thing.type((Parent) => class Yeelight2 extends Parent.with(Light, Fading, MiioApi, Power, Dimmable, Nameable) {
      static get type() {
        return "miio:yeelight";
      }
      constructor(options) {
        super(options);
        this.defineProperty("power", {
          name: "power",
          mapper: (v) => v === "on"
        });
        this.defineProperty("bright", {
          name: "brightness",
          mapper: parseInt
        });
        this.defineProperty("delayoff", {
          name: "offDelay",
          mapper: parseInt
        });
        this.defineProperty("color_mode", {
          name: "colorMode",
          mapper: (v) => {
            v = parseInt(v);
            switch (v) {
              case 1:
                return "rgb";
              case 2:
                return "colorTemperature";
              case 3:
                return "hsv";
            }
          }
        });
        this.defineProperty("name");
        this.updateMaxChangeTime("30s");
      }
      propertyUpdated(key, value) {
        if (key === "name") {
          this.metadata.name = value;
        }
        super.propertyUpdated(key, value);
      }
      changePower(power) {
        return this.call("set_power", Yeelight2.withEffect(power ? "on" : "off"), {
          refresh: ["power"]
        }).then(MiioApi.checkOk);
      }
      setDefault() {
        return this.call("set_default").then(MiioApi.checkOk);
      }
      changeBrightness(brightness, options) {
        if (brightness <= 0) {
          return this.changePower(false);
        } else {
          let promise;
          if (options.powerOn && this.power() === false) {
            promise = this.changePower(true);
          } else {
            promise = Promise.resolve();
          }
          return promise.then(() => this.call("set_bright", Yeelight2.withEffect(brightness, options.duration), {
            refresh: ["brightness"]
          })).then(MiioApi.checkOk);
        }
      }
      changeName(name) {
        return this.call("set_name", [name]).then(MiioApi.checkOk).then(() => this.metadata.name = name);
      }
      static withEffect(arg, duration) {
        const result = Array.isArray(arg) ? arg : [arg];
        if (duration) {
          if (duration.ms > 0) {
            result.push(DEFAULT_EFFECT);
            result.push(duration.ms);
          } else {
            result.push("sudden");
            result.push(0);
          }
        } else {
          result.push(DEFAULT_EFFECT);
          result.push(DEFAULT_DURATION);
        }
        return result;
      }
    });
    module2.exports.Yeelight = Yeelight;
    module2.exports.ColorTemperature = Thing.mixin((Parent) => class extends Parent.with(MiioApi, Colorable, ColorTemperature) {
      constructor(...args) {
        super(...args);
        this.defineProperty("ct", {
          name: "colorTemperature",
          mapper: parseInt
        });
        this.updateColorTemperatureRange(2700, 6500);
      }
      propertyUpdated(key, value) {
        if (key === "colorTemperature") {
          this.updateColor(color.temperature(value));
        }
        super.propertyUpdated(key, value);
      }
      changeColor(color2, options) {
        const range = this.colorTemperatureRange;
        const temperature = Math.min(Math.max(color2.temperature.kelvins, range.min), range.max);
        return this.call("set_ct_abx", Yeelight.withEffect(temperature, options.duration), {
          refresh: ["colorTemperature"]
        }).then(MiioApi.checkOk);
      }
    });
    module2.exports.ColorFull = Thing.mixin((Parent) => class extends Parent.with(MiioApi, Colorable, ColorTemperature, ColorFull) {
      constructor(...args) {
        super(...args);
        this.defineProperty("ct", {
          name: "colorTemperature",
          mapper: parseInt
        });
        this.defineProperty("rgb", {
          name: "colorRGB",
          mapper: (rgb) => {
            rgb = parseInt(rgb);
            return {
              red: rgb >> 16 & 255,
              green: rgb >> 8 & 255,
              blue: rgb & 255
            };
          }
        });
        this.defineProperty("hue", {
          name: "colorHue",
          mapper: parseInt
        });
        this.defineProperty("sat", {
          name: "colorSaturation",
          mapper: parseInt
        });
        this.metadata.addCapabilities("color:temperature", "color:full");
        this.updateColorTemperatureRange(2700, 6500);
      }
      propertyUpdated(key, value) {
        if (key === "colorTemperature" || key === "colorMode" || key === "colorRGB" || key === "colorHue" || key === "colorSaturation" || key === "brightness") {
          let currentColor = this.color();
          switch (this.property("colorMode")) {
            case "colorTemperature":
              currentColor = color.temperature(this.property("colorTemperature"));
              break;
            case "rgb": {
              let rgb = this.property("colorRGB");
              if (rgb) {
                currentColor = color.rgb(rgb.red, rgb.green, rgb.blue);
              }
              break;
            }
            case "hsv": {
              let hue = this.property("colorHue");
              let saturation = this.property("colorSaturation");
              if (typeof hue !== "undefined" && typeof saturation !== "undefined") {
                currentColor = color.hsv(hue, saturation, this.property("brightness"));
              }
            }
          }
          this.updateColor(currentColor);
        }
        super.propertyUpdated(key, value);
      }
      changeColor(color2, options) {
        if (color2.is("temperature")) {
          const range = this.colorTemperatureRange;
          const temperature = Math.min(Math.max(color2.temperature.kelvins, range.min), range.max);
          return this.call("set_ct_abx", Yeelight.withEffect(temperature, options.duration), {
            refresh: ["colorTemperature", "colorMode"]
          }).then(MiioApi.checkOk);
        } else if (color2.is("hsl")) {
          return this.call("set_hsv", Yeelight.withEffect([color2.hue, color2.saturation], options.duration), {
            refresh: ["colorHue", "colorSaturation", "colorMode"]
          }).then(MiioApi.checkOk);
        } else {
          color2 = color2.rgb;
          const rgb = color2.red * 65536 + color2.green * 256 + color2.blue;
          return this.call("set_rgb", Yeelight.withEffect(rgb, options.duration), {
            refresh: ["colorRGB", "colorMode"]
          }).then(MiioApi.checkOk);
        }
      }
    });
  }
});

// node_modules/miio/lib/devices/yeelight.color.js
var require_yeelight_color = __commonJS({
  "node_modules/miio/lib/devices/yeelight.color.js"(exports, module2) {
    "use strict";
    var { Yeelight, ColorFull } = require_yeelight();
    module2.exports = class YeelightColor extends Yeelight.with(ColorFull) {
    };
  }
});

// node_modules/miio/lib/devices/yeelight.mono.js
var require_yeelight_mono = __commonJS({
  "node_modules/miio/lib/devices/yeelight.mono.js"(exports, module2) {
    "use strict";
    var { Yeelight, ColorTemperature } = require_yeelight();
    module2.exports = class YeelightMono extends Yeelight.with(ColorTemperature) {
      constructor(options) {
        super(options);
      }
    };
  }
});

// node_modules/miio/lib/devices/air-purifier3c.js
var require_air_purifier3c = __commonJS({
  "node_modules/miio/lib/devices/air-purifier3c.js"(exports, module2) {
    "use strict";
    var { AirPurifier } = require_climate();
    var MiioApi = require_device();
    var Power = require_power3();
    var Mode = require_mode2();
    var LEDBrightness = require_changeable_led_brightness();
    var Buzzer = require_buzzer();
    var { AQI } = require_sensor2();
    module2.exports = class extends AirPurifier.with(MiioApi, Power, Mode, AQI, LEDBrightness, Buzzer) {
      get serviceMapping() {
        return {
          power: { siid: 2, piid: 1 },
          mode: {
            siid: 2,
            piid: 4,
            mapping: (mode) => {
              switch (mode) {
                case "auto":
                  return 0;
                case "silent":
                  return 1;
                case "favorite":
                  return 2;
                case "idle:":
                  return 3;
                default:
                  return 0;
              }
            }
          },
          aqi: { siid: 3, piid: 4 },
          favorite_rpm: {
            siid: 9,
            piid: 3
          },
          filter_life_remaining: { siid: 4, piid: 1 },
          filter_hours_used: { siid: 4, piid: 3 },
          led_brightness_level: { siid: 7, piid: 2 },
          buzzer: { siid: 6, piid: 1 }
        };
      }
      getServiceProperty(prop) {
        return {
          did: String(this.handle.api.id),
          siid: this.serviceMapping[prop].siid,
          piid: this.serviceMapping[prop].piid
        };
      }
      static get type() {
        return "miio:air-purifier";
      }
      loadProperties(props) {
        props = props.map((key) => this._reversePropertyDefinitions[key] || key);
        const propObjects = props.filter((prop) => this.serviceMapping[prop]).map(this.getServiceProperty.bind(this));
        return this.call("get_properties", propObjects).then((result) => {
          const obj = {};
          for (let i = 0; i < result.length; i++) {
            this._pushProperty(obj, props[i], result[i].value);
          }
          return obj;
        });
      }
      constructor(options) {
        super(options);
        this.defineProperty("power");
        this.defineProperty("mode", {
          mapper: (v) => {
            switch (v) {
              case 0:
                return "auto";
              case 1:
                return "silent";
              case 2:
                return "favorite";
              case 3:
                return "idle";
            }
          }
        });
        this.updateModes(["idle", "auto", "silent", "favorite"]);
        this.defineProperty("aqi");
        this.defineProperty("favorite_rpm", {
          name: "favoriteRPM"
        });
        this.defineProperty("filter_life_remaining", {
          name: "filterLifeRemaining"
        });
        this.defineProperty("filter_hours_used", {
          name: "filterHoursUsed"
        });
        this.defineProperty("led_brightness_level", {
          name: "ledBrightness",
          mapper: (v) => {
            switch (v) {
              case 2:
                return "bright";
              case 1:
                return "dim";
              case 0:
                return "off";
              default:
                return "unknown";
            }
          }
        });
        this.defineProperty("buzzer");
      }
      changePower(power) {
        const attributes = [];
        attributes.push(Object.assign({ value: power }, this.getServiceProperty("power")));
        return this.call("set_properties", attributes, {
          refresh: ["power", "mode"],
          refreshDelay: 200
        });
      }
      changeMode(mode) {
        const realMode = this.serviceMapping["mode"].mapping(mode);
        return this.call("set_properties", [Object.assign({ value: realMode }, this.getServiceProperty("mode"))], {
          refresh: ["power", "mode"],
          refreshDelay: 200
        }).then(MiioApi.checkOk).catch((err) => {
          throw err.code === -5001 ? new Error("Mode `" + mode + "` not supported") : err;
        });
      }
      favoriteRPM(level = void 0) {
        if (typeof level === "undefined") {
          return Promise.resolve(this.property("favoriteRPM"));
        }
        return this.setFavoriteRPM(level);
      }
      setFavoriteRPM(value) {
        return this.call("set_properties", [
          Object.assign({ value }, this.getServiceProperty("favorite_rpm"))
        ]).then(() => null);
      }
      changeLEDBrightness(level) {
        switch (level) {
          case "bright":
            level = 2;
            break;
          case "dim":
            level = 1;
            break;
          case "off":
            level = 0;
            break;
          default:
            return Promise.reject(new Error("Invalid LED brigthness: " + level));
        }
        return this.call("set_properties", [
          Object.assign({ value: level }, this.getServiceProperty("led_brightness_level"))
        ]).then(() => null);
      }
    };
  }
});

// node_modules/miio/lib/devices/chuangmi.plug.v1.js
var require_chuangmi_plug_v1 = __commonJS({
  "node_modules/miio/lib/devices/chuangmi.plug.v1.js"(exports, module2) {
    "use strict";
    var { Thing, SwitchablePower } = require_abstract_things();
    var { PowerPlug, PowerOutlet } = require_electrical();
    var MiioApi = require_device();
    var MiioPower = require_power3();
    module2.exports = class extends Thing.with(PowerPlug, PowerOutlet, MiioApi, MiioPower) {
      static get type() {
        return "miio:power-plug";
      }
      constructor(options) {
        super(options);
        this.defineProperty("on", {
          name: "power"
        });
        this.addChild(new USBOutlet(this));
      }
      setName(name) {
        return super.setName(name).then((n) => {
          this.child("usb").updateName();
          return n;
        });
      }
      propertyUpdated(key, value) {
        switch (key) {
          case "powerChannelUsb":
            this.child("usb").updatePower(value);
            break;
        }
      }
    };
    var USBOutlet = class extends PowerOutlet.with(SwitchablePower) {
      constructor(parent) {
        super();
        this.id = parent.id + ":usb";
        this.parent = parent;
        this.updateName();
      }
      updateName() {
        this.metadata.name = this.parent.name + " - USB";
      }
      changePower(power) {
        return this.parent.call(power ? "set_usb_on" : "set_usb_off", [], { refresh: true });
      }
    };
  }
});

// node_modules/miio/lib/devices/eyecare-lamp2.js
var require_eyecare_lamp2 = __commonJS({
  "node_modules/miio/lib/devices/eyecare-lamp2.js"(exports, module2) {
    "use strict";
    var MiioApi = require_device();
    var { Children } = require_abstract_things();
    var { Light, Dimmable, SwitchablePower } = require_lights();
    var { percentage } = require_values();
    var MiioDimmable = require_dimmable2();
    var MiioPower = require_power3();
    module2.exports = class EyecareLamp2 extends Light.with(MiioPower, MiioDimmable, Children, MiioApi) {
      constructor(options) {
        super(options);
        this.defineProperty("power", {
          name: "power",
          mapper: (v) => v === "on"
        });
        this.defineProperty("bright", {
          name: "brightness",
          mapper: parseInt
        });
        this.defineProperty("notifystatus", {
          name: "notifyStatus",
          mapper: (v) => v === "on"
        });
        this.defineProperty("ambstatus", {
          name: "ambientPower",
          mapper: (v) => v === "on"
        });
        this.defineProperty("ambvalue", {
          name: "ambientBrightness",
          mapper: parseInt
        });
        this.defineProperty("eyecare", {
          name: "eyeCare",
          mapper: (v) => v === "on"
        });
        this.defineProperty("scene_num", {
          name: "userScene",
          mapper: (v) => {
            switch (v) {
              case 1:
                return "study";
              case 2:
                return "reading";
              case 3:
                return "phone";
            }
          }
        });
        this.setModes(["study", "reading", "phone"]);
        this.defineProperty("bls", {
          name: "bls",
          mapper: (v) => v === "on"
        });
        this.defineProperty("dvalue", {
          name: "dvalue",
          mapper: parseInt
        });
        this.ambient = new AmbientLight(this);
        this.addChild(this.ambient);
      }
      changePower(power) {
        return this.call("set_power", [power ? "on" : "off"], {
          refresh: true
        });
      }
      changeBrightness(brightness) {
        return this.call("set_bright", [brightness], {
          refresh: true
        }).then(MiioApi.checkOk);
      }
      eyeCare() {
        return Promise.resolve(this.property("eyeCare"));
      }
      setEyeCare(enable) {
        return this.call("set_eyecare", [enable ? "on" : "off"], {
          refresh: true
        }).then(() => null);
      }
      setAmbientPower(power) {
        return this.call.send("enable_amb", [power ? "on" : "off"]).then(MiioApi.checkOk);
      }
      setAmbientBrightness(brightness) {
        brightness = percentage(brightness, { min: 0, max: 100 });
        return this.call.send("set_amb_bright", [brightness]).then(MiioApi.checkOk);
      }
      propertyUpdated(key, value) {
        super.propertyUpdated(key, value);
        switch (key) {
          case "ambientPower":
            this.ambient.updatePower(value);
            break;
          case "ambientBrightness":
            this.ambient.updateBrightness(value);
            break;
        }
      }
    };
    var AmbientLight = class extends Light.with(Dimmable, SwitchablePower) {
      constructor(parent) {
        super();
        this.parent = parent;
        this.id = parent.id + ":ambient";
      }
      changePower(power) {
        return this.parent.setAmbientPower(power);
      }
      changeBrightness(brightness) {
        return this.parent.setAmbientBrightness(brightness);
      }
    };
  }
});

// node_modules/miio/lib/devices/capabilities/colorable.js
var require_colorable2 = __commonJS({
  "node_modules/miio/lib/devices/capabilities/colorable.js"(exports, module2) {
    "use strict";
    var { Thing } = require_abstract_things();
    var { Colorable } = require_lights();
    module2.exports = Thing.mixin((Parent) => class extends Parent.with(Colorable) {
      propertyUpdated(key, value) {
        if (key === "color") {
          this.updateColor(value);
        }
        super.propertyUpdated(key, value);
      }
    });
  }
});

// node_modules/miio/lib/devices/philips-light-bulb.js
var require_philips_light_bulb = __commonJS({
  "node_modules/miio/lib/devices/philips-light-bulb.js"(exports, module2) {
    "use strict";
    var { LightBulb, ColorTemperature } = require_lights();
    var { color } = require_values();
    var MiioApi = require_device();
    var Power = require_power3();
    var Dimmable = require_dimmable2();
    var Colorable = require_colorable2();
    var MIN_TEMP = 3e3;
    var MAX_TEMP = 5700;
    module2.exports = class BallLamp extends LightBulb.with(MiioApi, Power, Dimmable, Colorable, ColorTemperature) {
      static get type() {
        return "miio:philiphs-ball-lamp";
      }
      constructor(options) {
        super(options);
        this.defineProperty("power", {
          name: "power",
          mapper: (v) => v === "on"
        });
        this.defineProperty("bright", {
          name: "brightness",
          mapper: parseInt
        });
        this.defineProperty("cct", {
          name: "color",
          mapper: (v) => {
            v = parseInt(v);
            return color.temperature(MIN_TEMP + v / 100 * (MAX_TEMP - MIN_TEMP));
          }
        });
        this.updateColorTemperatureRange(MIN_TEMP, MAX_TEMP);
      }
      changePower(power) {
        return this.call("set_power", [power ? "on" : "off"], {
          refresh: ["power"]
        }).then(MiioApi.checkOk);
      }
      changeBrightness(brightness) {
        return this.call("set_bright", [brightness], {
          refresh: ["brightness"]
        }).then(MiioApi.checkOk);
      }
      changeColor(color2) {
        const kelvins = color2.temperature.kelvins;
        let temp;
        if (kelvins <= MIN_TEMP) {
          temp = 1;
        } else if (kelvins >= MAX_TEMP) {
          temp = 100;
        } else {
          temp = Math.round((kelvins - MIN_TEMP) / (MAX_TEMP - MIN_TEMP) * 100);
        }
        return this.call("set_cct", [temp], {
          refresh: ["color"]
        }).then(MiioApi.checkOk);
      }
    };
  }
});

// node_modules/miio/lib/models.js
var require_models = __commonJS({
  "node_modules/miio/lib/models.js"(exports, module2) {
    "use strict";
    var AirMonitor = require_air_monitor2();
    var AirPurifier = require_air_purifier2();
    var Gateway = require_gateway();
    var Vacuum = require_vacuum2();
    var PowerPlug = require_power_plug2();
    var PowerStrip = require_power_strip2();
    var Humidifier = require_humidifier2();
    var YeelightColor = require_yeelight_color();
    var YeelightMono = require_yeelight_mono();
    var AirPurifier3C = require_air_purifier3c();
    module2.exports = {
      "zhimi.airmonitor.v1": AirMonitor,
      "zhimi.airpurifier.v1": AirPurifier,
      "zhimi.airpurifier.v2": AirPurifier,
      "zhimi.airpurifier.v3": AirPurifier,
      "zhimi.airpurifier.v6": AirPurifier,
      "zhimi.airpurifier.m1": AirPurifier,
      "zhimi.airpurifier.m2": AirPurifier,
      "zhimi.airpurifier.ma2": AirPurifier,
      "zhimi.airpurifier.mb4": AirPurifier3C,
      "zhimi.humidifier.v1": Humidifier,
      "chuangmi.plug.m1": PowerPlug,
      "chuangmi.plug.v1": require_chuangmi_plug_v1(),
      "chuangmi.plug.v2": PowerPlug,
      "rockrobo.vacuum.v1": Vacuum,
      "roborock.vacuum.s5": Vacuum,
      "lumi.gateway.v2": Gateway.WithLightAndSensor,
      "lumi.gateway.v3": Gateway.WithLightAndSensor,
      "lumi.acpartner.v1": Gateway.Basic,
      "lumi.acpartner.v2": Gateway.Basic,
      "lumi.acpartner.v3": Gateway.Basic,
      "qmi.powerstrip.v1": PowerStrip,
      "zimi.powerstrip.v2": PowerStrip,
      "yeelink.light.lamp1": YeelightMono,
      "yeelink.light.mono1": YeelightMono,
      "yeelink.light.color1": YeelightColor,
      "yeelink.light.strip1": YeelightColor,
      "philips.light.sread1": require_eyecare_lamp2(),
      "philips.light.bulb": require_philips_light_bulb()
    };
  }
});

// node_modules/miio/lib/connectToDevice.js
var require_connectToDevice = __commonJS({
  "node_modules/miio/lib/connectToDevice.js"(exports, module2) {
    "use strict";
    var network = require_network2();
    var Device = require_device();
    var Placeholder = require_placeholder2();
    var models = require_models();
    module2.exports = function(options) {
      let handle = network.ref();
      return network.findDeviceViaAddress(options).then((device) => {
        const deviceHandle = {
          ref: network.ref(),
          api: device
        };
        const d = models[device.model];
        if (!d) {
          return new Device(deviceHandle);
        } else {
          return new d(deviceHandle);
        }
      }).catch((e) => {
        if ((e.code === "missing-token" || e.code === "connection-failure") && options.withPlaceholder) {
          const deviceHandle = {
            ref: network.ref(),
            api: e.device
          };
          return new Placeholder(deviceHandle);
        }
        handle.release();
        e.device = null;
        throw e;
      }).then((device) => {
        handle.release();
        return device.init();
      });
    };
  }
});

// node_modules/miio/lib/discovery.js
var require_discovery2 = __commonJS({
  "node_modules/miio/lib/discovery.js"(exports, module2) {
    "use strict";
    var { TimedDiscovery, BasicDiscovery, search, addService, removeService } = require_tinkerhub_discovery();
    var { Children } = require_abstract_things();
    var util = require("util");
    var dns = require("dns");
    var network = require_network2();
    var infoFromHostname = require_infoFromHostname();
    var connectToDevice = require_connectToDevice();
    var tryAdd = Symbol("tryAdd");
    var Browser = module2.exports.Browser = class Browser extends TimedDiscovery {
      static get type() {
        return "miio";
      }
      constructor(options) {
        super({
          maxStaleTime: (options.cacheTime || 1800) * 1e3
        });
        if (typeof options.useTokenStorage !== "undefined" ? options.useTokenStorage : true) {
          this.tokens = require_tokens();
        }
        this.manualTokens = options.tokens || {};
        this[tryAdd] = this[tryAdd].bind(this);
        this.start();
      }
      _manualToken(id) {
        return this.manualTokens[id] || null;
      }
      start() {
        this.handle = network.ref();
        network.on("device", this[tryAdd]);
        super.start();
      }
      stop() {
        super.stop();
        network.removeListener("device", this[tryAdd]);
        this.handle.release();
      }
      [search]() {
        network.search();
      }
      [tryAdd](device) {
        const service = {
          id: device.id,
          address: device.address,
          port: device.port,
          token: device.token || this._manualToken(device.id),
          autoToken: device.autoToken,
          connect: function(options = {}) {
            return connectToDevice(Object.assign({
              address: this.address,
              port: this.port,
              model: this.model
            }, options));
          }
        };
        const add = () => this[addService](service);
        setTimeout(add, 5e3);
        dns.lookupService(service.address, service.port, (err, hostname) => {
          if (err || !hostname) {
            add();
            return;
          }
          service.hostname = hostname;
          const info = infoFromHostname(hostname);
          if (info) {
            service.model = info.model;
          }
          add();
        });
      }
      [util.inspect.custom]() {
        return "MiioBrowser{}";
      }
    };
    var Devices = class extends BasicDiscovery {
      static get type() {
        return "miio:devices";
      }
      constructor(options) {
        super();
        this._filter = options && options.filter;
        this._skipSubDevices = options && options.skipSubDevices;
        this._browser = new Browser(options).map((reg) => {
          return connectToDevice({
            address: reg.address,
            port: reg.port,
            model: reg.model,
            withPlaceholder: true
          });
        });
        this._browser.on("available", (s) => {
          this[addService](s);
          if (s instanceof Children) {
            this._bindSubDevices(s);
          }
        });
        this._browser.on("unavailable", (s) => {
          this[removeService](s);
        });
      }
      start() {
        super.start();
        this._browser.start();
      }
      stop() {
        super.stop();
        this._browser.stop();
      }
      [util.inspect.custom]() {
        return "MiioDevices{}";
      }
      _bindSubDevices(device) {
        if (this._skipSubDevices)
          return;
        const handleAvailable = (sub) => {
          if (!sub.miioModel)
            return;
          const reg = {
            id: sub.internalId,
            model: sub.model,
            type: sub.type,
            parent: device,
            device: sub
          };
          if (this._filter && !this._filter(reg)) {
            return;
          }
          this[addService](sub);
        };
        device.on("thing:available", handleAvailable);
        device.on("thing:unavailable", (sub) => this[removeService](sub.id));
        for (const child of device.children()) {
          handleAvailable(child);
        }
      }
    };
    module2.exports.Devices = Devices;
  }
});

// node_modules/miio/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/miio/lib/index.js"(exports, module2) {
    "use strict";
    var discovery = require_discovery2();
    module2.exports.models = require_models();
    module2.exports.device = require_connectToDevice();
    module2.exports.infoFromHostname = require_infoFromHostname();
    module2.exports.browse = function(options) {
      return new discovery.Browser(options || {});
    };
    module2.exports.devices = function(options) {
      return new discovery.Devices(options || {});
    };
  }
});

// src/app.js
var dotenv = require_main();
var miio = require_lib2();
var dotenv_path = process.cwd() + "\\.env";
process.argv.slice(2).forEach(function(val, index, array) {
  const data = array[index].split("=");
  switch (data[0]) {
    case "config":
    case "-c":
    case "--config":
      dotenv_path = data[1];
  }
});
dotenv.config({ path: dotenv_path });
var config = {
  config_file: dotenv_path,
  device_ip: process.env.DEVICE_IP,
  device_token: process.env.DEVICE_TOKEN,
  debug: process.env.DEBUG == "true",
  log_file: process.env.LOG_FILE || "",
  console_log_date: process.env.CONSOLE_LOG_DATE == "false",
  connect_retry: process.env.CONNECT_RETRY || 60,
  use_aqi_change_event: process.env.USE_AQI_CHANGE_EVENT == "false",
  aqi_check_period: process.env.AQI_CHECK_PERIOD || 60,
  aqi_disable_threshold: process.env.AQI_DISABLE_THRESHOLD || 5,
  aqi_enable_threshold: process.env.AQI_ENABLE_THRESHOLD || 10,
  time_enable: process.env.TIME_ENABLE || "08:00",
  time_disable: process.env.TIME_DISABLE || "00:00",
  time_silent: process.env.TIME_SILENT || "22:00"
};
if (!process.env.DEVICE_IP) {
  log("DEVICE_IP not defined!");
  process.exit();
}
if (!process.env.DEVICE_TOKEN) {
  log("DEVICE_TOKEN not defined!");
  process.exit();
}
if (parseInt(config.aqi_enable_threshold) <= parseInt(config.aqi_disable_threshold)) {
  log("AQI_ENABLE_THRESHOLD must be bigger than AQI_DISABLE_THRESHOLD!");
  process.exit();
}
if (config.debug) {
  log("Configuration", config);
}
process.on("uncaughtException", function(exception) {
  log("Uncaught exception", exception);
});
device_connection();
function log(text, variable = null) {
  const date_prefix = "[" + getFormattedDate() + "] ";
  let console_prefix = "";
  if (config.console_log_date) {
    console_prefix = date_prefix;
  }
  if (variable !== null) {
    console.log(console_prefix + text, variable);
  } else {
    console.log(console_prefix + text);
  }
  if (config.log_file !== "") {
    const fs = require("fs");
    const file = fs.createWriteStream(config.log_file, { flags: "a" });
    if (variable !== null) {
      file.write(date_prefix + text + " " + JSON.stringify(variable) + "\n");
    } else {
      file.write(date_prefix + text + "\n");
    }
  }
}
function handleError(error) {
  log(error);
}
function getFormattedDate() {
  var d = new Date();
  return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
}
function getTime(seconds = true) {
  const d = new Date();
  return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + (seconds ? ":" + ("0" + d.getSeconds()).slice(-2) : "");
}
function device_connection() {
  let connectionInterval = null;
  log("Connecting...");
  miio.device({
    address: config.device_ip,
    token: config.device_token
  }).then((device) => {
    if (config.debug) {
      log("Connected to", device);
      device.loadProperties(["power", "mode", "aqi", "favorite_rpm", "filter_life_remaining", "filter_hours_used", "led_brightness_level", "buzzer"]).then((result) => log("Device state", result));
    } else {
      log("Connected to", device.miioModel);
    }
    if (device.matches("type:air-purifier")) {
      set_schedule_rules(device);
      if (connectionInterval) {
        clearInterval(connectionInterval);
      }
    } else {
      log("This device is not Air Purifier");
      process.exit();
    }
  }).catch((error) => {
    handleError(error);
    log("Will retry in " + config.connect_retry + " seconds...");
    if (!connectionInterval) {
      connectionInterval = setInterval(function() {
        device_connection();
      }, config.connect_retry * 1e3);
    }
  });
}
function switchPower(device, value = true) {
  device.setPower(value).then(() => log("Switched power to", value)).catch((error) => handleError(error));
}
function switchMode(device, value = "auto") {
  device.setMode(value).then((mode) => log("Switched mode to", mode)).catch((error) => handleError(error));
}
function set_schedule_rules(device) {
  if (config.use_aqi_change_event) {
    log("Registering AQI change event handler");
    device.on("pm2.5Changed", (value) => {
      log("AQI value is", value);
      control_device_on_off(device, value);
    });
  } else {
    setInterval(() => {
      device.loadProperties(["aqi"]).then((result) => {
        log("AQI value is", result["aqi"]);
        control_device_on_off(device, result["aqi"]);
      });
    }, config.aqi_check_period * 1e3);
  }
  setInterval(() => {
    if (getTime(false) == config.time_disable) {
      device.power().then((isOn) => {
        if (isOn === true) {
          switchPower(device, false);
        }
      });
    } else if (getTime(false) == config.time_silent) {
      device.mode().then((mode) => {
        if (mode != "silent" && mode != "favorite") {
          switchMode(device, "silent");
        }
      });
    }
  }, 1e3);
}
function control_device_on_off(device, aqi) {
  const time = getTime();
  let time_disable = config.time_disable;
  if (config.time_disable < config.time_enable && config.time_disable.split(":")[0] == "00" && time <= "23:59:59") {
    time_disable = "23:59";
  }
  if (time >= config.time_enable + ":00" && time < time_disable + ":00") {
    device.mode().then((mode) => {
      if (mode === "favorite") {
        return;
      }
      if (aqi >= config.aqi_enable_threshold) {
        if (time < config.time_silent + ":00") {
          if (mode !== "auto") {
            switchMode(device, "auto");
          }
        }
        device.power().then((isOn) => {
          if (isOn === false) {
            switchPower(device, true);
          }
        });
      } else if (aqi <= config.aqi_disable_threshold) {
        device.power().then((isOn) => {
          if (isOn === true) {
            switchPower(device, false);
          }
        });
      }
    });
  }
}
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
/**
 * @author  Jack'lul <jacklul.github.io>
 * @license MIT
 */
/**
 * @preserve
 * JS Implementation of incremental MurmurHash3 (r150) (as of May 10, 2013)
 *
 * @author <a href="mailto:jensyt@gmail.com">Jens Taylor</a>
 * @see http://github.com/homebrewing/brauhaus-diff
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 */
/**
 * event-lite.js - Light-weight EventEmitter (less than 1KB when gzipped)
 *
 * @copyright Yusuke Kawasaki
 * @license MIT
 * @constructor
 * @see https://github.com/kawanet/event-lite
 * @see http://kawanet.github.io/event-lite/EventLite.html
 * @example
 * var EventLite = require("event-lite");
 *
 * function MyClass() {...}             // your class
 *
 * EventLite.mixin(MyClass.prototype);  // import event methods
 *
 * var obj = new MyClass();
 * obj.on("foo", function() {...});     // add event listener
 * obj.once("bar", function() {...});   // add one-time event listener
 * obj.emit("foo");                     // dispatch event
 * obj.emit("bar");                     // dispatch another event
 * obj.off("foo");                      // remove event listener
 */
