const cs = require("child_process");
const axios =require('axios');
const fs = require('fs')
const AdmZip = require('adm-zip');
const { response } = require("express");
var http_url = 'http://localhost:8088'
var workspace_used = "tiger"
var user_workspace = "sf"
var datastore_used = "book"

exports.test_get = (request,response)=>{
    response.send('Hello Express')
}

exports.test_post = (request,response)=>{
    console.log("获得请求了")
    let pwd = request.body.pwd;
    let user = request.body.user;
    console.log(pwd,user)
    // 貌似只能send一个
    response.send(pwd)
}

// 获取工作空间名称
exports.GetWorkSpaces = (req,res) => {
    const user = req.body
    console.log(user)
    const result = cs.exec('curl -v -u '+user.username+':'+user.password+' -XGET\
    http://localhost:8080/geoserver/rest/workspaces', (error,stdout,stderr)=>{
        if (error) {
            console.error('error:', error);
            return;
        }
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        console.log(typeof(stdout))
        res.send(stdout)
    })
    
}
// 获取图层名称
exports.GetLayers = (req,res) => {
    const info = req.body
    console.log(info)
    cs.exec('curl -v -u '+info.username+':'+info.password+' -X GET http://localhost:8080/geoserver/rest/workspaces/' + workspace_used + '/layers ',(error,stdout,stderr)=>{
        if (error) {
            console.error('error:', error);
            return;
        }
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        console.log("触发了GetLayers函数")
        //stdou是string ，转成json， 返回去
        data = JSON.parse(stdout)
        // console.log(data.layers.layer)
        res.send(data.layers.layer)
    })
}

exports.GetLayers_old = (req,res) => {
    const info = req.body
    console.log(info)
    cs.exec('curl -v -u '+info.username+':'+info.password+' -X GET http://localhost:8080/geoserver/rest/workspaces/' + info.workspace_name + '/layers ',(error,stdout,stderr)=>{
        if (error) {
            console.error('error:', error);
            return;
        }
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        // console.log(typeof(stdout))
        //stdou是string ，转成json， 返回去
        res.send(stdout)
    })
}

// 上传
exports.UpLoad = (req,res) =>{
    // curl -u admin:geoserver -XPUT -H "Content-type:image/tiff" --data-binary @C:\Users\fhm\Desktop\kaifeng07231304.tif http://localhost:8080/geoserver/rest/workspaces/fan/coveragestores/GeoTIFF/file.geotiff
    console.log(req.file.path)
    // res.send(req.file)
    let shapename = req.file.path  //shp文件路径
    let shplen = shapename.split("\\").length
    let filename = shapename.split("\\")[shplen - 1].split(".")[0] 
    let filetype =  shapename.split("\\")[shplen - 1].split(".")[1] 
    console.log(filetype)
    if(filetype=="zip"){
        cs.exec('curl -v -u admin:geoserver -X PUT -H "Content-type:application/zip" --data-binary @'+ req.file.path +' '+ http_url +'/geoserver/rest/workspaces/' + user_workspace + '/datastores/' + filename + '/file.shp' ,(error,stdout,stderr)=>{
            if (error) {
                // console.error('error:', error);
                return res.cc(error);
            }
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            console.log("上传")
            res.send(stdout)
            // console.log(stdout)
        })
    }
    else{
        cs.exec('curl -u admin:geoserver -XPUT -H "Content-type:image/tiff" --data-binary @'+ req.file.path+' http://localhost:8080/geoserver/rest/workspaces/' + workspace_used + '/coveragestores/' + filename + '/file.geotiff' ,(error,stdout,stderr)=>{
            if (error) {
                // console.error('error:', error);
                return res.cc(error);
            }
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            res.send(stdout)
            // console.log(stdout)
        })
    }

}

// 2dWMTS
exports.Get2DWMTS = (req,res)=>{
    console.log(req.body)
    let data = {
        url:"http://localhost:8080/geoserver/gwc/service/wmts",
        layer : workspace_used + ":" +req.body.layer,
        tilematrixSet: "WebMercatorQuad",
        // tilematrixSet: "EPSG:4326",
    }
    res.send(data)
}

// 3DWMTS
exports.Get3DWMTS = (req,res)=>{
    console.log(req.body)
    let data = {
        url:"http://localhost:8080/geoserver/gwc/service/wmts",
        layer : workspace_used + req.body.layer,
        // tilematrixSet: "WebMercatorQuad",
        tilematrixSet: "EPSG:4326",
        matrixIds : ['EPSG:4326:0', 'EPSG:4326:1', 'EPSG:4326:2', 'EPSG:4326:3', 'EPSG:4326:4', 'EPSG:4326:5', 'EPSG:4326:6', 'EPSG:4326:7', 'EPSG:4326:8', 'EPSG:4326:9', 'EPSG:4326:10',
                        'EPSG:4326:11', 'EPSG:4326:12', 'EPSG:4326:13', 'EPSG:4326:14', 'EPSG:4326:15', 'EPSG:4326:16', 'EPSG:4326:17', 'EPSG:4326:18', 'EPSG:4326:19', 'EPSG:4326:20', 'EPSG:4326:21'
                    ]
    }
    res.send(data)
}

//获取单个图层的WMS WMTS WFS TMS
exports.Get_WWWT = (req,res)=>{
    const info = req.body
    console.log(info)
    cs.exec('curl -v -u '+info.username+':'+info.password+' -X GET '+ http_url +'/geoserver/rest/workspaces/' + workspace_used + '/layers ',(error,stdout,stderr)=>{
        if (error) {
            console.error('error:', error);
            return;
        }
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        console.log("触发了GetLayers函数")
        //stdou是string ，转成json， 返回去
        let data = JSON.parse(stdout)
        const layer = data.layers.layer
        console.log(layer)
        let Layer_big = []
        let types = {}
        for(let i=0;i<layer.length;i++){
          axios.get(http_url+'/geoserver/wfs?service=wfs&version=2.0.0&request=DescribeFeatureType&typeNames='+ workspace_used +':'+ encodeURIComponent(layer[i].name) +'&outputFormat=application%2Fjson').then(response=>{
            //用字典存，就不存在同异步的问题
            console.log(response.data)
            types[layer[i].name] = response.data.featureTypes[0].properties[0].localType
          }).catch(err=>{
            console.log(err)
          })
        }
        setTimeout(() => {
          for(let i=0;i<layer.length;i++){
            let WMS_url = ''+http_url+'/geoserver/'+ workspace_used +'/wms?&layer='+ workspace_used+':'+layer[i].name +'&format=image/png&transparent=true'
            let WMS_url2 = ''+http_url+'/geoserver/'+ workspace_used +'/wms?&layer='+ workspace_used+':'+layer[i].name +''
            let WMTS_url = ''+http_url+'/geoserver/gwc/service/wmts?service=WMTS&request=GetTile&version=1.0.0&layer='+workspace_used+':'+layer[i].name+'&style=&tilematrixset=WebMercatorQuad&format=image%2Fpng&width=256&height=256&tilematrix={z}&tilerow={y}&tilecol={x}'
            let WFS_url = ''+http_url+'/geoserver/wfs?request=GetFeature&version=1.1.0&typeName='+workspace_used+':'+layer[i].name+'&maxFeatures=50&outputFormat=application/json'
            let TMS_url = ''+http_url+'/geoserver/gwc/service/tms/1.0.0/'+workspace_used+':'+layer[i].name+'@WebMercatorQuad@png/{z}/{x}/{-y}.png'
            let TMS_url2 = ''+http_url+'/geoserver/gwc/service/tms/1.0.0/'+workspace_used+':'+layer[i].name+'@EPSG:900913@png/{z}/{x}/{reverseY}.png'
            let WMTS_url2 = ''+http_url+'/geoserver/gwc/service/wmts/rest/'+workspace_used+':'+layer[i].name+'/{style}/{TileMatrixSet}/{TileMatrixSet}:{TileMatrix}/{TileRow}/{TileCol}?format=image/png'
            let services = [
              {
                  ServiceName:"WMS-二维",
                  URL:WMS_url
              },
              {
                  ServiceName:"WMS-三维",
                  URL:WMS_url2
              },
              {
                  ServiceName:"WFS",
                  URL:WFS_url
              },
              {
                  ServiceName:"TMS-二维",
                  URL:TMS_url
              },
              {
                  ServiceName:"TMS-三维",
                  URL:TMS_url2
              },
              {
                  ServiceName:"WMTS-二维",
                  URL:WMTS_url
              },
              {
                  ServiceName:"WMTS-三维",
                  URL:WMTS_url2
              },
          ]
            let temp = {}
            temp.name = layer[i].name
            temp.id = i+1
            temp.type = types[layer[i].name]
            temp.service = services
            Layer_big.push(temp)
        }
        }, 300);

        setTimeout(() => {
          res.send(Layer_big)
        }, 400);
    })
}

//获取单个用户图层的WMS WMTS WFS TMS
exports.Get_WWWT_user = (req,res)=>{
    const info = req.body
    console.log(info)
    cs.exec('curl -v -u '+info.username+':'+info.password+' -X GET '+ http_url +'/geoserver/rest/workspaces/' + user_workspace + '/layers ',(error,stdout,stderr)=>{
        if (error) {
            console.error('error:', error);
            return;
        }
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        console.log("触发了GetLayers函数")
        //stdou是string ，转成json， 返回去
        data = JSON.parse(stdout)
        // console.log(data.layers.layer)
        const layer = data.layers.layer
        // console.log(layer)
        let Layer_big = []
        let types = {}
        for(let i=0;i<layer.length;i++){
          axios.get(http_url+'/geoserver/wfs?service=wfs&version=2.0.0&request=DescribeFeatureType&typeNames='+ user_workspace +':'+ encodeURIComponent(layer[i].name) +'&outputFormat=application%2Fjson').then(response=>{
            //用字典存，就不存在同异步的问题
            types[layer[i].name] = response.data.featureTypes[0].properties[0].localType
          }).catch(err=>{
            console.log(err)
          })
        }
        setTimeout(() => {
          for(let i=0;i<layer.length;i++){
            let WMS_url = ''+http_url+'/geoserver/'+ user_workspace +'/wms?&layer='+ user_workspace+':'+layer[i].name +'&format=image/png&transparent=true'
            let WMS_url2 = ''+http_url+'/geoserver/'+ user_workspace +'/wms?&layer='+ user_workspace+':'+layer[i].name +''
            let WMTS_url = ''+http_url+'/geoserver/gwc/service/wmts?service=WMTS&request=GetTile&version=1.0.0&layer='+user_workspace+':'+layer[i].name+'&style=&tilematrixset=WebMercatorQuad&format=image%2Fpng&width=256&height=256&tilematrix={z}&tilerow={y}&tilecol={x}'
            let WFS_url = ''+http_url+'/geoserver/wfs?request=GetFeature&version=1.1.0&typeName='+user_workspace+':'+layer[i].name+'&maxFeatures=50&outputFormat=application/json'
            let TMS_url = ''+http_url+'/geoserver/gwc/service/tms/1.0.0/'+user_workspace+':'+layer[i].name+'@WebMercatorQuad@png/{z}/{x}/{-y}.png'
            let TMS_url2 = ''+http_url+'/geoserver/gwc/service/tms/1.0.0/'+user_workspace+':'+layer[i].name+'@EPSG:900913@png/{z}/{x}/{reverseY}.png'
            let WMTS_url2 = ''+http_url+'/geoserver/gwc/service/wmts/rest/'+user_workspace+':'+layer[i].name+'/{style}/{TileMatrixSet}/{TileMatrixSet}:{TileMatrix}/{TileRow}/{TileCol}?format=image/png'
            let services = [
              {
                  ServiceName:"WMS-二维",
                  URL:WMS_url
              },
              {
                  ServiceName:"WMS-三维",
                  URL:WMS_url2
              },
              {
                  ServiceName:"WFS",
                  URL:WFS_url
              },
              {
                  ServiceName:"TMS-二维",
                  URL:TMS_url
              },
              {
                  ServiceName:"TMS-三维",
                  URL:TMS_url2
              },
              {
                  ServiceName:"WMTS-二维",
                  URL:WMTS_url
              },
              {
                  ServiceName:"WMTS-三维",
                  URL:WMTS_url2
              },
          ]
            let temp = {}
            temp.name = layer[i].name
            temp.id = i+1
            temp.type = types[layer[i].name]
            temp.service = services
            Layer_big.push(temp)
        }
        }, 500);

        setTimeout(() => {
          res.send(Layer_big)
        }, 600);
    })
}



//wfs获取图层信息
exports.WFS_getFeatures = (req,res)=>{
    let attrList=[]
    let treeCol=new Array();
    let WFSUrl = "http://localhost:8080/geoserver/wfs?"
    var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+workspace_used+':'+req.body.layer+'&outputFormat=application/json';
    axios.get(feature_url).then((WFS_res)=>{
        // res.send(WFS_res.data)
        
        let GeoObject = WFS_res.data
        console.log(GeoObject)
        // res.send(typeof(GeoObject))
        try {
            for (atr in GeoObject.features[0].properties ){
                    attrList.push(atr)
            }
            // res.send(attrList)
            let attrLen = Object.keys(GeoObject.features[0].properties).length
            let featureCount = GeoObject.totalFeatures
           
            for(var i=0;i<attrLen;i++){
                treeCol[i]=new Array(); 
            for(var j=0;j<featureCount;j++){
                treeCol[i][j]=GeoObject.features[j].properties[attrList[i]];
                }
            }      
        } catch (error) {
            console.log("Error:"+error)
        }
        res.send({Attributes:attrList,Value:treeCol})
    })
}

//wfs获取图层单个属性的信息，方便后面SLD文件的生成
exports.WFS_getFea_singel = (req,res)=>{
    let query_attr = req.body.Attr
    console.log(query_attr)
    let WFSUrl = "http://localhost:8080/geoserver/wfs?"
    var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+workspace_used+':'+req.body.layer+'&outputFormat=application/json';
    axios.get(feature_url).then((WFS_res)=>{
        // res.send(WFS_res.data.features)
        let Geodata = WFS_res.data.features
        let attrList=[]
        for(let i=0;i<Geodata.length;i++){
            console.log(Geodata[i].properties[query_attr])
            attrList.push(Geodata[i].properties[query_attr])
        }
        res.send({query_attr:attrList})
    })
}

//wfs获取图层属性信息(只要属性信息，方便一系列的WFS的编辑操作)
exports.WFS_getFea_onlyAttr = (req,res)=>{
    let attrList=[]
    let WFSUrl = ''+ http_url +'/geoserver/wfs?'
    var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+user_workspace+':'+req.body.layer+'&outputFormat=application/json';
    // console.log(feature_url)
    axios.get(feature_url).then((WFS_res)=>{
        // res.send(WFS_res.data)
        let GeoObject = WFS_res.data
        // console.log(GeoObject)
        // res.send(typeof(GeoObject))
        try {
            for (atr in GeoObject.features[0].properties ){
                    attrList.push(atr)
            }    
        } catch (error) {
            console.log("Error:"+error)
        }
        // 处理返回数据，是select能接收
        // 这里如果改变，涉及到的增加要素“exports.WFS_addFeatures”里面的拼接属性信息的for循环里的变量也要改
        // 前端属性信息录入对应for循环的变量也要改
        let resdata = []
        for(let i=0;i<attrList.length;i++){
            resdata.push({Attr:attrList[i]})
        }

        res.send(resdata)
    })
}

