const Mock = require('mockjs')
const path = require('path')
const jsonServer = require('json-server')
const server = jsonServer.create()
// 路径从根目录开始?
const router = jsonServer.router(path.resolve(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()
// 需要跨域时的请求头配置
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Credentials': true
}
// 验证是否是符合要求的对象
const isVerified = obj => {
  if(obj instanceof Object) {
    for(let key in obj){
      if(obj.hasOwnProperty(key)){
        return true
      }
    }
  }
  return false
}
server.use(middlewares)
/**
 * 启动mock服务
 * @func
 * @param {object} config mock 服务配置
 * @param {mockData} config.mockData - mock数据json(支持 mockjs 中的写法)
 * @param {headConfig=} config.headConfig - 服务端请求头信息配置
 * @param {boolean=} config.crossDomain - 是否跨域
 * @param {number=} port - 服务器端口
 */
const Server = (config = {}, port = 3030) => {

  // To handle POST, PUT and PATCH you need to use a body-parser
  // You can use the one used by JSON Server
  server.use(jsonServer.bodyParser)

  server.use((req, res, next) => {
    let mockData = config.mockData || {}
    let result = {};
    let url = req._parsedUrl.pathname.slice(1)
    let data = mockData[url]
    let method = req.method.toLowerCase()
    // 处理请求头信息
    let headConfig = isVerified(config.headConfig) ? config.headConfig : config.crossDomain ? headers : {}
    // 处理中文乱码
    headConfig['Content-Type'] = headConfig['Content-Type'] || 'text/html; charset=utf-8'
    // 验证接口是否存在
    if (data) {
      // 验证请求方法是否存在
      if (data[method]) {
        res.writeHead(200, headConfig)
        result = Mock.mock(data[method])
        if (data.format) {
          let params = Object.assign({}, req.body || {}, req.query)
          result = data.format(method, params , result) || result
        }
      } else {
        res.writeHead(405, headConfig)
        result = {
          code: 405,
          message: '方法错误'
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

  server.use(router)
  server.listen(port, () => {
    console.log()
    console.log(`已启动json-server服务器 http://localhost:${port}`)
    console.log()
  })
}

module.exports = Server
