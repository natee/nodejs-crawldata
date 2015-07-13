
var accounts = require('./config').accounts;
var getDataFromAccount = require('./login');
accounts.forEach(function (v) {
	getDataFromAccount(v);
});
console.log('======', '正在登陆...', '======');
