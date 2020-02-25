"use strict";
exports.__esModule = true;
var config_1 = require("./config");
var defaultConfig = Object.assign({}, config_1.config.data);
var config = defaultConfig;
exports.login = {
    // 转发
    relay: '',
    // 格式化请求结果
    format: function (method, params, result, _a) {
        var body = _a.body;
        return Object.assign(body || {}, result);
    },
    // 模拟请求出错
    error: function (method, params, result, _a) {
        var body = _a.body;
        if (params.username !== config.username || params.password !== config.password) {
            return function (res, headConfig) {
                res.writeHead(400, headConfig);
                res.end(JSON.stringify({
                    code: 400,
                    message: '密码错误'
                }));
            };
        }
    },
    // post方法的默认请求结果
    post: {
        message: '登录成功!'
    }
};
exports.logout = {
    format: function (method, params, result, _a) {
        var body = _a.body;
        return Object.assign(body || {}, result);
    },
    post: {
        message: '退出成功!'
    }
};
exports.relay = {
    relay: function (method, params, result) {
        var _a;
        var key = /get/i.test(method) ? 'qs' : 'form';
        return _a = {
                url: config.retryUrl,
                method: method
            },
            _a[key] = params,
            _a.json = true,
            _a;
    }
};
exports.info = {
    error: function (method, params, result) {
        if (!params.username) {
            return '参数不足';
        }
    },
    format: function (method, params, result) {
        result.message = 'hello ' + (params.username || 'world');
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(result);
            }, ~~(Math.random() * 1e4));
        });
        // 不返回, 那么修改无效
        // return result
    },
    get: {
        code: 200,
        message: 'ok',
        data: {}
    }
};
exports.settings = {
    // 公开当前接口
    public: true,
    format: function (method, params, result) {
        if (method === 'get') {
            if (params.type === 'default') {
                result.data = defaultConfig;
            }
            else {
                result.data = config;
            }
        }
        else if (method === 'post') {
            Object.assign(config, params);
            result.data = config;
        }
        return result;
    },
    get: {
        code: 200,
        message: 'ok',
        data: {}
    },
    post: {
        code: 200,
        message: 'ok',
        data: {}
    }
};
exports["default"] = {
    info: exports.info,
    login: exports.login,
    logout: exports.logout,
    relay: exports.relay,
    settings: exports.settings
};
