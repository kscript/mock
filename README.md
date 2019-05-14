## ks-mock
一个mock服务端api的工具, 从 1.1.3 版本起, 除模拟请求api接口数据外, 还提供了触发 鉴权、请求错误 机制的功能

## npm命令
``` npm
  # 用于构建mock服务器
  npm run bundle

  # webpack 插件模式
  npm run build

  # 打包并运行mock服务器
  npm run mock
```

## 使用场景
### 1. 作为单独的 mock 服务器使用
下载
```git
  git clone https://github.com/kscript/mock.git
```
安装
```npm
  npm i
```
运行
```npm
  npm run mock
```
项目运行后, 打开首页(http://localhost:3030) 可查看demo


### 2. 作为webpack 插件使用
安装
```npm
  npm i ks-mock -D
```
使用
```javascript
// webpack.config.js
const KsMock = require("ks-mock");
module.exports = {
  ...
  plugins: [
    new KsMock({
      mockData: {}, 
      headConfig: null, // 服务器请求头设置
      crossDomain: true, // 是否允许跨域 当 headConfig 不为空时忽略该项
      port: 3030
    })
    ...
  ]
}
```

### 目录结构
|- public  <font color="green">demo文件夹</font>  
|- src  <font color="green">源码文件夹</font>  
|- -- auth.ts  <font color="green">用户权限</font>  
|- -- config.ts  <font color="green">mock服务器的一些配置</font>  
|- -- datas.ts  <font color="green">返回数据</font>  
|- -- index.ts  <font color="green">插件模式入口</font>  
|- -- localhost.ts  <font color="green">mock服务器模式入口</font>  
|- -- server.ts  <font color="green">mock服务器实例</font>  
|- db.json  <font color="green">json-server数据库</font>  
|- index.js  <font color="green">rollup打包后的插件入口</font>  
|- localhost.js  <font color="green">rollup打包后的 mock服务器 入口</font>  
|- package.json  
|- rollup.config.js  <font color="green">rollup配置</font>  


### 配置项
|属性|类型|默认值|说明|
|--|--|--|--|
| mockData | object | {} | 模拟属性相关的配置 |
| headConfig | object | null | 服务器请求头设置 |
| crossDomain | boolean | true | 是否允许跨域 当 headConfig 不为空时, 忽略该项 |
| port | number | 3030 | 端口号 |
| loginUrl | string | - | 登录地址, 如果配置了loginUrl, 那么除登录和public属性为true的接口外, 其它接口必须在登录之后才可以正常执行 |
| logoutUrl | string | - | 退出登录地址 |

mockData 属性, 存放客户端请求api时的返回数据, 以及对返回数据的一些操作  
支持的可选操作有: 
1. 对返回数据的包装
2. 返回错误信息
3. 转发请求

返回数据支持 mock.js 中的写法, [查看 mock.js 使用文档](https://github.com/nuysoft/Mock/wiki), 但如果进入2和3操作时, 那么 mock.js 写法无效

``` js
  {
    // 请求地址
    url: {
      // 默认除登录外的接口都需要鉴权, 但设置了public, 则表示当前接口不需要鉴权
      public: true,
      /**
       * 对模拟返回的数据进行包装
       * @func
       * @param {string} method 请求方法
       * @param {object} params 请求参数
       * @param {any} result 默认返回结果的副本
       * @desc 无返回值时, 则放弃修改
       */
      format: (method, params, result) => {}, 
      /**
       * 对模拟返回的数据进行包装
       * @func
       * @param {string} method 请求方法
       * @param {object} params 请求参数
       * @param {any} result 默认返回结果的副本
       * @desc 返回值说明: 
       * 1. function(res, headConfig) - 通过方法来自定义报错信息
       * 2. object - 作为报错信息 
       * 3. string - 作为报错信息内容 (使用默认的报错结构)
       * 4. 其它 - 没有错误, 继续向下执行~
       */
      error: (method, params, result) => {
        // 1
        return function(res, headConfig){
          res.writeHead(400, headConfig)
          res.end(JSON.stringify({
            code: 400,
            message: '未知错误'
          }))
        }
        // 2
        return {
          code: 400,
          message: '未知错误'
        }
        // 3
        return '未知错误'
      }, 
      /**
       * 转发请求
       * @func
       * @param {string} method 请求方法
       * @param {object} params 请求参数
       * @param {any} result 默认返回结果的副本
       * @desc relay 可以是一个url字符串
       * @returns 参数数组, 会通过 apply 传给 request 模块, 参数说明参考 request 模块, (预置了最后一个函数参数, 建议不要传这个参数)
      */
      relay: (method, params, result) => {
        return ['url', {}, () => {}]
      },
      // 请求方法, 返回数据
      // 返回数据可以使用 mockjs 来填充数据, 也可以直接写json
      get: {
        // ...
      },
      // 如果在 db.json 中配置了当前url, 则post请求会被 json-server 拦截
      // 请求被拦截的优先级: 鉴权 > 错误处理error > 转发请求relay > json-server
      post: {
        // ...
      },
    }
  }
```

### 流程图
![流程图](./flowsheet.svg)

### License
MIT
