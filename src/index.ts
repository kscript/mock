import server from './server.js'
/**
 * mock实例
 * @param option 配置
 */
function KsMock(option) {
    this.option = option
}

KsMock.prototype.apply = function (compiler) {
    server(this.option)
    compiler.plugin("emit", function (compilation, callback) {
        callback()
    })
}
KsMock.prototype.server = function (option) {
    server(option || this.option)
}

export default KsMock
