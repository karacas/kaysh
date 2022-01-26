import { of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { isObservable } from 'rxjs/internal/util/isObservable';
import { shareReplay, tap } from 'rxjs/operators';
import { DefaultConfigCacheModel, __simpleCacheStore } from './simple-cache-store';

const getRxjsObservableCacheValue = (key: string, argsToHash?: any): Observable<any> => {
  const cache = __simpleCacheStore.getCacheValue(key, argsToHash);

  if (cache == null) return cache;

  if (isObservable(cache)) return cache;

  return of(cache);
};

const setRxjsObservableCacheValue = (
  stream: Observable<any>,
  key: string,
  argsToHash?: any,
  config?: DefaultConfigCacheModel
): Observable<any> => {
  if (stream == null || key == null) return of(null);

  const setCache = ($data: any) => {
    if ($data != null) __simpleCacheStore.setCacheValue(key, $data, argsToHash, config);
  };

  let cacheReplay = stream.pipe(shareReplay());

  setCache(cacheReplay);

  return cacheReplay.pipe(
    shareReplay(),
    tap((_data: any) => setCache(_data))
  );
};

const __rxCacheStore = {
  getRxjsObservableCacheValue,
  setRxjsObservableCacheValue,
  resetCache: __simpleCacheStore.resetCache,
  resetAllCaches: __simpleCacheStore.resetAllCaches,
};

export { __rxCacheStore as __rxjsCacheStore };
