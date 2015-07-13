var superagent = require('superagent');
var cheerio = require('cheerio');
var observe = require('observe.js');
var fs = require('fs');

var cityMap = [{"name":"anshan","value":"鞍山"},{"name":"beijing","value":"北京"},{"name":"baoding","value":"保定"},{"name":"beihai","value":"北海"},{"name":"chengdu","value":"成都"},{"name":"chongqing","value":"重庆"},{"name":"changsha","value":"长沙"},{"name":"changchun","value":"长春"},{"name":"changzhou","value":"常州"},{"name":"dalian","value":"大连"},{"name":"dongguan","value":"东莞"},{"name":"dali","value":"大理"},{"name":"daqing","value":"大庆"},{"name":"dandong","value":"丹东"},{"name":"fuzhou","value":"福州"},{"name":"foshan","value":"佛山"},{"name":"guangzhou","value":"广州"},{"name":"guiyang","value":"贵阳"},{"name":"ganzhou","value":"赣州"},{"name":"guilin","value":"桂林"},{"name":"hangzhou","value":"杭州"},{"name":"huhehaote","value":"呼和浩特"},{"name":"haerbin","value":"哈尔滨"},{"name":"handan","value":"邯郸"},{"name":"hefei","value":"合肥"},{"name":"huizhou","value":"惠州"},{"name":"huzhou","value":"湖州"},{"name":"haikou","value":"海口"},{"name":"jinan","value":"济南"},{"name":"jilin","value":"吉林"},{"name":"jiaxing","value":"嘉兴"},{"name":"jiujiang","value":"九江"},{"name":"jiangmen","value":"江门"},{"name":"jinhua","value":"金华"},{"name":"kunming","value":"昆明"},{"name":"lanzhou","value":"兰州"},{"name":"langfang","value":"廊坊"},{"name":"lijiang","value":"丽江"},{"name":"liupanshui","value":"六盘水"},{"name":"luoyang","value":"洛阳"},{"name":"lianyungang","value":"连云港"},{"name":"liuzhou","value":"柳州"},{"name":"mianyang","value":"绵阳"},{"name":"maanshan","value":"马鞍山"},{"name":"nanjing","value":"南京"},{"name":"ningbo","value":"宁波"},{"name":"nanning","value":"南宁"},{"name":"nanchang","value":"南昌"},{"name":"nantong","value":"南通"},{"name":"panzhihua","value":"攀枝花"},{"name":"putian","value":"莆田"},{"name":"qingdao","value":"青岛"},{"name":"qinhuangdao","value":"秦皇岛"},{"name":"quanzhou","value":"泉州"},{"name":"quzhou","value":"衢州"},{"name":"qingyuan","value":"清远"},{"name":"shanghai","value":"上海"},{"name":"shenzhen","value":"深圳"},{"name":"shenyang","value":"沈阳"},{"name":"shijiazhuang","value":"石家庄"},{"name":"suzhou","value":"苏州"},{"name":"sanya","value":"三亚"},{"name":"shaoxing","value":"绍兴"},{"name":"suqian","value":"宿迁"},{"name":"tianjin","value":"天津"},{"name":"taiyuan","value":"太原"},{"name":"tangshan","value":"唐山"},{"name":"taizhou","value":"泰州"},{"name":"tzh","value":"台州"},{"name":"wuhan","value":"武汉"},{"name":"wenzhou","value":"温州"},{"name":"wuxi","value":"无锡"},{"name":"weihai","value":"威海"},{"name":"wulumuqi","value":"乌鲁木齐"},{"name":"weifang","value":"潍坊"},{"name":"wuhu","value":"芜湖"},{"name":"xian","value":"西安"},{"name":"xiamen","value":"厦门"},{"name":"xianyang","value":"咸阳"},{"name":"xining","value":"西宁"},{"name":"xiangyang","value":"襄阳"},{"name":"xuzhou","value":"徐州"},{"name":"xiangtan","value":"湘潭"},{"name":"yinchuan","value":"银川"},{"name":"yangzhou","value":"扬州"},{"name":"yibin","value":"宜宾"},{"name":"yantai","value":"烟台"},{"name":"yanan","value":"延安"},{"name":"yichang","value":"宜昌"},{"name":"yancheng","value":"盐城"},{"name":"yulin","value":"玉林"},{"name":"zhengzhou","value":"郑州"},{"name":"zigong","value":"自贡"},{"name":"zhongshan","value":"中山"},{"name":"zhanjiang","value":"湛江"},{"name":"zhuzhou","value":"株洲"},{"name":"zhenjiang","value":"镇江"},{"name":"zhuhai","value":"珠海"},{"name":"zibo","value":"淄博"},{"name":"zhangjiajie","value":"张家界"}];

