import { of } from 'rxjs';
import { kayshFlushMemFunction, kayshFlushOperator, kayshMemFunction } from '../src';
import { kayshOperator } from '../src/lib/rxjs-cache-store';

const optional_config = {
  localStorage: true /* Uses localStorage / Promises and RxJs automatically save a resolved value | dafault:false */,
  maxItems: 10 /* Maximum values cached per function/args | dafault:10 */,
  maxTime: 5 * 1000 /* Maximum time of the cached value in milliseconds | dafault:0(infinite) */,
};

// Obserbable Operator
const getObservable = (payLoad?) => {
  return of(Math.random() + JSON.stringify(payLoad)).pipe(kayshOperator('getObservable', payLoad, optional_config));
};

const flushObservableValue = (payLoad?) => kayshFlushOperator('getObservable', payLoad);
const flushObservable = () => kayshFlushOperator('getObservable');

test('TestObserbable Operator', async function() {
  let value1 = await getObservable([1, 2]).toPromise();
  let value2 = await getObservable([1, 2]).toPromise();

  expect(value1).toBe(value2);

  flushObservableValue([1, 2]); // or flushObservable() for all values

  let value3 = await getObservable([1, 2]).toPromise();
  expect(value3).not.toBe(value1);
});

// Simple Function
function testFunction(val) {
  return String(Math.random()) + JSON.stringify(val);
}

const testFunctionMem = kayshMemFunction(testFunction, optional_config);
const flush = kayshFlushMemFunction(testFunction);

test('Test Simple function', function() {
  let value1 = testFunctionMem({ test: [1] });
  let value2 = testFunctionMem({ test: [1] });

  expect(value1).toBe(value2);

  flush({ test: [1] }); // or flush() for all values

  let value3 = testFunctionMem({ test: [1] });
  expect(value3).not.toBe(value1);
});
