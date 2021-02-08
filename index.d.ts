export namespace mock {
    
    interface anyObject<T=any> {
        [prop: string]: T
    }

    interface api {
        public?: boolean;
        relay?: string | apiFunc;
        format?: apiFunc;
        error?: apiErrorFunc;
        post?: anyObject;
        get?: anyObject;
        [prop: string]: any;
    }

    interface options {
        // 模拟属性相关的配置
        mockData?: anyObject<api>;
        // 服务器请求头设置
        headConfig?: anyObject | null;
        // 是否允许跨域 当 headConfig 不为空时, 忽略该项
        crossDomain?: boolean;
        // 端口号
        port?: number;
        // 静态文件目录
        static?: string | ((jsonServer: Object, server: Object) => void);
        // https证书配置
        https?: {
            key: string;
            cert: string;
        } | undefined;
        // 路由重写规则, 参考 json-server rewriter
        rules?: anyObject<string>;
        // 登录地址, 如果配置了loginUrl, 那么除登录和public属性为true的接口外, 其它接口必须在登录之后才可以正常执行
        loginUrl?: string;
        // 退出登录地址
        logoutUrl?: string;
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
}
export declare class KsMock {
    public option: mock.options;
    constructor(option: mock.options);
    public apply(compiler: any): void;
    public server(option?: mock.options): void;
}

export default KsMock