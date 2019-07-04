import server from './server.js'
import datas from './datas.js'
import * as  fs from 'fs';

server({
  mockData: datas,
  port: 3030,
  loginUrl: 'login',
  logoutUrl: 'logout',
  https: {
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/cert.pem')
  }
})
