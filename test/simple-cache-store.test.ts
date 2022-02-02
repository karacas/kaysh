import { kayshFlushMemFunction, kayshDecorator, kayshMemFunction } from '../src';
import { StoredValueModelObj, __simpleCacheStore } from '../src/lib/simple-cache-store';

const _log = console.log;

test('Test sortStoredValueModelByDate', function() {
  let objTest: StoredValueModelObj = {
    '2': { value: { val: 101 }, date: 2 },
    '8': { value: { val: 101 }, date: 8 },
    '100': { value: { val: 101 }, date: 100 },
    '101': { value: { val: 101 }, date: 101 },
    '1': { value: { val: 101 }, date: 1 },
    '5': { value: { val: 101 }, date: 5 },
  };

  let res = __simpleCacheStore.__sortStoredValueModelByDate(objTest);
  expect(Object.keys(res).join()).toBe([1, 2, 5, 8, 100, 101].join());

  res = __simpleCacheStore.__sortStoredValueModelByDate(objTest, 5);
  expect(Object.keys(res).join()).toBe([2, 5, 8, 100, 101].join());
});

let count: number = -1;
let funcTest = (v: number = 100) => {
  count++;
  return count + v;
};

const funcTestMemo = kayshMemFunction(funcTest);
const resetFuncTestMemo = kayshFlushMemFunction(funcTest);

test('Test memoFunction', function() {
  count = -1;

  let res1 = funcTestMemo(0);
  let res2 = funcTestMemo(0);
  expect(res1).toBe(res2);
  expect(res1).toBe(0);

  let resA = funcTestMemo(1);
  expect(resA).toBe(2);

  resetFuncTestMemo(0);

  let res3 = funcTestMemo(0);
  expect(res3).toBe(2);

  res3 = funcTestMemo(0);
  expect(res3).toBe(2);

  resA = funcTestMemo(1);
  expect(resA).toBe(2);

  resetFuncTestMemo(1);
  resA = funcTestMemo(1);
  expect(resA).toBe(4);

  res3 = funcTestMemo(0);
  expect(res3).toBe(2);

  resetFuncTestMemo();

  res3 = funcTestMemo(0);
  expect(res3).toBe(4);

  resA = funcTestMemo(1);
  expect(resA).toBe(6);
});

test('Test memoFunction no args', function() {
  count = -1;

  let res1 = funcTestMemo();
  let res2 = funcTestMemo();
  expect(res1).toBe(res2);
  expect(res1).toBe(100);

  resetFuncTestMemo();

  let res3 = funcTestMemo();
  expect(res3).toBe(101);

  if (false) _log(__simpleCacheStore.__getStoreState());
});

test('Test memoFunction String', function() {
  count = -1;

  let res1 = funcTestMemo('algo');
  let res2 = funcTestMemo('algo');
  expect(res1).toBe(res2);
  expect(res1).toBe('0algo');

  resetFuncTestMemo('algo');

  let res3 = funcTestMemo('algo');
  expect(res3).toBe('1algo');
});

// new class typescrip
class TestClass {
  count: number = -1;

  _funcTest_(v: number = 100) {
    this.count++;
    return this.count + v;
  }

  funcTestMemo = kayshMemFunction(this._funcTest_);
  resetFuncTestMemo = kayshFlushMemFunction(this._funcTest_);

  @kayshDecorator()
  _funcTestDecorated(v: number = 100) {
    this.count++;
    return this.count + v;
  }

  resetFuncTestDecorated = kayshFlushMemFunction(this._funcTestDecorated);
}

let testClass = new TestClass();

test('Test memoFunction class', function() {
  let res1 = testClass.funcTestMemo(0);
  let res2 = testClass.funcTestMemo(0);
  expect(res1).toBe(res2);
  expect(res1).toBe(0);

  testClass.resetFuncTestMemo();

  let res3 = testClass.funcTestMemo(0);
  expect(res3).toBe(1);

  if (false) _log(JSON.stringify(__simpleCacheStore.__getStoreState(), null, 2));
});

test('Test memoFunction class no args', function() {
  let res1 = testClass.funcTestMemo();
  let res2 = testClass.funcTestMemo();
  expect(res1).toBe(res2);
  expect(res1).toBe(102);

  testClass.resetFuncTestMemo();

  let res3 = testClass.funcTestMemo();
  expect(res3).toBe(103);

  if (false) _log(JSON.stringify(__simpleCacheStore.__getStoreState(), null, 2));
});

test('Test memoFunction class Decorated', function() {
  testClass.count = -1;

  let res1 = testClass._funcTestDecorated(0);
  let res2 = testClass._funcTestDecorated(0);
  expect(res1).toBe(res2);
  expect(res1).toBe(0);

  testClass.resetFuncTestDecorated(0);
  res1 = testClass._funcTestDecorated(0);
  res2 = testClass._funcTestDecorated(0);
  expect(res1).toBe(res2);
  expect(res1).toBe(1);

  testClass.resetFuncTestDecorated();
  res1 = testClass._funcTestDecorated(0);
  res2 = testClass._funcTestDecorated(0);
  expect(res1).toBe(res2);
  expect(res1).toBe(2);

  testClass.resetFuncTestDecorated(1);
  res1 = testClass._funcTestDecorated(0);
  res2 = testClass._funcTestDecorated(0);
  expect(res1).toBe(res2);
  expect(res1).toBe(2);

  if (false) _log(JSON.stringify(__simpleCacheStore.__getStoreState(), null, 2));
});
