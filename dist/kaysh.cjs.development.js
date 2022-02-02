'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var rxjs = require('rxjs');
var isObservable = require('rxjs/internal/util/isObservable');
var operators = require('rxjs/operators');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function __strToHash(str) {
  if (str === void 0) {
    str = '';
  }

  var hash = 0,
      i,
      chr;

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }

  return hash.toString(36);
}

function getShortValue(val) {
  if (Number.isInteger(val) && String(val).length) return 'num_' + val;

  if (typeof val === 'string') {
    if (val.length === 0) return 'emptyString__';
    return 'str_' + val;
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return 'emptyArray__';

    if (val.length === 1) {
      if (Number.isInteger(val[0]) && String(val[0]).length) return '_num_' + val[0];

      if (typeof val[0] === 'string') {
        if (val[0].length === 0) return '_emptyString__';
        return '_str_' + val[0];
      }
    }
  }

  return null;
}

function __objToHash(val, fast) {
  if (fast === void 0) {
    fast = true;
  }

  if (val === undefined) return '__undefined__';
  if (val === null) return '__null__';

  if (fast) {
    var shortValue = getShortValue(val);
    if (shortValue != null && shortValue.length > 0 && shortValue.length < 32) return shortValue;
  }

  return __strToHash(JSON.stringify(val));
}

var _window;
var _localStorageParentKey = 'KAYSH-V1';
var _localStorageMaxGlobalTime = 0;

var _localStorage;

var _localStorageLoaded = false;
var _keyshEnabled = true;
var _keyshLocalStorageEnabled = true;
var memoFuncPrefixId = 'KAYSH-CACHE-MEMO-FUNC__';
_localStorage = (_window = window) == null ? void 0 : _window.localStorage;
var defaultConfig = {
  localStorage: false,
  maxTime: 0,
  maxItems: 10
};
var store_state = {};

function setCacheValue(key, value, argsToHash, config) {
  var _ref, _extends2, _obj$config;

  if (_keyshEnabled !== true) return;
  if (key == null) return;
  if (value === undefined) return;

  var _hash = __objToHash(argsToHash);

  var _obj = {
    value: value,
    date: Date.now().valueOf(),
    localStored: false,
    config: _extends({}, defaultConfig, config || ((_ref = store_state[key] || {}) == null ? void 0 : _ref.config))
  }; //Add Obj

  var stateObjs = _extends({}, store_state[key], (_extends2 = {}, _extends2[_hash] = _obj, _extends2)); //Check MaxItems


  var maxItems = Number(_obj == null ? void 0 : (_obj$config = _obj.config) == null ? void 0 : _obj$config.maxItems);
  var obj = store_state[key];
  if (obj != null && Object.keys(obj).length > Number(maxItems)) stateObjs = __sortStoredValueModelByDate(stateObjs, maxItems);
  store_state[key] = stateObjs;
  if (__isValidLocalStorageItem(value) && (config == null ? void 0 : config.localStorage) === true) __updateLocalStorage(); //check Promise

  if (__isPromise(value)) {
    value.then(function (_val) {
      if (_val != null) setCacheValue(key, _val, argsToHash, config);
    });
  }
}

function getCacheValue(key, argsToHash) {
  var _objKeyValue$config;

  if (_keyshEnabled !== true) return null;
  if ( typeof window !== 'undefined' && _localStorageLoaded === false) __setLocalStoredToStore();
  if (store_state[key] == null) return store_state[key];

  var _hash = __objToHash(argsToHash);

  var objKeyValue = store_state[key][_hash];
  if (objKeyValue == null) return objKeyValue;

  if (((_objKeyValue$config = objKeyValue.config) != null && _objKeyValue$config.maxTime || objKeyValue.config.localStorage) && !__checkValidItemDate(objKeyValue)) return null;
  if (objKeyValue.value == null) return objKeyValue.value;
  if (typeof objKeyValue.value === 'object') return Object.freeze(objKeyValue.value);
  return objKeyValue.value;
}

function resetCache(key, argsToHash) {
  if (key == null) return;

  if (argsToHash !== undefined) {
    var _hash = __objToHash(argsToHash);

    if (store_state && key in store_state && _hash in store_state[key]) {
      var resetLocalStorage = __isLocalStorageItem(store_state[key][_hash]);

      delete store_state[key][_hash];
      if (resetLocalStorage) __updateLocalStorage();
    }

    return;
  }

  if (store_state && key in store_state) {
    delete store_state[key];

    __updateLocalStorage();
  }
}

