// export declare namespace datas {
type apiFunc = (
    method: string,
    params: {
        [prop: string]: any;
    },
    result: {
        [prop: string]: any;
    },
    rest?: {
        url: string;
        body: object;
        [prop: string]: any;
    }
) => undefined | object;

type apiErrorFunc = (
    method: string,
    params: {
        [prop: string]: any;
    },
    result: {
        [prop: string]: any;
    },
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
    post?: {
        [prop: string]: any;
    };
    get?: {
        [prop: string]: any;
    };
    [prop: string]: any;
}

// }
