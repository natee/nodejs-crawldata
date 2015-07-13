/**
 * 把抓取整合后的数据处理成一行行的，便于处理成excel
 * [{city:'北京',data:12300,date:'2015-1-12'}]
 */
var fs = require('fs');
var json2csv = require('json2csv');
var fields = ['city', 'date', 'price'];
var fieldNames = ['城市', '日期', '房价'];

/**
 * data = [{
 *   city:'北京',
 *   data:[1,2],
 *   date:['2015-1-1','2015-1-2']
 * }]
 */
var data=JSON.parse(fs.readFileSync("data/price.json","utf-8"));

var result = [];

console.log('====== 正在转化数据.. ======');

data.forEach(function(val,key){
    val.data.forEach(function(v,k){
        result.push({
            "city":val.city,
            "date":val.date[k],
            "price":v
        });
    });
});

console.log(result);

console.log('====== 数据转化完成，正在写入excel.. ======');

json2csv({ data: result, fields: fields, fieldNames: fieldNames }, function(err, csv) {
    if (err) console.log(err);

    fs.writeFile('data/price.csv', csv, function(err) {
        if (err) throw err;
        console.log('====== 完成！ ======');
    });
});

