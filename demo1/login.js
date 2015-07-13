var request = require('superagent');
var task = require('./task');

var headers = {
    'Host':'user.fangjia.com',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Origin': 'http://user.fangjia.com',
    'X-FirePHP-Version': '0.0.6',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': 'http://user.fangjia.com/fangjiatong2/users/userCenterLogin?__from=fjw_header',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6,en;q=0.4,sr;q=0.2',
    'Cookie':''
};
var origin = 'user.fangjia.com',
    urls = {
        login: origin + '/fangjiatong2/users/userLogin'
    };

/**
 * 执行登陆
 * @param account {object}
 * @constructor
 */
function getDataFromAccount(account) {
    this.account = account;
    this.cookie = {
        value: null,
        expires: null
    };
    this.init();
}
getDataFromAccount.prototype = {
    constructor: getDataFromAccount,
    init: function () {
        var that = this;
        that._verify(function (cookie) {

            // 登陆成功
            console.log('======', '登陆成功，正在抓取数据..','======');

            task(headers,cookie);

        });
    },
    // 验证登录，如果凭证没过期，无需重新验证
    _verify: function (cb) {
        Date.now() > this.cookie.expires ? this._login(cb) : cb(this.cookie);
    },
    // 登录
    _login: function (cb) {
        var that = this;
        request
            .post(urls.login)
            .set(headers)
            .type('form')
            .send({
                userName: that.account.userName,
                password: that.account.password,
                autoLogin:1
            })
            .redirects(0) // 防止页面重定向
            .end(function (err,result) {
                var cookie = result.headers['set-cookie'];
                that.cookie = {
                    value: cookie,
                    expires: cookie.join().match(/Expires=(.*);/)[1]
                };
                cb(that.cookie);
            });
    }

};

module.exports = function (account) {
    return new getDataFromAccount(account);
};
