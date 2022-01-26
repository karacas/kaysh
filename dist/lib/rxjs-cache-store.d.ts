import { Observable } from 'rxjs/internal/Observable';
import { DefaultConfigCacheModel } from './simple-cache-store';
declare const __rxCacheStore: {
    getRxjsObservableCacheValue: (key: string, argsToHash?: any) => Observable<any>;
    setRxjsObservableCacheValue: (stream: Observable<any>, key: string, argsToHash?: any, config?: DefaultConfigCacheModel) => Observable<any>;
    resetCache: (key: string, argsToHash?: any) => void;
    resetAllCaches: () => void;
};
export { __rxCacheStore as __rxjsCacheStore };
