# mock
一个mock服务端api的工具
# 使用方法
## 运行:
```npm
  npm run mock
```
## demo
项目运行后, 打开首页(http://localhost:3000) 查看
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