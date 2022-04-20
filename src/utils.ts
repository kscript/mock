import Mock from 'mockjs';
import auth from './auth';
const request = require('request');

export class Http {
    res = null;
    constructor(res) {
        this.res = res
    }
    writeHead (code, header) {
        this.res.writeHead(code, header)
    }
    end (body) {
        this.res.end(typeof body === 'string' ? body : JSON.stringify(mockResult(body)))
    }
}
export const noop = (func: Function | any) : Function => {
    if (typeof func === 'function') {
        return func
    }
    return () => {}
}
export const once = (func: Function, context?: Object) => {
    let called = false
    return (...args) => {
        if (!called) {
            called = true
            context ? func.call(context, ...args) : func(...args)
        }
    }
}
export const getInfo = (req, option, headers, res) => {
    let url = req._parsedUrl[/get/i.test(req.method) ? 'pathname' : 'href'].replace(/^\//, '')
    return {
        url,
        extra: {
            url,
            files: req.files,
            option,
            res
        },
        data: option.mockData[url],
        method: req.method.toLowerCase(),
        urlKey: (url || '').replace(/\/$/, '').replace(/\//g, '_'),
        params: Object.assign({}, req.body || {}, req.query),
        headConfig: Object.assign(
            Object.assign(
                {
                    // 中文乱码
                    'Content-Type': 'text/html; charset=utf-8'
                },
                // 是否跨域
                option.crossDomain ? headers : {}
            ),
            option.headConfig
        )
    }
}
export const formatResult = ({
    data, method, params, result, extra
}) => {
    try {
        result = JSON.parse(
            JSON.stringify(
                typeof data[method] == 'function' 
                ? data[method](method, params, result, extra) 
                : data[method] instanceof Object 
                    ? data[method]
                    : {}
            )
        )
    } catch (e) {
        result = {}
    }
    if (!(result instanceof Object)) {
        result = {}
    }
    return result
}

export const mockResult = (result) => {
    return result instanceof Object ? Mock.mock(result) : result
}
export const authHandler = ({
    http,
    data,
    option,
    urlKey,
    headConfig
}) => {
    if (urlKey !== option.loginUrl && option.bounded && !data.public && !auth.verify()) {
        http.writeHead(401, headConfig)
        http.end({
            code: 401,
            message: urlKey && urlKey === option.logoutUrl ? '退出失败' : '权限不足, 请先登录'
        })
        return false
    }
}
export const errorHandler = ({
    http,
    data,
    method, 
    params, 
    result,
    headConfig,
    extra
}) => {
    if (typeof data.error === 'function') {
        let errResult = data.error(method, params, result, extra)
        if (errResult) {
            // 返回函数时, 可以在data.error得到两个参数res, headConfig, 方便进行自定义的错误输出
            if (typeof errResult === 'function') {
                errResult(http, headConfig)
                // 返回对象时, 将其作为错误信息输出
            } else if (typeof errResult === 'object') {
                http.writeHead(400, headConfig)
                http.end(errResult)
                // 输出默认错误信息
            } else {
                http.writeHead(400, headConfig)
                http.end({
                    code: 400,
                    message: typeof errResult === 'string' ? errResult : '请求出错'
                })
            }
            return false
        }
    }
}
export const relayHandler = ({
    req,
    url,
    http,
    urlKey,
    data,
    method,
    params,
    option,
    headConfig,
    extra
}) => {
    if (data.relay && /(string|function)/.test(typeof data.relay) || data.relay instanceof Object) {
        let relay = typeof data.relay === 'function' ? data.relay(method, params, data[method], extra) : data.relay
        if (!Array.isArray(relay)) {
            relay = [relay]
        }
        if (relay.length) {
            let url = typeof relay[0] === 'string' ? relay[0] : relay[0] instanceof Object ? relay[0].url : ''
            if (url && !/(http(s)|\/\/)/.test(url)) {
                let protocol = req.headers.referer.split(':')[0] + ':'
                if (typeof relay[0] == 'string') {
                    relay[0] = protocol + '//' + (req.headers.host + relay[0]).replace(/\/+/g, '/')
                } else if(relay[0] instanceof Object) {
                    relay[0].url = protocol + '//' + (req.headers.host + relay[0].url).replace(/\/+/g, '/')
                }
            }
        }
        request.apply(request, relay.concat((error, response, body) => {
            if (!error) {
                try {
                    if (response.statusCode === 200) {
                        http.writeHead(200, headConfig)
                        http.end(body)
                    } else {
                        http.writeHead(response.statusCode, headConfig)
                        http.end(body)
                    }
                    // 如果是登录入口请求成功
                    if (method === 'post' && urlKey === option.loginUrl) {
                        auth.login(params)
                    }
                } catch (e) {
                    console.log(e)
                }
            } else {
                http.writeHead(400, headConfig)
                http.end({
                    code: 400,
                    message: "请求失败"
                })
                console.log(error);
            }
        }))
        return false
    }
}
export const methodHandler = ({
    req,
    url,
    http,
    urlKey,
    data,
    method,
    params,
    option,
    headConfig,
    result,
    transfer,
    extra
}, next) => {
    // 请求成功的链接是登录入口, 没有被上面的错误拦截, 则视为登录成功
    if (urlKey === option.loginUrl) {
        auth.login(params)
    }
    if (urlKey === option.logoutUrl) {
        auth.logout()
    }
    // 如果存在当前的请求方法, 先根据配置进行处理, 再判断是否需要转交给 json-server
    let formatResult = data[method] && data.format ? data.format(method, params, result, extra) : undefined;
    if (formatResult) {
        result = formatResult;
    } else if (transfer) {
        // 如果没有配置当前的请求方法, 则后续操作由json-server控制
        next()
        return false
    }
    if (result instanceof Promise) {
        try {
            result.then((data) => {
                http.writeHead(200, headConfig)
                http.end(data)
            }).catch((e) => {
                http.writeHead(500, headConfig)
                http.end(e)
            })
        } catch(e) {}
        return false
    } else {
        http.writeHead(200, headConfig)
    }
    return true
}

export default {
    Http,
    getInfo,
    once,
    formatResult,
    mockResult,
    authHandler,
    errorHandler, 
    relayHandler,
    methodHandler
}
