var request = require("request");
var cheerio = require('cheerio');
var fs = require('fs');
var Iconv = require('iconv').Iconv;
var iconv = new Iconv('GBK', 'UTF-8');
var colors = require('colors');

var getDataUrl = 'http://website.com/';

if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

/**
 * 抓取图片
 * @param page {Number}
 */
function getData(page) {

    request(getDataUrl + page,
        function (err, res, body) {
            handleResult(body);
    })
}

/**
 * 处理页面数据
 */
function handleResult(data) {

    var $ = cheerio.load(data);
    var $imgs = $('#list').find('.img-box');
    var detailSrc;

    for (var i = 0; i < $imgs.length; i++) {
        detailSrc = $imgs.eq(i).find('a').attr('href'); // 图片详细页url

        //console.log('下载第',(n+i),'张');
        getImgPage(detailSrc);
    }

    //console.log('图片抓取请求已全部发送...剩下的就是等图片保存成功了');

}

function encodeAscii(str){
    var r = unescape(str.replace(/&#x/g,'%u').replace(/;/g,''));
    return r;
}

/**
 * 图片详情页
 * @param src
 */
function getImgPage(src) {

    request.get({
        url: src,
        encoding: null
    }, function (err, res, body) {
        var html = body;
        html = encodeAscii(iconv.convert(html).toString());

        // 中文乱码处理
        var $ = cheerio.load(html/*, {decodeEntities: false}*/);
        var filename = encodeAscii($('title').html().replace(/\s*/g,'')).split('-')[0];

        var sc = $('.listItem').find('script').eq(0).html();

        // 这个网站恶心之处再于每张图片都是动态生成js然后去渲染img标签的src，所以只能去获取<script>标签的内容再处理
        if(!sc){
            console.log('-------------------'.red);
            console.log('|  第',n,'张下载失败  |'.red);
            console.log('-------------------'.red);

            errInfo.push(n);
            n++; // 跳过错误编号，便于查找
        }else{
            var scripts = sc.replace(/\s*\n*\r*\t*\'*/g,'');
            saveImg(scripts,filename);
        }

    })

}

/**
 * 下载图片
 * @param info {String} 页面动态生成图片的信息,JS代码
 */
function saveImg(info,filename){

    var argsStr = info.split('{')[1].split('}')[0].toString();
    var argsArr = argsStr.split(',');
    if(!argsArr[7] || !argsArr[7].split('pic:')[1]){

        console.log('-------------------'.red);
        console.log('|  第',n,'张下载失败  |'.red);
        console.log('-------------------'.red);

        errInfo.push({
            "name":filename,
            "number":n
        });
        n++; // 跳过错误编号，便于查找
        return;
    }
    var url = argsArr[7].split('pic:')[1].toString().replace('_preview_size.jpg','.jpg');
    //var filename = argsArr[4].split(':')[1];

    //var a = {
        //    a: '',
        //    b: 'image',
        //    c: '',
        //    d: 1,
        //    title: 'һ����',
        //    info: 'һ����',
        //    url: '',
        //    pic: 'image url'
        //}

    request.head(url, function (err, res, body) {
        request(url).pipe(fs.createWriteStream('data/' + filename + '.jpg'));
        console.log('第',n,'张下载完成');

        if(n % 18 === 0){
            startPage++;
            if(startPage <= endPage){
                getData(startPage);
            }else{
                console.log('=================='.green);
                console.log('** 所有下载完成 **'.green);
                fs.writeFile('error.json', JSON.stringify(errInfo), function(err) {
                    if (err) throw err;
                    console.log('====== 完成！======'.green);
                });
            }
        }

        n++;

    });

}

var errInfo = []; // 存储错误信息
var startPage = 1;
var endPage = 1;
var n = (startPage-1)*18 + 1; // 初始图片编号1，以后一次递增

// 开始下载
getData(startPage);

