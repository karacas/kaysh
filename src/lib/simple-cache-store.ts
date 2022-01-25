import { isObservable } from 'rxjs/internal/util/isObservable';
import { __objToHash } from './_aux';

//TODO: Name
//TODO: Documentation

const _isTest = process.env.NODE_ENV === 'test';

if (_isTest) if (false) console.log('test');

const _log = console.log;

let _localStorageParentKey = 'RXJS-CACHE-KEY-V1';
let _localStorageMaxGlobalTime = 0;
let _localStorage;
let _localStorageLoaded = false;
declare var window;

const memoFuncPrefix = 'RXJS-CACHE-MEMO-FUNC__';

_localStorage = window.localStorage;

export interface StoredValueModelObjRoot {
  [key: string]: StoredValueModelObj;
}

export interface StoredValueModelObj {
  [key: string]: StoredValueModel;
}

export interface StoredValueModel {
  value: any;
  date: number;
  localStored?: boolean;
  config?: DefaultConfigCacheModel;
}

export interface DefaultConfigCacheModel {
  localStorage?: boolean;
  maxTime?: number;
  maxTimeLocalStorage?: number;
  maxItems?: number;
}

const defaultConfig: DefaultConfigCacheModel = {
  localStorage: false,
  maxTime: 0,
  maxItems: 10,
};

let store_state: StoredValueModelObjRoot = {};

function setCacheValue(key: string, value: any, payloadToHash?: any, config?: DefaultConfigCacheModel) {
  if (key == null) return;
  if (value === undefined) return;

  const _hash = __objToHash(payloadToHash);

  const _obj = {
    value,
    date: Date.now().valueOf(),
    localStored: false,
    config: {
      ...defaultConfig,
      ...(config || (store_state[key] || {})?.config),
    },
  };

  //Add Obj
  let stateObjs: StoredValueModelObj = {
    ...store_state[key],
    [_hash]: _obj,
  };

  //Check MaxItems
  let maxItems = Number(_obj?.config?.maxItems);
  let obj = store_state[key];
  if (obj != null && Object.keys(obj).length > Number(maxItems)) stateObjs = __sortStoredValueModelByDate(stateObjs, maxItems);

  store_state[key] = stateObjs;

  if (false) _log(JSON.stringify({ store_state, _hash, payloadToHash }, null, 2));

  if (__isValidLocalStorageItem(value) && config?.localStorage === true) __updateLocalStorage();

  //check Promise
  if (__isPromise(value)) {
    value.then(_val => {
      if (_val != null) setCacheValue(key, _val, payloadToHash, config);
    });
  }
}

function getCacheValue(key: string, payloadToHash?: any): any {
  if (true && typeof window !== 'undefined' && _localStorageLoaded === false) __setLocalStoredToStore();

  if (store_state[key] == null) return store_state[key];

  const _hash = __objToHash(payloadToHash);
  const objKeyValue: StoredValueModel = store_state[key][_hash];
  if (objKeyValue == null) return objKeyValue;

  if (false && _isTest) _log(JSON.stringify(store_state, null, 2));

  //Is maxTime
  if ((objKeyValue.config?.maxTime || objKeyValue.config.localStorage) && !__checkValidItemDate(objKeyValue)) return null;

  if (objKeyValue.value == null) return objKeyValue.value;

  if (typeof objKeyValue.value === 'object') return Object.freeze(objKeyValue.value);

  return objKeyValue.value;
}