//wfs删除图层要素
exports.WFS_delFeatures = (req,res)=>{
    let cur_layer = req.body.layer 
    let cur_FID = req.body.FID
    var xml =   '<wfs:Transaction service="WFS" version="1.0.0" xmlns:cdf="http://www.opengis.net/cite/data" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wfs="http://www.opengis.net/wfs" xmlns:topp="http://www.openplans.org/topp">',
    xml = xml+ '<wfs:Delete typeName="'+workspace_used+':'+cur_layer+'">',
    xml = xml+ '<ogc:Filter> <ogc:FeatureId fid="'+cur_layer+'.'+cur_FID+'"/> </ogc:Filter>'
    xml= xml+ '</wfs:Delete>'
    xml= xml+'</wfs:Transaction>'
    console.log(xml)

    axios({
        headers:{
            'content-type': 'text/xml',
        },
        method: 'post',
        baseURL:'http://localhost:8080/geoserver/wfs',
        contentType: 'text/xml',
        data:xml,
    }).then(
        console.log("收到请求")
    ).catch(error => {
        console.log(error)
    })
    res.send(req.body.layer+":"+req.body.FID+"删除完成")
}

//获取所选要素的边界信息(其实就是一个要素，是按边界查询，0.0001设置的很小，使他只能查询到一个要素)
exports.WFS_getBorder = (req,res)=>{
    let WFSUrl = "http://localhost:8080/geoserver/wfs?"
    let cur_layer = req.body.layer; 
    let min_lng = req.body.latlng.min_lng;
    let max_lng = req.body.latlng.max_lng;
    let min_lat = req.body.latlng.min_lat;
    let max_lat = req.body.latlng.max_lat;
    let feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+workspace_used+':'+cur_layer+'&outputFormat=application/json&BBOX=' + min_lng + ',' + min_lat + ',' + max_lng + ',' + max_lat + ',EPSG:4326';
    // console.log(req.body)
    // console.log(feature_url)
    try {
    axios({
        method: 'post',
        baseURL:feature_url,
    }).then((responseGeo) => {
        // 传回前端后，可以res.data.features[0].properties.name来获取相关属性值
        //   console.log(responseGeo.data);
          res.send(responseGeo.data)
        })
    } catch (error) {
        console.log("获取图层要素出错")
    }
}

//按画的形状查询
exports.WFS_queryFeatures = (req,res)=>{
    let WFSUrl = "http://localhost:8080/geoserver/wfs?"
    let cur_layer = req.body.layer 
    let lineString = req.body.lineString
    let typeName = workspace_used+':'+cur_layer
    // 必须是<wfs:Query typeName="fan:community_price"> 要有双引号
    // outputFormat 控制输出格式 Json GML2
    // <gml:coordinates decimal="." cs="," ts=" "> 160{decimal}25{cs}35.66{ts}160.25,35.66
    // </Intersects> 相交 overlaps contains
    let gml_txt = 
    '<wfs:GetFeature service="WFS" version="1.0.0"\n\
        outputFormat="Json"\n\
        xmlns:wfs="http://www.opengis.net/wfs"\n\
        xmlns="http://www.opengis.net/ogc"\n\
        xmlns:gml="http://www.opengis.net/gml"\n\
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n\
        xsi:schemaLocation="http://www.opengis.net/wfs\n\
                            http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">\n\
        <wfs:Query typeName= '+ '"'+ typeName +'"'+'>\n\
        <Filter>\n\
            <Intersects>\n\
            <PropertyName>the_geom</PropertyName>\n\
                <gml:MultiLineString srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">\n\
                <gml:LineStringMember>\n\
                    <gml:LineString>\n\
                    <gml:coordinates decimal="." cs="," ts=" ">'+lineString+'</gml:coordinates>\n\
                    </gml:LineString>\n\
                </gml:LineStringMember>\n\
                </gml:MultiLineString>\n\
            </Intersects>\n\
            </Filter>\n\
        </wfs:Query>\n\
    </wfs:GetFeature>'
    console.log(gml_txt)
    axios({
        headers:{
          "Content-Type": "application/xml"
        },
        method:'post',
        baseURL:'http://localhost:8080/geoserver/wfs?',
        data:gml_txt,
    }).then(responseGeo=>{
    //    console.log("response_data",responseGeo.data)
       res.send(responseGeo.data)
       console.log('收到Line请求');
      }
      ).catch(err => {
        console.log(err);
    })
}

//增加要素
exports.WFS_addFeatures = (req,res)=>{
    let cur_layer = req.body.layer 
    let attrs = req.body.attrs
    let values = req.body.values
    let coord = req.body.coord
    // console.log(req.body)
    // fan="http://www.fan" 一定要和命名空间的url对应上
    // typename=fan:china_project" 引号不能忘 要不会报错
    // <ows:ExceptionText>javax.xml.stream.XMLStreamException: ParseError at [row,col]:[8,5]
    // Message: 与元素类型 "wfs:Transaction" 相关联的 "xsi:schemaLocation" 属性值不能包含 '&lt;' 字符。
    var gml_txt = '<?xml version="1.0" encoding="UTF8"?>\n\
    <wfs:Transaction service="WFS" version="1.0.0"\n\
                   xmlns:wfs="http://www.opengis.net/wfs"\n\
                   xmlns:fan="http://www.fan"\n\
                   xmlns:gml="http://www.opengis.net/gml"\n\
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n\
                   xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd http://www.fan.com http://localhost:8080/geoserver/wfs/DescribeFeatureType?typename=fan:' +cur_layer+ '"'+'>\n\
    <wfs:Insert>\n\
      <fan:'+ cur_layer +'>\n\
        <fan:the_geom>\n\
          <gml:MultiPolygon srsName="http://www.opengis.net/gml/srs/epsg.xml#4326"><gml:polygonMember><gml:Polygon><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates xmlns:gml="http://www.opengis.net/gml" decimal="." cs="," ts=" ">'+coord+'</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></gml:polygonMember></gml:MultiPolygon>\n\
        </fan:the_geom>\n\
    '
    for(var i=0;i<attrs.length;i++){
        gml_txt+='    <fan:'+ attrs[i].Attr +'>'+values[i]+'</fan:'+ attrs[i].Attr +'>\n\ '
    }
    gml_txt += ' </fan:'+ cur_layer +'>\n\
    </wfs:Insert>\n\
</wfs:Transaction>\n\
'
    console.log(gml_txt)
    axios({
        headers:{
          "Content-Type": "application/xml"
        },
        method:'post',
        baseURL:'http://localhost:8080/geoserver/wfs?',
        data:gml_txt,
    }).then(responseGeo=>{
    //    console.log("response_data",responseGeo.data)
       res.send(responseGeo.data)
    //    console.log('收到Line请求');
      }
      ).catch(err => {
        console.log(err);
    })
} 

//按id删除要素
exports.WFS_delByID = (req,res)=>{
    let cur_layer = req.body.layer 
    let id = req.body.id
    let typeName = workspace_used+':'+cur_layer
    let gml_txt = '<wfs:Transaction service="WFS" version="1.0.0"\n\
    xmlns:cdf="http://www.opengis.net/cite/data"\n\
    xmlns:ogc="http://www.opengis.net/ogc"\n\
    xmlns:wfs="http://www.opengis.net/wfs"\n\
    xmlns:topp="http://www.openplans.org/topp">\n\
    <wfs:Delete typeName='+ '"'+ typeName +'"'+'>\n\
      <ogc:Filter>\n\
        <ogc:FeatureId fid='+ '"'+ id +'"'+'/>\n\
      </ogc:Filter>\n\
    </wfs:Delete>\n\
  </wfs:Transaction>'
  console.log(gml_txt)
  axios({
      headers:{
        "Content-Type": "application/xml"
      },
      method:'post',
      baseURL:'http://localhost:8080/geoserver/wfs?',
      data:gml_txt,
  }).then(responseGeo=>{
     console.log("response_data",responseGeo.data)
     res.send(responseGeo.data)
     console.log('收到Line请求');
    }
    ).catch(err => {
      console.log(err);
  })
}

//修改属性
exports.WFS_modifyAttr = (req,res)=>{
    let cur_layer = req.body.layer 
    let id = req.body.id
    let typeName = workspace_used+':'+cur_layer
    let attr = req.body.attr
    let gml_txt = '<?xml version="1.0" encoding="UTF8"?>\n\
    <wfs:Transaction service="WFS" version="1.0.0"\n\
      xmlns:topp="http://www.openplans.org/topp"\n\
      xmlns:ogc="http://www.opengis.net/ogc"\n\
      xmlns:wfs="http://www.opengis.net/wfs">\n\
        <wfs:Update typeName='+ '"'+ typeName +'"'+'>\n\
            <wfs:Property>\n\
                <wfs:Name>name</wfs:Name>\n\
                <wfs:Value>'+ attr +'</wfs:Value>\n\
            </wfs:Property>\n\
            <ogc:Filter>\n\
                <ogc:FeatureId fid='+ '"'+ id +'"'+'/>\n\
            </ogc:Filter>\n\
        </wfs:Update>\n\
    </wfs:Transaction>'
    console.log(gml_txt)
    axios({
        headers:{
          "Content-Type": "application/xml"
        },
        method:'post',
        baseURL:'http://localhost:8080/geoserver/wfs?',
        data:gml_txt,
    }).then(responseGeo=>{
       console.log("response_data",responseGeo.data)
       res.send(responseGeo.data)
       console.log('收到Line请求');
      }
      ).catch(err => {
        console.log(err);
    })

}





