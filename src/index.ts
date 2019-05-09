import server from './server.js'

function KsMock(option) {
    this.option = option
}

KsMock.prototype.apply =  function (compiler){
    server(this.option)
    compiler.plugin("emit", (compilation, callback) => {
        callback()
    })
}

export default KsMock
