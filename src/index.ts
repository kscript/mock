import server from './server.js'

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
