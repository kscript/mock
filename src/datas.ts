export let login = {
    // 转发
    relay: '',
    // 格式化请求结果
    format: (method, params, result) => {
    },
    // 模拟请求出错
    error: (method, params, result) => {
    },
    // post方法的默认请求结果
    post: {
    }
}
export let info = {
    error: (method, params, result) => {
        console.log(method, params, result)
        if (!params.username) {
            return '参数不足'
        }
    },
    post: {
        code: 200,
        message: 'ok',
        data: {
            text: "hello world"
        }
    }
}
export default {
    login,
    info
}
