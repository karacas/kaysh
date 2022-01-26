import { of } from 'rxjs/internal/observable/of';
import { delay } from 'rxjs/operators';
import { rxjsKaysh } from '../src/';

const _timeout = ms => new Promise(res => setTimeout(res, ms));

let defaultKey = String(~~(Math.random() * 10000000));

let httpFakeCounter = 0;
const httpFake = (count = 0) => {
  const val = { val: httpFakeCounter + count };
  return of(val).pipe(delay(10));
};

// EXAMPLE
let _dataCachedSharedCount = 0;
const getDataCached = (count?, forceUpdate = false, options?) => {
  const cache = rxjsKaysh.getRxjsObservableCacheValue(defaultKey, count);
  if (forceUpdate === false && cache != null) return cache;

  _dataCachedSharedCount++;
  const rv = httpFake(count);

  return rxjsKaysh.setRxjsObservableCacheValue(rv, defaultKey, count, options);
};

test('Test get ShareReplay', async function() {
  getDataCached(0)
    .toPromise()
    .then(v => {
      expect(_dataCachedSharedCount).toBe(1);
      expect(v.val).toBe(0);
    });

  getDataCached(0)
    .toPromise()
    .then(v => {
      expect(_dataCachedSharedCount).toBe(1);
      expect(v.val).toBe(0);
    });

  getDataCached(0)
    .toPromise()
    .then(v => {
      expect(_dataCachedSharedCount).toBe(1);
      expect(v.val).toBe(0);
    });

  getDataCached(0)
    .toPromise()
    .then(v => {
      expect(_dataCachedSharedCount).toBe(1);
      expect(v.val).toBe(0);
    });

  httpFakeCounter++;

  let cache = await getDataCached(0).toPromise();
  let cache2 = await getDataCached(0).toPromise();
  let cache3 = await getDataCached(0).toPromise();

  expect(_dataCachedSharedCount).toBe(1);
  expect(cache.val).toBe(0);
  expect(cache2.val).toBe(0);
  expect(cache3.val).toBe(0);

  rxjsKaysh.resetCache(defaultKey);

  let cache4 = await getDataCached(0).toPromise();
  expect(_dataCachedSharedCount).toBe(2);
  expect(cache4.val).toBe(1);
});

test('Test get cache A', async function() {
  let cache;
  httpFakeCounter = 0;
  rxjsKaysh.resetAllCaches();

  let test1 = getDataCached(0);

  test1.toPromise().then(v => {
    expect(v.val).toBe(0);
  });

  test1.toPromise().then(v => {
    expect(v.val).toBe(0);
  });

  cache = await getDataCached(0).toPromise();
  expect(cache.val).toBe(0);

  httpFakeCounter++;

  cache = await getDataCached(0).toPromise();
  expect(cache.val).toBe(0);

  httpFakeCounter++;

  rxjsKaysh.resetCache(defaultKey);

  cache = await getDataCached(0).toPromise();
  expect(cache.val).toBe(2);
});

test('Test get cache B', async function() {
  let cache;
  httpFakeCounter = 0;
  rxjsKaysh.resetAllCaches();

  cache = await getDataCached(0).toPromise();
  expect(cache.val).toBe(0);

  httpFakeCounter++;

  cache = await getDataCached(0, false).toPromise();
  expect(cache.val).toBe(0);

  cache = await getDataCached(0, true).toPromise();
  expect(cache.val).toBe(1);

  cache = await getDataCached(0, false).toPromise();
  expect(cache.val).toBe(1);

  rxjsKaysh.resetAllCaches();

  httpFakeCounter++;

  cache = await getDataCached(0).toPromise();
  expect(cache.val).toBe(2);
});

test('Test get cache noKey', async function() {
  let cache;
  httpFakeCounter = 0;
  rxjsKaysh.resetAllCaches();

  cache = await getDataCached().toPromise();
  expect(cache.val).toBe(0);

  httpFakeCounter++;

  cache = await getDataCached().toPromise();
  expect(cache.val).toBe(0);

  rxjsKaysh.resetCache(defaultKey);

  cache = await getDataCached().toPromise();
  expect(cache.val).toBe(1);
});

test('Test MaxTime', async function() {
  let cache;
  httpFakeCounter = 0;
  rxjsKaysh.resetAllCaches();

  let maxTime = 100;

  cache = await getDataCached(0, false, { maxTime: maxTime }).toPromise();
  expect(cache.val).toBe(0);

  httpFakeCounter++;

  cache = await getDataCached(0, false, { maxTime: maxTime }).toPromise();
  expect(cache.val).toBe(0);

  await _timeout(10);

  cache = await getDataCached(0, false, { maxTime: maxTime }).toPromise();
  expect(cache.val).toBe(0);

  await _timeout(maxTime);

  cache = await getDataCached(0, false, { maxTime: maxTime }).toPromise();
  expect(cache.val).toBe(1);

  httpFakeCounter++;
  await _timeout(10);

  cache = await getDataCached(0, false, { maxTime: maxTime }).toPromise();
  expect(cache.val).toBe(1);

  await _timeout(maxTime);

  cache = await getDataCached(0, false, { maxTime: maxTime }).toPromise();
  expect(cache.val).toBe(2);
});