//获取一个图层下有几个样式
exports.SLD_get = (req,res)=>{
    let cur_layer = req.body.layer //当前图层
    axios({
        method: 'get',
        baseURL:'http://localhost:8080/geoserver/rest/layers/'+ workspace_used + ':' + cur_layer +'',
        headers: {
        Authorization:'Basic YWRtaW46Z2Vvc2VydmVy',
        'content-type': 'application/json'
      }
    }).then(responseStyle=>{
        console.log(responseStyle.data)
        console.log('加载选中样式')
        res.send(responseStyle.data)
    }).catch(err=>{
        console.log(err);
        res.send('ERROR!加载样式表出错')
    })
}
//从已有的样式里更换样式（本质上是修改默认样式实现）
exports.SLD_modify = (req,res)=>{
    let query_work = req.body.workspace
    let cur_layer = req.body.layer //当前图层
    let chg_SLD = req.body.newSLD //想修改的样式名称


    let styleJSON = {
        "layer": {
            "defaultStyle": {
                "name": chg_SLD,"href": ''+ http_url +'/geoserver/rest/styles/'+ chg_SLD +'.json'
            }
        }
    }
    console.log(styleJSON)
    axios({
        method: 'put',
        baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + cur_layer +'',
        headers: {
        Authorization:'Basic YWRtaW46Z2Vvc2VydmVy',
        'content-type': 'application/json'
      },
        data:styleJSON
    }).then(responseStyle=>{
        console.log(responseStyle.data)
        console.log('加载选中样式')
        res.send(styleJSON)
    }).catch(err=>{
        console.log(err);
        res.send('ERROR!加载样式表出错')
    })
}
exports.SLD_modify_graduated = (req,res)=>{
    console.log("开始设为默认")
    let query_layer = req.body.layer //当前图层
    let chg_SLD = req.body.newSLD //想修改的样式名称
    console.log(chg_SLD)
    let styleJSON = {
        "layer": {
            "defaultStyle": {
                "name": chg_SLD,"href": 'http://localhost:8080/geoserver/rest/styles/'+ chg_SLD +'.json'
            }
        }
    }
    console.log(styleJSON)
    axios({
        method: 'put',
        baseURL:'http://localhost:8080/geoserver/rest/layers/'+ workspace_used + ':' + query_layer +'',
        headers: {
        Authorization:'Basic YWRtaW46Z2Vvc2VydmVy',
        'content-type': 'application/json'
    },
        data:styleJSON
    }).then(responseStyle=>{
        console.log(responseStyle.data)
        console.log('加载了新加载的样式')
        res.send(styleJSON)
    }).catch(err=>{
        console.log(err);
        res.send('ERROR!加载样式表出错')
    })

}
//SLD 点点点点点点点点点点点点点点点点点点点点点点点点
//SLD image 使用外部图片
exports.SLD_dotImage = (req,res)=>{
    // let query_attr = req.body.Attr   // 选择的属性值，
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    // let layer_color = req.body.layer_color // 图层颜色
    // let line_color = req.body.line_color // 线的颜色
    // let line_width = req.body.line_width // 线的宽度
    let img_url = req.body.img_url      // 图片url
    let size = req.body.size            // 图片的大小
    let rotate= req.body.rotate         // 图片旋转角度
    // 新的sld文件的名字
    let today = new Date();
    let time = today.getTime().toString()
    let time_used = time.substring(time.length-5,time.length-1)
    let new_name = 'DOTIMG'+query_layer+'-'+time_used
    let sld_text = ''
    let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
    <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:se="http://www.opengis.net/se">'
    let sld_name = '  <NamedLayer>\n\
    <se:Name>'+ new_name +'</se:Name>\n\
    <UserStyle>\n\
    <se:Name>' + new_name+'</se:Name>\n\
    <se:FeatureTypeStyle>'
    let sld_rule = '        <se:Rule>\n\
    <se:Name>Single symbol</se:Name>\n\
    <se:PointSymbolizer>\n\
      <se:Graphic>\n\
        <!--Parametric SVG-->\n\
        <se:ExternalGraphic>\n\
          <se:OnlineResource xlink:href="'+ img_url +'?fill=%23000000&amp;fill-opacity=1&amp;outline=%23ffffff&amp;outline-opacity=1&amp;outline-width=0" xlink:type="simple"/>\n\
          <se:Format>image/png</se:Format>\n\
        </se:ExternalGraphic>\n\
        <!--Plain SVG fallback, no parameters-->\n\
        <se:ExternalGraphic>\n\
          <se:OnlineResource xlink:href="transport/transport_airport.svg" xlink:type="simple"/>\n\
          <se:Format>image/svg+xml</se:Format>\n\
        </se:ExternalGraphic>\n\
        <!--Well known marker fallback-->\n\
        <se:Mark>\n\
          <se:WellKnownName>square</se:WellKnownName>\n\
          <se:Fill>\n\
            <se:SvgParameter name="fill">#000000</se:SvgParameter>\n\
          </se:Fill>\n\
          <se:Stroke>\n\
            <se:SvgParameter name="stroke">#ffffff</se:SvgParameter>\n\
            <se:SvgParameter name="stroke-width">0.5</se:SvgParameter>\n\
          </se:Stroke>\n\
        </se:Mark>\n\
        <se:Size>'+ size +'</se:Size>\n\
        <se:Rotation>\n\
          <ogc:Literal>'+ rotate+'</ogc:Literal>\n\
        </se:Rotation>\n\
      </se:Graphic>\n\
    </se:PointSymbolizer>\n\
  </se:Rule>'
    let sld_tail = '      </se:FeatureTypeStyle>\n\
    </UserStyle>\n\
    </NamedLayer>\n\
    </StyledLayerDescriptor>'
    sld_text += sld_head
    sld_text += sld_name
    sld_text += sld_rule
    sld_text += sld_tail

    // 打包
    console.log(__dirname)
    let sldPath = 'C:\\Users\\fhm\\Desktop\\'
    // let new_name = query_layer+'_'+query_attr
    const file = new AdmZip();
    file.addFile(new_name+'.sld',Buffer.from(sld_text));
    const fs = require('fs');
    fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
    const pathname = __dirname+"/SLDfile/"+new_name
    // 上传
    cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
        if (error) {
            console.error('error:', error);
            return res.cc(error);
        }
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        // res.send(stdout)
        // console.log(stdout)
    })
    setTimeout(()=>{
        console.log("5")
    // 设为默认
    let chg_SLD = new_name//想修改的样式名称
    let styleJSON = {
        "layer": {
            "defaultStyle": {
                "name":chg_SLD,"href": ''+ query_work +'/geoserver/rest/styles/'+ chg_SLD +'.json'
            }
        }
    }
    console.log(styleJSON)

    axios({
        method: 'PUT',
        baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
        headers: {
        'Authorization':'Basic YWRtaW46Z2Vvc2VydmVy',
        'content-type': 'application/json'
    },
        data:styleJSON
    }).then(responseStyle=>{
        console.log(responseStyle.data)
        console.log(''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'')
        console.log('加载选中样式')
        res.send('加载选中样式')
    }).catch(err=>{
        console.log(err);
        res.send('ERROR!加载样式表出错')
    })
    }, 500)
}
//SLD 单色点
exports.SLD_dotSingle = (req,res)=>{
    // let query_attr = req.body.Attr   // 选择的属性值，
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    let layer_color = req.body.layer_color // 图层颜色
    let layer_size = req.body.layer_size // 点的大小
    let layer_shape = req.body.layer_shape // 点的形状
    let line_color = req.body.line_color // 线的颜色
    let line_width = req.body.line_width // 线的宽度
    //颜色转化为16进制
    let rgb = rgb2hex(line_color)
    let layer_rgb = rgb2hex(layer_color)
    // 新的sld文件的名字
    let today = new Date();
    let time = today.getTime().toString()
    let time_used = time.substring(time.length-5,time.length-1)
    let new_name = 'DOTSING'+query_layer+'-'+time_used
    let sld_text = ''
    let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
    <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:se="http://www.opengis.net/se">'
    let sld_name = '  <NamedLayer>\n\
    <se:Name>'+ new_name +'</se:Name>\n\
    <UserStyle>\n\
    <se:Name>' + new_name+'</se:Name>\n\
    <se:FeatureTypeStyle>'
    let sld_rule = '        <se:Rule>\n\
    <se:Name>Single symbol</se:Name>\n\
    <se:PointSymbolizer>\n\
      <se:Graphic>\n\
        <se:Mark>\n\
          <se:WellKnownName>'+ layer_shape +'</se:WellKnownName>\n\
          <se:Fill>\n\
            <se:SvgParameter name="fill">'+ layer_rgb +'</se:SvgParameter>\n\
          </se:Fill>\n\
          <se:Stroke>\n\
            <se:SvgParameter name="stroke">'+rgb+'</se:SvgParameter>\n\
            <se:SvgParameter name="stroke-width">'+line_width+'</se:SvgParameter>\n\
          </se:Stroke>\n\
        </se:Mark>\n\
        <se:Size>' + layer_size+ '</se:Size>\n\
      </se:Graphic>\n\
    </se:PointSymbolizer>\n\
  </se:Rule>'
    let sld_tail = '      </se:FeatureTypeStyle>\n\
    </UserStyle>\n\
    </NamedLayer>\n\
    </StyledLayerDescriptor>'
    sld_text += sld_head
    sld_text += sld_name
    sld_text += sld_rule
    sld_text += sld_tail

    // 打包
    console.log(__dirname)
    let sldPath = 'C:\\Users\\fhm\\Desktop\\'
    // let new_name = query_layer+'_'+query_attr
    const file = new AdmZip();
    file.addFile(new_name+'.sld',Buffer.from(sld_text));
    const fs = require('fs');
    fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
    const pathname = __dirname+"/SLDfile/"+new_name
    // 上传
    cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
        if (error) {
            console.error('error:', error);
            return res.cc(error);
        }
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        // res.send(stdout)
        // console.log(stdout)
    })
    setTimeout(()=>{
        console.log("5")
    // 设为默认
    let chg_SLD = new_name//想修改的样式名称
    let styleJSON = {
        "layer": {
            "defaultStyle": {
                "name":chg_SLD,"href": ''+ query_work +'/geoserver/rest/styles/'+ chg_SLD +'.json'
            }
        }
    }
    console.log(styleJSON)

    axios({
        method: 'PUT',
        baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
        headers: {
        'Authorization':'Basic YWRtaW46Z2Vvc2VydmVy',
        'content-type': 'application/json'
    },
        data:styleJSON
    }).then(responseStyle=>{
        console.log(responseStyle.data)
        console.log(''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'')
        console.log('加载选中样式')
        res.send('加载选中样式')
    }).catch(err=>{
        console.log(err);
        res.send('ERROR!加载样式表出错')
    })
    }, 500)
}
//SLD 唯一值 使用默认的 色带60
exports.SLD_dotUnique = (req,res)=>{
    let query_attr = req.body.Attr   // 选择的属性值，
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    // let layer_color = req.body.layer_color // 图层颜色
    let layer_size = req.body.layer_size // 点的大小
    let layer_shape = req.body.layer_shape // 点的形状
    let line_color = req.body.line_color // 线的颜色
    let line_width = req.body.line_width // 线的宽度
    //颜色转化为16进制
    let rgb = rgb2hex(line_color)
    // 新的sld文件的名字
    let today = new Date();
    let time = today.getTime().toString()
    let time_used = time.substring(time.length-5,time.length-1)
    let new_name = 'DOTUNIQ'+query_layer+'-'+query_attr+time_used

    let WFSUrl = ''+http_url+'/geoserver/wfs?'
    var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+query_work+':'+query_layer+'&outputFormat=application/json';
    console.log(feature_url)
    axios.get(feature_url).then((WFS_res)=>{
        let Geodata = WFS_res.data.features
        let attrList=[]
        for(let i=0;i<Geodata.length;i++){
            // console.log(Geodata[i].properties[query_attr])
            attrList.push(Geodata[i].properties[query_attr])
        }
        //先排个序，从小到大
        attrList.sort(function(a,b){
            return a-b
        }) 
        //需要去重，得到的最后个数为最后需要分类的个数
        //size: 获取Set实例的元素个数：
        var sum = new Set(attrList);
        let cat_num = sum.size // 分的层级数
        // console.log(cat_num)
        const sum_attr = Array.from(sum)
        // console.log(attrList)
        // console.log(sum_attr)

        // 利用数组长度，除余，解决数组过多，利用 色带60
        let sld_text = ''
        let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
        <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:se="http://www.opengis.net/se">'
        let sld_name = '  <NamedLayer>\n\
        <se:Name>'+ new_name +'</se:Name>\n\
        <UserStyle>\n\
        <se:Name>' + new_name+'</se:Name>\n\
        <se:FeatureTypeStyle>'
        let sld_rule = ''
        // 显示的label
        let sld_label = '<se:Rule>\n\
        <se:TextSymbolizer>\n\
            <se:Label>\n\
            <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
            </se:Label>\n\
            <se:Font>\n\
            <se:SvgParameter name="font-family">微软雅黑</se:SvgParameter>\n\
            <se:SvgParameter name="font-size">13</se:SvgParameter>\n\
            </se:Font>\n\
            <se:LabelPlacement>\n\
            <se:PointPlacement>\n\
                <se:AnchorPoint>\n\
                <se:AnchorPointX>0</se:AnchorPointX>\n\
                <se:AnchorPointY>0.5</se:AnchorPointY>\n\
                </se:AnchorPoint>\n\
            </se:PointPlacement>\n\
            </se:LabelPlacement>\n\
            <se:Fill>\n\
            <se:SvgParameter name="fill">#323232</se:SvgParameter>\n\
            </se:Fill>\n\
            <se:VendorOption name="maxDisplacement">1</se:VendorOption>\n\
        </se:TextSymbolizer>\n\
        </se:Rule>'
        let sld_tail = '      </se:FeatureTypeStyle>\n\
        </UserStyle>\n\
        </NamedLayer>\n\
        </StyledLayerDescriptor>'
        // 唯一值不用生成的色带，用声明的全局ColorBand_60色彩数组
        // let colorBand = generateBand(attrList.length,rgb[0],rgb[1],rgb[2])
        // res.send(colorBand)
        for(var i=1;i<sum_attr.length+1;i++){
            sld_rule += '<se:Rule>\n\
            <se:Name>'+ i +'</se:Name>\n\
            <se:Description>\n\
              <se:Title>'+ i +'</se:Title>\n\
            </se:Description>\n\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
              <ogc:PropertyIsEqualTo>\n\
                <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                <ogc:Literal>'+ sum_attr[i-1] +'</ogc:Literal>\n\
              </ogc:PropertyIsEqualTo>\n\
            </ogc:Filter>\n\
            <se:PointSymbolizer>\n\
              <se:Graphic>\n\
                <se:Mark>\n\
                  <se:WellKnownName>'+ layer_shape +'</se:WellKnownName>\n\
                  <se:Fill>\n\
                    <se:SvgParameter name="fill">'+ ColorBand_60[i%60-1] +'</se:SvgParameter>\n\
                  </se:Fill>\n\
                  <se:Stroke>\n\
                    <se:SvgParameter name="stroke">'+ rgb +'</se:SvgParameter>\n\
                    <se:SvgParameter name="stroke-width">'+ line_width +'</se:SvgParameter>\n\
                  </se:Stroke>\n\
                </se:Mark>\n\
                <se:Size>'+ layer_size +'</se:Size>\n\
              </se:Graphic>\n\
            </se:PointSymbolizer>\n\
          </se:Rule>'
        }
        sld_text += sld_head
        sld_text += sld_name
        sld_text += sld_rule
        // sld_text += sld_label
        sld_text += sld_tail

        // 打包
        console.log(__dirname)
        let sldPath = 'C:\\Users\\fhm\\Desktop\\'
        // let new_name = query_layer+'_'+query_attr
        const file = new AdmZip();
        file.addFile(new_name+'.sld',Buffer.from(sld_text));
        const fs = require('fs');
        fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
        const pathname = __dirname+"/SLDfile/"+new_name
        // 上传
        cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
            if (error) {
                console.error('error:', error);
                return res.cc(error);
            }
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            // res.send(stdout)
            // console.log(stdout)
        })
        setTimeout(()=>{
            console.log("5")
        // 设为默认
        let chg_SLD = new_name//想修改的样式名称
        let styleJSON = {
            "layer": {
                "defaultStyle": {
                    "name":chg_SLD,"href": ''+ query_work +'/geoserver/rest/styles/'+ chg_SLD +'.json'
                }
            }
        }
        console.log(styleJSON)

    axios({
        method: 'PUT',
        baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
        headers: {
        'Authorization':'Basic YWRtaW46Z2Vvc2VydmVy',
        'content-type': 'application/json'
        },
        data:styleJSON
    }).then(responseStyle=>{
        console.log(responseStyle.data)
        console.log('加载选中样式')
        res.send('加载选中样式')
    }).catch(err=>{
        console.log(err);
        res.send('ERROR!加载样式表出错')
    })
        }, 500)
    })

}
//SLD 分层设色
exports.SLD_dotGraduated = (req,res)=>{
    let query_attr = req.body.Attr   // 选择的属性值，
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    let layer_color = req.body.layer_color // 图层颜色
    let layer_size = req.body.layer_size // 点的大小
    let layer_shape = req.body.layer_shape // 点的形状
    let line_color = req.body.line_color // 线的颜色
    let line_width = req.body.line_width // 线的宽度
    let cat_num = req.body.num // 分的层级数
    console.log(req.body)
    //颜色转化为16进制
    let rgb = rgb2hex(line_color)
    // let layer_rgb = layer_color.substring(4,layer_color.length-1).split(",")
    // 新的sld文件的名字
    let today = new Date();
    let time = today.getTime().toString()
    let time_used = time.substring(time.length-5,time.length-1)
    let new_name = 'DOTGRAD'+query_layer+'-'+query_attr+time_used

    let WFSUrl = ''+http_url+'/geoserver/wfs?'
    var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+query_work+':'+query_layer+'&outputFormat=application/json';
    axios.get(feature_url).then((WFS_res)=>{
        // res.send(WFS_res.data.features)
        let Geodata = WFS_res.data.features
        let attrList=[]
        for(let i=0;i<Geodata.length;i++){
            // console.log(Geodata[i].properties[query_attr])
            attrList.push(Geodata[i].properties[query_attr])
        }

        //做一下class分类，默认分五类,|'''''|'''''|'''''|'''''|'''''|
        //先排个序，从小到大
        attrList.sort(function(a,b){
            return a-b
        }) 
        //需要去重，得到的最后个数为最后需要分类的个数
        //size: 获取Set实例的元素个数：
        var sum = new Set(attrList);
        // cat_num = sum.size // 分的层级数
        // 6-1 为5 因为索引从零开始
        const d_attr = Math.floor(Geodata.length/cat_num)
        // res.send(attrList)
        // console.log(attrList)
        console.log(d_attr)
        let sld_text = ''
        let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
        <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        let sld_name = '  <NamedLayer>\n\
        <se:Name>'+ new_name +'</se:Name>\n\
        <UserStyle>\n\
        <se:Name>' + new_name+'</se:Name>\n\
        <se:FeatureTypeStyle>'
        // 显示的label
        let sld_label = '<se:Rule>\n\
        <se:TextSymbolizer>\n\
            <se:Label>\n\
            <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
            </se:Label>\n\
            <se:Font>\n\
            <se:SvgParameter name="font-family">微软雅黑</se:SvgParameter>\n\
            <se:SvgParameter name="font-size">13</se:SvgParameter>\n\
            </se:Font>\n\
            <se:LabelPlacement>\n\
            <se:PointPlacement>\n\
                <se:AnchorPoint>\n\
                <se:AnchorPointX>0</se:AnchorPointX>\n\
                <se:AnchorPointY>0.5</se:AnchorPointY>\n\
                </se:AnchorPoint>\n\
            </se:PointPlacement>\n\
            </se:LabelPlacement>\n\
            <se:Fill>\n\
            <se:SvgParameter name="fill">#323232</se:SvgParameter>\n\
            </se:Fill>\n\
            <se:VendorOption name="maxDisplacement">1</se:VendorOption>\n\
        </se:TextSymbolizer>\n\
        </se:Rule>'
        let sld_rule = ''
        let sld_tail = '      </se:FeatureTypeStyle>\n\
        </UserStyle>\n\
        </NamedLayer>\n\
        </StyledLayerDescriptor>'
        // 生成颜色
        // let colorBand = generateBand(cat_num,layer_rgb[0],layer_rgb[1],layer_rgb[2])
        let colorBand = sedai(cat_num,layer_color)
        console.log(colorBand)
        // console.log(req.body.R,req.body.G,req.body.B)
        // res.send(colorBand)
        for(var i=0;i<cat_num-1;i++){
            console.log(i*d_attr)
            sld_rule += '<se:Rule>\n\
            <se:Name>'+ attrList[i*d_attr] + '-' + attrList[i*d_attr+d_attr]+'</se:Name>\n\
            <se:Description>\n\
              <se:Title>'+ attrList[i*d_attr]+ '-' + attrList[i*d_attr+d_attr] +'</se:Title>\n\
            </se:Description>\n\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
              <ogc:And>\n\
                <ogc:PropertyIsGreaterThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[i*d_attr] + '</ogc:Literal>\n\
                </ogc:PropertyIsGreaterThanOrEqualTo>\n\
                <ogc:PropertyIsLessThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[i*d_attr+d_attr] + '</ogc:Literal>\n\
                </ogc:PropertyIsLessThanOrEqualTo>\n\
              </ogc:And>\n\
            </ogc:Filter>\n\
            <se:PointSymbolizer>\n\
            <se:Graphic>\n\
              <se:Mark>\n\
                <se:WellKnownName>'+ layer_shape +'</se:WellKnownName>\n\
                <se:Fill>\n\
                  <se:SvgParameter name="fill">'+ colorBand[i] +'</se:SvgParameter>\n\
                </se:Fill>\n\
                <se:Stroke>\n\
                  <se:SvgParameter name="stroke">'+ rgb +'</se:SvgParameter>\n\
                  <se:SvgParameter name="stroke-width">'+ line_width+'</se:SvgParameter>\n\
                </se:Stroke>\n\
              </se:Mark>\n\
              <se:Size>'+ layer_size +'</se:Size>\n\
            </se:Graphic>\n\
          </se:PointSymbolizer>\n\
          </se:Rule>'
        }
        sld_rule += '<se:Rule>\n\
            <se:Name>'+ attrList[(cat_num-2)*d_attr+d_attr] + '-' +  attrList[attrList.length-1]+'</se:Name>\n\
            <se:Description>\n\
              <se:Title>'+ attrList[(cat_num-2)*d_attr+d_attr]+ '-' +  attrList[attrList.length-1] +'</se:Title>\n\
            </se:Description>\n\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
              <ogc:And>\n\
                <ogc:PropertyIsGreaterThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[(cat_num-2)*d_attr+d_attr] + '</ogc:Literal>\n\
                </ogc:PropertyIsGreaterThanOrEqualTo>\n\
                <ogc:PropertyIsLessThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[attrList.length-1] + '</ogc:Literal>\n\
                </ogc:PropertyIsLessThanOrEqualTo>\n\
              </ogc:And>\n\
            </ogc:Filter>\n\
            <se:PointSymbolizer>\n\
            <se:Graphic>\n\
              <se:Mark>\n\
                <se:WellKnownName>'+ layer_shape +'</se:WellKnownName>\n\
                <se:Fill>\n\
                  <se:SvgParameter name="fill">'+ colorBand[colorBand.length-1] +'</se:SvgParameter>\n\
                </se:Fill>\n\
                <se:Stroke>\n\
                  <se:SvgParameter name="stroke">'+ rgb +'</se:SvgParameter>\n\
                  <se:SvgParameter name="stroke-width">'+ line_width+'</se:SvgParameter>\n\
                </se:Stroke>\n\
              </se:Mark>\n\
              <se:Size>'+ layer_size +'</se:Size>\n\
            </se:Graphic>\n\
          </se:PointSymbolizer>\n\
          </se:Rule>'
        sld_text += sld_head
        sld_text += sld_name
        sld_text += sld_rule
        // sld_text += sld_label
        sld_text += sld_tail
        // res.send(sld_text)
        // fs.writeFile('C:\\Users\\fhm\\Desktop\\test2.xml',sld_text,err=>{
        //     // 没错会打null
        //     console.log(err)
        // })
        //打包
        let sldPath = 'C:\\Users\\fhm\\Desktop\\'
        // let new_name = query_layer+'_'+query_attr
        const file = new AdmZip();
        file.addFile(new_name+'.sld',Buffer.from(sld_text));
        const fs = require('fs');
        fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
        const pathname = __dirname+"/SLDfile/"+new_name
        // 上传
        cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
            if (error) {
                console.error('error:', error);
                return res.cc(error);
            }
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            // res.send(stdout)
            // console.log(stdout)
        })
        console.log("SLD文件制作上传完成")

        setTimeout(()=>{
            console.log("开始设为默认")
            let styleJSON = {
                "layer": {
                    "defaultStyle": {
                        "name": new_name,"href": ''+ http_url +'/geoserver/rest/styles/'+ new_name +'.json'
                    }
                }
            }
            console.log(styleJSON)
            axios({
                method: 'put',
                baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
                headers: {
                Authorization:'Basic YWRtaW46Z2Vvc2VydmVy',
                'content-type': 'application/json'
            },
                data:styleJSON
            }).then(responseStyle=>{
                console.log(responseStyle.data)
                console.log('加载了新加载的样式')
                res.send(styleJSON)
            }).catch(err=>{
                console.log(err);
                res.send('ERROR!加载样式表出错')
            })
        },500)
    }) 
}
//SLD 渐变设色
exports.SLD_dotGradient = (req,res)=>{
    let today = new Date();
    let time = today.getTime().toString()
    let time_used = time.substring(time.length-5,time.length-1)
    // res.send(time_used)
    console.log(time_used)


    let query_attr = req.body.Attr   // 选择的属性值，
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    let layer_color = req.body.layer_color // 图层颜色
    let layer_size = req.body.layer_size // 点的大小
    let layer_shape = req.body.layer_shape // 点的形状
    let line_color = req.body.line_color // 线的颜色
    let line_width = req.body.line_width // 线的宽度

    console.log(req.body)
    // 转化为16进制的颜色值
    let rgb = rgb2hex(line_color)
    // let rgb = query_color.substring(4,query_color.length-1).split(",")
    // 新的sld文件的名字
    let new_name = 'DOTJIAN'+query_layer+'-'+query_attr+time_used
    let WFSUrl = ''+http_url+'/geoserver/wfs?'
    var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+query_work+':'+query_layer+'&outputFormat=application/json';
    axios.get(feature_url).then((WFS_res)=>{
        // res.send(WFS_res.data.features)
        let Geodata = WFS_res.data.features
        let attrList=[]
        for(let i=0;i<Geodata.length;i++){
            // console.log(Geodata[i].properties[query_attr])
            attrList.push(Geodata[i].properties[query_attr])
        }

        //开始拼接
        // let today = new Date()
        // let sjTime = today.getTime()
        //先排个序，从小到大
        attrList.sort(function(a,b){
            return a-b
        }) 
        //需要去重，得到的最后个数为最后需要分类的个数
        //size: 获取Set实例的元素个数：
        var sum = new Set(attrList);
        let cat_num = sum.size // 分的层级数
        const sum_attr = Array.from(sum)
        let sld_text = ''
        let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
        <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        let sld_name = '  <NamedLayer>\n\
        <se:Name>'+ new_name +'</se:Name>\n\
        <UserStyle>\n\
        <se:Name>' + new_name+'</se:Name>\n\
        <se:FeatureTypeStyle>'
        // 显示的label
        let sld_label = '<se:Rule>\n\
        <se:TextSymbolizer>\n\
            <se:Label>\n\
            <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
            </se:Label>\n\
            <se:Font>\n\
            <se:SvgParameter name="font-family">微软雅黑</se:SvgParameter>\n\
            <se:SvgParameter name="font-size">13</se:SvgParameter>\n\
            </se:Font>\n\
            <se:LabelPlacement>\n\
            <se:PointPlacement>\n\
                <se:AnchorPoint>\n\
                <se:AnchorPointX>0</se:AnchorPointX>\n\
                <se:AnchorPointY>0.5</se:AnchorPointY>\n\
                </se:AnchorPoint>\n\
            </se:PointPlacement>\n\
            </se:LabelPlacement>\n\
            <se:Fill>\n\
            <se:SvgParameter name="fill">#323232</se:SvgParameter>\n\
            </se:Fill>\n\
            <se:VendorOption name="maxDisplacement">1</se:VendorOption>\n\
        </se:TextSymbolizer>\n\
        </se:Rule>'
        let sld_rule = ''
        let sld_tail = '      </se:FeatureTypeStyle>\n\
        </UserStyle>\n\
        </NamedLayer>\n\
        </StyledLayerDescriptor>'
        // 生成颜色
        // console.log(cat_num,layer_color)
        let colorBand = sedai(cat_num,layer_color)
        // console.log(colorBand)
        // console.log(req.body.R,req.body.G,req.body.B)
        // res.send(colorBand)
        for(var i=1;i<cat_num+1;i++){
            sld_rule += '<se:Rule>\n\
            <se:Name>'+ sum_attr[i-1] + '-' + sum_attr[i]+'</se:Name>\n\
            <se:Description>\n\
              <se:Title>'+ sum_attr[i-1]+ '-' + sum_attr[i] +'</se:Title>\n\
            </se:Description>\n\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
              <ogc:And>\n\
                <ogc:PropertyIsGreaterThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + sum_attr[i-1] + '</ogc:Literal>\n\
                </ogc:PropertyIsGreaterThanOrEqualTo>\n\
                <ogc:PropertyIsLessThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + sum_attr[i-1] + '</ogc:Literal>\n\
                </ogc:PropertyIsLessThanOrEqualTo>\n\
              </ogc:And>\n\
            </ogc:Filter>\n\
            <se:PointSymbolizer>\n\
            <se:Graphic>\n\
              <se:Mark>\n\
                <se:WellKnownName>'+ layer_shape +'</se:WellKnownName>\n\
                <se:Fill>\n\
                  <se:SvgParameter name="fill">'+ colorBand[i-1] +'</se:SvgParameter>\n\
                </se:Fill>\n\
                <se:Stroke>\n\
                  <se:SvgParameter name="stroke">'+ rgb +'</se:SvgParameter>\n\
                  <se:SvgParameter name="stroke-width">'+ line_width+'</se:SvgParameter>\n\
                </se:Stroke>\n\
              </se:Mark>\n\
              <se:Size>'+ layer_size +'</se:Size>\n\
            </se:Graphic>\n\
          </se:PointSymbolizer>\n\
          </se:Rule>'
        }
        sld_text += sld_head
        sld_text += sld_name
        sld_text += sld_rule
        // sld_text += sld_label
        sld_text += sld_tail
        // res.send(sld_text)
        // fs.writeFile('C:\\Users\\fhm\\Desktop\\test2.xml',sld_text,err=>{
        //     // 没错会打null
        //     console.log(err)
        // })
        //打包
        let sldPath = 'C:\\Users\\fhm\\Desktop\\'
        // let new_name = query_layer+'_'+query_attr
        const file = new AdmZip();
        file.addFile(new_name+'.sld',Buffer.from(sld_text));
        const fs = require('fs');
        fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
        const pathname = __dirname+"/SLDfile/"+new_name
        // 上传
        cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
            if (error) {
                console.error('error:', error);
                return res.cc(error);
            }
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            // res.send(stdout)
            // console.log(stdout)
        })
        console.log("SLD文件制作上传完成")

        setTimeout(()=>{
            console.log("开始设为默认")
            let styleJSON = {
                "layer": {
                    "defaultStyle": {
                        "name": new_name,"href": ''+ http_url +'/geoserver/rest/styles/'+ new_name +'.json'
                    }
                }
            }
            console.log(styleJSON)
            axios({
                method: 'put',
                baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
                headers: {
                Authorization:'Basic YWRtaW46Z2Vvc2VydmVy',
                'content-type': 'application/json'
            },
                data:styleJSON
            }).then(responseStyle=>{
                console.log(responseStyle.data)
                console.log('加载了新加载的样式')
                res.send(styleJSON)
            }).catch(err=>{
                console.log(err);
                res.send('ERROR!加载样式表出错')
            })
        },500)
    }) 
    
}
//线线线线线线线线线线线线线线线线线线线线线线线线线线
//单色
exports.SLD_lineSingle = (req,res)=>{
    // let query_attr = req.body.Attr   // 选择的属性值，
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    let line_color = req.body.line_color // 线的颜色
    let line_width = req.body.line_width // 线的宽度

    //颜色转化为16进制
    let rgb = rgb2hex(line_color)
    // 新的sld文件的名字
    let today = new Date();
    let time = today.getTime().toString()
    let time_used = time.substring(time.length-5,time.length-1)
    let new_name = 'LINESING'+query_layer+'-'+time_used
    let sld_text = ''
    let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
    <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:se="http://www.opengis.net/se">'
    let sld_name = '  <NamedLayer>\n\
    <se:Name>'+ new_name +'</se:Name>\n\
    <UserStyle>\n\
    <se:Name>' + new_name+'</se:Name>\n\
    <se:FeatureTypeStyle>'
    let sld_rule = '        <se:Rule>\n\
    <se:Name>Single symbol</se:Name>\n\
    <se:LineSymbolizer>\n\
      <se:Stroke>\n\
        <se:SvgParameter name="stroke">'+ rgb +'</se:SvgParameter>\n\
        <se:SvgParameter name="stroke-width">'+ line_width +'</se:SvgParameter>\n\
        <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
        <se:SvgParameter name="stroke-linecap">square</se:SvgParameter>\n\
      </se:Stroke>\n\
    </se:LineSymbolizer>\n\
  </se:Rule>'
  let sld_tail = '      </se:FeatureTypeStyle>\n\
  </UserStyle>\n\
  </NamedLayer>\n\
  </StyledLayerDescriptor>'
  sld_text += sld_head
  sld_text += sld_name
  sld_text += sld_rule
  sld_text += sld_tail

  // 打包
  console.log(__dirname)
  let sldPath = 'C:\\Users\\fhm\\Desktop\\'
  // let new_name = query_layer+'_'+query_attr
  const file = new AdmZip();
  file.addFile(new_name+'.sld',Buffer.from(sld_text));
  const fs = require('fs');
  fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
  const pathname = __dirname+"/SLDfile/"+new_name
  console.log(pathname)
  // 上传
  cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
      if (error) {
          console.error('error:', error);
          return res.cc(error);
      }
      // console.log('stdout: ' + stdout);
      // console.log('stderr: ' + stderr);
      // res.send(stdout)
      // console.log(stdout)
  })
  setTimeout(()=>{
      console.log("5")
  // 设为默认
  let chg_SLD = new_name//想修改的样式名称
  let styleJSON = {
      "layer": {
          "defaultStyle": {
              "name":chg_SLD,"href": ''+ query_work +'/geoserver/rest/styles/'+ chg_SLD +'.json'
          }
      }
  }
  console.log(styleJSON)

  axios({
      method: 'PUT',
      baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
      headers: {
      'Authorization':'Basic YWRtaW46Z2Vvc2VydmVy',
      'content-type': 'application/json'
  },
      data:styleJSON
  }).then(responseStyle=>{
      console.log(responseStyle.data)
      console.log(''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'')
      console.log('加载选中样式')
      res.send('加载选中样式')
  }).catch(err=>{
      console.log(err);
      res.send('ERROR!加载样式表出错')
  })
  }, 500)
}
//唯一值
//线唯一值
exports.SLD_lineUnique = (req,res)=>{
    let query_attr = req.body.Attr   // 选择的属性值，
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    // let line_color = req.body.line_color // 线的颜色
    let line_width = req.body.line_width // 线的宽度

    //颜色转化为16进制
    // let rgb = rgb2hex(line_color)
    // 新的sld文件的名字
    let today = new Date();
    let time = today.getTime().toString()
    let time_used = time.substring(time.length-5,time.length-1)
    let new_name = 'LINEUNIQ'+query_layer+'-'+time_used

    let WFSUrl = ''+http_url+'/geoserver/wfs?'
    var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+query_work+':'+query_layer+'&outputFormat=application/json';
    console.log(feature_url)
        
    axios.get(feature_url).then((WFS_res)=>{
        let Geodata = WFS_res.data.features
        let attrList=[]
        for(let i=0;i<Geodata.length;i++){
            // console.log(Geodata[i].properties[query_attr])
            attrList.push(Geodata[i].properties[query_attr])
        }
        //先排个序，从小到大
        attrList.sort(function(a,b){
            return a-b
        }) 
        //需要去重，得到的最后个数为最后需要分类的个数
        //size: 获取Set实例的元素个数：
        var sum = new Set(attrList);
        let cat_num = sum.size // 分的层级数
        // console.log(cat_num)
        const sum_attr = Array.from(sum)
        let sld_text = ''
        let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
        <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:se="http://www.opengis.net/se">'
        let sld_name = '  <NamedLayer>\n\
        <se:Name>'+ new_name +'</se:Name>\n\
        <UserStyle>\n\
        <se:Name>' + new_name+'</se:Name>\n\
        <se:FeatureTypeStyle>'
        let sld_rule = ''
        let sld_tail = '      </se:FeatureTypeStyle>\n\
        </UserStyle>\n\
        </NamedLayer>\n\
        </StyledLayerDescriptor>'
      
      for(let i=1;i<sum_attr.length+1;i++){
            sld_rule+='        <se:Rule>\n\
            <se:Name>'+ i +'</se:Name>\n\
            <se:Description>\n\
              <se:Title>'+ i +'</se:Title>\n\
            </se:Description>\n\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
              <ogc:PropertyIsEqualTo>\n\
                <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                <ogc:Literal>'+ sum_attr[i-1] +'</ogc:Literal>\n\
              </ogc:PropertyIsEqualTo>\n\
            </ogc:Filter>\n\
            <se:LineSymbolizer>\n\
              <se:Stroke>\n\
                <se:SvgParameter name="stroke">'+ ColorBand_60[i%60-1] +'</se:SvgParameter>\n\
                <se:SvgParameter name="stroke-width">'+ line_width +'</se:SvgParameter>\n\
                <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
                <se:SvgParameter name="stroke-linecap">square</se:SvgParameter>\n\
              </se:Stroke>\n\
            </se:LineSymbolizer>\n\
          </se:Rule>'
      }
      sld_text += sld_head
      sld_text += sld_name
      sld_text += sld_rule
      sld_text += sld_tail
    
      // 打包
      console.log(__dirname)
      let sldPath = 'C:\\Users\\fhm\\Desktop\\'
      // let new_name = query_layer+'_'+query_attr
      const file = new AdmZip();
      file.addFile(new_name+'.sld',Buffer.from(sld_text));
      const fs = require('fs');
      fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
      const pathname = __dirname+"/SLDfile/"+new_name
      console.log(pathname)
      // 上传
      cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
          if (error) {
              console.error('error:', error);
              return res.cc(error);
          }
          // console.log('stdout: ' + stdout);
          // console.log('stderr: ' + stderr);
          // res.send(stdout)
          // console.log(stdout)
      })
      setTimeout(()=>{
          console.log("5")
      // 设为默认
      let chg_SLD = new_name//想修改的样式名称
      let styleJSON = {
          "layer": {
              "defaultStyle": {
                  "name":chg_SLD,"href": ''+ query_work +'/geoserver/rest/styles/'+ chg_SLD +'.json'
              }
          }
      }
      console.log(styleJSON)
    
      axios({
          method: 'PUT',
          baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
          headers: {
          'Authorization':'Basic YWRtaW46Z2Vvc2VydmVy',
          'content-type': 'application/json'
      },
          data:styleJSON
      }).then(responseStyle=>{
          console.log(responseStyle.data)
          console.log(''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'')
          console.log('加载选中样式')
          res.send('加载选中样式')
      }).catch(err=>{
          console.log(err);
          res.send('ERROR!加载样式表出错')
      })
      }, 500)
    }).catch(err=>{
        console.log(err);
        res.send('SLD文件生成出错了')
    })
}
//分层设色
exports.SLD_lineGraduated = (req,res)=>{
    let query_attr = req.body.Attr   // 选择的属性值，
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    let line_color = req.body.line_color // 线的颜色
    let line_width = req.body.line_width // 线的宽度
    let cat_num = req.body.num // 分的层级数
    console.log(req.body)
    //颜色转化为16进制
    let rgb = rgb2hex(line_color)
    // let layer_rgb = layer_color.substring(4,layer_color.length-1).split(",")
    // 新的sld文件的名字
    let today = new Date();
    let time = today.getTime().toString()
    let time_used = time.substring(time.length-5,time.length-1)
    let new_name = 'LINEGRAD'+query_layer+'-'+query_attr+time_used

    let WFSUrl = ''+http_url+'/geoserver/wfs?'
    var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+query_work+':'+query_layer+'&outputFormat=application/json';
    console.log(feature_url)
    axios.get(feature_url).then((WFS_res)=>{
        // res.send(WFS_res.data.features)
        let Geodata = WFS_res.data.features
        let attrList=[]
        for(let i=0;i<Geodata.length;i++){
            // console.log(Geodata[i].properties[query_attr])
            attrList.push(Geodata[i].properties[query_attr])
        }

        //做一下class分类，默认分五类,|'''''|'''''|'''''|'''''|'''''|
        //先排个序，从小到大
        attrList.sort(function(a,b){
            return a-b
        }) 
        //需要去重，得到的最后个数为最后需要分类的个数
        //size: 获取Set实例的元素个数：
        // var sum = new Set(attrList);
        // cat_num = sum.size // 分的层级数
        // 6-1 为5 因为索引从零开始
        const d_attr = Math.floor(Geodata.length/cat_num)
        // res.send(attrList)
        // console.log(attrList)
        console.log(d_attr)
        let sld_text = ''
        let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
        <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        let sld_name = '  <NamedLayer>\n\
        <se:Name>'+ new_name +'</se:Name>\n\
        <UserStyle>\n\
        <se:Name>' + new_name+'</se:Name>\n\
        <se:FeatureTypeStyle>'
        // 显示的label
        let sld_label = '<se:Rule>\n\
        <se:TextSymbolizer>\n\
            <se:Label>\n\
            <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
            </se:Label>\n\
            <se:Font>\n\
            <se:SvgParameter name="font-family">微软雅黑</se:SvgParameter>\n\
            <se:SvgParameter name="font-size">13</se:SvgParameter>\n\
            </se:Font>\n\
            <se:LabelPlacement>\n\
            <se:PointPlacement>\n\
                <se:AnchorPoint>\n\
                <se:AnchorPointX>0</se:AnchorPointX>\n\
                <se:AnchorPointY>0.5</se:AnchorPointY>\n\
                </se:AnchorPoint>\n\
            </se:PointPlacement>\n\
            </se:LabelPlacement>\n\
            <se:Fill>\n\
            <se:SvgParameter name="fill">#323232</se:SvgParameter>\n\
            </se:Fill>\n\
            <se:VendorOption name="maxDisplacement">1</se:VendorOption>\n\
        </se:TextSymbolizer>\n\
        </se:Rule>'
        let sld_rule = ''
        let sld_tail = '      </se:FeatureTypeStyle>\n\
        </UserStyle>\n\
        </NamedLayer>\n\
        </StyledLayerDescriptor>'
        // 生成颜色
        // let colorBand = generateBand(cat_num,layer_rgb[0],layer_rgb[1],layer_rgb[2])
        let colorBand = sedai(cat_num,line_color)
        console.log(colorBand)
        // console.log(req.body.R,req.body.G,req.body.B)
        // res.send(colorBand)
        for(var i=0;i<cat_num-1;i++){
            console.log(i*d_attr)
            sld_rule += '<se:Rule>\n\
            <se:Name>'+ attrList[i*d_attr] + '-' + attrList[i*d_attr+d_attr]+'</se:Name>\n\
            <se:Description>\n\
              <se:Title>'+ attrList[i*d_attr]+ '-' + attrList[i*d_attr+d_attr] +'</se:Title>\n\
            </se:Description>\n\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
              <ogc:And>\n\
                <ogc:PropertyIsGreaterThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[i*d_attr] + '</ogc:Literal>\n\
                </ogc:PropertyIsGreaterThanOrEqualTo>\n\
                <ogc:PropertyIsLessThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[i*d_attr+d_attr] + '</ogc:Literal>\n\
                </ogc:PropertyIsLessThanOrEqualTo>\n\
              </ogc:And>\n\
            </ogc:Filter>\n\
            <se:LineSymbolizer>\n\
            <se:Stroke>\n\
              <se:SvgParameter name="stroke">'+colorBand[i]+'</se:SvgParameter>\n\
              <se:SvgParameter name="stroke-width">'+ line_width +'</se:SvgParameter>\n\
              <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
              <se:SvgParameter name="stroke-linecap">square</se:SvgParameter>\n\
            </se:Stroke>\n\
          </se:LineSymbolizer>\n\
          </se:Rule>'
        }
        sld_rule += '<se:Rule>\n\
            <se:Name>'+ attrList[(cat_num-2)*d_attr+d_attr] + '-' +  attrList[attrList.length-1]+'</se:Name>\n\
            <se:Description>\n\
              <se:Title>'+ attrList[(cat_num-2)*d_attr+d_attr]+ '-' +  attrList[attrList.length-1] +'</se:Title>\n\
            </se:Description>\n\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
              <ogc:And>\n\
                <ogc:PropertyIsGreaterThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[(cat_num-2)*d_attr+d_attr] + '</ogc:Literal>\n\
                </ogc:PropertyIsGreaterThanOrEqualTo>\n\
                <ogc:PropertyIsLessThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[attrList.length-1] + '</ogc:Literal>\n\
                </ogc:PropertyIsLessThanOrEqualTo>\n\
              </ogc:And>\n\
            </ogc:Filter>\n\
            <se:LineSymbolizer>\n\
            <se:Stroke>\n\
              <se:SvgParameter name="stroke">'+colorBand[colorBand.length-1]+'</se:SvgParameter>\n\
              <se:SvgParameter name="stroke-width">'+ line_width +'</se:SvgParameter>\n\
              <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
              <se:SvgParameter name="stroke-linecap">square</se:SvgParameter>\n\
            </se:Stroke>\n\
          </se:LineSymbolizer>\n\
          </se:Rule>'
        sld_text += sld_head
        sld_text += sld_name
        sld_text += sld_rule
        // sld_text += sld_label
        sld_text += sld_tail
        // res.send(sld_text)
        // fs.writeFile('C:\\Users\\fhm\\Desktop\\test2.xml',sld_text,err=>{
        //     // 没错会打null
        //     console.log(err)
        // })
        //打包
        let sldPath = 'C:\\Users\\fhm\\Desktop\\'
        // let new_name = query_layer+'_'+query_attr
        const file = new AdmZip();
        file.addFile(new_name+'.sld',Buffer.from(sld_text));
        const fs = require('fs');
        fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
        const pathname = __dirname+"/SLDfile/"+new_name
        // 上传
        cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
            if (error) {
                console.error('error:', error);
                return res.cc(error);
            }
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            // res.send(stdout)
            // console.log(stdout)
        })
        console.log("SLD文件制作上传完成")

        setTimeout(()=>{
            console.log("开始设为默认")
            let styleJSON = {
                "layer": {
                    "defaultStyle": {
                        "name": new_name,"href": ''+ http_url +'/geoserver/rest/styles/'+ new_name +'.json'
                    }
                }
            }
            console.log(styleJSON)
            axios({
                method: 'put',
                baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
                headers: {
                Authorization:'Basic YWRtaW46Z2Vvc2VydmVy',
                'content-type': 'application/json'
            },
                data:styleJSON
            }).then(responseStyle=>{
                console.log(responseStyle.data)
                console.log('加载了新加载的样式')
                res.send(styleJSON)
            }).catch(err=>{
                console.log(err);
                res.send('ERROR!加载样式表出错')
            })
        },500)
    }) 
}
//SLD 渐变设色
exports.SLD_lineGradient = (req,res)=>{
    let today = new Date();
    let time = today.getTime().toString()
    let time_used = time.substring(time.length-5,time.length-1)
    // res.send(time_used)
    console.log(time_used)


    let query_attr = req.body.Attr   // 选择的属性值，
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    let line_color = req.body.line_color // 线的颜色
    let line_width = req.body.line_width // 线的宽度


    // 新的sld文件的名字
    let new_name = 'LINEJIAN'+query_layer+'-'+query_attr+time_used
    let WFSUrl = ''+http_url+'/geoserver/wfs?'
    var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+query_work+':'+query_layer+'&outputFormat=application/json';
    axios.get(feature_url).then((WFS_res)=>{
        // res.send(WFS_res.data.features)
        let Geodata = WFS_res.data.features
        let attrList=[]
        for(let i=0;i<Geodata.length;i++){
            // console.log(Geodata[i].properties[query_attr])
            attrList.push(Geodata[i].properties[query_attr])
        }

        //开始拼接
        // let today = new Date()
        // let sjTime = today.getTime()
        //先排个序，从小到大
        attrList.sort(function(a,b){
            return a-b
        }) 
        //需要去重，得到的最后个数为最后需要分类的个数
        //size: 获取Set实例的元素个数：
        var sum = new Set(attrList);
        let cat_num = sum.size // 分的层级数
        const sum_attr = Array.from(sum)
        let sld_text = ''
        let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
        <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        let sld_name = '  <NamedLayer>\n\
        <se:Name>'+ new_name +'</se:Name>\n\
        <UserStyle>\n\
        <se:Name>' + new_name+'</se:Name>\n\
        <se:FeatureTypeStyle>'
        // 显示的label
        let sld_label = '<se:Rule>\n\
        <se:TextSymbolizer>\n\
            <se:Label>\n\
            <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
            </se:Label>\n\
            <se:Font>\n\
            <se:SvgParameter name="font-family">微软雅黑</se:SvgParameter>\n\
            <se:SvgParameter name="font-size">13</se:SvgParameter>\n\
            </se:Font>\n\
            <se:LabelPlacement>\n\
            <se:PointPlacement>\n\
                <se:AnchorPoint>\n\
                <se:AnchorPointX>0</se:AnchorPointX>\n\
                <se:AnchorPointY>0.5</se:AnchorPointY>\n\
                </se:AnchorPoint>\n\
            </se:PointPlacement>\n\
            </se:LabelPlacement>\n\
            <se:Fill>\n\
            <se:SvgParameter name="fill">#323232</se:SvgParameter>\n\
            </se:Fill>\n\
            <se:VendorOption name="maxDisplacement">1</se:VendorOption>\n\
        </se:TextSymbolizer>\n\
        </se:Rule>'
        let sld_rule = ''
        let sld_tail = '      </se:FeatureTypeStyle>\n\
        </UserStyle>\n\
        </NamedLayer>\n\
        </StyledLayerDescriptor>'
        // 生成颜色
        // console.log(cat_num,layer_color)
        let colorBand = sedai(cat_num,line_color)
        // console.log(colorBand)
        // console.log(req.body.R,req.body.G,req.body.B)
        // res.send(colorBand)
        for(var i=1;i<cat_num+1;i++){
            sld_rule += '<se:Rule>\n\
            <se:Name>'+ sum_attr[i-1] + '-' + sum_attr[i-1]+'</se:Name>\n\
            <se:Description>\n\
              <se:Title>'+ sum_attr[i]+ '-' + sum_attr[i] +'</se:Title>\n\
            </se:Description>\n\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
              <ogc:And>\n\
                <ogc:PropertyIsGreaterThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + sum_attr[i-1] + '</ogc:Literal>\n\
                </ogc:PropertyIsGreaterThanOrEqualTo>\n\
                <ogc:PropertyIsLessThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + sum_attr[i] + '</ogc:Literal>\n\
                </ogc:PropertyIsLessThanOrEqualTo>\n\
              </ogc:And>\n\
            </ogc:Filter>\n\
            <se:LineSymbolizer>\n\
            <se:Stroke>\n\
              <se:SvgParameter name="stroke">'+colorBand[i-1]+'</se:SvgParameter>\n\
              <se:SvgParameter name="stroke-width">'+ line_width +'</se:SvgParameter>\n\
              <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
              <se:SvgParameter name="stroke-linecap">square</se:SvgParameter>\n\
            </se:Stroke>\n\
          </se:LineSymbolizer>\n\
          </se:Rule>'
        }
        sld_text += sld_head
        sld_text += sld_name
        sld_text += sld_rule
        // sld_text += sld_label
        sld_text += sld_tail
        // res.send(sld_text)
        // fs.writeFile('C:\\Users\\fhm\\Desktop\\test2.xml',sld_text,err=>{
        //     // 没错会打null
        //     console.log(err)
        // })
        //打包
        let sldPath = 'C:\\Users\\fhm\\Desktop\\'
        // let new_name = query_layer+'_'+query_attr
        const file = new AdmZip();
        file.addFile(new_name+'.sld',Buffer.from(sld_text));
        const fs = require('fs');
        fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
        const pathname = __dirname+"/SLDfile/"+new_name
        // 上传
        cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
            if (error) {
                console.error('error:', error);
                return res.cc(error);
            }
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            // res.send(stdout)
            // console.log(stdout)
        })
        console.log("SLD文件制作上传完成")

        setTimeout(()=>{
            console.log("开始设为默认")
            let styleJSON = {
                "layer": {
                    "defaultStyle": {
                        "name": new_name,"href": ''+ http_url +'/geoserver/rest/styles/'+ new_name +'.json'
                    }
                }
            }
            console.log(styleJSON)
            axios({
                method: 'put',
                baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
                headers: {
                Authorization:'Basic YWRtaW46Z2Vvc2VydmVy',
                'content-type': 'application/json'
            },
                data:styleJSON
            }).then(responseStyle=>{
                console.log(responseStyle.data)
                console.log('加载了新加载的样式')
                res.send(styleJSON)
            }).catch(err=>{
                console.log(err);
                res.send('ERROR!加载样式表出错')
            })
        },500)
    }) 
    
}
//面面面面面面面面面面面面面面面面面面面面面面面面面面
//SLD single单色
exports.SLD_single = (req,res)=>{
    let query_attr = req.body.Attr   // 选择的属性值，
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    let layer_color = req.body.layer_color // 图层颜色
    let line_color = req.body.line_color // 线的颜色
    let line_width = req.body.line_width // 线的宽度
    // 转化为16进制的颜色值
    let rgb = rgb2hex(line_color)
    let layer_rgb = rgb2hex(layer_color)
    //开始拼接
    // let today = new Date()
    // let sjTime = today.getTime()
    // 新的sld文件的名字
    let today = new Date();
    let time = today.getTime().toString()
    let time_used = time.substring(time.length-5,time.length-1)
    let new_name = 'SING'+query_layer+'-'+query_attr+time_used
    let sld_text = ''
    let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
    <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
    let sld_name = '  <NamedLayer>\n\
    <se:Name>'+ new_name +'</se:Name>\n\
    <UserStyle>\n\
    <se:Name>' + new_name+'</se:Name>\n\
    <se:FeatureTypeStyle>'
    let sld_rule = ''
    // 显示的label
    let sld_label = '<se:Rule>\n\
    <se:TextSymbolizer>\n\
        <se:Label>\n\
        <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
        </se:Label>\n\
        <se:Font>\n\
        <se:SvgParameter name="font-family">微软雅黑</se:SvgParameter>\n\
        <se:SvgParameter name="font-size">13</se:SvgParameter>\n\
        </se:Font>\n\
        <se:LabelPlacement>\n\
        <se:PointPlacement>\n\
            <se:AnchorPoint>\n\
            <se:AnchorPointX>0</se:AnchorPointX>\n\
            <se:AnchorPointY>0.5</se:AnchorPointY>\n\
            </se:AnchorPoint>\n\
        </se:PointPlacement>\n\
        </se:LabelPlacement>\n\
        <se:Fill>\n\
        <se:SvgParameter name="fill">#323232</se:SvgParameter>\n\
        </se:Fill>\n\
        <se:VendorOption name="maxDisplacement">1</se:VendorOption>\n\
    </se:TextSymbolizer>\n\
    </se:Rule>'
    let sld_tail = '      </se:FeatureTypeStyle>\n\
    </UserStyle>\n\
    </NamedLayer>\n\
    </StyledLayerDescriptor>'
    sld_rule += '        <se:Rule>\n\
    <se:Name>Single symbol</se:Name>\n\
    <se:PolygonSymbolizer>\n\
    <se:Fill>\n\
        <se:SvgParameter name="fill">'+layer_rgb+'</se:SvgParameter>\n\
    </se:Fill>\n\
    <se:Stroke>\n\
        <se:SvgParameter name="stroke">'+ rgb +'</se:SvgParameter>\n\
        <se:SvgParameter name="stroke-width">'+ line_width +'</se:SvgParameter>\n\
        <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
    </se:Stroke>\n\
    </se:PolygonSymbolizer>\n\
    </se:Rule>'
    sld_text += sld_head
    sld_text += sld_name
    sld_text += sld_rule
    sld_text += sld_label
    sld_text += sld_tail

    // 打包
    console.log(__dirname)
    let sldPath = 'C:\\Users\\fhm\\Desktop\\'
    // let new_name = query_layer+'_'+query_attr
    const file = new AdmZip();
    file.addFile(new_name+'.sld',Buffer.from(sld_text));
    const fs = require('fs');
    fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
    const pathname = __dirname+"/SLDfile/"+new_name
    // 上传
    cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
        if (error) {
            console.error('error:', error);
            return res.cc(error);
        }
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        // res.send(stdout)
        // console.log(stdout)
    })
    setTimeout(()=>{
        console.log("5")
    // 设为默认
    let chg_SLD = new_name//想修改的样式名称
    let styleJSON = {
        "layer": {
            "defaultStyle": {
                "name":chg_SLD,"href": ''+ query_work +'/geoserver/rest/styles/'+ chg_SLD +'.json'
            }
        }
    }
    console.log(styleJSON)

    axios({
        method: 'PUT',
        baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
        headers: {
        'Authorization':'Basic YWRtaW46Z2Vvc2VydmVy',
        'content-type': 'application/json'
    },
        data:styleJSON
    }).then(responseStyle=>{
        console.log(responseStyle.data)
        console.log('加载选中样式')
        res.send('加载选中样式')
    }).catch(err=>{
        console.log(err);
        res.send('ERROR!加载样式表出错')
    })
    }, 500)
}
//SLD unique唯一值设色
exports.SLD_unique = (req,res)=>{
    console.log(req.body)
    let query_attr = req.body.Attr // 选择的属性值
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    let line_color = req.body.line_color // 线的颜色
    let line_width = req.body.line_width // 线的宽度
    // 转化为16进制的颜色值
    let rgb = rgb2hex(line_color)
    // let color = req.body.color
    // let rgb = color.substring(4,color.length-1).split(",")
    // console.log(query_attr)
    let WFSUrl = ''+http_url+'/geoserver/wfs?'
    var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+query_work+':'+query_layer+'&outputFormat=application/json';
    axios.get(feature_url).then((WFS_res)=>{
        // res.send(WFS_res.data.features)
        let Geodata = WFS_res.data.features
        let attrList=[]
        for(let i=0;i<Geodata.length;i++){
            // console.log(Geodata[i].properties[query_attr])
            attrList.push(Geodata[i].properties[query_attr])
        }
        //先排个序，从小到大
        attrList.sort(function(a,b){
            return a-b
        }) 
        //需要去重，得到的最后个数为最后需要分类的个数
        //size: 获取Set实例的元素个数：
        var sum = new Set(attrList);
        let cat_num = sum.size // 分的层级数
        // console.log(cat_num)
        const sum_attr = Array.from(sum)
        // console.log(sum_attr)
        //开始拼接
        // let today = new Date()
        // let sjTime = today.getTime()
        // 新的sld文件的名字
        let today = new Date();
        let time = today.getTime().toString()
        let time_used = time.substring(time.length-5,time.length-1)
        let new_name = 'UNIN'+query_layer+'-'+query_attr+time_used
        let sld_text = ''
        let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
        <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        let sld_name = '  <NamedLayer>\n\
        <se:Name>'+ new_name +'</se:Name>\n\
        <UserStyle>\n\
        <se:Name>' + new_name+'</se:Name>\n\
        <se:FeatureTypeStyle>'
        let sld_rule = ''
        // 显示的label
        let sld_label = '<se:Rule>\n\
        <se:TextSymbolizer>\n\
          <se:Label>\n\
            <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
          </se:Label>\n\
          <se:Font>\n\
            <se:SvgParameter name="font-family">微软雅黑</se:SvgParameter>\n\
            <se:SvgParameter name="font-size">15</se:SvgParameter>\n\
          </se:Font>\n\
          <se:LabelPlacement>\n\
            <se:PointPlacement>\n\
              <se:AnchorPoint>\n\
                <se:AnchorPointX>0</se:AnchorPointX>\n\
                <se:AnchorPointY>0.5</se:AnchorPointY>\n\
              </se:AnchorPoint>\n\
            </se:PointPlacement>\n\
          </se:LabelPlacement>\n\
          <se:Fill>\n\
            <se:SvgParameter name="fill">#323232</se:SvgParameter>\n\
          </se:Fill>\n\
          <se:VendorOption name="maxDisplacement">1</se:VendorOption>\n\
        </se:TextSymbolizer>\n\
      </se:Rule>'
        let sld_tail = '      </se:FeatureTypeStyle>\n\
        </UserStyle>\n\
        </NamedLayer>\n\
        </StyledLayerDescriptor>'
        // 唯一值不用生成的色带，用声明的全局ColorBand_60色彩数组
        // let colorBand = generateBand(attrList.length,rgb[0],rgb[1],rgb[2])
        // res.send(colorBand)
        for(var i=1;i<sum_attr.length+1;i++){
            sld_rule += '        <se:Rule>\n\
            <se:Name>'+ i +'</se:Name>\n\
            <se:Description>\n\
            <se:Title>' + i +'</se:Title>\n\
            </se:Description>\n\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
            <ogc:PropertyIsEqualTo>\n\
                <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                <ogc:Literal>'+ sum_attr[i-1] +'</ogc:Literal>\n\
            </ogc:PropertyIsEqualTo>\n\
            </ogc:Filter>\n\
            <se:PolygonSymbolizer>\n\
            <se:Fill>\n\
                <se:SvgParameter name="fill">'+ColorBand_60[i%60-1]+'</se:SvgParameter>\n\
            </se:Fill>\n\
            <se:Stroke>\n\
                <se:SvgParameter name="stroke">'+ rgb +'</se:SvgParameter>\n\
                <se:SvgParameter name="stroke-width">'+ line_width +'</se:SvgParameter>\n\
                <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
            </se:Stroke>\n\
            </se:PolygonSymbolizer>\n\
        </se:Rule>'
        }
        sld_text += sld_head
        sld_text += sld_name
        sld_text += sld_rule
        sld_text += sld_label
        sld_text += sld_tail
        // fs.writeFile('C:\\Users\\fhm\\Desktop\\test2.xml',sld_text,err=>{
        //     console.log(err)
        // })
        // 打包
        console.log(__dirname)
        let sldPath = 'C:\\Users\\fhm\\Desktop\\'
        // let new_name = query_layer+'_'+query_attr
        const file = new AdmZip();
        file.addFile(new_name+'.sld',Buffer.from(sld_text));
        const fs = require('fs');
        fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
        const pathname = __dirname+"/SLDfile/"+new_name
        // 上传
        cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
            if (error) {
                console.error('error:', error);
                return res.cc(error);
            }
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            // res.send(stdout)
            // console.log(stdout)
        })
        // 尝试
        // sld_text= sld_text.replace(/[\r\n]/g, "");
        // cs.exec('curl -u admin:geoserver -X POST http://localhost:8080/geoserver/rest/workspaces/fan/styles -H  "accept: application/json" -H  "content-type: application/vnd.ogc.sld+xml" -H  "Content-Type: " -d '+'"'+ sld_text +'"'+'' ,(error,stdout,stderr)=>{
        //     if (error) {
        //         // console.error('error:', error);
        //         // return res.cc(error);
        //     }
        //     console.log('stdout: ' + stdout);
        //     console.log('stderr: ' + stderr);
        //     // res.send(stdout)
        //     // console.log(stdout)
        // })
        console.log("1")
        setTimeout(()=>{
            console.log("5")
        // 设为默认
        let chg_SLD = new_name//想修改的样式名称
        let styleJSON = {
            "layer": {
                "defaultStyle": {
                    "name":chg_SLD,"href": ''+ query_work +'/geoserver/rest/styles/'+ chg_SLD +'.json'
                }
            }
        }
        console.log(styleJSON)

    axios({
        method: 'PUT',
        baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
        headers: {
        'Authorization':'Basic YWRtaW46Z2Vvc2VydmVy',
        'content-type': 'application/json'
      },
        data:styleJSON
    }).then(responseStyle=>{
        console.log(responseStyle.data)
        console.log('加载选中样式')
        res.send('加载选中样式')
    }).catch(err=>{
        console.log(err);
        res.send('ERROR!加载样式表出错')
    })
        }, 500)
    
  }) 
}
//SLD graduated分层设色(分开写，两个按钮，上传样式和修改样式两步)
exports.SLD_graduated = (req,res)=>{
    let query_attr = req.body.Attr
    let query_layer = req.body.layer
    // 新的sld文件的名字
    let new_name = 'grad'+query_layer+'-'+query_attr
    // 首先存在这一种情况，已经上传了一个样式并设为默认后，当你再次去修改颜色时，会产生不能修改的情况，桌面生成的zip文件已经改变，但geoserver里已经上传的样式是不会改变的
    // 所以在设为默认前，要判断是否已经存在样式，存在的话将其删除
    // 默认样式貌似删不掉，403没权限，我好像理解了，因为是默认样式，说以再次选颜色的时候会尝试修改默认样式，本质上是403没权限
    // 所以就不能用删除了，要将样式修改回polygon默认样式
    // arr.includes()判断是否存在某元素
    // 得在上传新的样式前，判断是否为默认，并将其改为polygon
    axios({
        method: 'Get',
        baseURL:'http://localhost:8080/geoserver/rest/workspaces/'+ workspace_used+'/styles',
        headers: {
        'Authorization':'Basic YWRtaW46Z2Vvc2VydmVy',
        'content-type': 'application/json'
        },
    }).then(responseStyle=>{
        // 这是返回的数据的形式，responseStyle.data
        // {
        //     "styles": {
        //         "style": [
        //             {
        //                 "name": "gradhenan_dishi-ADCODE99",
        //                 "href": "http://localhost:8080/geoserver/rest/workspaces/fan/styles/gradhenan_dishi-ADCODE99.json"
        //             },
        //             {
        //                 "name": "gradhenan_dishi-BOUNT_",
        //                 "href": "http://localhost:8080/geoserver/rest/workspaces/fan/styles/gradhenan_dishi-BOUNT_.json"
        //             }
        //         ]
        //     }
        // }
        // console.log("asdasdasd",responseStyle.data.styles)
        // console.log("asdasdasd",responseStyle.data.styles.length)
        if(responseStyle.data.styles.length!=0){
            let contains_styles = []
            for(let i=0;i<responseStyle.data.styles.style.length;i++){
                contains_styles.push(responseStyle.data.styles.style[i].name)
            }
            console.log(contains_styles.includes(new_name))
            // 已存在样式，先将pologon设为默认
            if(contains_styles.includes(new_name)){
                axios({
                    method: 'PUT',
                    baseURL:'http://localhost:8080/geoserver/rest/layers/'+ workspace_used + ':' + query_layer +'',
                    headers: {
                    'Authorization':'Basic YWRtaW46Z2Vvc2VydmVy',
                    'content-type': 'application/json'
                },
                    data:{
                        "layer": {
                            "defaultStyle": {
                                "name":"polygon","href": 'http://localhost:8080/geoserver/rest/styles/polygon.json'
                            }
                        }
                    }
                }).then(response=>{
                    console.log(response.data)
                    console.log('加载选中样式polygon')
                    // res.send('加载选中样式')
                }).catch(err=>{
                    console.log(err);
                    response.send('ERROR!加载样式表出错')
                })
            }
        }

    }).catch(err=>{
        console.log(err);
        res.send('ERROR!加载样式表出错')
    })

    //开始制作SLD文件，SLD制作比判断快，设置一个延时
    setTimeout(()=>{
        let WFSUrl = "http://localhost:8080/geoserver/wfs?"
        var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+workspace_used+':'+query_layer+'&outputFormat=application/json';
        axios.get(feature_url).then((WFS_res)=>{
            // res.send(WFS_res.data.features)
            let Geodata = WFS_res.data.features
            let attrList=[]
            for(let i=0;i<Geodata.length;i++){
                // console.log(Geodata[i].properties[query_attr])
                attrList.push(Geodata[i].properties[query_attr])
            }
    
            //开始拼接
            // let today = new Date()
            // let sjTime = today.getTime()
    
    
            //做一下class分类，默认分五类,|'''''|'''''|'''''|'''''|'''''|
            //先排个序，从小到大
            attrList.sort(function(a,b){
                return a-b
            }) 
            // 6-1 为5 因为索引从零开始
            const d_attr = Math.floor(Geodata.length/5)
            // res.send(attrList)
            // console.log(attrList)
            // console.log(d_attr)
            let sld_text = ''
            let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
            <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
            let sld_name = '  <NamedLayer>\n\
            <se:Name>'+ new_name +'</se:Name>\n\
            <UserStyle>\n\
            <se:Name>' + new_name+'</se:Name>\n\
            <se:FeatureTypeStyle>'
            let sld_rule = ''
            let sld_tail = '      </se:FeatureTypeStyle>\n\
            </UserStyle>\n\
            </NamedLayer>\n\
            </StyledLayerDescriptor>'
            let colorBand = generateBand(6,req.body.R,req.body.G,req.body.B)
            console.log(req.body.R,req.body.G,req.body.B)
            // res.send(colorBand)
            for(var i=0;i<5;i++){
                sld_rule += '<se:Rule>\n\
                <se:Name>'+ attrList[i*d_attr] + '-' + attrList[i*d_attr+d_attr]+'</se:Name>\n\
                <se:Description>\n\
                  <se:Title>'+ attrList[i*d_attr]+ '-' + attrList[i*d_attr+d_attr] +'</se:Title>\n\
                </se:Description>\n\
                <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
                  <ogc:And>\n\
                    <ogc:PropertyIsGreaterThanOrEqualTo>\n\
                      <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                      <ogc:Literal>' + attrList[i*d_attr] + '</ogc:Literal>\n\
                    </ogc:PropertyIsGreaterThanOrEqualTo>\n\
                    <ogc:PropertyIsLessThanOrEqualTo>\n\
                      <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                      <ogc:Literal>' + attrList[i*d_attr+d_attr] + '</ogc:Literal>\n\
                    </ogc:PropertyIsLessThanOrEqualTo>\n\
                  </ogc:And>\n\
                </ogc:Filter>\n\
                <se:PolygonSymbolizer>\n\
                  <se:Fill>\n\
                    <se:SvgParameter name="fill">'+ colorBand[i]+'</se:SvgParameter>\n\
                  </se:Fill>\n\
                  <se:Stroke>\n\
                    <se:SvgParameter name="stroke">#232323</se:SvgParameter>\n\
                    <se:SvgParameter name="stroke-width">1</se:SvgParameter>\n\
                    <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
                  </se:Stroke>\n\
                </se:PolygonSymbolizer>\n\
              </se:Rule>'
            }
            sld_rule += '<se:Rule>\n\
                <se:Name>'+ attrList[4*d_attr+d_attr] + '-' +  attrList[attrList.length-1]+'</se:Name>\n\
                <se:Description>\n\
                  <se:Title>'+ attrList[4*d_attr+d_attr]+ '-' +  attrList[attrList.length-1] +'</se:Title>\n\
                </se:Description>\n\
                <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
                  <ogc:And>\n\
                    <ogc:PropertyIsGreaterThanOrEqualTo>\n\
                      <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                      <ogc:Literal>' + attrList[4*d_attr+d_attr] + '</ogc:Literal>\n\
                    </ogc:PropertyIsGreaterThanOrEqualTo>\n\
                    <ogc:PropertyIsLessThanOrEqualTo>\n\
                      <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                      <ogc:Literal>' + attrList[attrList.length-1] + '</ogc:Literal>\n\
                    </ogc:PropertyIsLessThanOrEqualTo>\n\
                  </ogc:And>\n\
                </ogc:Filter>\n\
                <se:PolygonSymbolizer>\n\
                  <se:Fill>\n\
                    <se:SvgParameter name="fill">'+ colorBand[colorBand.length-1]+'</se:SvgParameter>\n\
                  </se:Fill>\n\
                  <se:Stroke>\n\
                    <se:SvgParameter name="stroke">#232323</se:SvgParameter>\n\
                    <se:SvgParameter name="stroke-width">1</se:SvgParameter>\n\
                    <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
                  </se:Stroke>\n\
                </se:PolygonSymbolizer>\n\
              </se:Rule>'
            sld_text += sld_head
            sld_text += sld_name
            sld_text += sld_rule
            sld_text += sld_tail
            // res.send(sld_text)
            // fs.writeFile('C:\\Users\\fhm\\Desktop\\test2.xml',sld_text,err=>{
            //     // 没错会打null
            //     console.log(err)
            // })
            //打包
            let sldPath = 'C:\\Users\\fhm\\Desktop\\'
            // let new_name = query_layer+'_'+query_attr
            const file = new AdmZip();
            file.addFile(new_name+'.sld',Buffer.from(sld_text));
            const fs = require('fs');
            fs.writeFileSync(sldPath+new_name+'.zip', file.toBuffer());
            // 上传
            cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @C:\\Users\\fhm\\Desktop\\'+ new_name +'.zip http://localhost:8080/geoserver/rest/workspaces/fan/styles' ,(error,stdout,stderr)=>{
                if (error) {
                    console.error('error:', error);
                    return res.cc(error);
                }
                // console.log('stdout: ' + stdout);
                // console.log('stderr: ' + stderr);
                // res.send(stdout)
                // console.log(stdout)
            })
            console.log("SLD文件制作上传完成")
        }) 
    },500)
}
//SLD graduated分层设色(一步实现,利用时间戳是每个文件都不一样，避免了上一个函数所涉及的修改geoserver中sld文件的麻烦)
exports.SLD_graduated2 = (req,res)=>{
    let today = new Date();
    let time = today.getTime().toString()
    let time_used = time.substring(time.length-5,time.length-1)
    // res.send(time_used)
    console.log(time_used)


    let query_attr = req.body.Attr // 选择的属性值
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    let query_color = req.body.color // 图层颜色
    let line_color = req.body.line_color // 线的颜色
    let line_width = req.body.line_width // 线的宽度
    let cat_num = req.body.num // 分的层级数

    // 转化为16进制的颜色值
    let line_rgb = rgb2hex(line_color)
    // let rgb = query_color.substring(4,query_color.length-1).split(",")
    // 新的sld文件的名字
    let new_name = 'GRAD'+query_layer+'-'+query_attr+time_used
    let WFSUrl = ''+http_url+'/geoserver/wfs?'
    var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+query_work+':'+query_layer+'&outputFormat=application/json';
    axios.get(feature_url).then((WFS_res)=>{
        // res.send(WFS_res.data.features)
        let Geodata = WFS_res.data.features
        let attrList=[]
        for(let i=0;i<Geodata.length;i++){
            // console.log(Geodata[i].properties[query_attr])
            attrList.push(Geodata[i].properties[query_attr])
        }

        //开始拼接
        // let today = new Date()
        // let sjTime = today.getTime()


        //做一下class分类，默认分五类,|'''''|'''''|'''''|'''''|'''''|
        //先排个序，从小到大
        attrList.sort(function(a,b){
            return a-b
        }) 
        //需要去重，得到的最后个数为最后需要分类的个数
        //size: 获取Set实例的元素个数：
        var sum = new Set(attrList);
        // cat_num = sum.size // 分的层级数
        // 6-1 为5 因为索引从零开始
        const d_attr = Math.floor(Geodata.length/cat_num)
        // res.send(attrList)
        // console.log(attrList)
        // console.log(d_attr)
        let sld_text = ''
        let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
        <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        let sld_name = '  <NamedLayer>\n\
        <se:Name>'+ new_name +'</se:Name>\n\
        <UserStyle>\n\
        <se:Name>' + new_name+'</se:Name>\n\
        <se:FeatureTypeStyle>'
        // 显示的label
        let sld_label = '<se:Rule>\n\
        <se:TextSymbolizer>\n\
            <se:Label>\n\
            <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
            </se:Label>\n\
            <se:Font>\n\
            <se:SvgParameter name="font-family">微软雅黑</se:SvgParameter>\n\
            <se:SvgParameter name="font-size">13</se:SvgParameter>\n\
            </se:Font>\n\
            <se:LabelPlacement>\n\
            <se:PointPlacement>\n\
                <se:AnchorPoint>\n\
                <se:AnchorPointX>0</se:AnchorPointX>\n\
                <se:AnchorPointY>0.5</se:AnchorPointY>\n\
                </se:AnchorPoint>\n\
            </se:PointPlacement>\n\
            </se:LabelPlacement>\n\
            <se:Fill>\n\
            <se:SvgParameter name="fill">#323232</se:SvgParameter>\n\
            </se:Fill>\n\
            <se:VendorOption name="maxDisplacement">1</se:VendorOption>\n\
        </se:TextSymbolizer>\n\
        </se:Rule>'
        let sld_rule = ''
        let sld_tail = '      </se:FeatureTypeStyle>\n\
        </UserStyle>\n\
        </NamedLayer>\n\
        </StyledLayerDescriptor>'
        // 生成颜色
        // let colorBand = generateBand(cat_num,rgb[0],rgb[1],rgb[2])
        // console.log(colorBand)
        let colorBand = sedai(cat_num,query_color)
        // console.log(req.body.R,req.body.G,req.body.B)
        // res.send(colorBand)
        for(var i=0;i<cat_num-1;i++){
            console.log(i*d_attr)
            sld_rule += '<se:Rule>\n\
            <se:Name>'+ attrList[i*d_attr] + '-' + attrList[i*d_attr+d_attr]+'</se:Name>\n\
            <se:Description>\n\
              <se:Title>'+ attrList[i*d_attr]+ '-' + attrList[i*d_attr+d_attr] +'</se:Title>\n\
            </se:Description>\n\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
              <ogc:And>\n\
                <ogc:PropertyIsGreaterThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[i*d_attr] + '</ogc:Literal>\n\
                </ogc:PropertyIsGreaterThanOrEqualTo>\n\
                <ogc:PropertyIsLessThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[i*d_attr+d_attr] + '</ogc:Literal>\n\
                </ogc:PropertyIsLessThanOrEqualTo>\n\
              </ogc:And>\n\
            </ogc:Filter>\n\
            <se:PolygonSymbolizer>\n\
              <se:Fill>\n\
                <se:SvgParameter name="fill">'+ colorBand[i]+'</se:SvgParameter>\n\
              </se:Fill>\n\
              <se:Stroke>\n\
                <se:SvgParameter name="stroke">'+ line_rgb +'</se:SvgParameter>\n\
                <se:SvgParameter name="stroke-width">'+ line_width +'</se:SvgParameter>\n\
                <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
              </se:Stroke>\n\
            </se:PolygonSymbolizer>\n\
          </se:Rule>'
        }
        sld_rule += '<se:Rule>\n\
            <se:Name>'+ attrList[(cat_num-2)*d_attr+d_attr] + '-' +  attrList[attrList.length-1]+'</se:Name>\n\
            <se:Description>\n\
              <se:Title>'+ attrList[(cat_num-2)*d_attr+d_attr]+ '-' +  attrList[attrList.length-1] +'</se:Title>\n\
            </se:Description>\n\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
              <ogc:And>\n\
                <ogc:PropertyIsGreaterThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[(cat_num-2)*d_attr+d_attr] + '</ogc:Literal>\n\
                </ogc:PropertyIsGreaterThanOrEqualTo>\n\
                <ogc:PropertyIsLessThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[attrList.length-1] + '</ogc:Literal>\n\
                </ogc:PropertyIsLessThanOrEqualTo>\n\
              </ogc:And>\n\
            </ogc:Filter>\n\
            <se:PolygonSymbolizer>\n\
              <se:Fill>\n\
                <se:SvgParameter name="fill">'+ colorBand[colorBand.length-1]+'</se:SvgParameter>\n\
              </se:Fill>\n\
              <se:Stroke>\n\
                <se:SvgParameter name="stroke">'+ line_rgb +'</se:SvgParameter>\n\
                <se:SvgParameter name="stroke-width">'+ line_width +'</se:SvgParameter>\n\
                <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
              </se:Stroke>\n\
            </se:PolygonSymbolizer>\n\
          </se:Rule>'
        sld_text += sld_head
        sld_text += sld_name
        sld_text += sld_rule
        sld_text += sld_label
        sld_text += sld_tail
        // res.send(sld_text)
        // fs.writeFile('C:\\Users\\fhm\\Desktop\\test2.xml',sld_text,err=>{
        //     // 没错会打null
        //     console.log(err)
        // })
        //打包
        let sldPath = 'C:\\Users\\fhm\\Desktop\\'
        // let new_name = query_layer+'_'+query_attr
        const file = new AdmZip();
        file.addFile(new_name+'.sld',Buffer.from(sld_text));
        const fs = require('fs');
        fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
        const pathname = __dirname+"/SLDfile/"+new_name
        // 上传
        cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
            if (error) {
                console.error('error:', error);
                return res.cc(error);
            }
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            // res.send(stdout)
            // console.log(stdout)
        })
        console.log("SLD文件制作上传完成")

        setTimeout(()=>{
            console.log("开始设为默认")
            let styleJSON = {
                "layer": {
                    "defaultStyle": {
                        "name": new_name,"href": ''+ http_url +'/geoserver/rest/styles/'+ new_name +'.json'
                    }
                }
            }
            console.log(styleJSON)
            axios({
                method: 'put',
                baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
                headers: {
                Authorization:'Basic YWRtaW46Z2Vvc2VydmVy',
                'content-type': 'application/json'
            },
                data:styleJSON
            }).then(responseStyle=>{
                console.log(responseStyle.data)
                console.log('加载了新加载的样式')
                res.send(styleJSON)
            }).catch(err=>{
                console.log(err);
                res.send('ERROR!加载样式表出错')
            })
        },500)
    }) 
    
}
//SLD 渐变设色 使用 sedai()方法去生成色带 采用分层设色的SLD样式和唯一值上色都行，到出现值冲突的情况是再分析要用哪个
exports.SLD_gradient = (req,res)=>{
    let today = new Date();
    let time = today.getTime().toString()
    let time_used = time.substring(time.length-5,time.length-1)
    // res.send(time_used)
    console.log(time_used)


    let query_attr = req.body.Attr // 选择的属性值
    let query_layer = req.body.layer // 选择的图层
    let query_work = req.body.workspace // 选择的工作空间
    let query_color = req.body.color // 图层颜色
    let line_color = req.body.line_color // 线的颜色
    let line_width = req.body.line_width // 线的宽度


    // 转化为16进制的颜色值
    let line_rgb = rgb2hex(line_color)
    // let rgb = query_color.substring(4,query_color.length-1).split(",")
    // 新的sld文件的名字
    let new_name = 'JIAN'+query_layer+'-'+query_attr+time_used
    let WFSUrl = ''+http_url+'/geoserver/wfs?'
    var feature_url = WFSUrl + 'request=GetFeature&version=1.1.0&typeName='+query_work+':'+query_layer+'&outputFormat=application/json';
    axios.get(feature_url).then((WFS_res)=>{
        // res.send(WFS_res.data.features)
        let Geodata = WFS_res.data.features
        let attrList=[]
        for(let i=0;i<Geodata.length;i++){
            // console.log(Geodata[i].properties[query_attr])
            attrList.push(Geodata[i].properties[query_attr])
        }

        //开始拼接
        // let today = new Date()
        // let sjTime = today.getTime()
        //先排个序，从小到大
        attrList.sort(function(a,b){
            return a-b
        }) 
        //需要去重，得到的最后个数为最后需要分类的个数
        //size: 获取Set实例的元素个数：
        var sum = new Set(attrList);
        let cat_num = sum.size // 分的层级数

        let sld_text = ''
        let sld_head = '<?xml version="1.0" encoding="UTF-8"?>\n\
        <StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1.0" xmlns:ogc="http://www.opengis.net/ogc" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" xmlns:se="http://www.opengis.net/se" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        let sld_name = '  <NamedLayer>\n\
        <se:Name>'+ new_name +'</se:Name>\n\
        <UserStyle>\n\
        <se:Name>' + new_name+'</se:Name>\n\
        <se:FeatureTypeStyle>'
        // 显示的label
        let sld_label = '<se:Rule>\n\
        <se:TextSymbolizer>\n\
            <se:Label>\n\
            <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
            </se:Label>\n\
            <se:Font>\n\
            <se:SvgParameter name="font-family">微软雅黑</se:SvgParameter>\n\
            <se:SvgParameter name="font-size">13</se:SvgParameter>\n\
            </se:Font>\n\
            <se:LabelPlacement>\n\
            <se:PointPlacement>\n\
                <se:AnchorPoint>\n\
                <se:AnchorPointX>0</se:AnchorPointX>\n\
                <se:AnchorPointY>0.5</se:AnchorPointY>\n\
                </se:AnchorPoint>\n\
            </se:PointPlacement>\n\
            </se:LabelPlacement>\n\
            <se:Fill>\n\
            <se:SvgParameter name="fill">#323232</se:SvgParameter>\n\
            </se:Fill>\n\
            <se:VendorOption name="maxDisplacement">1</se:VendorOption>\n\
        </se:TextSymbolizer>\n\
        </se:Rule>'
        let sld_rule = ''
        let sld_tail = '      </se:FeatureTypeStyle>\n\
        </UserStyle>\n\
        </NamedLayer>\n\
        </StyledLayerDescriptor>'
        // 生成颜色
        let colorBand = sedai(cat_num,query_color)
        // console.log(colorBand)
        // console.log(req.body.R,req.body.G,req.body.B)
        // res.send(colorBand)
        for(var i=1;i<cat_num+1;i++){
            sld_rule += '<se:Rule>\n\
            <se:Name>'+ attrList[i-1] + '-' + attrList[i]+'</se:Name>\n\
            <se:Description>\n\
              <se:Title>'+ attrList[i-1]+ '-' + attrList[i] +'</se:Title>\n\
            </se:Description>\n\
            <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
              <ogc:And>\n\
                <ogc:PropertyIsGreaterThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[i-1] + '</ogc:Literal>\n\
                </ogc:PropertyIsGreaterThanOrEqualTo>\n\
                <ogc:PropertyIsLessThanOrEqualTo>\n\
                  <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
                  <ogc:Literal>' + attrList[i-1] + '</ogc:Literal>\n\
                </ogc:PropertyIsLessThanOrEqualTo>\n\
              </ogc:And>\n\
            </ogc:Filter>\n\
            <se:PolygonSymbolizer>\n\
              <se:Fill>\n\
                <se:SvgParameter name="fill">'+ colorBand[i-1]+'</se:SvgParameter>\n\
              </se:Fill>\n\
              <se:Stroke>\n\
                <se:SvgParameter name="stroke">'+ line_rgb +'</se:SvgParameter>\n\
                <se:SvgParameter name="stroke-width">'+ line_width +'</se:SvgParameter>\n\
                <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
              </se:Stroke>\n\
            </se:PolygonSymbolizer>\n\
          </se:Rule>'
    //       sld_rule += '        <se:Rule>\n\
    //       <se:Name>'+ i +'</se:Name>\n\
    //       <se:Description>\n\
    //       <se:Title>' + i +'</se:Title>\n\
    //       </se:Description>\n\
    //       <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">\n\
    //       <ogc:PropertyIsEqualTo>\n\
    //           <ogc:PropertyName>'+ query_attr +'</ogc:PropertyName>\n\
    //           <ogc:Literal>'+ attrList[i-1] +'</ogc:Literal>\n\
    //       </ogc:PropertyIsEqualTo>\n\
    //       </ogc:Filter>\n\
    //       <se:PolygonSymbolizer>\n\
    //       <se:Fill>\n\
    //           <se:SvgParameter name="fill">'+ColorBand_60[i-1]+'</se:SvgParameter>\n\
    //       </se:Fill>\n\
    //       <se:Stroke>\n\
    //           <se:SvgParameter name="stroke">'+ line_rgb +'</se:SvgParameter>\n\
    //           <se:SvgParameter name="stroke-width">'+ line_width +'</se:SvgParameter>\n\
    //           <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\n\
    //       </se:Stroke>\n\
    //       </se:PolygonSymbolizer>\n\
    //   </se:Rule>'
        }
        sld_text += sld_head
        sld_text += sld_name
        sld_text += sld_rule
        sld_text += sld_label
        sld_text += sld_tail
        // res.send(sld_text)
        // fs.writeFile('C:\\Users\\fhm\\Desktop\\test2.xml',sld_text,err=>{
        //     // 没错会打null
        //     console.log(err)
        // })
        //打包
        let sldPath = 'C:\\Users\\fhm\\Desktop\\'
        // let new_name = query_layer+'_'+query_attr
        const file = new AdmZip();
        file.addFile(new_name+'.sld',Buffer.from(sld_text));
        const fs = require('fs');
        fs.writeFileSync(__dirname+"/SLDfile/"+new_name+'.zip', file.toBuffer());
        const pathname = __dirname+"/SLDfile/"+new_name
        // 上传
        cs.exec('curl -u admin:geoserver -XPOST -H "Content-type: application/zip" --data-binary @'+ pathname +'.zip '+ http_url +'/geoserver/rest/workspaces/'+ query_work +'/styles' ,(error,stdout,stderr)=>{
            if (error) {
                console.error('error:', error);
                return res.cc(error);
            }
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            // res.send(stdout)
            // console.log(stdout)
        })
        console.log("SLD文件制作上传完成")

        setTimeout(()=>{
            console.log("开始设为默认")
            let styleJSON = {
                "layer": {
                    "defaultStyle": {
                        "name": new_name,"href": ''+ http_url +'/geoserver/rest/styles/'+ new_name +'.json'
                    }
                }
            }
            console.log(styleJSON)
            axios({
                method: 'put',
                baseURL:''+ http_url +'/geoserver/rest/layers/'+ query_work + ':' + query_layer +'',
                headers: {
                Authorization:'Basic YWRtaW46Z2Vvc2VydmVy',
                'content-type': 'application/json'
            },
                data:styleJSON
            }).then(responseStyle=>{
                console.log(responseStyle.data)
                console.log('加载了新加载的样式')
                res.send(styleJSON)
            }).catch(err=>{
                console.log(err);
                res.send('ERROR!加载样式表出错')
            })
        },500)
    }) 
    
}
// 获取用户自定义文件夹下上传的图片链接
exports.Get_userImages = (req,res)=>{
    // 同步Image目录下的所有文件到files中
    let files = fs.readdirSync('./public/userImage');
    let ImageInfo = []
    console.log(files.length)
    for (let i = 0;i<files.length;i++){
        let ImageInfo_baby = {}
        // express会在静态资源目录下查找文件，所以不用把静态目录public作为url的一部分。访问项目public的子文件index.js :
        // imgUrl[i] = "http://localhost:3000/"+encodeURIComponent(files[i])
        ImageInfo_baby.ImageName = files[i].split(".")[0]
        ImageInfo_baby.ImageURL = 'http://localhost:3000/userImage/'+encodeURIComponent(files[i])
        ImageInfo.push(ImageInfo_baby)
    }
    res.send(ImageInfo)
}


