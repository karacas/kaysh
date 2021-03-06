import { simpleKaysh } from '../src';

const _timeout = ms => new Promise(res => setTimeout(res, ms));
let defaultKey = String(~~(Math.random() * 10000000));

let getDataCachedComplexCounter = 0;
const getDataCachedComplex = (args?, forceUpdate = false, options?) => {
  const cache = simpleKaysh.getCacheValue(defaultKey, args);
  if (forceUpdate === false && cache != null) return cache;

  let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ ...args, add: args.add + getDataCachedComplexCounter });
      getDataCachedComplexCounter++;
    }, 100);
  });

  simpleKaysh.setCacheValue(defaultKey, promise, args, options);

  return promise;
};

test('Test set/get promises', async function() {
  getDataCachedComplexCounter = 0;
  let res = { test: 1, test2: [1, 2, 4, 5, 6, 7], add: 0 };

  let cache = getDataCachedComplex(res, false);
  let cache2 = getDataCachedComplex(res, false);
  let cache3 = getDataCachedComplex(res, false);

  expect(cache).toBe(cache2);
  expect(cache).toBe(cache3);
});

test('Test set/get promises resolved', async function() {
  getDataCachedComplexCounter = 0;
  let res = { test: 2, test2: [1, 2, 4, 5, 6, 7], add: 0 };

  let cache = await getDataCachedComplex(res, false);
  let cache2 = await getDataCachedComplex(res, false);
  let cache3 = await getDataCachedComplex(res, false);

  expect(JSON.stringify(cache)).toBe(JSON.stringify(cache2));
  expect(JSON.stringify(cache)).toBe(JSON.stringify(cache3));
});

test('Test set/get promises resolved LS', async function() {
  simpleKaysh.resetAllCaches();
  getDataCachedComplexCounter = 0;
  let res = { test: 3, test2: [1, 2, 4, 5, 6, 7], add: 0 };

  let cache = getDataCachedComplex(res, false, {
    localStorage: true,
  });

  let cacheB = getDataCachedComplex(res, false, {
    localStorage: true,
  });

  simpleKaysh.__simulateRefresh();

  let cacheC = getDataCachedComplex(res, false, {
    localStorage: true,
  });

  let _cache = await cache;
  let _cacheB = await cacheB;
  let _cacheC = await cacheC;

  expect(JSON.stringify(_cache)).toBe(JSON.stringify(_cacheB));
  expect(JSON.stringify(_cache)).not.toBe(JSON.stringify(_cacheC));
});

test('Test set/get promises resolved LS B', async function() {
  getDataCachedComplexCounter = 0;
  let res = { test: 2, test2: [1, 2, 4, 5, 6, 7], add: 0 };

  let cache = await getDataCachedComplex(res, false, {
    localStorage: true,
  });

  let cache2 = await getDataCachedComplex(res, false);

  await _timeout(100);
  simpleKaysh.__simulateRefresh();

  let cache3 = await getDataCachedComplex(res, false);

  expect(JSON.stringify(cache)).toBe(JSON.stringify(cache2));
  expect(JSON.stringify(cache)).toBe(JSON.stringify(cache3));
});
