import { Observable } from 'rxjs/internal/Observable';
import { DefaultConfigCacheModel } from './simple-cache-store';
declare const __rxCacheStore: {
    getRxjsObservableCacheValue: (key: string, payloadToHash?: any) => Observable<any>;
    setRxjsObservableCacheValue: (stream: Observable<any>, key: string, payloadToHash?: any, config?: DefaultConfigCacheModel) => Observable<any>;
    resetCache: (key: string, payloadToHash?: any) => void;
    resetAllCaches: () => void;
};
export { __rxCacheStore as __rxjsCacheStore };
