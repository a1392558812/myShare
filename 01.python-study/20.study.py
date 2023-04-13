'''
print ("Content-type:text/html")
print ()                             # 空行，告诉服务器结束头部
print ('<html>')
print ('<head>')
print ('<meta charset="utf-8">')
print ('<title>Hello Word - 我的第一个 CGI 程序！</title>')
print ('</head>')
print ('<body>')
print ('<h2>Hello Word! 我是来自菜鸟教程的第一CGI程序</h2>')
print ('</body>')
print ('</html>')
'''

'''
浏览器客户端通过两种方法向服务器传递信息，这两种方法就是 GET 方法和 POST 方法。

使用GET方法传输数据
GET方法发送编码后的用户信息到服务端，数据信息包含在请求页面的URL上，以"?"号分割, 如下所示：

http://www.test.com/cgi-bin/hello.py?key1=value1&key2=value2有关 GET 请求的其他一些注释：
GET 请求可被缓存
GET 请求保留在浏览器历史记录中
GET 请求可被收藏为书签
GET 请求不应在处理敏感数据时使用
GET 请求有长度限制
GET 请求只应当用于取回数据
简单的url实例：GET方法
以下是一个简单的URL，使用GET方法向hello_get.py程序发送两个参数：

/cgi-bin/test.py?name=菜鸟教程&url=http://www.runoob.com
以下为 hello_get.py 文件的代码：

实例
#!/usr/bin/python3

# CGI处理模块
import cgi, cgitb

# 创建 FieldStorage 的实例化
form = cgi.FieldStorage()

# 获取数据
site_name = form.getvalue('name')
site_url  = form.getvalue('url')

print ("Content-type:text/html")
print ()
print ("<html>")
print ("<head>")
print ("<meta charset=\"utf-8\">")
print ("<title>菜鸟教程 CGI 测试实例</title>")
print ("</head>")
print ("<body>")
print ("<h2>%s官网：%s</h2>" % (site_name, site_url))
print ("</body>")
print ("</html>")
'''


'''
于 www/cgi-bin/hello2-post.py发送post表单提交
于 www/cgi-bin/hello2-get.py接受post表单提交
'''


'''
CGI中使用Cookie
在 http 协议一个很大的缺点就是不对用户身份的进行判断，这样给编程人员带来很大的不便， 而 cookie 功能的出现弥补了这个不足。

cookie 就是在客户访问脚本的同时，通过客户的浏览器，在客户硬盘上写入纪录数据 ，当下次客户访问脚本时取回数据信息，从而达到身份判别的功能，cookie 常用在身份校验中。

　
cookie的语法
http cookie的发送是通过http头部来实现的，他早于文件的传递，头部set-cookie的语法如下：

Set-cookie:name=name;expires=date;path=path;domain=domain;secure 
name=name: 需要设置cookie的值(name不能使用";"和","号),有多个name值时用 ";" 分隔，例如：name1=name1;name2=name2;name3=name3。
expires=date: cookie的有效期限,格式： expires="Wdy,DD-Mon-YYYY HH:MM:SS"
path=path: 设置cookie支持的路径,如果path是一个路径，则cookie对这个目录下的所有文件及子目录生效，例如： path="/cgi-bin/"，如果path是一个文件，则cookie指对这个文件生效，例如：path="/cgi-bin/cookie.cgi"。
domain=domain: 对cookie生效的域名，例如：domain="www.runoob.com"
secure: 如果给出此标志，表示cookie只能通过SSL协议的https服务器来传递。
cookie的接收是通过设置环境变量HTTP_COOKIE来实现的，CGI程序可以通过检索该变量获取cookie信息。
Cookie设置
Cookie的 设置非常简单，cookie 会在 http 头部单独发送。以下实例在 cookie 中设置了 name 和 expires：

实例
#!/usr/bin/python3

print ('Set-Cookie: name="菜鸟教程";expires=Wed, 28 Aug 2016 18:30:00 GMT')
print ('Content-Type: text/html')

print ()
print ("""
<html>
  <head>
    <meta charset="utf-8">
    <title>菜鸟教程(runoob.com)</title>
  </head>
    <body>
        <h1>Cookie set OK!</h1>
    </body>
</html>
""")
将以上代码保存到 cookie_set.py，并修改 cookie_set.py 权限：

chmod 755 cookie_set.py
以上实例使用了 Set-Cookie 头信息来设置 Cookie 信息，可选项中设置了 Cookie 的其他属性，如过期时间 Expires，域名 Domain，路径 Path。这些信息设置在 "Content-type:text/html" 之前。

检索Cookie信息
Cookie信息检索页非常简单，Cookie信息存储在CGI的环境变量HTTP_COOKIE中，存储格式如下：

key1=value1;key2=value2;key3=value3....
以下是一个简单的CGI检索cookie信息的程序：

实例
#!/usr/bin/python3

# 导入模块
import os
import http.cookies

print ("Content-type: text/html")
print ()

print ("""
<html>
<head>
<meta charset="utf-8">
<title>菜鸟教程(runoob.com)</title>
</head>
<body>
<h1>读取cookie信息</h1>
""")

if 'HTTP_COOKIE' in os.environ:
    cookie_string=os.environ.get('HTTP_COOKIE')
    c= http.cookies.SimpleCookie()
   # c=Cookie.SimpleCookie()
    c.load(cookie_string)

    try:
        data=c['name'].value
        print ("cookie data: "+data+"<br>")
    except KeyError:
        print ("cookie 没有设置或者已过去<br>")
print ("""
</body>
</html>
""")
将以上代码保存到 cookie_get.py，并修改 cookie_get.py 权限：

chmod 755 cookie_get.py



文件上传实例
HTML设置上传文件的表单需要设置 enctype 属性为 multipart/form-data，代码如下所示：

实例
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>菜鸟教程(runoob.com)</title>
</head>
<body>
 <form enctype="multipart/form-data"
                    action="/cgi-bin/save_file.py" method="post">
   <p>选中文件: <input type="file" name="filename" /></p>
   <p><input type="submit" value="上传" /></p>
   </form>
</body>
</html>
save_file.py 脚本文件代码如下：

实例
#!/usr/bin/python3

import cgi, os
import cgitb; cgitb.enable()

form = cgi.FieldStorage()

# 获取文件名
fileitem = form['filename']

# 检测文件是否上传
if fileitem.filename:
   # 设置文件路径
   fn = os.path.basename(fileitem.filename)
   open('/tmp/' + fn, 'wb').write(fileitem.file.read())

   message = '文件 "' + fn + '" 上传成功'
   
else:
   message = '文件没有上传'
   
print ("""\
Content-Type: text/html\n
<html>
<head>
<meta charset="utf-8">
<title>菜鸟教程(runoob.com)</title>
</head>
<body>
   <p>%s</p>
</body>
</html>
""" % (message,))
将以上代码保存到 save_file.py，并修改 save_file.py 权限：

chmod 755 save_file.py



如果你使用的系统是Unix/Linux，你必须替换文件分隔符，在window下只需要使用open()语句即可：

fn = os.path.basename(fileitem.filename.replace("\\", "/" ))
文件下载对话框
我们先在当前目录下创建 foo.txt 文件，用于程序的下载。

文件下载通过设置HTTP头信息来实现，功能代码如下：

实例
#!/usr/bin/python3

# HTTP 头部
print ("Content-Disposition: attachment; filename=\"foo.txt\"")
print ()
# 打开文件
fo = open("foo.txt", "rb")

str = fo.read();
print (str)

# 关闭文件
fo.close()
'''