# ks-mock
一个mock服务端api的工具

## 使用场景
### 1. 作为单独的 mock 服务器使用
#### 运行:
```npm
  npm run mock
```
项目运行后, 打开首页(http://localhost:3000) 可查看demo

### 2. 在其它项目中使用
1. 安装依赖
```npm
  cnpm install --save-dev json-server mockjs
```
2. 在要使用的项目里新建一个文件夹, 然后将 src 目录下文件复制到该文件夹, 最后添加指令到package.json
```javascript
// 将 src 修改为复制后的脚本地址
"script":{
  "mock": "node src"
}
```

### 3. 作为webpack 插件使用
安装
```npm
npm install --save-dev ks-mock
```
使用
```javascript
// webpack.config.js
const KsMock = require("ks-mock");
module.exports = {
  ...
  plugins: [
    new KsMock({
      config: {
        mockData: {}, // 内容格式参考 创建api接口 一节
        headConfig: null, // 服务器请求头设置
        crossDomain: true, // 是否允许跨域 当 headConfig 不为空时忽略该项
      },
      port: 3000
    })
    ...
  ]
}
```

## 创建api接口:
  在场景1、2中创建接口, 一般只需要关注 [datas.js]("https://github.com/kscript/moke/core/datas.js") 文件,
  该文件的书写格式为:
```javascript
  {
    // 请求地址
    url: {
      // 对模拟返回的数据进行包装
      format: function, 

      // 请求方法, 返回数据
      // 返回数据可以使用 mockjs 来填充数据, 也可以直接写json
      method1: data,
      method2: data
    }
  }
```
  在场景3中创建接口, 除了 datas文件 改为 在webpack的plugin配置里传参 外, 格式与上面的相同.