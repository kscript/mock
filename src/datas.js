var localStorage = require('./localstorage');

module.exports = {
  // 登录
  login: {
    /**
     * 对返回数据进行二次包装
     * @param {string} method 请求方法
     * @param {object} data 请求数据
     * @param {object} result 未处理时的返回结果
     */
    format: function(method, data, result){
      if(method === 'post'){
        result.data.token = 'new token';
      }
      return result;
    },
    get: {
      code: 200,
      message: 'ok',
      data: {
        appKey: localStorage.getItem('appKey'),
        token: localStorage.getItem('token')
      }
    },
    post: {
      code: 200,
      message: 'ok',
      data: {
        appKey: localStorage.getItem('appKey'),
        token: localStorage.getItem('token')
      }
    }
  }
}