function resetAllCaches() {
  store_state = {};

  __clearLocalStorage();
}

function memoFunction(func, config, prefixId) {
  var _object;

  if (prefixId === void 0) {
    prefixId = memoFuncPrefixId;
  }

  var funcName = func.name || '__memoized';
  var funcKey = prefixId + func.name;
  var object = (_object = {}, _object[funcName] = function () {
    for (var _len = arguments.length, restArgs = new Array(_len), _key = 0; _key < _len; _key++) {
      restArgs[_key] = arguments[_key];
    }

    var cache = getCacheValue(funcKey, restArgs);
    if (cache !== undefined) return cache;
    var res = func.apply(this, restArgs);
    setCacheValue(funcKey, res, restArgs, config);
    return res;
  }, _object);
  return object[funcName];
}

function resetMemoFunction(function_Or_functionName, prefixId) {
  if (prefixId === void 0) {
    prefixId = memoFuncPrefixId;
  }

  var funcKey;

  if (typeof function_Or_functionName === 'string') {
    funcKey = prefixId + function_Or_functionName;
  } else {
    funcKey = prefixId + function_Or_functionName.name;
  }

  var memoizedReset = function memoizedReset() {
    for (var _len2 = arguments.length, restArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      restArgs[_key2] = arguments[_key2];
    }

    if (restArgs !== undefined && restArgs.length) {
      resetCache(funcKey, restArgs);
    } else {
      resetCache(funcKey);
    }
  };

  return memoizedReset;
}

function memoFunctionDecorator(config, prefixId) {
  var instanceMap = new WeakMap();
  return function (target, propertyKey, descriptor) {
    var input = target[propertyKey]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    if (typeof input !== 'function') {
      throw new TypeError('The decorated value must be a function');
    }

    delete descriptor.value;
    delete descriptor.writable;

    descriptor.get = function () {
      if (!instanceMap.has(this)) {
        var value = memoFunction(input, config, prefixId);
        instanceMap.set(this, value);
        return value;
      }

      return instanceMap.get(this);
    };
  };
}

function __sortStoredValueModelByDate(StoredValuel, max) {
  if (max === void 0) {
    max = Infinity;
  }

  return Object.entries(_extends({}, StoredValuel)).sort(function (_ref2, _ref3) {
    var a = _ref2[1];
    var b = _ref3[1];
    return Number(b.date) - Number(a.date);
  }).slice(0, max).reduce(function (r, _ref4) {
    var _extends3;

    var k = _ref4[0],
        v = _ref4[1];
    return _extends({}, r, (_extends3 = {}, _extends3[k] = v, _extends3));
  }, {});
}

function __isRxjsObservableObj(value) {
  if (value == null) return false;
  if (__isObservable(value)) return true;
  return typeof value === 'object' && value.hasOwnProperty('_isScalar') && value.hasOwnProperty('source');
}

function __isFunction(value) {
  return value != null && typeof value === 'function';
}

function __isObservable(value) {
  var _value$constructor;

  if ((value == null ? void 0 : value.value) != null && __isObservable(value == null ? void 0 : value.value)) return true;
  return value != null && typeof value === 'object' && ((value == null ? void 0 : (_value$constructor = value.constructor) == null ? void 0 : _value$constructor.name) === 'Observable' || __isFunction(value.lift) && __isFunction(value.subscribe));
}

function __isPromise(value) {
  if ((value == null ? void 0 : value.value) != null && __isPromise(value == null ? void 0 : value.value)) return true;
  return value != null && Object.prototype.toString.call(value) === '[object Promise]';
}

function __isValidLocalStorageItem(val) {
  return !__isRxjsObservableObj(val) && !__isPromise(val);
}

function __isLocalStorageItem(val, isToLoadData) {
  var _val$config;

  if (isToLoadData === void 0) {
    isToLoadData = false;
  }

  var rv = __isValidLocalStorageItem(val) && (val == null ? void 0 : (_val$config = val.config) == null ? void 0 : _val$config.localStorage) === true && (val == null ? void 0 : val.date) > 0;

  if (isToLoadData) {
    rv = rv && val.localStored === true;
  }

  return rv;
}

