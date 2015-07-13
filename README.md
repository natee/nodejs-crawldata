# nodejs-crawldata
NodeJS抓取网站数据的例子
====
##demo1
此例子需要登录才能查看数据，所以示例代码增加了登录部分。

该网站使用了httpOnly的cookie，导致登录成功无法直接获取session，所以目前只是手动登陆后复制response header中的cookie去验证登陆。

抓取到的原始数据是字符串格式，并不是传统的JSON字符串，所以用到了一些replace把它处理成JSON格式。