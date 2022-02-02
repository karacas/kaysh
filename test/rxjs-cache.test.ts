import { of } from 'rxjs/internal/observable/of';
import { delay, map, tap } from 'rxjs/operators';
import { kayshOperator, rxjsKaysh, simpleKaysh } from '../src/';

const _log = console.log;
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
  return httpFake(count).pipe(
    tap(() => _dataCachedSharedCount++),
    kayshOperator(defaultKey, count, options, forceUpdate)
  );
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

  await _timeout(maxTime + 10);

  cache = await getDataCached(0, false, { maxTime: maxTime }).toPromise();
  expect(cache.val).toBe(1);

  httpFakeCounter++;
  await _timeout(10);

  cache = await getDataCached(0, false, { maxTime: maxTime }).toPromise();
  expect(cache.val).toBe(1);

  await _timeout(maxTime + 10);

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
  return of(typeof args === 'string' ? args : { ...args, add: args.add + 1 + getDataCachedComplexCounter }).pipe(
    tap(v => {
      getDataCachedComplexCounter++;
    }),
    kayshOperator(defaultKey, args, options, forceUpdate)
  );
};

test('Test set/get rx', async function() {
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
  return of(getDataCachedSimpleCounter === 0 ? args : args + getDataCachedSimpleCounter).pipe(
    tap(v => {
      getDataCachedSimpleCounter++;
    }),
    kayshOperator(defaultKey, args, options, forceUpdate)
  );
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

const testCustomPipe = (args?, forceUpdate = false, options?) => {
  return httpFake(args).pipe(
    tap(() => _dataCachedSharedCount++),
    kayshOperator('testCustomPipe', args, { localStorage: true }, forceUpdate)
  );
};

test('Test customOperator', async function() {
  httpFakeCounter = 0;
  rxjsKaysh.resetAllCaches();

  let obs = testCustomPipe();
  let cache1 = obs.toPromise();
  let cache2 = obs.toPromise();

  expect(cache1).toStrictEqual(cache2);

  httpFakeCounter++;

  let obs2 = testCustomPipe();
  let cache3 = await obs2.toPromise();
  let cache4 = await obs2.toPromise();
  let cache1B = await obs.toPromise();

  expect(cache3).toStrictEqual(cache4);
  expect(cache3).toStrictEqual(cache1B);
  expect(cache3).not.toStrictEqual(cache1);

  let obs3 = testCustomPipe(undefined, true);
  let cache5 = await obs3.toPromise();
  let cache6 = await obs3.toPromise();

  expect(cache5).toStrictEqual(cache6);
  expect(cache5).not.toStrictEqual(cache1B);

  let obs4 = testCustomPipe(3);
  let cache7 = await obs4.toPromise();
  let cache8 = await obs4.toPromise();

  expect(cache7).toStrictEqual(cache8);
  expect(cache7).not.toStrictEqual(cache5);
});

test('Test customOperator LS', async function() {
  httpFakeCounter = 0;
  _dataCachedSharedCount = 0;
  rxjsKaysh.resetAllCaches();

  let _testCustomPipe1 = testCustomPipe();
  httpFakeCounter++;
  let _testCustomPipe2 = testCustomPipe();

  let cache1 = await _testCustomPipe1.toPromise();
  let cache2 = await _testCustomPipe2.toPromise();
  expect(cache1.val).toStrictEqual(cache2.val);

  let call2 = _dataCachedSharedCount;
  expect(call2).toStrictEqual(1);

  simpleKaysh.__simulateRefresh();

  let cache3 = await testCustomPipe().toPromise();
  expect(cache3.val).toStrictEqual(cache1.val);

  let call3 = _dataCachedSharedCount;
  expect(call3).toStrictEqual(call2);

  simpleKaysh.resetCache('testCustomPipe');

  let cache4 = await testCustomPipe().toPromise();
  expect(cache4.val).not.toStrictEqual(cache1.val);

  let call4 = _dataCachedSharedCount;
  expect(call4).toStrictEqual(call3 + 1);

  let cache5 = await testCustomPipe().toPromise();
  expect(cache5.val).toStrictEqual(cache4.val);
});