function resetCache(key: string, payloadToHash?: any) {
  if (key == null) return;

  if (payloadToHash !== undefined) {
    const _hash = __objToHash(payloadToHash);
    if (store_state && key in store_state && _hash in store_state[key]) {
      let resetLocalStorage = __isLocalStorageItem(store_state[key][_hash]);

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

function memoFunction(func: Function, prefix: string = memoFuncPrefix, config?: DefaultConfigCacheModel) {
  let funcName = func.name || '__memoized';
  let funcKey = prefix + func.name;

  if (false) _log('funcName', funcName);

  var object = {
    [funcName]: function(...restArgs) {
      const cache = getCacheValue(funcKey, restArgs);
      if (cache !== undefined) return cache;

      const res = func.apply(this, restArgs);
      setCacheValue(funcKey, res, restArgs, config);
      return res;
    },
  };

  return object[funcName];
}

function resetMemoFunction(funcOrName: Function | string, prefix: string = memoFuncPrefix) {
  let funcKey;

  if (typeof funcOrName === 'string') {
    funcKey = prefix + funcOrName;
  } else {
    funcKey = prefix + funcOrName.name;
  }

  const memoized = function(...restArgs) {
    if (restArgs !== undefined && restArgs.length) {
      resetCache(funcKey, restArgs);
    } else {
      resetCache(funcKey);
    }
  };

  return memoized;
}

function memoFunctionDecorator(config?: DefaultConfigCacheModel, prefix?) {
  const instanceMap = new WeakMap();
  return (target, propertyKey, descriptor) => {
    const input = target[propertyKey]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access

    if (typeof input !== 'function') {
      throw new TypeError('The decorated value must be a function');
    }

    delete descriptor.value;
    delete descriptor.writable;

    descriptor.get = function() {
      if (!instanceMap.has(this)) {
        const value = memoFunction(input, prefix, config);
        instanceMap.set(this, value);
        return value;
      }
      return instanceMap.get(this);
    };
  };
}

function __sortStoredValueModelByDate(StoredValuel: StoredValueModelObj, max: number = Infinity): StoredValueModelObj {
  return Object.entries({ ...StoredValuel })
    .sort(([, a], [, b]) => Number(b.date) - Number(a.date))
    .slice(0, max)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {} as any);
}

function __isRxjsObservableObj(value: any) {
  if (value == null) return false;

  if (isObservable(value)) return true;

  return typeof value === 'object' && '_isScalar' in value && 'source' in value;
}

//TODO: Validar con test
function __isPromise(value: any) {
  return value != null && Object.prototype.toString.call(value) === '[object Promise]';
}

function __isValidLocalStorageItem(val) {
  return val != null && !__isRxjsObservableObj(val) && !__isPromise(val);
}

function __isLocalStorageItem(val, isToLoadData = false) {
  let rv = __isValidLocalStorageItem(val) && val?.config?.localStorage === true && val?.date > 0;

  if (isToLoadData) {
    rv = rv && val.localStored === true;
  }

  return rv;
}

function __filterLocalStorageItems(state: any, isToLoadData?: boolean) {
  if (state == null) return state;

  let rv = {};
  let _state = { ...state };

  Object.entries(_state).forEach(([key, value]) => {
    if (value != null && typeof value === 'object' && Object.keys(value).length > 0) {
      //SUBKEY
      rv[key] = { ..._state[key] };

      Object.entries(value).forEach(([key2, value2]) => {
        if (__isLocalStorageItem(value2, isToLoadData)) {
          rv[key][key2] = { ...value2, localStored: true };
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
  if (!_localStorage) return;

  let store_stateClone = __filterLocalStorageItems(store_state);

  if (store_stateClone != null && typeof store_stateClone === 'object' && Object.keys(store_stateClone).length > 0) {
    _localStorage.setItem(_localStorageParentKey, JSON.stringify(store_stateClone));
  } else {
    __clearLocalStorage();
  }

  if (false) _log('[updateLocalStorage]', JSON.stringify(store_stateClone, null, 2));
  if (false) _log('[updateLocalStorage]', JSON.stringify(store_state, null, 2));
}

function __checkValidItemDate(objKeyValue: StoredValueModel): boolean {
  let max = Number(objKeyValue.config?.maxTime);

  if (objKeyValue.config.localStorage && _localStorageMaxGlobalTime > 0) {
    max = max === 0 ? _localStorageMaxGlobalTime : Math.min(max, _localStorageMaxGlobalTime);
  }

  if (!(max > 0)) return true;

  let now = Date.now().valueOf();
  let date = Number(objKeyValue.date);
  let maxDate = date + max;

  return !(now > maxDate);
}

function __getLocalStorageClass() {
  return _localStorage;
}

function __setLocalStoredToStore() {
  if (_localStorage?.getItem == null || !_localStorageParentKey?.length) return;
  if (!_isTest && _localStorageLoaded) return;

  const dataStored = _localStorage.getItem(_localStorageParentKey);

  if (dataStored == null) return;

  let storeStateObject = JSON.parse(dataStored);

  if (storeStateObject != null) {
    store_state = __filterLocalStorageItems(storeStateObject, true);
    _localStorageLoaded = true;
  }
}

function __getLocalStorageGlobalKey() {
  return _localStorageParentKey;
}

function __setLocalStorageGlobals(parentKey: string, maxGlobalTime: number = null) {
  if (parentKey == null && maxGlobalTime == null) return;

  __clearLocalStorage();

  if (parentKey != null) _localStorageParentKey = parentKey;

  if (maxGlobalTime != null) _localStorageMaxGlobalTime = maxGlobalTime;
}

function __clearLocalStorage() {
  if (_localStorage == null) return;

  _localStorage.removeItem(_localStorageParentKey);

  _localStorageLoaded = false;
}

function __getStoreState() {
  if (store_state == null) return null;

  return Object.freeze({ ...store_state } as any);
}

function __simulateRefresh() {
  if (_isTest) {
    if (false) _log('[simulateRefresh]');
    store_state = {};
    __setLocalStoredToStore();
  }
}

const __simpleCacheStore = {
  setCacheValue,
  getCacheValue,
  resetCache,
  resetAllCaches,
  memoFunction,
  memoFunctionDecorator,
  resetMemoFunction,
  __getLocalStorageClass,
  __setLocalStoredToStore,
  __clearLocalStorage,
  __getLocalStorageGlobalKey,
  __getStoreState,
  __sortStoredValueModelByDate,
  __simulateRefresh,
  __setLocalStorageGlobals,
  __isPromise,
};

export { __simpleCacheStore };
