// 导入 express 模块
const express = require('express')
// 创建 express 的服务器实例
const app = express()
const axios = require("axios")
// 导入 cors 中间件
const cors = require('cors')
// 将 cors 注册为全局中间件
app.use(cors())


//指定Image文件夹为静态目录文件夹
app.use(express.static(__dirname+'/public')) 
console.log(__dirname)


//配置解析表单数据的中间件
const bodyParser = require('body-parser');  //用于requset.body获取值的
app.use(bodyParser.json());  // json格式解析
app.use(bodyParser.urlencoded({ extended: false })); // 创建 application/x-www-form-urlencoded 编码解析


// 响应错误出现情况
// 响应数据的中间件 一定要在路由之前，封装 res.cc 函数
app.use(function (req, res, next) {
    // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
    res.cc = function (err, status = 1) {
      res.send({
        // 状态
        status,
        // 状态描述，判断 err 是 错误对象 还是 字符串
        message: err instanceof Error ? err.message : err,
      })
    }
    next()
})



// 导入并test路由模块
const testRouter = require('./router/test')
app.use('/test', testRouter)
// 导入正式的路由模块
const formalRouter = require('./router/formal')
app.use('/formal', formalRouter)


// app.post('/server/changeSLD',(request,response)=>{
//   let cur_wsp = request.body.nWsp  //当前工作空间
//   let cur_layer = request.body.layer //当前图层
//   let cur_SLD = request.body.preSLD //当前样式
//   let chg_SLD = request.body.newSLD //想修改的样式名称
//   console.log(chg_SLD)
//   let quyURL = 'http://localhost:8080/geoserver/rest/workspaces/'+cur_wsp+'/styles/'+chg_SLD+'.json'
//   let lyrURL = 'http://localhost:8080/geoserver/rest/layers/'+cur_wsp+':'+cur_layer
//   let styleJSON='{"layer": {"defaultStyle": {"name": "'+chg_SLD+'",'+'"href": "http://localhost:8080/geoserver/rest/'+cur_wsp+'/styles/'+chg_SLD+'.json" }}}'
//   console.log(styleJSON)
//   console.log(lyrURL)
//   axios({
//       method: 'get',
//       baseURL:quyURL,
//       headers: {
//           'Authorization':'Basic YWRtaW46Z2Vvc2VydmVy',
//           'content-type': 'application/json',
//         },
//   }).then(responseGeo=>{
//       console.log('收到请求');
//       axios({
//           method: 'put',
//           baseURL:lyrURL,
//           headers: {
//           Authorization:'Basic YWRtaW46Z2Vvc2VydmVy',
//           'content-type': 'application/json'
//         },
//           data:styleJSON
//       }).then(responseStyle=>{
//           console.log(responseStyle.data)
//           console.log('加载选中样式')
//       }).catch(err=>{
//           console.log(err);
//           response.send('ERROR!加载样式表出错')
//       })
//     }
//     ).catch(err => {
//       console.log(err);
//       response.send('ERROR!加载样式表出错')
//   })
  

// })
// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(3000, function () {
    console.log('api server running at http://127.0.0.1:3000')
})