var cities = [
    "上海", "北京", "广州", "深圳", "天津",
    "重庆", "鞍山", "保定", "北海", "成都",
    "长沙", "长春", "常州", "大连", "东莞",
    "大理", "大庆", "丹东", "福州", "佛山",
    "贵阳", "赣州", "桂林", "杭州", "呼和浩特",
    "哈尔滨", "邯郸", "合肥", "惠州", "湖州",
    "海口", "济南", "吉林", "嘉兴", "九江",
    "江门", "金华", "昆明", "兰州", "廊坊",
    "丽江", "六盘水", "洛阳", "连云港", "柳州",
    "绵阳", "马鞍山", "南京", "宁波", "南宁",
    "南昌", "南通", "攀枝花", "莆田", "青岛",
    "秦皇岛", "泉州", "衢州", "清远", "沈阳",
    "石家庄", "苏州", "三亚", "绍兴", "宿迁",
    "太原", "唐山", "泰州", "台州", "武汉",
    "温州", "无锡", "威海", "乌鲁木齐", "潍坊",
    "芜湖", "西安", "厦门", "咸阳", "西宁",
    "襄阳", "徐州", "湘潭", "银川", "扬州",
    "宜宾", "烟台", "延安", "宜昌", "盐城",
    "玉林", "郑州", "自贡", "中山", "湛江",
    "株洲", "镇江", "珠海", "淄博", "张家界"
];

var getDataUrl = 'http://user.fangjia.com/fangjiatong2/evaluation/showChart';

if(!fs.existsSync('data')){
    fs.mkdirSync('data');
}

var cityData = [];

/**
 * 抓取城市房价数据
 * @param options {Object}
 */
function getData(options){
    console.log('  正在抓取 ',options.city,' 的数据...');
    var query = {
        city: options.city,           // 市
        region:options.region || '',  // 区
        block:options.block || '',    // 街道
        month:240                     // 抓取数据时间跨度
    };

    superagent
        .get(getDataUrl)
        .query(query)
        //.set(headers)
        .set('Cookie', options.cookie)
        .end(function(err,res){
            if(res.ok){
                var text = JSON.parse(res.text);
                var dataJson = text.data.replace('data','"data"')
                    .replace(/'/g,'"')
                    .replace('name','"name"')
                    .replace('selected','"selected"')
                    .replace('marker','"marker"')
                    .replace('radius','"radius"')
                    .replace('visible','"visible"');

                var dateJson = text.x.replace(/'/g,'"');
                var data = JSON.parse(dataJson);
                cityData.push({
                    'city':data[0].name,
                    'data':data[0].data,
                    'date':JSON.parse(dateJson)
                });
                //console.log(cityData);

                fs.writeFile('nodejs-grab-data/data/price.json',JSON.stringify(cityData));

                console.log('  ',options.city,' 数据抓取完毕...');

            }else{
                console.log('====== 出错啦 ======\n',err);
            }
        });
}

module.exports = function(headers,cookie){

    // 由于网站设置了httpOnly的cookie,
    // 手动登陆之后复制response header中的cookie到此处
    cookie.value = 'JSESSIONID=xxxxxxxxx,xxxxx';

    // 遍历每个主要城市
    for(var i = 0; i < cities.length; i++){
        getData({
            cookie : cookie.value,
            city : cities[i]
        });
    }

};