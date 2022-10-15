const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const userHandler = require('../router_handler/test')


const multer  = require('multer')
const storage = multer.diskStorage({
  //保存路径
  destination: function (req, file, cb) {
    cb(null, 'E:\\postgraduate\\78month\\geoserver_rest\\router_handler\\upload')
    //注意这里的文件路径,不是相对路径，直接填写从项目根路径开始写就行了
  },
  //保存在 destination 中的文件名
  filename: function (req, file, cb) {    
    // cb(null, file.fieldname + '-' + Date.now())
    cb(null, 'qinyang.zip')
  }
})
const upload = multer({ storage: storage })



router.post('/GetWorkSpaces',  userHandler.GetWorkSpaces)

router.post('/GetLayers', userHandler.GetLayers)

// const cpUpload = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'user', maxCount: 8 }])
// router.post('/UpLoad', cpUpload, userHandler.UpLoad)
router.post('/UpLoad', upload.single('file'), userHandler.UpLoad)

// router.post('/upload2',upload.single('file'),(req,res)=>{
//     console.log(req.file)
//     res.send(req.file,)
// })


module.exports = router