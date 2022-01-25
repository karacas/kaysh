import { of } from 'rxjs/internal/observable/of';
import { delay } from 'rxjs/internal/operators/delay';
import { simpleCacheStore } from '../src';
import { rxjsCacheStore } from '../src/index';
import { StoredValueModelObjRoot } from '../src/lib/simple-cache-store';
import { __objToHash } from '../src/lib/_aux';

const _log = console.log;
const _timeout = ms => new Promise(res => setTimeout(res, ms));

let defaultKey = String(~~(Math.random() * 10000000));

let httpFakeCounter = 0;
const httpFake = (count = 0) => {
  const val = { val: httpFakeCounter + count };
  return of(val).pipe(delay(10));
};

// EXAMPLE
const getDataCached = (count?, forceUpdate = false, options?) => {
  const cache = rxjsCacheStore.getRxjsObservableCacheValue(defaultKey, count);
  if (forceUpdate === false && cache != null) return cache;

  const rv = httpFake(count);

  return rxjsCacheStore.setRxjsObservableCacheValue(rv, defaultKey, count, options);
};

test('Test internal localStorage', async function() {
  let _localStorage = simpleCacheStore.__getLocalStorageClass();
  let _objVal = { TEST: 'OK' };

  _localStorage.setItem('TEST', JSON.stringify(_objVal));
  let LS_item = _localStorage.getItem('TEST');

  expect(LS_item).toBe(JSON.stringify(_objVal));
});

test('Test set/get/reset localStorage', async function() {
  httpFakeCounter = 0;
  simpleCacheStore.resetAllCaches();
  let _localStorage = simpleCacheStore.__getLocalStorageClass();

  await getDataCached(1, false, {
    localStorage: true,
  }).toPromise();

  await getDataCached(1, false, {
    localStorage: true,
  }).toPromise();

  await getDataCached(2, false, {
    localStorage: false,
  }).toPromise();

  let localStorage = JSON.parse(_localStorage.getItem(simpleCacheStore.__getLocalStorageGlobalKey()));

  let status: any = simpleCacheStore.__getStoreState();

  expect(Object.keys(localStorage[defaultKey]).length).toBe(1);
  expect(Object.keys(status[defaultKey]).length).toBe(2);

  //TEST RESET
  simpleCacheStore.resetCache(defaultKey, 1);

  let localStorageNull = _localStorage.getItem(simpleCacheStore.__getLocalStorageGlobalKey());

  expect(localStorageNull).toBe(null);
});

test('Test set/get rx localStorage', async function() {
  httpFakeCounter = 0;
  let _localStorage = simpleCacheStore.__getLocalStorageClass();

  let hashVal = __objToHash(501);

  let expected: StoredValueModelObjRoot = {
    [defaultKey]: {
      [hashVal]: {
        value: {
          val: 501,
        },
        date: 1641954577777,
        localStored: true,
        config: {
          localStorage: true,
          maxTime: 0,
          maxItems: 10,
        },
      },
    },
  };

  _localStorage.setItem(simpleCacheStore.__getLocalStorageGlobalKey(), JSON.stringify(expected));
  simpleCacheStore.__setLocalStoredToStore();

  httpFakeCounter++;

  let cache = await getDataCached(501, false).toPromise();
  let cacheB = await getDataCached(501, false).toPromise();
  await _timeout(100);
  let cacheC = await getDataCached(501, false).toPromise();
  let cacheD = await getDataCached(502, false).toPromise();

  let expextedVal = 501 || expected[defaultKey][hashVal].value.val;

  expect(cache.val).toBe(expextedVal);
  expect(cacheB.val).toBe(expextedVal);
  expect(cacheC.val).toBe(expextedVal);
  expect(cacheD.val).toBe(503);

  //RESET
  simpleCacheStore.resetCache(defaultKey);
  httpFakeCounter++;

  let cache2 = await getDataCached(501, false).toPromise();

  expect(cache2.val).toBe(503);
});

test('Test auto localStorage Reset', async function() {
  httpFakeCounter = 0;
  simpleCacheStore.resetAllCaches();

  let cacheA = await getDataCached(11, false, {
    localStorage: true,
  }).toPromise();

  httpFakeCounter++;
  simpleCacheStore.__simulateRefresh();

  let cacheB = await getDataCached(11, false).toPromise();

  expect(cacheA.val).toBe(cacheB.val);
});

test('Test NO localStorage Reset', async function() {
  httpFakeCounter = 0;
  simpleCacheStore.resetAllCaches();

  let cacheA = await getDataCached(11, false, {
    localStorage: false,
  }).toPromise();

  httpFakeCounter++;
  simpleCacheStore.__simulateRefresh();

  let cacheB = await getDataCached(11, false).toPromise();

  expect(cacheA.val + 1).toBe(cacheB.val);
});

test('Test auto localStorage Reset checkMaxGlobalTime', async function() {
  httpFakeCounter = 0;
  simpleCacheStore.resetAllCaches();
  simpleCacheStore.__setLocalStorageGlobals(undefined, 1);

  let cacheA = await getDataCached(11, false, {
    localStorage: true,
  }).toPromise();

  httpFakeCounter++;
  simpleCacheStore.__simulateRefresh();

  let cacheB = await getDataCached(11, false).toPromise();

  expect(cacheA.val).toBe(cacheB.val);

  await _timeout(100);
  simpleCacheStore.__simulateRefresh();

  let cacheC = await getDataCached(11, false).toPromise();

  expect(cacheC.val).toBe(cacheA.val + 1);
});
