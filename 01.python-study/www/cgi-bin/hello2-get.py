#-*-coding:utf-8-*-
import cgi, cgitb
import sys
type = sys.getfilesystemencoding()

# 创建 FieldStorage 的实例化
form = cgi.FieldStorage()

# 获取数据
site_name = form.getvalue('name')
site_url  = form.getvalue('url')


if form.getvalue('google'):
   google_flag = "是"
else:
   google_flag = "否"

if form.getvalue('runoob'):
   runoob_flag = "是"
else:
   runoob_flag = "否"

# 接收字段数据
if form.getvalue('site'):
   site = form.getvalue('site')
else:
   site = "提交数据为空"

if form.getvalue('textcontent'):
   text_content = form.getvalue('textcontent')
else:
   text_content = "没有内容"



print ('Content-type:text/html')
print ()

print ("<html>")
print ("<head>")
print ('<meta charset="GBK">')
print ("<title>菜鸟教程 CGI 测试实例</title>")
print ("</head>")
print ("<body>")
print ("<div>{}官网：{}</div>".format(site_name, site_url))
print('<div>checkbox所选值 google_flag:{}, runoob_flag:{}</div>'.format(google_flag, runoob_flag))
print('<div>site:{}</div>'.format(site))
print('<div>text_content:{}</div>'.format(text_content))
print ("</body>")
print ("</html>")