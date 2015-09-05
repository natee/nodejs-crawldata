var superagent = require('superagent');
var request = require("request");
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');
var iconv = require('iconv-lite');

var getDataUrl = 'http://xxx.xxx.xxx/';

if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

var page = 1; // 抓多少页数据

// 翻页
for (var i = 1; i <= page; i++) {
    getData(i);
}

/**
 * 抓取图片
 * @param page {Number}
 */
function getData(page) {
    console.log('  正在抓取第 ', page, ' 页的图片...');
    superagent
        .get(getDataUrl + page + '.html') // 根据实际情况
        .end(function (err, res) {
            if (res.ok) {

                handleResult(res.text);

            } else {
                console.log('====== 出错啦 ======\n', err);
            }
        });
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

        getImgPage(detailSrc);
    }

    //console.log('图片抓取请求已全部发送...剩下的就是等图片保存成功了');

}

/**
 * 图片详情页
 * @param src
 */
function getImgPage(src) {

    superagent
        .get(src)
        .end(function (err, res) {
            if (res.ok) {

                // 中文乱码处理
                var $ = cheerio.load(iconv.decode(res.text, 'gbk'));

                // 这个网站恶心之处再于每张图片都是动态生成js然后去渲染img标签的src，所以只能去获取<script>标签的内容再处理
                var scripts = $('.listItem').find('script').eq(0).html().replace(/\s*\n*\r*\t*\'*/g,'');

                saveImg(scripts);

            } else {
                console.log('====== 出错啦 ======\n', err);
            }
        });

}

/**
 * 下载图片
 * @param info {String} 页面动态生成图片的信息,JS代码
 */
function saveImg(info){

    var argsStr = info.split('{')[1].split('}')[0].toString();
    var argsArr = argsStr.split(',');
    var url = argsArr[7].split('pic:')[1].toString();
    var filename = argsArr[4].split(':')[1];

    //console.log(url);

    //var a = {
        //    a: 'a',
        //    b: 'image',
        //    c: 'other',
        //    d: 1,
        //    title: '图片',
        //    f: 'test',
        //    g: '',
        //    pic: '图片实际路径'  // 最终为了拿到这个
        //}

    request.head(url, function (err, res, body) {
        request(url).pipe(fs.createWriteStream('data/' + filename + '.jpg'));
    });

}