// 上传图标文件
exports.uploadImage = (req,res)=> {
    // console.log(req.file)
    console.log('响应成功')
    res.send('ICON上传成功');
}
// 获取所有图片链接
exports.Get_allIamges = (req,res)=> {
    // 同步Image目录下的所有文件到files中
    let files_catelog = fs.readdirSync('./public/Image');
    let All_images = []
    for(let j=0;j<files_catelog.length;j++){
        let All_images_baby = {}
        All_images_baby.id = j
        All_images_baby.name = files_catelog[j]
        let files = fs.readdirSync('./public/Image/'+files_catelog[j])
        // console.log(files)
        let ImageInfo = []
        console.log(files.length)
        for (let i = 0;i<files.length;i++){
            let ImageInfo_baby = {}
            // express会在静态资源目录下查找文件，所以不用把静态目录public作为url的一部分。访问项目public的子文件index.js :
            // imgUrl[i] = "http://localhost:3000/"+encodeURIComponent(files[i])
            ImageInfo_baby.ImageName = files[i].split(".")[0]
            ImageInfo_baby.ImageURL = "http://localhost:3000/Image/"+encodeURIComponent(files_catelog[j])+'/'+encodeURIComponent(files[i])
            ImageInfo.push(ImageInfo_baby)
        }
        All_images_baby.ImageInfo = ImageInfo
        All_images.push(All_images_baby)
    }
    res.send(All_images)
    //  //拼凑image的url并返回
    //  res.send(imgUrl)
}

