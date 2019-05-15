class Base {
    data = {}
    get(key?: string) {
        return key ? this.data[key] : this.data
    }
    set(key: string, val: any) {
        this.data[key] = val
    }
    reset(obj: Object) {
        this.clear()
        Object.assign(this.data, obj)
    }
    clear() {
        for (let key in this.data) {
            delete this.data[key]
        }
    }
}
class Server extends Base {
    data: {
        login: false
    }
}
class User extends Base {
    data: {
    }
}

export const server = new Server;
export const user = new User;

export const crossDomain = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': true
}
export default {
    user,
    server,
    crossDomain
}
