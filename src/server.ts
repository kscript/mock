import * as path from 'path';
import jsonServer from 'json-server';
import auth from './auth';
import config from './config';
import rules from './rules';
import * as https from 'https';
import { Http, noop, getInfo, formatResult, mockResult, authHandler, errorHandler, relayHandler, methodHandler } from './utils'
import * as  fs from 'fs';
import { mock } from '../';
const server = jsonServer.create()
// 路径从根目录开始?
const router = jsonServer.router(path.resolve(process.cwd(), 'db.json'))

const createServer = (option: mock.anyObject, callback?: Function) => {
    let config = option.https
    config = /^(boolean|number)$/.test(typeof config) ? config && {} : config
    let currentServer
    if (config instanceof Object) {
        if (typeof config.static === 'function') {
            config.static(jsonServer, server)
        } else {
            const middlewares = jsonServer.defaults({
                static: typeof config.static === 'string' ? config.static : path.resolve(process.cwd(), './public')
            })
            server.use(middlewares)
        }
        if (typeof config.key !== 'string' || typeof config.cert !== 'string' || config.key.length + config.cert.length === 0) {
            config.key = fs.readFileSync(path.join(__dirname, 'ssl/key.pem'))
            config.cert = fs.readFileSync(path.join(__dirname, 'ssl/cert.pem'))
            console.log("正在使用默认的证书配置")
        }
        currentServer = https.createServer(config, server).listen(option.port, function () {
            console.log()
            console.log(`已启动json-server服务器 https://localhost:${option.port}`)
            console.log()
            typeof callback == 'function' && callback();
        })
    } else {
        currentServer = server.listen(option.port, () => {
            console.log()
            console.log(`已启动json-server服务器 http://localhost:${option.port}`)
            console.log()
            typeof callback == 'function' && callback();
        })
    }
    currentServer.on('error', (...rest) => {
        option.port++
        createServer(option, callback)
    })
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
const Server = (option: mock.anyObject, callback?: Function) => {
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
        if (noop(option.interceptor)(req, res, next) === false) {
            return ;
        }
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
            result = formatResult({
                data,
                method,
                params,
                result
            })
            const allOption = {
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
                transfer
            }
            // 2. 处理鉴权
            if (authHandler(allOption) === false) { return }
            // 3. 处理错误
            if (errorHandler(allOption) === false) { return }
            // 4. 处理转发请求
            if (relayHandler(allOption) === false) { return }
            // 5. 验证请求方法是否存在
            if (data[method] || transfer) {
                if (methodHandler(allOption, next) === false) { return }
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
    createServer(option, callback)
}
export default Server
