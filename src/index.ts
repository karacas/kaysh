import { __rxjsCacheStore } from './lib/rxjs-cache-store';
import { __simpleCacheStore } from './lib/simple-cache-store';

const kayshOperator = __rxjsCacheStore.kayshOperator;
const kayshFlushOperator = __rxjsCacheStore.kayshFlushOperator;

const kayshDecorator = __simpleCacheStore.memoFunctionDecorator;
const kayshMemFunction = __simpleCacheStore.memoFunction;
const kayshFlushMemFunction = __simpleCacheStore.resetMemoFunction;
const kayshFlushAll = __simpleCacheStore.resetAllCaches;
const kayshFlushValue = __simpleCacheStore.resetCache;

const simpleKaysh = __simpleCacheStore;
const rxjsKaysh = __rxjsCacheStore;

export {
  kayshOperator,
  kayshFlushOperator,
  kayshDecorator,
  kayshFlushMemFunction,
  kayshFlushAll,
  kayshFlushValue,
  kayshMemFunction,
  simpleKaysh,
  rxjsKaysh,
};
