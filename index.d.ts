export declare class KsMock {
    public option: any;
    constructor(option: any);
    public apply(compiler: any): void;
    public server(option?: any): void;
}
export namespace mock {
    interface anyObject<T=any> {
        [prop: string]: T
    }
    type apiFunc = (
        method: string,
        params: anyObject,
        result: anyObject,
        rest?: {
            url: string;
            body: object;
            [prop: string]: any;
        }
    ) => void | object;
    
    type apiErrorFunc = (
        method: string,
        params: anyObject,
        result: anyObject,
        rest?: {
            url: string;
            body: object;
            [prop: string]: any;
        }
    ) => undefined | object | string | Function;
    
    interface api {
        public?: boolean;
        relay?: string | apiFunc;
        format?: apiFunc;
        error?: apiErrorFunc;
        post?: anyObject;
        get?: anyObject;
        [prop: string]: any;
    }
}
export default KsMock