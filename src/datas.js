var localStorage = require('./localstorage');

module.exports = function() {
  return {
    // 登录
    login: {
      // 请求方法, 请求数据, 未处理时的返回结果
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

}