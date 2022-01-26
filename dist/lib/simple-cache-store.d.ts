export interface StoredValueModelObjRoot {
    [key: string]: StoredValueModelObj;
}
export interface StoredValueModelObj {
    [key: string]: StoredValueModel;
}
export interface StoredValueModel {
    value: any;
    date: number;
    localStored?: boolean;
    config?: DefaultConfigCacheModel;
}
export interface DefaultConfigCacheModel {
    localStorage?: boolean;
    maxTime?: number;
    maxItems?: number;
}
declare function setCacheValue(key: string, value: any, payloadToHash?: any, config?: DefaultConfigCacheModel): void;
declare function getCacheValue(key: string, payloadToHash?: any): any;
declare function resetCache(key: string, payloadToHash?: any): void;
declare function resetAllCaches(): void;
declare function memoFunction(func: Function, prefixId?: string, config?: DefaultConfigCacheModel): Function;
declare function resetMemoFunction(funcOrName: Function | string, prefixId?: string): Function;
declare function memoFunctionDecorator(config?: DefaultConfigCacheModel, prefixId?: any): (target: any, propertyKey: any, descriptor: any) => void;
declare function __sortStoredValueModelByDate(StoredValuel: StoredValueModelObj, max?: number): StoredValueModelObj;
declare function __isPromise(value: any): boolean;
declare function __getLocalStorageClass(): any;
declare function __setLocalStoredToStore(): any;
declare function __getLocalStorageGlobalKey(): string;
declare function __setLocalStorageGlobals(parentKey: string, maxGlobalTime?: number, enabled?: boolean, localStorageEnabled?: boolean): void;
declare function __clearLocalStorage(): void;
declare function __getStoreState(): any;
declare function __simulateRefresh(): void;
declare const __simpleCacheStore: {
    setCacheValue: typeof setCacheValue;
    getCacheValue: typeof getCacheValue;
    resetCache: typeof resetCache;
    resetAllCaches: typeof resetAllCaches;
    memoFunction: typeof memoFunction;
    memoFunctionDecorator: typeof memoFunctionDecorator;
    resetMemoFunction: typeof resetMemoFunction;
    __getLocalStorageClass: typeof __getLocalStorageClass;
    __setLocalStoredToStore: typeof __setLocalStoredToStore;
    __clearLocalStorage: typeof __clearLocalStorage;
    __getLocalStorageGlobalKey: typeof __getLocalStorageGlobalKey;
    __getStoreState: typeof __getStoreState;
    __sortStoredValueModelByDate: typeof __sortStoredValueModelByDate;
    __simulateRefresh: typeof __simulateRefresh;
    __setLocalStorageGlobals: typeof __setLocalStorageGlobals;
    __isPromise: typeof __isPromise;
};
export { __simpleCacheStore };