function __filterLocalStorageItems(state, isToLoadData) {
  if (state == null) return state;
  var rv = {};

  var _state = _extends({}, state);

  Object.entries(_state).forEach(function (_ref5) {
    var key = _ref5[0],
        value = _ref5[1];

    if (value != null && typeof value === 'object' && Object.keys(value).length > 0) {
      //SUBKEY
      rv[key] = _extends({}, _state[key]);
      Object.entries(value).forEach(function (_ref6) {
        var key2 = _ref6[0],
            value2 = _ref6[1];

        if (__isLocalStorageItem(value2, isToLoadData)) {
          rv[key][key2] = _extends({}, value2, {
            localStored: true
          });
        } else {
          delete rv[key][key2];
        }
      });

      if (Object.keys(rv[key]).length === 0) {
        if (key in rv) delete rv[key];
      }
    } else {
      if (key in rv) delete rv[key];
    }
  });
  return rv;
}

function __updateLocalStorage() {
  var _localStorage2;

  if (_keyshEnabled !== true || _keyshLocalStorageEnabled !== true) return null;
  if (!((_localStorage2 = _localStorage) != null && _localStorage2.setItem)) return;

  var store_stateClone = __filterLocalStorageItems(store_state);

  if (store_stateClone != null && typeof store_stateClone === 'object' && Object.keys(store_stateClone).length > 0) {
    _localStorage.setItem(_localStorageParentKey, JSON.stringify(store_stateClone));
  } else {
    __clearLocalStorage();
  }
}

function __checkValidItemDate(objKeyValue) {
  var _objKeyValue$config2;

  var max = Number(((_objKeyValue$config2 = objKeyValue.config) == null ? void 0 : _objKeyValue$config2.maxTime) || 0);

  if (objKeyValue.config.localStorage && _localStorageMaxGlobalTime > 0) {
    max = max === 0 ? _localStorageMaxGlobalTime : Math.min(max, _localStorageMaxGlobalTime);
  }

  if (!(max > 0)) return true;
  var now = Date.now().valueOf();
  var date = Number(objKeyValue.date);
  var maxDate = date + max;
  return !(now > maxDate);
}

function __getLocalStorageClass() {
  return _localStorage;
}

function __setLocalStoredToStore() {
  var _localStorage3, _localStorageParentKe;

  if (_keyshEnabled !== true || _keyshLocalStorageEnabled !== true) return null;
  if (((_localStorage3 = _localStorage) == null ? void 0 : _localStorage3.getItem) == null || !((_localStorageParentKe = _localStorageParentKey) != null && _localStorageParentKe.length)) return;
  if ( _localStorageLoaded) return;

  var dataStored = _localStorage.getItem(_localStorageParentKey);

  if (dataStored == null) return;
  var storeStateObject = JSON.parse(dataStored);

  if (storeStateObject != null) {
    store_state = __filterLocalStorageItems(storeStateObject, true);
    _localStorageLoaded = true;
  }
}

function __getLocalStorageGlobalKey() {
  return _localStorageParentKey;
}

function __setLocalStorageGlobals(parentKey, maxGlobalTime, enabled, localStorageEnabled) {
  if (maxGlobalTime === void 0) {
    maxGlobalTime = null;
  }

  if (enabled === void 0) {
    enabled = null;
  }

  if (localStorageEnabled === void 0) {
    localStorageEnabled = null;
  }

  if (parentKey == null && maxGlobalTime == null && enabled == null && localStorageEnabled == null) return;

  __clearLocalStorage();

  if (parentKey != null) _localStorageParentKey = parentKey;
  if (maxGlobalTime != null) _localStorageMaxGlobalTime = maxGlobalTime;
  if (enabled != null) _keyshEnabled = !!enabled;
  if (localStorageEnabled != null) _keyshLocalStorageEnabled = !!localStorageEnabled;
}

function __clearLocalStorage() {
  var _localStorage4;

  if (((_localStorage4 = _localStorage) == null ? void 0 : _localStorage4.removeItem) == null) return;

  _localStorage.removeItem(_localStorageParentKey);

  _localStorageLoaded = false;
}

function __getStoreState() {
  if (store_state == null) return null;
  return Object.freeze(_extends({}, store_state));
}

function __simulateRefresh() {
}

var __simpleCacheStore = {
  setCacheValue: setCacheValue,
  getCacheValue: getCacheValue,
  resetCache: resetCache,
  resetAllCaches: resetAllCaches,
  memoFunction: memoFunction,
  memoFunctionDecorator: memoFunctionDecorator,
  resetMemoFunction: resetMemoFunction,
  __getLocalStorageClass: __getLocalStorageClass,
  __setLocalStoredToStore: __setLocalStoredToStore,
  __clearLocalStorage: __clearLocalStorage,
  __getLocalStorageGlobalKey: __getLocalStorageGlobalKey,
  __getStoreState: __getStoreState,
  __sortStoredValueModelByDate: __sortStoredValueModelByDate,
  __simulateRefresh: __simulateRefresh,
  __setLocalStorageGlobals: __setLocalStorageGlobals,
  __isPromise: __isPromise
};

