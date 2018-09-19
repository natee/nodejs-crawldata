# nodejs-crawldata
NodeJS抓取网站数据的例子

## demo1
此例子需要登录才能查看数据，所以示例代码增加了登录部分。

该网站使用了`httpOnly`的cookie，导致登录成功无法直接获取session，所以目前只是手动登陆后复制response header中的cookie去验证登陆。

抓取到的原始数据是字符串格式，并不是传统的JSON字符串，所以用到了一些replace把它处理成JSON格式。

*修改config.js中的用户名密码（改了也没用），手动登陆后，修改好cookie。*

**step 1**

运行app：

```
node app.js
```

执行完第一步后你已经获取到所有城市每周对应房价的数据，然而，这个数据只是最基本的一个大json文件，有些想把它整到excel中，你可以继续运行第二步：

**step 2**

```
node convertData.js
```

至此，你已经把抓取的数据转成了price.csv文件。
