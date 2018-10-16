// 作为 webpack 插件项目时的入口
const server = require('./src/server.js');

function KsMock({ config = {}, port = 3000}) {
    this.config = config;
    this.port = port;
}

KsMock.prototype.apply = function (compiler) {
    server(this.config, this.port);
    compiler.plugin("emit", (compilation, callback) => {
        callback();
    });
}

module.exports = KsMock;