// 浅蓝  蓝  浅紫  紫  浅红  大红  亮红  黄  浅绿  绿
var ColorBand_60= ["#2e9ccc","#2e4dcc","#5e2ecc","#ad2ecc","#cc2e9c","#cc2e4d",
                    "#2e39cc","#722ecc","#c12ecc","#cc2e88","#cc2e39","#cc722e",
                    "#872ecc","#cc2ec2","#cc2e73","#cc382e","#cc872e","#c2cc2e",
                    "#cc2ec5","#cc2e76","#cc352e","#cc842e","#c5cc2e","#76cc2e",
                    "#cc2e71","#cc3a2e","#cc892e","#c0cc2e","#71cc2e","#2ecc3a",
                    "#cc2e3a","#cc712e","#ccc02e","#89cc2e","#3acc2e","#2ecc71",
                    "#cc3c2e","#cc8b2e","#becc2e","#6fcc2e","#2ecc3c","#2ecc8b",
                    "#ccc92e","#80cc2e","#31cc2e","#2ecc7a","#2eccc9","#2e80cc",
                    "#6dcc2e","#2ecc3e","#2ecc8d","#2ebccc","#2e6dcc","#3e2ecc",
                    "#2ecc52","#2ecca1","#2ea8cc","#2e59cc","#522ecc","#a12ecc"
                ]

