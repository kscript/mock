import server from './server.js'
import datas from './datas.js'

server({
  mockData: datas,
  port: 3031,
  loginUrl: 'login',
  logoutUrl: 'logout'
})
