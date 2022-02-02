import { MonoTypeOperatorFunction } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { DefaultConfigCacheModel } from './simple-cache-store';
export declare function kayshOperator<T>(key: string, argsToHash?: any, config?: DefaultConfigCacheModel, forceUpdate?: boolean): MonoTypeOperatorFunction<T>;
declare const __rxCacheStore: {
    observableCache: (stream: Observable<any>, key: string, argsToHash?: any, config?: DefaultConfigCacheModel, forceUpdate?: boolean) => Observable<any>;
    kayshFlushOperator: (key: string, argsToHash?: any) => void;
    kayshOperator: typeof kayshOperator;
    getRxjsObservableCacheValue: (key: string, argsToHash?: any) => Observable<any>;
    setRxjsObservableCacheValue: (stream: Observable<any>, key: string, argsToHash?: any, config?: DefaultConfigCacheModel) => Observable<any>;
    resetCache: (key: string, argsToHash?: any) => void;
    resetAllCaches: () => void;
};
export { __rxCacheStore as __rxjsCacheStore };
