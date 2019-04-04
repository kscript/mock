// import auth from './auth.js'
// import config from './config.js'
export default {
    login: {
        // 转发
        relay: null,
        // 格式化请求结果
        format: function(method, params, result){

        },
        // 模拟请求出错
        error: function(method, params, result){

        },
        // post方法的默认请求结果
        post: {

        }
    },
    test: {
        get: {
            code: 200,
            message: 'ok',
            data: {
                text: "hello world"
            }
        }
    }
}
