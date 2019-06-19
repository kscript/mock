// export declare namespace datas {
interface anyObject {
    [prop: string]: any;
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
) => undefined | object;

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

// }
