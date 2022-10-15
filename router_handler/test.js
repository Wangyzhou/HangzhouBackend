// const script = document.createElement("script")
// script.type = "text/javascript"
// script.src = "https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js"
// document.getElementsByTagName("head")[0].appendChild(script)


const cs = require("child_process");
const { stdout, stderr } = require("process");
const { domainToUnicode } = require("url");

//获取
exports.GetWorkSpaces = (req,res) => {
    const user = req.body
    console.log(user)
    const result = cs.exec('curl -v -u '+user.username+':'+user.password+' -XGET\
    http://localhost:8080/geoserver/rest/workspaces', (error,stdout,stderr)=>{
        if (error) {
            console.error('error:', error);
            return;
        }
        console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        console.log(typeof(stdout))
        res.send(stdout)
    })
    
}

exports.GetLayers = (req,res) => {
    const info = req.body
    console.log(info)
    cs.exec('curl -v -u '+info.username+':'+info.password+' -X GET http://localhost:8080/geoserver/rest/workspaces/' + info.workspace_name + '/layers ',(error,stdout,stderr)=>{
        if (error) {
            console.error('error:', error);
            return;
        }
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        res.send(stdout)
    })
}

//上传文件

exports.UpLoad = (req,res) => {
    console.log(req.file)  
    // console.log(__dirname)
    res.send(req.file)
    cs.exec('curl -v -u admin:geoserver -X PUT -H "Content-type:application/zip" --data-binary @'+ req.file.path +' http://localhost:8080/geoserver/rest/workspaces/fan/datastores/book/file.shp' ,(error,stdout,stderr)=>{
        if (error) {
            console.error('error:', error);
            return;
        }
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        res.send(stdout)
        console.log(stdout)
    })
}