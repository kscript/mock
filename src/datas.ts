
const config = {
    username: 'admin',
    password: '123456',
    retryUrl: 'http://localhost:3030/info'
}
const defaultConfig = Object.assign({}, config)

export const login: api = {
    // 转发
    relay: '',
    // 格式化请求结果
    format (method, params, result, { body }) {
        return Object.assign(body || {}, result)
    },
    // 模拟请求出错
    error (method, params, result, { body }) {
        if (params.username !== config.username || params.password !== config.password) {
            return (res, headConfig) => {
                res.writeHead(400, headConfig)
                res.end(JSON.stringify({
                    code: 400,
                    message: '密码错误'
                }))
            }
        }
    },
    // post方法的默认请求结果
    post: {
        message: '登录成功!'
    }
}
export const logout: api = {
    format: (method, params, result, { body }) => {
        return Object.assign(body || {}, result)
    },
    post: {
        message: '退出成功!'
    }
}
export const relay: api = {
    relay (method, params, result) {
        return {
            url: config.retryUrl,
            method,
            form: params,
            json: true
        }
    }
}
export const info: api = {
    error(method, params, result) {
        if (!params.username) {
            return '参数不足'
        }
    },
    format(method, params, result) {
        result.message = 'hello ' + (params.username || 'world')
        // 不返回, 那么修改无效
        return result
    },
    get: {
        code: 200,
        message: 'ok',
        data: {}
    }
}
export const settings: api = {
    // 公开当前接口
    public: true,
    format(method, params, result) {
        if (method === 'get') {
            if (params.type === 'default') {
                result.data = defaultConfig
            } else {
                result.data = config
            }
        } else if (method === 'post') {
            Object.assign(config, params)
            result.data = config
        }
        return result
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
}
export default {
    info,
    login,
    logout,
    relay,
    settings
}
