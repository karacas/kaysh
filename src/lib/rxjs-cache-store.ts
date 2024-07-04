import { MonoTypeOperatorFunction, of, ReplaySubject, Subscriber, Subscription } from 'rxjs';
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

  let useCacheReplay = config?.useCacheReplay !== false;

  if (useCacheReplay === false) {
    setCache(stream);
    return stream.pipe(tap((_data: any) => setCache(_data)));
  }

  let cacheReplay = stream.pipe(shareReplay());

  setCache(cacheReplay);

  return cacheReplay.pipe(
    shareReplay(),
    tap((_data: any) => setCache(_data))
  );
};

const observableCache = (
  stream: Observable<any>,
  key: string,
  argsToHash?: any,
  config?: DefaultConfigCacheModel,
  forceUpdate = false
) => {
  const cache = getRxjsObservableCacheValue(key, argsToHash);

  if (forceUpdate === false && cache != null) return cache;

  return setRxjsObservableCacheValue(stream, key, argsToHash, config);
};

export function kayshOperator<T>(
  key: string,
  argsToHash?: any,
  config?: DefaultConfigCacheModel,
  forceUpdate = false
): MonoTypeOperatorFunction<T> {
  function __shareReplayOperator<T>() {
    let subject: ReplaySubject<T> | undefined;
    let refCount = 0;
    let subscription: Subscription | undefined;
    let hasError = false;
    let isComplete = false;

    return function shareReplayOperation(this: Subscriber<T>, source: Observable<T>) {
      refCount++;
      let innerSub: Subscription;
      if (!subject || hasError) {
        hasError = false;
        subject = new ReplaySubject<T>();
        innerSub = subject.subscribe(this);
        subscription = source.subscribe({
          next(value) {
            subject.next(value);
          },
          error(err) {
            hasError = true;
            subject.error(err);
          },
          complete() {
            isComplete = true;
            subscription = undefined;
            subject.complete();
          },
        });

        if (isComplete) {
          subscription = undefined;
        }
      } else {
        innerSub = subject.subscribe(this);
      }

      this.add(() => {
        refCount--;
        innerSub.unsubscribe();
        innerSub = undefined;
        if (subscription && !isComplete && refCount === 0) {
          subscription.unsubscribe();
          subscription = undefined;
          subject = undefined;
        }
      });
    };
  }

  return (source: Observable<T>) => {
    const cacheObs = observableCache(source, key, argsToHash, config, forceUpdate);
    return cacheObs.lift(__shareReplayOperator());
  };
}

const kayshFlushOperator = (key: string, argsToHash?: any) => {
  return __simpleCacheStore.resetCache(key, argsToHash);
};

const __rxCacheStore = {
  observableCache,
  kayshFlushOperator,
  kayshOperator,
  getRxjsObservableCacheValue,
  setRxjsObservableCacheValue,
  resetCache: __simpleCacheStore.resetCache,
  resetAllCaches: __simpleCacheStore.resetAllCaches,
};

export { __rxCacheStore as __rxjsCacheStore };
