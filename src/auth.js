// 服务端信息
let server = {
    login: false
}
// 用户信息
let user = {
}
export default {
    get: function(key) {
        if (typeof key === 'string') {
            return user[key]
        }
        return JSON.parse(JSON.stringify(user))
    },
    login: function(data){
        user = data
        server.login = true
    },
    logout: function(){
        user = {}
        server.login = false
    },
    verify: function(data){
        return server.login
    }
}
