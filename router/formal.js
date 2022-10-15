const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const Handler = require('../router_handler/formal')

//处理文件
const multer  = require('multer')
// const storage = multer.diskStorage({
//     // 上传文件的目录
//     destination: function (req, file, cb) {
//       cb(null, '../geoserver_rest/uploadfile/Image')
//     },
//     // 上传文件的名称
//     filename: function (req, file, cb) {
//       cb(null, file.originalname)
//     }
//   })
const storage = multer.diskStorage({
  destination: function (request, file, cb) {
  console.log(file.originalname.split('.')[1])
  if(file.originalname.split('.')[1]!=null){
      let tpName = file.originalname.split('.')[1]
      switch (tpName) {
          case 'zip':
              cb(null, '../geoserver_rest/uploadfile/upload')    // 上传文件的目录
              break;
          case'png':
          case'jpg':
          case'svg':
          case'jpeg':
              cb(null, '../geoserver_rest/public/userImage')  
              break;  // 上传文件的目录
          case'tiff':
              cb(null, '../geoserver_rest/uploadfile/Tiff')  
              break;  // 上传文件的目录
          default:
              console.log('上传文件类型出错,请检查文件类型与后缀')
              break;
      }
  } 
  },
  filename: function (request, file, cb) {
      cb(null, file.originalname)
      orgName = file.originalname    // 上传文件的目录、文件名称保存到全局变量中
  }    
})

// multer 配置
const upload = multer({
  storage
})

// 测试get，post请求
router.get('/',Handler.test_get)
router.post('/',Handler.test_post)

// 获取工作空间
router.post('/GetWorkSpaces',  Handler.GetWorkSpaces)
// 获取图层
router.post('/GetLayers', Handler.GetLayers)
//上传
router.post('/UpLoad', upload.single('file'), Handler.UpLoad)
//2dwmts
router.post('/Get2DWMTS',Handler.Get2DWMTS)
//3dwmts
router.post('/Get3DWMTS',Handler.Get3DWMTS)
//Get_WWWT
router.post('/Get_WWWT',Handler.Get_WWWT)
//Get_WWWT_user
router.post('/Get_WWWT_user',Handler.Get_WWWT_user)


//wfs获取图层信息
router.post('/WFS_getFeatures',Handler.WFS_getFeatures)
//wfs获取图层属性信息(只要属性信息，方便一系列的WFS的编辑操作)
router.post('/WFS_getFea_singel',Handler.WFS_getFea_singel)
//wfs获取图层信息(只要属性信息，方便一系列的WFS的编辑操作)
router.post('/WFS_getFea_onlyAttr',Handler.WFS_getFea_onlyAttr)
//wfs删除图层信息
router.post('/WFS_delFeatures',Handler.WFS_delFeatures)
//获取所选要素的边界信息
router.post('/WFS_getBorder',Handler.WFS_getBorder)
//按要素查询
router.post('/WFS_queryFeatures',Handler.WFS_queryFeatures)
//增加要素
router.post('/WFS_addFeatures',Handler.WFS_addFeatures)
//按id删除要素
router.post('/WFS_delByID',Handler.WFS_delByID)
//修改要素属性
router.post('/WFS_modifyAttr',Handler.WFS_modifyAttr)



//获取图层里已有的样式
router.post('/SLD_get',Handler.SLD_get)
//从已有的样式里更换样式（本质上是修改默认样式实现）
router.post('/SLD_modify',Handler.SLD_modify)
//从已有的样式里更换样式（本质上是修改默认样式实现）
router.post('/SLD_modify_graduated',Handler.SLD_modify_graduated)
//SLD dot_image
router.post('/SLD_dotImage',Handler.SLD_dotImage)
//SLD dot_image
router.post('/SLD_dotSingle',Handler.SLD_dotSingle)
//SLD dotUnique
router.post('/SLD_dotUnique',Handler.SLD_dotUnique)
//SLD dotGraduated
router.post('/SLD_dotGraduated',Handler.SLD_dotGraduated)
//SLD dotGradient
router.post('/SLD_dotGradient',Handler.SLD_dotGradient)
//SLD lineSingle
router.post('/SLD_lineSingle',Handler.SLD_lineSingle)
//SLD lineUnique
router.post('/SLD_lineUnique',Handler.SLD_lineUnique)
//SLD lineGraduated
router.post('/SLD_lineGraduated',Handler.SLD_lineGraduated)
//SLD lineGradient
router.post('/SLD_lineGradient',Handler.SLD_lineGradient)
//SLD single
router.post('/SLD_single',Handler.SLD_single)
//SLD unique
router.post('/SLD_unique',Handler.SLD_unique)
//SLD_graduater
router.post('/SLD_graduated',Handler.SLD_graduated)
//SLD_graduater2
router.post('/SLD_graduated2',Handler.SLD_graduated2)
//SLD_gradient
router.post('/SLD_gradient',Handler.SLD_gradient)



// 上传image文件
router.post('/uploadImage', upload.single('file'), Handler.uploadImage)
// 获取所有图片的连接
router.get('/Get_allImages', Handler.Get_allIamges)
// 获取用户自定义文件夹下上传的图片链接
router.get('/Get_userImages', Handler.Get_userImages)
module.exports = router

