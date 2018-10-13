# mock
一个mock服务端api的工具
# 使用方法
## 运行:
```npm
  npm run mock
```
## demo
项目运行后, 打开首页(http://localhost:3000) 查看
## 在其它项目中使用
1. 安装依赖
```npm
  cnpm install --save-dev json-server mockjs
```
2. 在要使用的项目里新建一个文件夹, 然后将 src 目录下文件复制到该文件夹, 最后添加指令到package.json
```javascript
// 将下面的两个 src 替换为 新建的文件夹名
"script":{
  "mock": "json-server src/db.json --middlewares src --port 3000"
}
```
## 创建api接口:
  在创建接口时, 一般只需要关注 [datas.js]("https://github.com/kscript/moke/core/datas.js") 文件, 该文件的书写格式为:
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