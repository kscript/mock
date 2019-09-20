const fs = require('fs');
const ksMock = require('../index');
const datas = require('./datas');

new ksMock({
  mockData: datas,
  port: 3030,
  loginUrl: 'login',
  logoutUrl: 'logout',
  https: false,
  // https: {
  //   key: fs.readFileSync('ssl/key.pem'),
  //   cert: fs.readFileSync('ssl/cert.pem')
  // }
}).server();
