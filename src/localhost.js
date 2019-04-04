import server from './server.js'
import datas from './datas.js'

server({
  mockData: datas,
  loginUrl: 'login',
  logoutUrl: 'logout'
})
