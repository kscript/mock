import { user, server } from './config'

class Auth {
    get(key: string) {
        if (typeof key === 'string') {
            return user.get('key')
        }
        return JSON.parse(JSON.stringify(user.get()))
    }
    login(data: Object) {
        user.reset(data)
        server.set('login', true)
    }
    logout() {
        user.clear()
        server.set('login', false)
    }
    verify(): boolean {
        return server.get('login')
    }
}
export default new Auth
