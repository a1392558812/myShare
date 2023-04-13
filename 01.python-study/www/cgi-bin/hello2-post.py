#-*-coding:utf-8-*-

import os
import http.cookies
print ('Set-Cookie: name="asdasd";expires=Wed, 28 Aug 2045 18:30:00 GMT')
print ("Content-type:text/html")
print ()
print ("<html>")
print ("<head>")
print ('<meta charset="GBK">')
print ("<title>菜鸟教程 CGI 测试实例</title>")
print ("</head>")
print ("<body>")
print ('<form action="/cgi-bin/hello2-get.py" method="POST" target="_blank">')
print('name: <input type="text" name="name">  <br />')
print('url: <input type="text" name="url">  <br />')
print('<input type="checkbox" name="runoob" value="on" /> 菜鸟教程')
print('<input type="checkbox" name="google" value="on" /> Google')
print('<input type="radio" name="site" value="runoob" /> 菜鸟教程')
print('<input type="radio" name="site" value="google" /> Google')
print('<textarea name="textcontent" cols="40" rows="4">在这里输入内容...</textarea>')
print('<input type="submit" value="submit" />')
print('</form>')

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
print ("</body>")
print ("</html>")