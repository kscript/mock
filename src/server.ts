import Mock from 'mockjs';
import * as path from 'path';
import jsonServer from 'json-server';
import auth from './auth.js';
import config from './config.js';
const request = require('request');
const server = jsonServer.create()
// 路径从根目录开始?
const router = jsonServer.router(path.resolve(process.cwd(), 'db.json'))
const middlewares = jsonServer.defaults({
    static: path.resolve(__dirname, './public')
})

server.use(middlewares)

const getInfo = (req, option, headers) => {
    let url = req._parsedUrl.pathname.replace(/^\//, '')
    return {
        url,
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

/**
 * 启动mock服务
 * @func
 * @param {object} option mock 服务配置
 * @param {mockData} option.mockData - mock数据json(支持 mockjs 中的写法)
 * @param {headoption=} option.headoption - 服务端请求头信息配置
 * @param {boolean=} option.crossDomain - 是否跨域 (便于在不设置请求头时, 快速配置跨域)
 * @param {number=} port - 服务器端口
 */
const Server = option => {
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
        jsonServer.rewriter({
            '/api/*': '$1'
        })
    )

    server.use((req, res, next) => {
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
            result = JSON.parse(JSON.stringify(data[method] || {}))
            if (!(result instanceof Object)) {
                result = {}
            }
            // 2. 处理鉴权
            // 当前链接不是登录入口 && 启用了鉴权功能 && 当前api需要鉴权 && 用户未能通过鉴权
            if(urlKey !== option.loginUrl && option.bounded && !data.public && !auth.verify()) {
                res.writeHead(401, headConfig)
                res.end(JSON.stringify({
                    code: 401,
                    message: urlKey && urlKey === option.logoutUrl ? '退出失败' : '权限不足, 请先登录'
                }))
                return 
            }
            // 3. 处理错误
            if (data.error && typeof data.error === 'function') {
                let errResult = data.error(method, params, result, { url })
                if (errResult) {
                    // 返回函数时, 可以在data.error得到两个参数res, headConfig, 方便进行自定义的错误输出
                    if (typeof errResult === 'function') {
                        errResult(res, headConfig)
                    // 返回对象时, 将其作为错误信息输出
                    } else if (typeof errResult === 'object') {
                        res.writeHead(400, headConfig)
                        res.end(JSON.stringify(errResult))
                    // 输出默认错误信息
                    } else {
                        res.writeHead(400, headConfig)
                        res.end(JSON.stringify({
                            code: 400,
                            message: typeof errResult === 'string' ? errResult : '请求出错'
                        }))
                    }
                    return
                }
            }
            // 4. 处理转发请求
            if (data.relay) {
                let relay = typeof data.relay === 'function' ? data.relay(method, params, data[method], { url }) : data.relay
                if (!Array.isArray(relay)){
                    relay = [relay]
                }
                request.apply(request, relay.concat((error, response, body) => {
                    if (!error) {
                        try{
                            if (response.statusCode === 200) {
                                res.writeHead(200, headConfig)
                                res.end(JSON.stringify(body))
                            } else {
                                res.writeHead(response.statusCode, headConfig)
                                res.end(JSON.stringify(body))
                            }
                            // 如果是登录入口请求成功
                            if (method === 'post' && urlKey === option.loginUrl) {
                                auth.login(params)
                            }
                        } catch(e) {
                            console.log(e)
                        }
                    } else {
                        res.writeHead(400, headConfig)
                        res.end(JSON.stringify({
                            code: 400,
                            message: "请求失败"
                        }))
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
                // 如果存在当前的请求方法, 先根据配置进行处理, 再转交给 json-server
                if (data[method]) {
                    if (data.format) {
                        result = data.format(method, params, result, { url }) || result
                    }
                }
                // 如果没有配置当前的请求方法, 则后续操作由json-server控制
                if (transfer) {
                    next()
                    return 
                }
                res.writeHead(200, headConfig)
                result = Mock.mock(result)
            } else {
                res.writeHead(405, headConfig)
                result = {
                    code: 405,
                    message: '请求方法错误'
                }
            }
        } else {
            res.writeHead(404, headConfig)
            result = {
                code: 404,
                message: '请求地址不存在'
            }
        }
        res.end(JSON.stringify(result))
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
            code: 200,
            message: 'ok',
            data: res.locals.data
        }
        if (urlKey === option.loginUrl) {
            auth.login(params)
            Object.assign(body, {
                message: '登录成功!'
            }, mockData[method])
        } else if (urlKey === option.logoutUrl) {
            auth.logout()
            Object.assign(body, {
                message: '退出成功!'
            }, mockData[method])
        }
        if (mockData[method] instanceof Object && typeof mockData[method].format == 'function') {
            body = mockData[method].format(method, params, JSON.parse(JSON.stringify(body))) || body
        }
        // post成功后, 对其返回数据进行包装
        res.status(201).jsonp(body)
    }
    server.use(router)
    server.listen(option.port, () => {
        console.log()
        console.log(`已启动json-server服务器 http://localhost:${option.port}`)
        console.log()
    })
}
export default Server