test('Test MaxItems', async function() {
  let cache;
  httpFakeCounter = 0;
  rxjsKaysh.resetAllCaches();

  cache = await getDataCached(200, false, { maxItems: 1 }).toPromise();
  expect(cache.val).toBe(200);

  cache = await getDataCached(200, false, { maxItems: 1 }).toPromise();
  expect(cache.val).toBe(200);

  cache = await getDataCached(200, false, { maxItems: 1 }).toPromise();
  expect(cache.val).toBe(200);

  cache = await getDataCached(201, false, { maxItems: 1 }).toPromise();
  expect(cache.val).toBe(201);

  cache = await getDataCached(202, false, { maxItems: 1 }).toPromise();
  expect(cache.val).toBe(202);

  httpFakeCounter++;

  cache = await getDataCached(200, false, { maxItems: 1 }).toPromise();
  expect(cache.val).toBe(201);

  cache = await getDataCached(201, false, { maxItems: 1 }).toPromise();
  expect(cache.val).toBe(202);

  httpFakeCounter++;

  cache = await getDataCached(200, false, { maxItems: 1 }).toPromise();
  expect(cache.val).toBe(202);
});

let getDataCachedComplexCounter = 0;
const getDataCachedComplex = (args?, forceUpdate = false, options?) => {
  const cache = rxjsKaysh.getRxjsObservableCacheValue(defaultKey, args);
  if (forceUpdate === false && cache != null) return cache;

  const rv = of(typeof args === 'string' ? args : { ...args, add: args.add + 1 + getDataCachedComplexCounter });
  getDataCachedComplexCounter++;

  return rxjsKaysh.setRxjsObservableCacheValue(rv, defaultKey, args, options);
};

test('Test set/get rx localStorage', async function() {
  getDataCachedComplexCounter = 0;
  let res = { test: 1, test2: [1, 2, 4, 5, 6, 7], add: 0 };

  let cache = await getDataCachedComplex(res, false).toPromise();
  expect(cache).toStrictEqual({ ...res, add: res.add + 1 });

  let cache2 = await getDataCachedComplex(res, false).toPromise();
  expect(cache2).toStrictEqual(cache);

  getDataCachedComplexCounter = 0;
  let res2 = { test: 1, test2: [1, 2, 4, 5, 6, 7], add: 1 };

  let cache3 = await getDataCachedComplex(res2, false).toPromise();
  expect(cache3).toStrictEqual({ ...res2, add: res2.add + 1 });

  let cache4 = await getDataCachedComplex(res2, false).toPromise();
  expect(cache4).toStrictEqual(cache3);
});

let getDataCachedSimpleCounter = 0;
const getDataCachedSimple = (args?, forceUpdate = false, options?) => {
  const cache = rxjsKaysh.getRxjsObservableCacheValue(defaultKey, args);
  if (forceUpdate === false && cache != null) return cache;

  const rv = of(getDataCachedSimpleCounter === 0 ? args : args + getDataCachedSimpleCounter);
  getDataCachedSimpleCounter++;

  return rxjsKaysh.setRxjsObservableCacheValue(rv, defaultKey, args, options);
};

test('Test simpleValues', async function() {
  getDataCachedSimpleCounter = 0;
  let cacheB = await getDataCachedSimple('').toPromise();
  expect(cacheB).toBe('');
  await _timeout(16);
  let cacheB2 = await getDataCachedSimple('').toPromise();
  expect(cacheB2).toBe('');

  getDataCachedSimpleCounter = 0;
  let cacheC = await getDataCachedSimple('A').toPromise();
  expect(cacheC).toBe('A');
  await _timeout(16);
  let cacheC2 = await getDataCachedSimple('A').toPromise();
  expect(cacheC2).toBe('A');

  getDataCachedSimpleCounter = 0;
  let cacheD = await getDataCachedSimple(1).toPromise();
  expect(cacheD).toBe(1);
  await _timeout(16);
  let cacheD2 = await getDataCachedSimple(1).toPromise();
  expect(cacheD2).toBe(1);

  getDataCachedSimpleCounter = 0;
  let cacheE = await getDataCachedSimple([]).toPromise();
  expect(cacheE).toStrictEqual([]);
  await _timeout(16);
  let cacheE2 = await getDataCachedSimple([]).toPromise();
  expect(cacheE2).toStrictEqual([]);

  getDataCachedSimpleCounter = 0;
  let cacheF = await getDataCachedSimple([1]).toPromise();
  expect(cacheF).toStrictEqual([1]);
  await _timeout(16);
  let cacheF2 = await getDataCachedSimple([1]).toPromise();
  expect(cacheF2).toStrictEqual([1]);

  getDataCachedSimpleCounter = 0;
  let cacheG = await getDataCachedSimple(['']).toPromise();
  expect(cacheG).toStrictEqual(['']);
  await _timeout(16);
  let cacheG2 = await getDataCachedSimple(['']).toPromise();
  expect(cacheG2).toStrictEqual(['']);

  getDataCachedSimpleCounter = 0;
  let cacheNull = await getDataCachedSimple(null).toPromise();
  expect(cacheNull).toStrictEqual(null);
  await _timeout(16);
  let cacheNull2 = await getDataCachedSimple(null).toPromise();
  expect(cacheNull2).toStrictEqual(null);

  getDataCachedSimpleCounter = 0;
  let cacheH = await getDataCachedSimple([null]).toPromise();
  expect(cacheH).toStrictEqual([null]);
  await _timeout(16);
  let cacheH2 = await getDataCachedSimple([null]).toPromise();
  expect(cacheH2).toStrictEqual([null]);

  getDataCachedSimpleCounter = 0;
  let cacheI = await getDataCachedSimple(['A']).toPromise();
  expect(cacheI).toStrictEqual(['A']);
  await _timeout(16);
  let cacheI2 = await getDataCachedSimple(['A']).toPromise();
  expect(cacheI2).toStrictEqual(['A']);
});
