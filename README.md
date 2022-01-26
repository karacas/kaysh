# Kaysh

In-memory caching with support for RxJs observables, native promises, functions & methods. Optional localStorage.

<br />

### Cache Simple function

```typescript
import { simpleKaysh } from '@karacas/kaysh';

const optional_KayshOptions = {
  localStorage: true /*Promises and RxJs values automatically saved on resolve | dafault:false*/,
  maxItems: 10 /* Maximum values cached per function/args | dafault:10*/,
  maxTime: 5 * 1000 /* Maximum time of the cached value in milliseconds | dafault:0(infinite) */,
};

const testFunction = val => String(Math.random()) + JSON.stringify(val);

//Cached Function
const testFunctionCached = simpleKaysh.memoFunction(testFunction, 'optional_PrefixId', optional_KayshOptions);

//Flush Cached Function
const flushTestFunctionCached = simpleKaysh.resetMemoFunction(testFunction, 'optional_PrefixId');

//Expexts
/*
test('Test Simple function', function() {
  let value1_A = testFunctionCached({ test: [1] });
  let value1_B = testFunctionCached({ test: [1] });
  let value2_A = testFunctionCached({ test: [2] });
  expect(value1_A).toBe(value1_B);
  expect(value1_A).not.toBe(value2_A);

  flushTestFunctionCached();

  let value1_flushed = testFunctionCached({ test: [1] });
  expect(value1_A).not.toBe(value1_flushed);
});
*/
```

<br />

### Class Method Cache

```typescript
import { simpleKaysh } from '@karacas/kaysh';

//Normal
class CacheTestClass {
  funcTest(v: number = 100) {
    return 1 + v;
  }

  funcTestMemo = simpleKaysh.memoFunction(this.funcTest);
  resetFuncTestMemo = simpleKaysh.resetMemoFunction(this.funcTest);
}

//Decorator
class CacheClassExampleWithDecorator {
  @simpleKaysh.memoFunctionDecorator(kayshOptions)
  funcTestDecorated(v: number = 100) {
    return 1 + v;
  }

  resetFuncTestDecorated = simpleKaysh.resetMemoFunction(this.funcTestDecorated);
}
```

<br />

### RxJs Cache

```typescript
import { rxjsKaysh } from '@karacas/kaysh';

const getRxJsCached = (payLoad: any, forceUpdate = false) => {
  //getCache
  const cache = rxjsKaysh.getRxjsObservableCacheValue('getRxJsCached', payLoad);
  if (forceUpdate === false && cache != null) return cache;

  const rv = httpFake.get(payLoad);

  //setCache
  return rxjsKaysh.setRxjsObservableCacheValue(rv, 'getRxJsCached', payLoad, kayshOptions);
};
```
