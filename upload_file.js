const express = require('express');


const multer = require('multer'); //解析Post文件

const fs = require('fs');


const router = express.Router()

  

var server = express();

  

// var objMulter = multer({dest:'./www/upload'}); //用户上传文件存入dest目录下

// server.use(objMulter.any()); //处理任何用户上传的文件

  
router.post('/upload',multer({
    dest:'upload'
}).single('file'),(req,res)=>{
    console.log(req.file)
    res.send(req.file,)
})

// server.use(router)
// server.listen(8081, function () {
//     console.log('api server running at http://127.0.0.1:8081')
// })
module.exports = router