/*---------------生成任意色带数组------------------*/

function zero_fill_hex(num, digits) {
    var s = num.toString(16);
    while (s.length < digits)
        s = "0" + s;
    return s;
}
function rgb2hex(rgb) {

    if (rgb.charAt(0) == '#')
        return rgb;

    var ds = rgb.split(/\D+/);
    var decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3]);
    return "#" + zero_fill_hex(decimal, 6);
}//该函数实现从16进制颜色编码到rgb颜色编码的转换

//创造色带
function constructBand() {
    rgb = "(" + r + "," + g + "," + b + ")";
    colorBandSWH.push(rgb);
}

function generateBand(class_num,rr,gg,bb){
    var colorBandSWH = [];
    var r, g, b, rgb;
    r = parseInt(rr);
    g = parseInt(gg);
    b = parseInt(bb);
    // r = 200;
    // g = 100;
    // b = 50;
    // console.log(r,g,b)
    dr = Math.floor((r-50)/class_num)
    dg = Math.floor((g-50)/class_num)
    db = Math.floor((b-50)/class_num)
    // console.log(db)
    for(var i=0;i<class_num;i++){
        // r-=dr
        // g-=dg
        // b-=db;
        r-=20
        g-=20
        b-=20;
        // constructBand();
        rgb = "(" + r + "," + g + "," + b + ")";
        console.log(rgb)
        colorBandSWH.push(rgb);
    }
    // while (b < 255) {
    //     b++;
    //     constructBand();

    // }
    // while (r > 0) {
    //     r--;
    //     constructBand();

    // }
    // while (g < 200) {
    //     g++;
    //     constructBand();

    // }
    for (var i = 0; i < colorBandSWH.length; i++) {
        colorBandSWH[i] = rgb2hex(colorBandSWH[i]);
    }
    // console.log(colorBandSWH)
    return colorBandSWH
}

