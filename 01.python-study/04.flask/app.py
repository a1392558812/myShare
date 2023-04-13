from flask import Flask,url_for,render_template,request,make_response,redirect,jsonify,session
from wsgiref.simple_server import make_server

'''
变量规则
通过把 URL 的一部分标记为 <variable_name> 就可以在 URL 中添加变量。标记的 部分会作为关键字参数传递给函数。
通过使用 <converter:variable_name> ，可以 选择性的加上一个转换器，为变量指定规则。请看下面的例子:


from markupsafe import escape

@app.route('/user/<username>')
def show_user_profile(username):
    # show the user profile for that user
    return f'User {escape(username)}'

@app.route('/post/<int:post_id>')
def show_post(post_id):
    # show the post with the given id, the id is an integer
    return f'Post {post_id}'

@app.route('/path/<path:subpath>')
def show_subpath(subpath):
    # show the subpath after /path/
    return f'Subpath {escape(subpath)}'


唯一的 URL / 重定向行为
以下两条规则的不同之处在于是否使用尾部的斜杠。:

@app.route('/projects/')
def projects():
    return 'The project page'

@app.route('/about')
def about():
    return 'The about page'
projects 的 URL 是中规中矩的，尾部有一个斜杠，看起来就如同一个文件 夹。访问一个没有斜杠结尾的 URL （ /projects ）时 Flask 会自动进行重 定向，帮您在尾部加上一个斜杠（ /projects/ ）。

about 的 URL 没有尾部斜杠，因此其行为表现与一个文件类似。如果访问这 个 URL 时添加了尾部斜杠（`` /about/ `` ）就会得到一个 404 “未找到” 错 误。这样可以保持 URL 唯一，并有助于搜索引擎重复索引同一页面。


URL 构建
url_for() 函数用于构建指定函数的 URL。它把函数名称作为第一个 参数。它可以接受任意个关键字参数，每个关键字参数对应 URL 中的变量。未知变量 将添加到 URL 中作为查询参数。

为什么不在把 URL 写死在模板中，而要使用反转函数 url_for() 动态构建？

反转通常比硬编码 URL 的描述性更好。

您可以只在一个地方改变 URL ，而不用到处乱找。

URL 创建会为您处理特殊字符的转义，比较直观。

生产的路径总是绝对路径，可以避免相对路径产生副作用。

如果您的应用是放在 URL 根路径之外的地方（如在 /myapplication 中，不在 / 中）， url_for() 会为您妥善处理。

例如，这里我们使用 test_request_context() 方法来尝试使用 url_for() 。 test_request_context() 告诉 Flask 正在处理一个请求，而实际上也许我们正处在交互 Python shell 之中， 并没有真正的请求。



HTTP 方法
Web 应用使用不同的 HTTP 方法处理 URL 。当您使用 Flask 时，应当熟悉 HTTP 方法。 缺省情况下，一个路由只回应 GET 请求。 可以使用 route() 装饰器的 methods 参数来处理不同的 HTTP 方法:

from flask import request

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        return do_the_login()
    else:
        return show_the_login_form()
如果当前使用了 GET 方法， Flask 会自动添加 HEAD 方法支持，并且同时还会 按照 HTTP RFC 来处理 HEAD 请求。同样， OPTIONS 也会自动实现。

静态文件
动态的 web 应用也需要静态文件，一般是 CSS 和 JavaScript 文件。理想情况下您的 服务器已经配置好了为您的提供静态文件的服务。但是在开发过程中， Flask 也能做好 这项工作。只要在您的包或模块旁边创建一个名为 static 的文件夹就行了。 静态文件位于应用的 /static 中。

使用特定的 'static' 端点就可以生成相应的 URL

url_for('static', filename='style.css')
这个静态文件在文件系统中的位置应该是 static/style.css 。






渲染模板
在 Python 内部生成 HTML 不好玩，且相当笨拙。因为您必须自己负责 HTML 转义， 以确保应用的安全。因此， Flask 自动为您配置 Jinja2 模板引擎。

使用 render_template() 方法可以渲染模板，您只要提供模板名称和需要 作为参数传递给模板的变量就行了。下面是一个简单的模板渲染例子:

from flask import render_template

@app.route('/hello/')
@app.route('/hello/<name>')
def hello(name=None):
    return render_template('hello.html', name=name)
Flask 会在 templates 文件夹内寻找模板。因此，如果您的应用是一个模块， 那么模板文件夹应该在模块旁边；如果是一个包，那么就应该在包里面：

情形 1 : 一个模块:

/application.py
/templates
    /hello.html
情形 2 : 一个包:

/application
    /__init__.py
    /templates
        /hello.html
您可以充分使用 Jinja2 模板引擎的威力。更多内容，详见官方 Jinja2 模板文档 。

模板示例：

<!doctype html>
<title>Hello from Flask</title>
{% if name %}
  <h1>Hello {{ name }}!</h1>
{% else %}
  <h1>Hello, World!</h1>
{% endif %}
在模板内部可以像使用 url_for() 和 get_flashed_messages() 函数一样访问 config 、 request 、 session 和 g 1 对象。

模板在继承使用的情况下尤其有用。其工作原理参见 模板继承 。简单的说，模板继承可以使每个页面 的特定元素（如页头、导航和页尾）保持一致。

自动转义默认开启。因此，如果 name 包含 HTML ，那么会被自动转义。如 果您可以信任某个变量，且知道它是安全的 HTML （例如变量来自一个把 wiki 标记转换为 HTML 的模块），那么可以使用 Markup 类把 它标记为安全的，或者在模板中使用 |safe 过滤器。更多例子参见 Jinja 2 文档。

下面 Markup 类的基本使用方法:

from markupsafe import Markup
Markup('<strong>Hello %s!</strong>') % '<blink>hacker</blink>'
Markup('<strong>Hello &lt;blink&gt;hacker&lt;/blink&gt;!</strong>')
Markup.escape('<blink>hacker</blink>')
Markup('&lt;blink&gt;hacker&lt;/blink&gt;')
Markup('<em>Marked up</em> &raquo; HTML').striptags()
'Marked up » HTML'





请求对象
请求对象在 API 一节中有详细说明这里不细谈（参见 Request ）。 这里简略地谈一下最常见的操作。首先，您必须从 flask 模块导入请求对象:

from flask import request
通过使用 method 属性可以操作当前请求方法，通过使用 form 属性处理表单数据（在 POST 或者 PUT 请求 中传输的数据）。以下是使用上述两个属性的例子:

@app.route('/login', methods=['POST', 'GET'])
def login():
    error = None
    if request.method == 'POST':
        if valid_login(request.form['username'],
                       request.form['password']):
            return log_the_user_in(request.form['username'])
        else:
            error = 'Invalid username/password'
    # the code below is executed if the request method
    # was GET or the credentials were invalid
    return render_template('login.html', error=error)
当 form 属性中不存在这个键时会发生什么？会引发一个 KeyError 。 如果您不像捕捉一个标准错误一样捕捉 KeyError ，那么会显示一个 HTTP 400 Bad Request 错误页面。因此，多数情况下您不必处理这个问题。

要操作 URL （如 ?key=value ）中提交的参数可以使用 args 属性:

searchword = request.args.get('key', '')
用户可能会改变 URL 导致出现一个 400 请求出错页面，这样降低了用户友好度。因此， 我们推荐使用 get 或通过捕捉 KeyError 来访问 URL 参数。

完整的请求对象方法和属性参见 Request 文档。 https://dormousehole.readthedocs.io/en/latest/api.html#flask.Request






文件上传
用 Flask 处理文件上传很容易，只要确保不要忘记在您的 HTML 表单中设置 enctype="multipart/form-data" 属性就可以了。否则浏览器将不会传送您的文件。

已上传的文件被储存在内存或文件系统的临时位置。您可以通过请求对象 files 属性来访问上传的文件。每个上传的文件都储存在这个 字典型属性中。这个属性基本和标准 Python file 对象一样，另外多出一个 用于把上传文件保存到服务器的文件系统中的 save() 方法。下例展示其如何运作:

from flask import request

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        f = request.files['the_file']
        f.save('/var/www/uploads/uploaded_file.txt')
    ...
如果想要知道文件上传之前其在客户端系统中的名称，可以使用 filename 属性。但是请牢记这个值是 可以伪造的，永远不要信任这个值。如果想要把客户端的文件名作为服务器上的文件名， 可以通过 Werkzeug 提供的 secure_filename() 函数:

from werkzeug.utils import secure_filename

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['the_file']
        file.save(f"/var/www/uploads/{secure_filename(file.filename)}")
    ...
更好的例子参见 上传文件 。






Cookies
要访问 cookies ，可以使用 cookies 属性。可以使用响应 对象 的 set_cookie 方法来设置 cookies 。请求对象的 cookies 属性是一个包含了客户端传输的所有 cookies 的字典。在 Flask 中，如果使用 会话 ，那么就不要直接使用 cookies ，因为 会话 比较安全一些。

读取 cookies:

from flask import request

@app.route('/')
def index():
    username = request.cookies.get('username')
    # use cookies.get(key) instead of cookies[key] to not get a
    # KeyError if the cookie is missing.
储存 cookies:

from flask import make_response

@app.route('/')
def index():
    resp = make_response(render_template(...))
    resp.set_cookie('username', 'the username')
    return resp
注意， cookies 设置在响应对象上。通常只是从视图函数返回字符串， Flask 会把它们转换为响应对象。如果您想显式地转换，那么可以使用 make_response() 函数，然后再修改它。

使用 doc:patterns/deferredcallbacks 方案可以在没有响应对象的情况下设 置一个 cookie 。

另见 关于响应 。

重定向和错误
使用 redirect() 函数可以重定向。使用 abort() 可以 更早退出请求，并返回错误代码:

from flask import abort, redirect, url_for

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login')
def login():
    abort(401)
    this_is_never_executed()
上例实际上是没有意义的，它让一个用户从索引页重定向到一个无法访问的页面（401 表示禁止访问）。但是上例可以说明重定向和出错跳出是如何工作的。

缺省情况下每种出错代码都会对应显示一个黑白的出错页面。使用 errorhandler() 装饰器可以定制出错页面:

@app.errorhandler(404)
def page_not_found(error):
    return render_template('page_not_found.html'), 404
注意 render_template() 后面的 404 ，这表示页面对就的出错 代码是 404 ，即页面不存在。缺省情况下 200 表示：一切正常。

详见 应用错误处理 。

关于响应
视图函数的返回值会自动转换为一个响应对象。如果返回值是一个字符串，那么会被 转换为一个包含作为响应体的字符串、一个 200 OK 出错代码 和一个 text/html 类型的响应对象。如果返回值是一个字典，那么会调用 jsonify() 来产生一个响应。以下是转换的规则：

如果视图返回的是一个响应对象，那么就直接返回它。

如果返回的是一个字符串，那么根据这个字符串和缺省参数生成一个用于返回的 响应对象。

如果返回的是一个字典，那么调用 jsonify 创建一个响应对象。

如果返回的是一个元组，那么元组中的项目可以提供额外的信息。元组中必须至少 包含一个项目，且项目应当由 (response, status) 、 (response, headers) 或者 (response, status, headers) 组成。 status 的值会重载状态代码， headers 是一个由额外头部值组成的列表 或字典。

如果以上都不是，那么 Flask 会假定返回值是一个有效的 WSGI 应用并把它转换为 一个响应对象。

如果想要在视图内部掌控响应对象的结果，那么可以使用 make_response() 函数。

设想有如下视图:

@app.errorhandler(404)
def not_found(error):
    return render_template('error.html'), 404
可以使用 make_response() 包裹返回表达式，获得响应对象，并对该对象 进行修改，然后再返回:

@app.errorhandler(404)
def not_found(error):
    resp = make_response(render_template('error.html'), 404)
    resp.headers['X-Something'] = 'A value'
    return resp
JSON 格式的 API
JSON 格式的响应是常见的，用 Flask 写这样的 API 是很容易上手的。如果从视图 返回一个 dict ，那么它会被转换为一个 JSON 响应。

@app.route("/me")
def me_api():
    user = get_current_user()
    return {
        "username": user.username,
        "theme": user.theme,
        "image": url_for("user_image", filename=user.image),
    }
如果 dict 还不能满足需求，还需要创建其他类型的 JSON 格式响应，可以使用 jsonify() 函数。该函数会序列化任何支持的 JSON 数据类型。 也可以研究研究 Flask 社区扩展，以支持更复杂的应用。

@app.route("/users")
def users_api():
    users = get_all_users()
    return jsonify([user.to_json() for user in users])











会话
除了请求对象之外还有一种称为 session 的对象，允许您在不同请求 之间储存信息。这个对象相当于用密钥签名加密的 cookie ，即用户可以查看您的 cookie ，

但是如果没有密钥就无法修改它。

使用会话之前您必须设置一个密钥。举例说明:

from flask import session

# Set the secret key to some random bytes. Keep this really secret!
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

@app.route('/')
def index():
    if 'username' in session:
        return f'Logged in as {session["username"]}'
    return 'You are not logged in'

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session['username'] = request.form['username']
        return redirect(url_for('index'))
    return """
        <form method="post">
            <p><input type=text name=username>
            <p><input type=submit value=Login>
        </form>
    """

@app.route('/logout')
def logout():
    # remove the username from the session if it's there
    session.pop('username', None)
    return redirect(url_for('index'))








如何生成一个好的密钥
生成随机数的关键在于一个好的随机种子，因此一个好的密钥应当有足够 的随机性。操作系统可以有多种方式基于密码随机生成器来生成随机数据。 使用下面的命令可以快捷的为 Flask.secret_key （ 或者 SECRET_KEY ）生成值:

$ python -c 'import secrets; print(secrets.token_hex())'
'192b9bdd22ab9ed4d12e236c78afcb9a393ec15f71bbf5dc987d54727823bcbf'
基于 cookie 的会话的说明： Flask 会取出会话对象中的值，把值序列化后储 存到 cookie 中。在打开 cookie 的情况下，如果需要查找某个值，但是这个 值在请求中没有持续储存的话，那么不会得到一个清晰的出错信息。请检查页 面响应中的 cookie 的大小是否与网络浏览器所支持的大小一致。

除了缺省的客户端会话之外，还有许多 Flask 扩展支持服务端会话。
-设置:flash('aaa')
-取值：get_flashed_message()
 
-假设在a页面操作出错，跳转到b页面，在b页面显示a页面的错误信息


代码示例: https://www.bbsmax.com/A/D854QY2YdE/
from flask import Flask,flash,get_flashed_messages
 
app = Flask(__name__)
app.secret_key = 'asdfasdf'
 
@app.route('/index1')
def index():
    #(category="message", message))
    flash('超时错误',category="error")  #设置信息，分类为error
    flash('普通信息',category="info")  #设置信息，分类为info
    return "ssdsdsdfsd"
 
@app.route('/error')
def error():
    data = get_flashed_messages(with_categories=True,category_filter=("error","info"))
    data1 = get_flashed_messages(with_categories=True, category_filter=("error", "info"))
    print("data1",data1)
    print("data",data)
    return "错误信息"
 
if __name__ == '__main__':
    app.run()

'''

