## ks-mock
一个模拟服务端api的工具, 支持 https、触发鉴权、模拟接口、模拟请求错误、转发请求、异步操作 等功能

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


### 2. 在项目中使用
- 安装
```npm
  npm i ks-mock -D
```
- 添加 mock 文件夹, 参照如下示例, 添加入口文件 index.js 和处理用于处理返回数据的文件 datas.js


```javascript
// index.js
const KsMock = require("ks-mock");
const datas = require('./datas.js');
new KsMock({
    mockData: datas,
    headConfig: null,
    crossDomain: true,
    port: 3030,
    loginUrl: 'login',
    https: {
      key: '',
      cert: ''
    }
}).server();
```
```javascript
// datas.js
module.exports = {
    login: {
        format: (method, params, result, { body }) => {
          Object.assign(result.data, params);
          // 同步
          return result
          // 异步
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              // reject(result)
              resolve(result)
            }, 1e4)
          })
        },
        post: {
          data: {},
          message: "登录成功!"
        }
    },
};
```

- 在 package.json 添加命令
```
"mock": "node mock"
```

### 3. 作为 webpack 插件使用
安装
```npm
  npm i ks-mock -D
```
使用
```javascript
// webpack.config.js
const path = require('path');
const KsMock = require("ks-mock");
module.exports = {
  ...
  plugins: [
    new KsMock({
      // // 静态文件目录
      // static: path.join(__dirname, 'upload'),

      // 上传文件/写入文件前的钩子
      // beforeUpload(req, file, done) {
      //   // 参数: 错误对象, 要存储的目录
      //   done(null, '')
      // },
      // beforeWrite(req, file, done) {
      //   // 参数: 错误对象, 要存储的文件名
      //   done(null, '')
      // },

      mockData: {},
      headConfig: null,
      crossDomain: true,
      port: 3030,

      // // 配置路由重写规则
      // rules: {
      //   '/api/*': '/api?name=$1'
      // },

      // // 配置https证书
      // https: {
      //   key: '',
      //   cert: ''
      // }
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
|- -- rules.ts  <font color="green">路由重写规则</font>  
|- -- server.ts  <font color="green">mock服务器实例</font>  
|- -- utils.ts  <font color="green">一些用到的方法</font>  
|- ssl  <font color="green">SSL证书</font>  
|- db.json  <font color="green">json-server数据库(在其它项目中使用时, 会在process.cwd()目录生成)</font>  
|- index.js  <font color="green">rollup打包后的插件入口</font>  
|- localhost.js  <font color="green">rollup打包后的 mock服务器 入口</font>  
|- package.json  
|- rollup.config.js  <font color="green">rollup配置</font>  

 string | ((jsonServer: Object, server: Object) => void)
### 配置项
|属性|类型|默认值|说明|
|--|--|--|--|
| mockData | object | {} | 模拟属性相关的配置 |
| headConfig | object | null | 服务器请求头设置 |
| crossDomain | boolean | true | 是否允许跨域 当 headConfig 不为空时, 忽略该项 |
| port | number | 3030 | 端口号 |
| static | object/function | __dirname + '/public' | 静态文件目录 |
| beforeUpload | function | undefined | 上传文件前的钩子 |
| beforeWrite | function | undefined | 写入文件前的钩子 |
| https | object/undefined | undefined | https配置 |
| rules | object | - | 路由重写规则, 参考 [json-server rewriter](https://github.com/typicode/json-server#rewriter-example) |
| loginUrl | string | - | 登录地址, 如果配置了loginUrl, 那么除登录和public属性为true的接口外, 其它接口必须在登录之后才可以正常执行 |
| logoutUrl | string | - | 退出登录地址 |
| interceptor | function | - | 拦截器, 用于拦截/修改发送的请求 |

mockData 属性, 存放客户端请求api时的返回数据, 以及对返回数据的一些操作  
支持的可选操作有: 
1. 对返回数据的包装
2. 返回错误信息
3. 转发请求

返回数据支持 mock.js 中的写法, [查看 mock.js 使用文档](https://github.com/nuysoft/Mock/wiki), 但如果是被 鉴权/错误处理/转发请求 拦截, 那么 mock.js 写法无效

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
       * @returns string/object/array
      */
      relay: (method, params, result) => {
        let url = ''
        // 返回值用于给 request 模块传参, 调用逻辑:
        // request.apply(request, Array.isArray(returns) ? returns : [returns])
        // request中的传参字段: get为qs, post为form
        return url
        // return {
        //   url,
        //   [/post/i.test(method) ? 'form' : 'qs']: {
        //     test: 123
        //   }
        // }
        // return [url, {
        //   [/post/i.test(method) ? 'form' : 'qs']: {
        //     test: 123
        //   }
        // }]
      },

      // 请求方法, 返回数据
      // 返回数据可以使用 mockjs 来填充数据, 也可以直接写json

      // 请求方法为函数时, 参数与format/error/ralay等方法一致, 但result为空对象, 返回值作为返回数据
      // get: (method, params, result) => {}
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