// 四种基础色带
function sedai(class_num,option){
    var colorBandSWH = [];
    var r, g, b, rgb;
    switch(option){
        case "R":
            r=255
            g=0
            b=0
            dg = Math.floor(255/class_num)
            db = Math.floor(255/class_num)
            for(let i=0;i<class_num;i++){
                g+=dg;
                b+=db;
                rgb = "(" + r + "," + g + "," + b + ")";
                colorBandSWH.push(rgb);
            }
            // console.log(colorBandSWH)
            break;
        case "G":
            r=0
            g=255
            b=0
            dr = Math.floor(255/class_num)
            db = Math.floor(255/class_num)
            for(let i=0;i<class_num;i++){
                r+=dr;
                b+=db;
                rgb = "(" + r + "," + g + "," + b + ")";
                colorBandSWH.push(rgb);
            }
            break;
        case "B":
            r=0
            g=0
            b=255
            dg = Math.floor(255/class_num)
            dr = Math.floor(255/class_num)
            for(let i=0;i<class_num;i++){
                g+=dg;
                r+=dr;
                rgb = "(" + r + "," + g + "," + b + ")";
                colorBandSWH.push(rgb);
            }
            break;
        default:
            //首先一定要大于6种,两两之间要插入(class_num/6)-1个
            // R   G   B
            //255  0   0       红
            //255  0   255     紫
            //0    0   255     蓝
            //0   255  255     青
            //0   255   0      绿
            //255 255   0      黄
            //255  0    0      红
            let tmp_num = Math.floor((class_num/6))-1
            d=Math.floor(255/((class_num/6))) //由于不能刚好为255，舍掉-1
            // console.log("d:",d)
            // r=255
            // g=0
            // b=0
            //红
            colorBandSWH.push("(255,0,0)");
            //红---紫
            let tmp=255
            for(let i=0;i<tmp_num;i++){
                tmp+=d;
                rgb = "(" + 255 + "," + 0 + "," + tmp + ")";
                colorBandSWH.push(rgb);
            }
            //紫
            colorBandSWH.push("(255,0,255)");
            //紫---蓝
            tmp=255
            for(let i=0;i<tmp_num;i++){
                tmp-=d;
                rgb = "(" + tmp + "," + 0 + "," + 255 + ")";
                colorBandSWH.push(rgb);
            }
            //蓝
            colorBandSWH.push("(0,0,255)");
            //蓝---青
            tmp=255
            for(let i=0;i<tmp_num;i++){
                tmp+=d;
                rgb = "(" + 0 + "," + tmp + "," + 255 + ")";
                colorBandSWH.push(rgb);
            }
            //青
            colorBandSWH.push("(0,255,255)");
            //青到绿
            tmp=255
            for(let i=0;i<tmp_num;i++){
                tmp-=d;
                rgb = "(" + 0 + "," + 255 + "," + tmp + ")";
                colorBandSWH.push(rgb);
            }
            //绿
            colorBandSWH.push("(0,255,0)");
            //绿到黄
            tmp=255
            for(let i=0;i<tmp_num;i++){
                tmp+=d;
                rgb = "(" + tmp + "," + 255 + "," + 0 + ")";
                colorBandSWH.push(rgb);
            }
            //黄
            colorBandSWH.push("(255,255,0)");
            // console.log(colorBandSWH)
            //黄---红  这里需要将前面凑不够的算一下，一并弄了
            let rest = (class_num-(tmp_num+1)*5)-1 //黄的加进了，所以-1
            // console.log(class_num,tmp_num)
            // console.log("rest:",rest)
            tmp=255
            for(let i=0;i<rest;i++){
                tmp-=Math.floor(255/(rest+1));
                // console.log(tmp)
                rgb = "(" + 255 + "," + tmp + "," + 0 + ")";
                colorBandSWH.push(rgb);
            }
            // console.log(colorBandSWH)
    }
    for (var i = 0; i < colorBandSWH.length; i++) {
        colorBandSWH[i] = rgb2hex(colorBandSWH[i]);
    }
    return colorBandSWH
}