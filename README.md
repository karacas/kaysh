# Kaysh

## In-memory caching with support for RxJs observables, native promises, functions & methods. Optional localStorage.

<br />
<br />

### <b>Config</b>

```typescript
const optional_config = {
  localStorage: true  /* Uses localStorage / Promises and RxJs automatically save a resolved value | dafault:false */,
  maxItems: 10        /* Maximum values cached per function/args | dafault:10 */,
  maxTime: 5 * 1000   /* Maximum time of the cached value in milliseconds | dafault:0(infinite) */,
};
```

<br />
<br />

### <b>RxJs cache operator</b>

```typescript
import { kayshOperator, kayshFlushOperator } from '@karacas/kaysh';

const getObservable = (payLoad?) => {
  return of(Math.random() + JSON.stringify(payLoad))
          .pipe(kayshOperator('getObservable', payLoad, optional_config));
};

const flushObservableValue = (payLoad?) => kayshFlushOperator('getObservable', payLoad);
const flushObservable = () => kayshFlushOperator('getObservable');
```

> Expects

```typescript
test('TestObserbable Operator', async function() {
  let value1 = await getObservable([1, 2]).toPromise();
  let value2 = await getObservable([1, 2]).toPromise();

  expect(value1).toBe(value2);

  flushObservableValue([1, 2]); // or flushObservable() for all values

  let value3 = await getObservable([1, 2]).toPromise();
  expect(value3).not.toBe(value1);
});
```

<br />
<br />

### <b>Memoize a function</b>

```typescript
function testFunction(val) {
  return String(Math.random()) + JSON.stringify(val);
}

const testFunctionMem = kayshMemFunction(testFunction, optional_config);
const flush = kayshFlushMemFunction(testFunction);
```

> Expects

```typescript
test('Test Simple function', function() {
  let value1 = testFunctionMem({ test: [1] });
  let value2 = testFunctionMem({ test: [1] });

  expect(value1).toBe(value2);

  flush({ test: [1] }); // or flush() for all values

  let value3 = testFunctionMem({ test: [1] });
  expect(value3).not.toBe(value1);
});
```

<br />
<br />

### <b>Memoize a Class method</b>

```typescript
import { kayshMemFunction, kayshFlushMemFunction, kayshDecorator } from '@karacas/kaysh';

class CacheTestClass {
  //Normal

  funcTest(v = 100) {
    return 1 + v;
  }

  funcTestMemo = kayshMemFunction(this.funcTest);
  flushFuncTestMemo = kayshFlushMemFunction(this.funcTest);
}
```

> Or

```typescript
class CacheClassExampleWithDecorator {
  //Decorator

  @kayshDecorator(kayshOptions)
  testDecorated(v = 100) {
    return 1 + v;
  }

  flushTestDecorated = kayshFlushMemFunction(this.testDecorated);
}
```
