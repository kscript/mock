import { user, server } from './config'
/**
 * 用户权限管理
 */
class Auth {
    /**
     * 获取属性值
     * @param key 属性
     */
    get(key: string): any {
        if (typeof key === 'string') {
            return user.get('key')
        }
        return JSON.parse(JSON.stringify(user.get()))
    }
    /**
     * 登录
     * @param data 登录时携带的信息
     */
    login(data: Object): void {
        user.reset(data)
        server.set('login', true)
    }
    /**
     * 退出登录
     */
    logout(): void {
        user.clear()
        server.set('login', false)
    }
    /**
     * 验证是否登录
     */
    verify(): boolean {
        return server.get('login')
    }
}
export default new Auth
