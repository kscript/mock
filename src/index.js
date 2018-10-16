// 普通项目入口
const server = require('./server.js');
const datas = require('./datas.js');
server(
  {
    mockData: datas,
    headConfig: null,
    crossDomain: true
  },
  3000
);