import Mock from 'mockjs';
import path from 'path';
import request from 'request';
import jsonServer from 'json-server';
import auth from './auth.js';
import config from './config.js';
const server = jsonServer.create()
// 路径从根目录开始?
const router = jsonServer.router(path.resolve(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()

server.use(middlewares)

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
        bounded: !!option.loginUrl
    }, option)

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
            data,
            method,
            urlKey,
            params,
            headConfig
        } = getInfo(req, option, config.crossDomain)
        let result = {}
        let err = null;
        let transfer = method === 'post' && router.db.__wrapped__.hasOwnProperty(urlKey)
        // 访问受限
        if ((transfer || data) && option.bounded && !auth.verify()) {
            // 当前链接不是登录入口
            if (urlKey !== option.loginUrl) {
                res.writeHead(401, headConfig)
                res.end(JSON.stringify({
                    code: 401,
                    message: urlKey && urlKey === option.logoutUrl ? '退出失败' : '权限不足, 请先登录'
                }))
                return
            }
        }
        if (data || transfer) {
            data = data || {}
            // 转发请求
            if (data.relay) {
                let relay = typeof data.relay === 'function' ? data.relay(method, params, data[method]) : data.relay
                request(relay, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        res.writeHead(200, headConfig)
                        res.send(body)
                    } else {
                        res.writeHead(400, headConfig)
                        res.end(JSON.stringify({
                            code: 400,
                            message: "请求失败"
                        }))
                    }
                })
                return
            }
            // 验证请求方法是否存在
            if (data[method] || transfer) {
                if (data[method]) {
                    result = JSON.parse(JSON.stringify(data[method] || {}))
                    if (data.format) {
                        result = data.format(method, params, result) || result
                    }
                    // 处理错误
                    typeof data.error === 'function' && (err = data.error(method, params, result))
                    if (err) {
                        // 自定义错误输出
                        if (typeof err === 'function') {
                            err(res, headConfig)
                        } else if (typeof err === 'object') {
                            res.writeHead(400, headConfig)
                            res.end(JSON.stringify(err))
                        } else {
                            res.writeHead(400, headConfig)
                            res.end(JSON.stringify({
                                code: 400,
                                message: "请求出错"
                            }))
                        }
                        return
                    }
    
                    // 请求成功的链接是登录入口
                    if (urlKey === option.loginUrl) {
                        auth.login(params)
                        next()
                        return 
                    }
                } else {
                    // 如果路由里存在该 post 请求, 则后续操作由json-server控制
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
        mockData = mockData || {}
        let url = req._parsedUrl.pathname.replace(/^\//, '')
        let urlKey = (url || '').replace(/\/$/, '').replace(/\//g, '_')
        let params = Object.assign({}, req.body || {}, req.query)
        let method = req.method.toLowerCase()
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
        // post成功后, 对其返回数据进行包装
        res.status(201).jsonp(body)
    }
    server.use(router)
    server.listen(option.port, () => {
        console.log()
        console.log(`已启动json-server服务器 http://localhost:${option.port}`)
        console.log()
    })

    function getInfo(req, option, headers) {
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
}
export default Server