app = Flask(__name__)

@app.route('/')
def index():
    username = request.cookies.get('username')
    print('username', username)
    if username:
        return render_template('index.html', username=username)
    else:
        return redirect('/login')
        



@app.route('/login', methods=['POST', 'GET'])
def login():
    error = None
    # if request.method == 'POST':
    #     if valid_login(request.form['username'],request.form['password']):
    #         return log_the_user_in(request.form['username'])
    #     else:
    #         error = 'Invalid username/password'
    # post请求登录校验，验证账号密码


    # the code below is executed if the request method
    # was GET or the credentials were invalid
    resp = make_response(render_template('login.html', error=error))
    resp.set_cookie('username', 'Awen')
    return resp

@app.route('/user/<username>')
def profile(username):
    requestParams = dict({})
    requestParams.update(key = request.args.get('key', '')) # 获取url的params参数 ?key=value&xxxx=xxxx
    requestParams.update(height = request.args.get('height', ''))
    # dict(request.args) 所有的params参数
    print('searchword', requestParams, dict(request.args))
    return f'{username}\'s profile'


@app.route('/hello/')
@app.route('/hello/<name>')
def hello(name=None):
    return render_template('hello.html', name=name)


@app.errorhandler(404)
def page_not_found(error):
    resp = make_response(render_template('page_not_found.html'), 404)
    resp.headers['X-Something'] = 'A value'
    return resp

