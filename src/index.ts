import server from './server.js'
class KsMock {
    option = {}
    constructor(option) {
        this.option = option
    }
    apply(compiler) {
        server(this.option)
        compiler.plugin("emit", function (compilation, callback) {
            callback()
        })
    }
    server(option) {
        server(option || this.option)
    }
}
export default KsMock
