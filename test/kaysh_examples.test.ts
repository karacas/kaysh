import { simpleKaysh } from '../src';

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