# get userInfo接口
@app.route("/userInfo")
def users_api():
    return jsonify({
      'name': '喜洋洋',
      'sex': '男',
      'age': '26'
    })

with app.test_request_context():
    url_for('static', filename='style.css')
    print('url_for', url_for('index'))
    print('url_for', url_for('login'))
    print('url_for', url_for('login', next='/'))
    print('url_for', url_for('profile', username='John Doe'))


def application(environ, start_response):
    start_response('200 ok', [('Content-Type', 'text/html')])
    return [b'<h1>hello wsgi!</h1>']
httpd = make_server('', 8080, application)
httpd.serve_forever()

print ("Serving HTTP on port 8080...")



'''
wsgi是一个web组件的接口防范，wsgi将web组件分为三类：web服务器，web中间件，web应用程序

wsgi基本处理模式为：wsgi Server -> wsgi middleware -> wsgi application

WSGI，全称 Web Server Gateway Interface，或者 Python Web Server Gateway Interface ，是为 Python 语言定义的 Web 服务器和 Web 应用程序或框架之间的一种简单而通用的接口。自从 WSGI 被开发出来以后，许多其它语言中也出现了类似接口。

WSGI 的官方定义是，the Python Web Server Gateway Interface。从名字就可以看出来，这东西是一个Gateway，也就是网关。网关的作用就是在协议之间进行转换。

WSGI 是作为 Web 服务器与 Web 应用程序或应用框架之间的一种低级别的接口，以提升可移植 Web 应用开发的共同点。WSGI 是基于现存的 CGI 标准而设计的。

很多框架都自带了 WSGI server ，比如 Flask，webpy，Django、CherryPy等等。当然性能都不好，自带的 web server 更多的是测试用途，发布时则使用生产环境的 WSGI server或者是联合 nginx 做 uwsgi 。

也就是说，WSGI就像是一座桥梁，一边连着web服务器，另一边连着用户的应用。但是呢，这个桥的功能很弱，有时候还需要别的桥来帮忙才能进行处理。




WSGI的接口
1.WSGI接口定义格式
WSGI接口定义非常简单，它只要求Web开发者实现一个函数，就可以响应HTTP请求。我们来看一个最简单的Web版本的“Hello World!”：

def application(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/html')])
    return 'Hello World!'
1
2
3
2.参数解释
上面的application()函数就是符合WSGI标准的一个HTTP处理函数，它接收两个参数：

 environ：一个包含所有HTTP请求信息的dict对象；在用户向服务器请求数据时获得
 start_response：一个发送HTTP响应的函数，就是一个回调函数，用来生成服务器对浏览器的响应头部。
3.回调函数start_response解析
在application()函数中，调用：

start_response('200 OK', [('Content-Type', 'text/html')]) 
1
start_response()函数接收两个参数：

 一个是HTTP响应码
 ，一个是一组元组列表list表示的HTTP Header，每个Header用一个包含两个str的tuple表示。
start_response的作用是限制响应Body的内容形式以及提供响应的状态码信息===》Header，所以这个回调函数的作用就是发送HTTP响应的Header

注意Header只能发送一次，也就是只能调用一次start_response()。

然后，把函数的返回值作为HTTP响应的Body发送给浏览器。

4.WSGI的作用
整个application()函数本身没有涉及到任何解析HTTP的部分，也就是说，把底层web服务器解析部分和应用程序逻辑部分进行了分离，这样开发者就可以专心做一个领域了

不过，等等，这个application()函数怎么调用？如果我们自己调用，两个参数environ和start_response我们没法提供，返回的str也没法发给浏览器。

所以application()函数必须由WSGI服务器来调用。有很多符合WSGI规范的服务器。而我们此时的web服务器项目的目的就是做一个既能解析静态网页还可以解析动态网页的服务器
'''