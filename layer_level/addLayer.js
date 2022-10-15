
function AddLayer(url) {
    if (url.includes('wfs?')) {
      //设置查询字符串
        var xhr = createXHR();  //实例化XMLHttpRequest 对象
        xhr.open("GET", url, false);  //建立连接，要求同步响应
        xhr.send(null);  //发送请求
        console.log(xhr.responseText);  //接收wfs Geojson数据
        geoJson=eval("(" + xhr.responseText + ")")
        L.geoJSON(geoJson).addTo(this.map)
    }
    else if (url.includes('wms?')) {
        //拼凑wms链接
        //let url = "http://localhost:8080/geoserver/datamanage/wms?2122&layername=henan_dishi&format=image/png&transparent=true"
        let tempUrl = url.split('&')
        let wfsUrl = tempUrl[0].split('wms?')[0] + 'wms?'
        // let lyr = tempUrl[1].split('=')[0]
        let lyrVal = tempUrl[1].split('=')[1]
        // let format = tempUrl[2].split('=')[0]
        let formatVal = tempUrl[2].split('=')[1]
        // let transparent = tempUrl[3].split('=')[0]
        let transparentVal = tempUrl[3].split('=')[1]
        let wfsOption = { layers: lyrVal, format: formatVal, transparent: transparentVal }
        L.tileLayer.wms(wfsUrl, wfsOption).addTo(this.map)
    }
    else {
        L.tileLayer(url, { attribution: '' }).addTo(map);
    }
}
//用于Wfs请求地理数据
function createXHR () {
    var XHR = [  //兼容不同浏览器和版本得创建函数数组
        function () { return new XMLHttpRequest () },
        function () { return new ActiveXObject ("Msxml2.XMLHTTP") },
        function () { return new ActiveXObject ("Msxml3.XMLHTTP") },
        function () { return new ActiveXObject ("Microsoft.XMLHTTP") }
    ];
    var xhr = null;
    //尝试调用函数，如果成功则返回XMLHttpRequest对象，否则继续尝试
    for (var i = 0; i < XHR.length; i ++) {
        try {
            xhr = XHR[i]();
        } catch(e) {
            continue  //如果发生异常，则继续下一个函数调用
        }
        break;  //如果成功，则中止循环
    }
    return xhr;  //返回对象实例
}