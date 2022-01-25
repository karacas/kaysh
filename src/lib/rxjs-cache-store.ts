import { of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { isObservable } from 'rxjs/internal/util/isObservable';
import { shareReplay, tap } from 'rxjs/operators';
import { DefaultConfigCacheModel, __simpleCacheStore } from './simple-cache-store';

const getRxjsObservableCacheValue = (key: string, payloadToHash?: any): Observable<any> => {
  const cache = __simpleCacheStore.getCacheValue(key, payloadToHash);

  if (cache == null) return cache;

  if (isObservable(cache)) return cache;

  return of(cache);
};

const setRxjsObservableCacheValue = (
  stream: Observable<any>,
  key: string,
  payloadToHash?: any,
  config?: DefaultConfigCacheModel
): Observable<any> => {
  if (stream == null || key == null) return of(null);

  const setCache = ($data: any) => {
    if ($data != null) __simpleCacheStore.setCacheValue(key, $data, payloadToHash, config);
  };

  setCache(stream.pipe(shareReplay()));

  return stream.pipe(
    tap((_data: any) => setCache(_data)),
    shareReplay()
  );
};

const __rxCacheStore = {
  getRxjsObservableCacheValue,
  setRxjsObservableCacheValue,
  resetCache: __simpleCacheStore.resetCache,
  resetAllCaches: __simpleCacheStore.resetAllCaches,
};

export { __rxCacheStore as __rxjsCacheStore };
