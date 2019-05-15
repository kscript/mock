class Base {
    data: anyObject = {}
    get(key?: string): any {
        return key ? this.data[key] : this.data
    }
    set(key: string, val: any): Base {
        this.data[key] = val
        return this
    }
    reset(obj: anyObject): Base {
        this.clear()
        Object.assign(this.data, obj)
        return this
    }
    clear(): Base {
        for (let key in this.data) {
            delete this.data[key]
        }
        return this
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
