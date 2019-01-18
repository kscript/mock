let store = require('./localstorage').store

module.exports = {
  // 登录
  login: {
    /**
     * 对返回数据进行二次包装
     * @param {string} method 请求方法
     * @param {object} data 请求参数
     * @param {object} result 不处理时的返回结果
     */
    format: function(method, data, result){
      // if(method === 'post'){
      //   result.data.token = 'new token'
      // }
      return result
    },
    get: {
      code: 200,
      message: 'ok',
      data: {
        uid: '@natural(1000,99999999)',
        token: '@GUID',
        appKey: store.appKey
      }
    },
    post: {
      code: 200,
      message: 'ok',
      data: {
        uid: '@natural(1000,99999999)',
        token: '@GUID',
        appKey: store.appKey
      }
    }
  }
}
