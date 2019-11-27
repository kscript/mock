import * as path from 'path';
import jsonServer from 'json-server';
import auth from './auth';
import config from './config';
import rules from './rules';
import * as https from 'https';
import { getInfo, mockResult, Http } from './utils'
import * as  fs from 'fs';
const request = require('request');
const server = jsonServer.create()
// 路径从根目录开始?
const router = jsonServer.router(path.resolve(process.cwd(), 'db.json'))
const middlewares = jsonServer.defaults({
    static: path.resolve(__dirname, './public')
})

server.use(middlewares)
const createServer = (option: anyObject, callback?: Function) => {
    let config = option.https
    config = /^(boolean|number)$/.test(typeof config) ? config && {} : config
    if (config instanceof Object) {
        if (typeof config.key !== 'string' || typeof config.cert !== 'string' || config.key.length + config.cert.length === 0) {
            config.key = fs.readFileSync(path.join(__dirname, 'ssl/key.pem'))
            config.cert = fs.readFileSync(path.join(__dirname, 'ssl/cert.pem'))
            console.log("正在使用默认的证书配置")
        }
        https.createServer(config, server).listen(option.port, function () {
            console.log()
            console.log(`已启动json-server服务器 https://localhost:${option.port}`)
            console.log()
            typeof callback == 'function' && callback();
        })
    } else {
        server.listen(option.port, () => {
            console.log()
            console.log(`已启动json-server服务器 http://localhost:${option.port}`)
            console.log()
            typeof callback == 'function' && callback();
        })
    }
}
/**
 * 启动mock服务
 * @func
 * @param {object} option mock 服务配置
 * @param {mockData} option.mockData - mock数据json(支持 mockjs 中的写法)
 * @param {headoption=} option.headoption - 服务端请求头信息配置
 * @param {boolean=} option.crossDomain - 是否跨域 (便于在不设置请求头时, 快速配置跨域)
 * @param {number=} port - 服务器端口
 */
const Server = (option: anyObject, callback?: Function) => {
    option = Object.assign({
        port: 3030,
        crossDomain: true,
        headoption: null,
        mockData: {},
        bounded: !!option.loginUrl
    }, option)
    let mockData = option.mockData
    // To handle POST, PUT and PATCH you need to use a body-parser
    // You can use the one used by JSON Server
    server.use(jsonServer.bodyParser)

    // 路由映射
    server.use(
        jsonServer.rewriter(option.rules instanceof Object ? option.rules : rules)
    )
    server.use((req, res, next) => {
        const http = new Http(res)
        let {
            url,
            data,
            method,
            urlKey,
            params,
            headConfig
        } = getInfo(req, option, config.crossDomain)
        let result = {}
        // 是否需要将接口的处理逻辑交由json-server
        let transfer = method === 'post' && router.db.__wrapped__.hasOwnProperty(urlKey)

        // 1. 验证用户请求的api地址是否有数据
        if (data || transfer) {
            data = data || {}
            try {
                result = JSON.parse(
                    JSON.stringify(
                        typeof data[method] == 'function' 
                        ? data[method](method, params, result) 
                        : data[method] instanceof Object 
                            ? data[method]
                            : {}
                    )
                )
            } catch (e) {}
            if (!(result instanceof Object)) {
                result = {}
            }
            // 2. 处理鉴权
            // 当前链接不是登录入口 && 启用了鉴权功能 && 当前api需要鉴权 && 用户未能通过鉴权
            if (urlKey !== option.loginUrl && option.bounded && !data.public && !auth.verify()) {
                http.writeHead(401, headConfig)
                http.end({
                    code: 401,
                    message: urlKey && urlKey === option.logoutUrl ? '退出失败' : '权限不足, 请先登录'
                })
                return
            }
            // 3. 处理错误
            if (data.error && typeof data.error === 'function') {
                let errResult = data.error(method, params, result, { url })
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
                    return
                }
            }
            // 4. 处理转发请求
            if (data.relay) {
                let relay = typeof data.relay === 'function' ? data.relay(method, params, data[method], { url }) : data.relay
                if (!Array.isArray(relay)) {
                    relay = [relay]
                }
                if (relay.length) {
                    if (!/(http(s)|\/\/)/.test(relay[0])) {
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
                return
            }
            // 5. 验证请求方法是否存在
            if (data[method] || transfer) {
                // 请求成功的链接是登录入口, 没有被上面的错误拦截, 则视为登录成功
                if (urlKey === option.loginUrl) {
                    auth.login(params)
                }
                if (urlKey === option.logoutUrl) {
                    auth.logout()
                }
                // 如果存在当前的请求方法, 先根据配置进行处理, 再判断是否需要转交给 json-server
                let formatResult = data[method] && data.format ? data.format(method, params, result, { url }) : undefined;
                if (formatResult) {
                    result = formatResult;
                } else if (transfer) {
                    // 如果没有配置当前的请求方法, 则后续操作由json-server控制
                    next()
                    return
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
                    return
                } else {
                    http.writeHead(200, headConfig)
                }
            } else {
                http.writeHead(405, headConfig)
                result = {
                    code: 405,
                    message: '请求方法错误'
                }
            }
        } else {
            http.writeHead(404, headConfig)
            result = {
                code: 404,
                message: '请求地址不存在'
            }
        }
        http.end(result)
    })

    router.render = (req, res) => {
        let {
            url,
            data,
            method,
            urlKey,
            params,
        } = getInfo(req, option, config.crossDomain)
        mockData = mockData || {}
        let body = {
            code: 201,
            message: 'ok',
            data: res.locals.data
        }
        let current = mockData[urlKey]

        if (urlKey === option.loginUrl) {
            auth.login(params)
        } else if (urlKey === option.logoutUrl) {
            auth.logout()
        }
        if (current && typeof current.format === 'function') {
            body = mockResult(current.format(
                method,
                params,
                JSON.parse(JSON.stringify(current[method] instanceof Object ? current[method] : {})),
                {
                    url,
                    body: JSON.parse(JSON.stringify(body))
                }
            ) || body)
        }
        // post成功后, 对其返回数据进行包装
        res.status(200).jsonp(body)
    }
    server.use(router)
    createServer(option, callback);
}
export default Server