var getRxjsObservableCacheValue = function getRxjsObservableCacheValue(key, argsToHash) {
  var cache = __simpleCacheStore.getCacheValue(key, argsToHash);

  if (cache == null) return cache;
  if (isObservable.isObservable(cache)) return cache;
  return rxjs.of(cache);
};

var setRxjsObservableCacheValue = function setRxjsObservableCacheValue(stream, key, argsToHash, config) {
  if (stream == null || key == null) return rxjs.of(null);

  var setCache = function setCache($data) {
    if ($data != null) __simpleCacheStore.setCacheValue(key, $data, argsToHash, config);
  };

  var cacheReplay = stream.pipe(operators.shareReplay());
  setCache(cacheReplay);
  return cacheReplay.pipe(operators.shareReplay(), operators.tap(function (_data) {
    return setCache(_data);
  }));
};

var observableCache = function observableCache(stream, key, argsToHash, config, forceUpdate) {
  if (forceUpdate === void 0) {
    forceUpdate = false;
  }

  var cache = getRxjsObservableCacheValue(key, argsToHash);
  if (forceUpdate === false && cache != null) return cache;
  return setRxjsObservableCacheValue(stream, key, argsToHash, config);
};

function kayshOperator(key, argsToHash, config, forceUpdate) {
  if (forceUpdate === void 0) {
    forceUpdate = false;
  }

  function __shareReplayOperator() {
    var subject;
    var refCount = 0;
    var subscription;
    var hasError = false;
    var isComplete = false;
    return function shareReplayOperation(source) {
      refCount++;
      var innerSub;

      if (!subject || hasError) {
        hasError = false;
        subject = new rxjs.ReplaySubject();
        innerSub = subject.subscribe(this);
        subscription = source.subscribe({
          next: function next(value) {
            subject.next(value);
          },
          error: function error(err) {
            hasError = true;
            subject.error(err);
          },
          complete: function complete() {
            isComplete = true;
            subscription = undefined;
            subject.complete();
          }
        });

        if (isComplete) {
          subscription = undefined;
        }
      } else {
        innerSub = subject.subscribe(this);
      }

      this.add(function () {
        refCount--;
        innerSub.unsubscribe();
        innerSub = undefined;

        if (subscription && !isComplete && refCount === 0) {
          subscription.unsubscribe();
          subscription = undefined;
          subject = undefined;
        }
      });
    };
  }

  return function (source) {
    var cacheObs = observableCache(source, key, argsToHash, config, forceUpdate);
    return cacheObs.lift(__shareReplayOperator());
  };
}

var kayshFlushOperator = function kayshFlushOperator(key, argsToHash) {
  return __simpleCacheStore.resetCache(key, argsToHash);
};

var __rxCacheStore = {
  observableCache: observableCache,
  kayshFlushOperator: kayshFlushOperator,
  kayshOperator: kayshOperator,
  getRxjsObservableCacheValue: getRxjsObservableCacheValue,
  setRxjsObservableCacheValue: setRxjsObservableCacheValue,
  resetCache: __simpleCacheStore.resetCache,
  resetAllCaches: __simpleCacheStore.resetAllCaches
};

var kayshOperator$1 = __rxCacheStore.kayshOperator;
var kayshFlushOperator$1 = __rxCacheStore.kayshFlushOperator;
var kayshDecorator = __simpleCacheStore.memoFunctionDecorator;
var kayshMemFunction = __simpleCacheStore.memoFunction;
var kayshFlushMemFunction = __simpleCacheStore.resetMemoFunction;
var kayshFlushAll = __simpleCacheStore.resetAllCaches;
var kayshFlushValue = __simpleCacheStore.resetCache;
var simpleKaysh = __simpleCacheStore;
var rxjsKaysh = __rxCacheStore;

exports.kayshDecorator = kayshDecorator;
exports.kayshFlushAll = kayshFlushAll;
exports.kayshFlushMemFunction = kayshFlushMemFunction;
exports.kayshFlushOperator = kayshFlushOperator$1;
exports.kayshFlushValue = kayshFlushValue;
exports.kayshMemFunction = kayshMemFunction;
exports.kayshOperator = kayshOperator$1;
exports.rxjsKaysh = rxjsKaysh;
exports.simpleKaysh = simpleKaysh;
//# sourceMappingURL=kaysh.cjs.development.js.map
