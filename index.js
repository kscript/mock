'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = require('path');
var jsonServer = _interopDefault(require('json-server'));
var Mock = _interopDefault(require('mockjs'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var Base = /** @class */ (function () {
    function Base() {
        this.data = {};
    }
    Base.prototype.get = function (key) {
        return key ? this.data[key] : this.data;
    };
    Base.prototype.set = function (key, val) {
        this.data[key] = val;
    };
    Base.prototype.reset = function (obj) {
        this.clear();
        Object.assign(this.data, obj);
    };
    Base.prototype.clear = function () {
        for (var key in this.data) {
            delete this.data[key];
        }
    };
    return Base;
}());
var Server = /** @class */ (function (_super) {
    __extends(Server, _super);
    function Server() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Server;
}(Base));
var User = /** @class */ (function (_super) {
    __extends(User, _super);
    function User() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return User;
}(Base));
var server = new Server;
var user = new User;
var crossDomain = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': true
};
var config = {
    user: user,
    server: server,
    crossDomain: crossDomain
};

var Auth = /** @class */ (function () {
    function Auth() {
    }
    Auth.prototype.get = function (key) {
        if (typeof key === 'string') {
            return user.get('key');
        }
        return JSON.parse(JSON.stringify(user.get()));
    };
    Auth.prototype.login = function (data) {
        user.reset(data);
        server.set('login', true);
    };
    Auth.prototype.logout = function () {
        user.clear();
        server.set('login', false);
    };
    Auth.prototype.verify = function () {
        return server.get('login');
    };
    return Auth;
}());
var auth = new Auth;

// 路由重写规则
var rules = {
    '/api/*': '$1'
};

var getInfo = function (req, option, headers) {
    var url = req._parsedUrl.pathname.replace(/^\//, '');
    return {
        url: url,
        data: option.mockData[url],
        method: req.method.toLowerCase(),
        urlKey: (url || '').replace(/\/$/, '').replace(/\//g, '_'),
        params: Object.assign({}, req.body || {}, req.query),
        headConfig: Object.assign(Object.assign({
            // 中文乱码
            'Content-Type': 'text/html; charset=utf-8'
        }, 
        // 是否跨域
        option.crossDomain ? headers : {}), option.headConfig)
    };
};
var mockResult = function (result) {
    return result instanceof Object ? Mock.mock(result) : result;
};
var Http = /** @class */ (function () {
    function Http(res) {
        this.res = null;
        this.res = res;
    }
    Http.prototype.writeHead = function (code, header) {
        this.res.writeHead(code, header);
    };
    Http.prototype.end = function (body) {
        this.res.end(typeof body === 'string' ? body : JSON.stringify(mockResult(body)));
    };
    return Http;
}());

var request = require('request');
var server$1 = jsonServer.create();
// 路径从根目录开始?
var router = jsonServer.router(path.resolve(process.cwd(), 'db.json'));
var middlewares = jsonServer.defaults({
    static: path.resolve(__dirname, './public')
});
server$1.use(middlewares);
/**
 * 启动mock服务
 * @func
 * @param {object} option mock 服务配置
 * @param {mockData} option.mockData - mock数据json(支持 mockjs 中的写法)
 * @param {headoption=} option.headoption - 服务端请求头信息配置
 * @param {boolean=} option.crossDomain - 是否跨域 (便于在不设置请求头时, 快速配置跨域)
 * @param {number=} port - 服务器端口
 */
var Server$1 = function (option) {
    option = Object.assign({
        port: 3030,
        crossDomain: true,
        headoption: null,
        mockData: {},
        bounded: !!option.loginUrl
    }, option);
    var mockData = option.mockData;
    // To handle POST, PUT and PATCH you need to use a body-parser
    // You can use the one used by JSON Server
    server$1.use(jsonServer.bodyParser);
    // 路由映射
    server$1.use(jsonServer.rewriter(option.rules instanceof Object ? option.rules : rules));
    server$1.use(function (req, res, next) {
        var http = new Http(res);
        var _a = getInfo(req, option, config.crossDomain), url = _a.url, data = _a.data, method = _a.method, urlKey = _a.urlKey, params = _a.params, headConfig = _a.headConfig;
        var result = {};
        // 是否需要将接口的处理逻辑交由json-server
        var transfer = method === 'post' && router.db.__wrapped__.hasOwnProperty(urlKey);
        // 1. 验证用户请求的api地址是否有数据
        if (data || transfer) {
            data = data || {};
            result = JSON.parse(JSON.stringify(data[method] || {}));
            if (!(result instanceof Object)) {
                result = {};
            }
            // 2. 处理鉴权
            // 当前链接不是登录入口 && 启用了鉴权功能 && 当前api需要鉴权 && 用户未能通过鉴权
            if (urlKey !== option.loginUrl && option.bounded && !data.public && !auth.verify()) {
                http.writeHead(401, headConfig);
                http.end({
                    code: 401,
                    message: urlKey && urlKey === option.logoutUrl ? '退出失败' : '权限不足, 请先登录'
                });
                return;
            }
            // 3. 处理错误
            if (data.error && typeof data.error === 'function') {
                var errResult = data.error(method, params, result, { url: url });
                if (errResult) {
                    // 返回函数时, 可以在data.error得到两个参数res, headConfig, 方便进行自定义的错误输出
                    if (typeof errResult === 'function') {
                        errResult(http, headConfig);
                        // 返回对象时, 将其作为错误信息输出
                    }
                    else if (typeof errResult === 'object') {
                        http.writeHead(400, headConfig);
                        http.end(errResult);
                        // 输出默认错误信息
                    }
                    else {
                        http.writeHead(400, headConfig);
                        http.end({
                            code: 400,
                            message: typeof errResult === 'string' ? errResult : '请求出错'
                        });
                    }
                    return;
                }
            }
            // 4. 处理转发请求
            if (data.relay) {
                var relay = typeof data.relay === 'function' ? data.relay(method, params, data[method], { url: url }) : data.relay;
                if (!Array.isArray(relay)) {
                    relay = [relay];
                }
                request.apply(request, relay.concat(function (error, response, body) {
                    if (!error) {
                        try {
                            if (response.statusCode === 200) {
                                http.writeHead(200, headConfig);
                                http.end(body);
                            }
                            else {
                                http.writeHead(response.statusCode, headConfig);
                                http.end(body);
                            }
                            // 如果是登录入口请求成功
                            if (method === 'post' && urlKey === option.loginUrl) {
                                auth.login(params);
                            }
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    else {
                        http.writeHead(400, headConfig);
                        http.end({
                            code: 400,
                            message: "请求失败"
                        });
                    }
                }));
                return;
            }
            // 5. 验证请求方法是否存在
            if (data[method] || transfer) {
                // 请求成功的链接是登录入口, 没有被上面的错误拦截, 则视为登录成功
                if (urlKey === option.loginUrl) {
                    auth.login(params);
                }
                // 如果存在当前的请求方法, 先根据配置进行处理, 再转交给 json-server
                if (data[method]) {
                    if (data.format) {
                        result = data.format(method, params, result, { url: url }) || result;
                    }
                }
                // 如果没有配置当前的请求方法, 则后续操作由json-server控制
                if (transfer) {
                    next();
                    return;
                }
                http.writeHead(200, headConfig);
            }
            else {
                http.writeHead(405, headConfig);
                result = {
                    code: 405,
                    message: '请求方法错误'
                };
            }
        }
        else {
            http.writeHead(404, headConfig);
            result = {
                code: 404,
                message: '请求地址不存在'
            };
        }
        http.end(result);
    });
    router.render = function (req, res) {
        var _a = getInfo(req, option, config.crossDomain), url = _a.url, method = _a.method, urlKey = _a.urlKey, params = _a.params;
        mockData = mockData || {};
        var body = {
            code: 200,
            message: 'ok',
            data: res.locals.data
        };
        var current = mockData[urlKey];
        if (urlKey === option.loginUrl) {
            auth.login(params);
        }
        else if (urlKey === option.logoutUrl) {
            auth.logout();
        }
        if (current && typeof current.format === 'function') {
            body = mockResult(current.format(method, params, JSON.parse(JSON.stringify(current[method] instanceof Object ? current[method] : {})), {
                url: url,
                body: JSON.parse(JSON.stringify(body))
            }) || body);
        }
        // post成功后, 对其返回数据进行包装
        res.status(200).jsonp(body);
    };
    server$1.use(router);
    server$1.listen(option.port, function () {
        console.log();
        console.log("\u5DF2\u542F\u52A8json-server\u670D\u52A1\u5668 http://localhost:" + option.port);
        console.log();
    });
};

function KsMock(option) {
    this.option = option;
}
KsMock.prototype.apply = function (compiler) {
    Server$1(this.option);
    compiler.plugin("emit", function (compilation, callback) {
        callback();
    });
};
KsMock.prototype.server = function (option) {
    Server$1(option || this.option);
};

module.exports = KsMock;
