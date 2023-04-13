# 导入 requests 包
import requests

# 发送请求
x = requests.get('https://www.runoob.com/')

# 返回网页内容
# print(x.text)
print(x.status_code)

# 响应状态的描述
print(x.reason)

# 返回编码
print(x.apparent_encoding)


x = requests.get('https://www.runoob.com/try/ajax/json_demo.json')
# 返回 json 数据
print(x.json())


'''
requests 方法
requests 方法如下表：

方法	描述
delete(url, args)	发送 DELETE 请求到指定 url
get(url, params, args)	发送 GET 请求到指定 url
head(url, args)	发送 HEAD 请求到指定 url
patch(url, data, args)	发送 PATCH 请求到指定 url
post(url, data, json, args)	发送 POST 请求到指定 url
put(url, data, args)	发送 PUT 请求到指定 url
request(method, url, args)	向指定的 url 发送指定的请求方法
使用 requests.request() 发送 get 请求：

实例
# 导入 requests 包
import requests

# 发送请求
x = requests.request('get', 'https://www.runoob.com/')

# 返回网页内容
print(x.status_code)
输出结果如下：

200
'''

kw = {'s':'python 教程'}

# 设置请求头
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36"}
 
# params 接收一个字典或者字符串的查询参数，字典类型自动转换为url编码，不需要urlencode()
response = requests.get("https://www.runoob.com/", params = kw, headers = headers)

# 查看响应状态码
print (response.status_code)

# 查看响应头部字符编码
print (response.encoding)

# 查看完整url地址
print (response.url)

# 查看响应内容，response.text 返回的是Unicode格式的数据
print(response.text)


'''
post() 方法可以发送 POST 请求到指定 url，一般格式如下：

requests.post(url, data={key: value}, json={key: value}, args)
url 请求 url。

data 参数为要发送到指定 url 的字典、元组列表、字节或文件对象。

json 参数为要发送到指定 url 的 JSON 对象。

args 为其他参数，比如 cookies、headers、verify等。

实例
# 导入 requests 包
import requests

# 发送请求
x = requests.post('https://www.runoob.com/try/ajax/demo_post.php')

# 返回网页内容
print(x.text)
输出结果如下：

<p style='color:red;'>本内容是使用 POST 方法请求的。</p><p style='color:red;'>请求时间：
2022-05-26 17:30:47</p>
post 请求带参数：

实例
# 导入 requests 包
import requests

# 表单参数，参数名为 fname 和 lname
myobj = {'fname': 'RUNOOB','lname': 'Boy'}

# 发送请求
x = requests.post('https://www.runoob.com/try/ajax/demo_post2.php', data = myobj)

# 返回网页内容
print(x.text)
输出结果如下：

<p style='color:red;'>你好，RUNOOB Boy，今天过得怎么样？</p>
'''