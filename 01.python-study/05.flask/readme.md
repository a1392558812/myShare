### 项目布局

```
├── flaskr/
│   ├── __init__.py
│   ├── db.py
│   ├── schema.sql
│   ├── auth.py
│   ├── blog.py
│   ├── templates/
│   │   ├── base.html
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   └── register.html
│   │   └── blog/
│   │       ├── create.html
│   │       ├── index.html
│   │       └── update.html
│   └── static/
│       └── style.css
├── tests/
│   ├── conftest.py
│   ├── data.sql
│   ├── test_factory.py
│   ├── test_db.py
│   ├── test_auth.py
│   └── test_blog.py
├── venv/
├── setup.py
└── MANIFEST.in
```


### 虚拟环境
建议在开发环境和生产环境下都使用虚拟环境来管理项目的依赖。

为什么要使用虚拟环境？随着你的 Python 项目越来越多，你会发现不同的项目 会需要不同的版本的 Python 库。同一个 Python 库的不同版本可能不兼容。

虚拟环境可以为每一个项目安装独立的 Python 库，这样就可以隔离不同项目之 间的 Python 库，也可以隔离项目与操作系统之间的 Python 库。

Python 内置了用于创建虚拟环境的 venv 模块。

创建一个虚拟环境
创建一个项目文件夹，然后创建一个虚拟环境。创建完成后项目文件夹中会有一个 venv 文件夹：

```cmd
mkdir myproject
cd myproject
py -3 -m venv venv
```

### 激活虚拟环境
在开始工作前，先要激活相应的虚拟环境：

```cmd
venv\Scripts\activate
```

安装 Flask
在已激活的虚拟环境中可以使用如下命令安装 Flask：

```cmd
pip install Flask
```

现在可以通过使用 flask 命令来运行应用。在终端中告诉 Flask 你的应用 在哪里，然后在开发模式下运行应用。请记住，现在还是应当在最顶层的 flask-tutorial 目录下，不是在 flaskr 包里面。

开发模式下，当页面出错的时候会显示一个交互调试器，并且当你修改代码保存 后会重启服务器。

```cmd
set FLASK_APP=flaskr
set FLASK_ENV=development
flask run
```

可以看到类似如下输出内容：

```
* Serving Flask app "flaskr"
* Environment: development
* Debug mode: on
* Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
* Restarting with stat
* Debugger is active!
* Debugger PIN: 855-212-761
```
在浏览器中访问 http://127.0.0.1:5000/hello ，


退出虚拟环境

```
deactivate
```



可以使用 coverage 命令代替直接使用 pytest 来运行测试，这样可以衡量测试 覆盖率。
```
coverage run -m pytest
```

如果有测试失败， pytest 会显示引发的错误。可以使用 pytest -v 得到每个测试的列表，而不是一串点。


### 构建和安装

当需要把应用部署到其他地方时，需要构建一个发行文件。当前 Python 的标准发行 文件是 wheel 格式的，扩展名为 .whl 。先确保已经安装好 wheel 库：

```
pip install wheel
```

用 Python 运行 setup.py 会得到一个命令行工具，以使用构建相关命令。 bdist_wheel 命令会构建一个 wheel 发行文件。

```
python setup.py bdist_wheel
```

构建的文件为 dist/flaskr-1.0.0-py3-none-any.whl 。文件名由项目名称、版 本号和一些关于项目安装要求的标记组成，形如： {project name}-{version}-{python tag}-{abi tag}-{platform tag} 。


复制这个文件到另一台机器， 创建一个新的虚拟环境 ，然后用 pip 安装这个文件。


```
pip install flaskr-1.0.0-py3-none-any.whl
```


Pip 会安装项目和相关依赖。既然这是一个不同的机器，那么需要再次运行 init-db 命令，在实例文件夹中 创建数据库。

```
set FLASK_APP=flaskr
flask init-db
```
当 Flask 探测到它已被安装（不在编辑模式下），它会与前文不同，使用 venv/var/flaskr-instance 作为实例文件夹。



### 配置密钥
在教程开始的时候给了 SECRET_KEY 一个缺省值。在产品中我们应当设置一 些随机内容。否则网络攻击者就可以使用公开的 'dev' 键来修改会话 cookie ，或者其他任何使用密钥的东西。

可以使用下面的命令输出一个随机密钥：

```
python -c 'import secrets; print(secrets.token_hex())'
```

5b661f002d936d28e6b5be2dace79b9b76789dcd24f7783fd05ab1989f84975f（这是我的秘钥）
在实例文件夹创建一个 config.py 文件。工厂会读取这个文件，如果该文件存 在的话。提制生成的值到该文件中。

venv/var/flaskr-instance/config.py
```Python
SECRET_KEY = '192b9bdd22ab9ed4d12e236c78afcb9a393ec15f71bbf5dc987d54727823bcbf'
```
其他必须的配置也可以写入该文件中。 Flaskr 只需要 SECRET_KEY 即可。



### 运行产品服务器
当运行公开服务器而不是进行开发的时候，应当不使用内建的开发服务器 （ flask run ）。开发服务器由 Werkzeug 提供，目的是为了方便开发，但是 不够高效、稳定和安全。

替代地，应当选用一个产品级的 WSGI 服务器。例如，使用 Waitress 。首先在 虚拟环境中安装它：

```
pip install waitress
```

需要把应用告知 Waitree ，但是方式与 flask run 那样使用 FLASK_APP 不同。需要告知 Waitree 导入并调用应用工厂来得到一个应用对象。

```
waitress-serve --call flaskr:create_app
```

Serving on http://0.0.0.0:8080
以多种不同方式部署应用的列表参见 部署方式 。使用 Waitress 只是一个示例，选择它是因为它同时支持 Windows 和 Linux 。还有其他许多 WSGI 服务器和部署选项可供选择。



### 蓝印错误处理器
在 使用蓝图进行应用模块化 中，大多数错误处理器会按预期工作，但是处理 404 和 405 错误的处理器比较特殊，要小心。这些错误处理器只有从适当的 raise 语句调用时或者在另一个蓝印在视图函数中调用 abort 时才会调用。相反， 例如非法 URL 访问时，则不会调用。

这是因为蓝印不“拥有”一定的 URL 空间，所以应用实例无法知道非法 URL 访 问应当调用哪个蓝印的错误处理器。如果需要基于 URL 前缀配置不同的处理策略， 那么可以使用 rquest 代理对象在应用层面进行配置。


```Python

from flask import jsonify, render_template

# at the application level
# not the blueprint level
@app.errorhandler(404)
def page_not_found(e):
    # if a request is in our blog URL space
    if request.path.startswith('/blog/'):
        # we return a custom blog 404 page
        return render_template("blog/404.html"), 404
    else:
        # otherwise we return our generic site-wide 404 page
        return render_template("404.html"), 404

@app.errorhandler(405)
def method_not_allowed(e):
    # if a request has the wrong method to our API
    if request.path.startswith('/api/'):
        # we return a json saying so
        return jsonify(message="Method Not Allowed"), 405
    else:
        # otherwise we return a generic site-wide 405 page
        return render_template("405.html"), 405
```


### 将 API 错误作为 JSON 返回

在 Flask 中构建 API 时，一些开发人员意识到内置的异常对于 API 来说表达能 力不够，而且发出的 text/html 内容类型对 API 使用者来说不是 很有用。

使用与上述相同的技术和 jsonify() 我们可以对 API 错误 返回 JSON 格式的响应。 调用 abort() 时，使用 description 参数，错误处理器会把 这个参数的内容作为 JSON 错误信息，并设置状态码为 404 。

```Python
from flask import abort, jsonify

@app.errorhandler(404)
def resource_not_found(e):
    return jsonify(error=str(e)), 404

@app.route("/cheese")
def get_one_cheese():
    resource = get_resource()

    if resource is None:
        abort(404, description="Resource not found")

    return jsonify(resource)

```


我们还可以创建自定义异常类。 例如，我们可以为 API 引入一个新的自定义异常， 该异常可以包含可读性良好的错误消息、状态码以及与错误相关的可选内容。


```Python

from flask import jsonify, request

# InvalidAPIUsage继承Exception
class InvalidAPIUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        super().__init__()
        self.message = message
        # 默认status_code为 400
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

@app.errorhandler(InvalidAPIUsage)
def invalid_api_usage(e):
    return jsonify(e.to_dict()), e.status_code

# an API app route for getting user information
# a correct request might be /api/user?user_id=420
@app.route("/api/user")
def user_api(user_id):
    user_id = request.arg.get("user_id")
    if not user_id:
        raise InvalidAPIUsage("No user id provided!")

    user = get_user(user_id=user_id)
    if not user:
        raise InvalidAPIUsage("No such user!", status_code=404)

    return jsonify(user.to_dict())


# 一个视图现在可以引发带有错误信息的异常。此外，一些额外的内容可以通过 payload 参数，以字典的方式提供。
```




### 日志

when=D： 表示按天进行切分
interval=1： 每天都切分。 比如interval=2就表示两天切分一下。
backupCount=15: 保留15天的日志
encoding=UTF-8: 使用UTF-8的编码来写日志
utc=True: 使用UTC+0的时间来记录 （一般docker镜像默认也是UTC+0）


```Python

import logging
from logging.handlers import TimedRotatingFileHandler


formatter = logging.Formatter(
 
        "[%(asctime)s][%(filename)s:%(lineno)d][%(levelname)s][%(thread)d] - %(message)s")
 
    handler = TimedRotatingFileHandler(
 
        "flask.log", when="D", interval=1, backupCount=15,
 
        encoding="UTF-8", delay=False, utc=True)
 
    app.logger.addHandler(handler)
 
    handler.setFormatter(formatter)
```

在蓝图中使用

```Python
from flask import ( current_app,Blueprint )
bp = Blueprint("test", __name__, url_prefix='/test')
@bp.route('',methods=["GET"])
def test():
  current_app.logger.info('logged in successfully')

```
如果我们想要单独设置蓝图的日志的话

```Python

import logging from flask import Blueprint
bp = Blueprint("test", __name__, url_prefix='/test')
logger = logging.getLogger(__name__) #返回一个新的以文件名为名的logger @bp.route('',methods=["GET"])
def test():
　　 logger.info("this is info")

```



### 蓝图的概念

蓝图的基本概念是：在蓝图被注册到应用之后，所要执行的操作的集合。当分配请求 时， Flask 会把蓝图和视图函数关联起来，并生成两个端点之前的 URL 。

Flask 中的蓝图不是一个可插拨的应用，因为它不是一个真正的应用，而是一套可以 注册在应用中的操作，并且可以注册多次。那么为什么不使用多个应用对象呢？可以 使用多个应用对象（参见 应用调度 ），但是这样会导致每个 应用都使用自己独立的配置，且只能在 WSGI 层中管理应用。

而如果使用蓝图，那么应用会在 Flask 层中进行管理，共享配置，通过注册按需改 变应用对象。蓝图的缺点是一旦应用被创建后，只有销毁整个应用对象才能注销蓝图。


```Python
from flask import Blueprint, render_template, abort
from jinja2 import TemplateNotFound

simple_page = Blueprint('simple_page', __name__,
                        template_folder='templates')

@simple_page.route('/', defaults={'page': 'index'})
@simple_page.route('/<page>')
def show(page):
    try:
        return render_template(f'pages/{page}.html')
    except TemplateNotFound:
        abort(404)

'''
当你使用 @simple_page.route 装饰器绑定一个函数时，蓝图会记录下所登记的 show 函数。当以后在应用中注册蓝图时，这个函数会被注册到应用中。另外，它 会把构建 Blueprint 时所使用的名称（在本例为 simple_page ）作 为函数端点的前缀。蓝图的名称不修改 URL ，只修改端点。
'''        
```

### 注册蓝图

```Python
from flask import Flask
from yourapplication.simple_page import simple_page

app = Flask(__name__)
app.register_blueprint(simple_page)
```
以下是注册蓝图后形成的规则:

```
app.url_map
Map([<Rule '/static/<filename>' (HEAD, OPTIONS, GET) -> static>,
 <Rule '/<page>' (HEAD, OPTIONS, GET) -> simple_page.show>,
 <Rule '/' (HEAD, OPTIONS, GET) -> simple_page.show>])
```


### 嵌套蓝图

```Python
parent = Blueprint('parent', __name__, url_prefix='/parent')
child = Blueprint('child', __name__, url_prefix='/child')
parent.register_blueprint(child)
app.register_blueprint(parent)
```

子蓝图会把父蓝图的名称作为其前缀，子 URL 也会把父 URL 作为前缀。


```Python
url_for('parent.child.create')
/parent/child/create
```


### 蓝图资源

和普通应用一样，蓝图一般都放在一个文件夹中。虽然多个蓝图可以共存于同一个文 件夹中，但是最好不要这样做。

文件夹由 Blueprint 的第二个参数指定，通常为 __name__ 。这个参数 指定与蓝图相关的逻辑 Python 模块或包。如果这个参数指向的是实际的 Python 包 （文件系统中的一个文件夹），那么它就是资源文件夹。如果是一个模块，那么这个 模块包含的包就是资源文件夹。可以通过 Blueprint.root_path 属性来查 看蓝图的资源文件夹:

可以使用 open_resource() 函数快速打开这个文件夹中的资源:

```Python
with simple_page.open_resource('static/style.css') as f:
    code = f.read()
```


### 静态文件

蓝图的第三个参数是 static_folder 。这个参数用以指定蓝图的静态文件所在的 文件夹，它可以是一个绝对路径也可以是相对路径。:

```Python
admin = Blueprint('admin', __name__, static_folder='static')
```

缺省情况下，路径最右端的部分是在 URL 中暴露的部分。这可以通过 static_url_path 来改变。因为上例中的文件夹为名称是 static ，那么 URL 应该是蓝图的 url_prefix 加上 /static 。 如果蓝图注册前缀为 /admin ，那么静态文件 URL 就是 /admin/static 。

端点的名称是 blueprint_name.static 。你可以像对待应用中的文件夹一样 使用 url_for() 来生成其 URL:


```Python
url_for('admin.static', filename='style.css')
```

但是，如果蓝图没有 url_prefix ，那么不可能访问蓝图的静态文件夹。 这是因为在这种情况下，URL应该是 / static ，而应用程序的 / static 路线优先。与模板文件夹不同，如果文件不存在于应用静态文件夹中，那么不会 搜索蓝图静态文件夹。


### 模板

如果你想使用蓝图来暴露模板，那么可以使用 Blueprint 的 template_folder 参数:

```Python
admin = Blueprint('admin', __name__, template_folder='templates')
```

对于静态文件，路径可以是绝对的或相对于蓝图的资源文件夹。

模板文件夹被添加到模板的搜索路径，但优先级低于实际应用的模板文件夹。这样就 可以轻松地重载在实际应用中蓝图提供的模板。这也意味着如果你不希望蓝图模板出 现意外重写，那么就要确保没有其他蓝图或实际的应用模板具有相同的相对路径。 多个蓝图提供相同的相对路径时，第一个注册的优先。

假设你的蓝图便于 yourapplication/admin 中，要渲染的模板是 'admin/index.html' ， template_folder 参数值为 templates ，那么 真正的模板文件为： yourapplication/admin/templates/admin/index.html 。多出一个 admin 文件夹是为了避免模板被实际应用模板文件夹中的 index.html 重载。

更详细一点说：如果你有一个名为 admin 的蓝图，该蓝图指定的模版文件是 index.html ，那么最好按照如下结构存放模版文件:


这样，当你需要渲染模板的时候就可以使用 admin/index.html 来找到模板。 如果没有载入正确的模板，那么应该启用 EXPLAIN_TEMPLATE_LOADING 配置变量。 启用这个变量以后，每次调用 render_template 时， Flask 会打印出定位模板的 步骤，方便调试。
```
yourpackage/
    blueprints/
        admin/
            templates/
                admin/
                    index.html
            __init__.py
```

### 蓝图出错处理器

蓝图像 Flask 应用对象一样支持 errorhandler 装饰器，所以很容易 使用蓝图特定的自定义错误页面。

下面是 “404 Page Not Found” 异常的例子:

```Python
@simple_page.errorhandler(404)
def page_not_found(e):
    return render_template('pages/404.html')

```
大多数错误处理器会按预期工作。然而，有一个涉及 404 和 405 例外处理器的警示。 这些错误处理器只会由一个适当的 raise 语句引发或者调用在另一个蓝图视图 中调用 abort 引发。它们不会引发于无效的 URL 访问。这是因为蓝图不“拥有” 特定的 URL 空间，在发生无效 URL 访问时，应用实例无法知道应该运行哪个蓝图错 误处理器。 如果你想基于 URL 前缀执行不同的错误处理策略，那么可以 在应用层使用 request 代理对象定义它们:

```Python
@app.errorhandler(404)
@app.errorhandler(405)
def _handle_api_error(ex):
    if request.path.startswith('/api/'):
        return jsonify(error=str(ex)), ex.code
    else:
        return ex
```

### 环境

Flask 应用所运行的环境由 FLASK_ENV 环境变更指定。如果配置该变量， 那么缺省为 production 。另一个可用的环境值是 development 。 Flask 和扩展可能基于环境不同而改变行为。

如果环境是 development ， flask 命令会开启调试模式并且 flask run 会开启交互调试器和重启器。


```CMD
 set FLASK_ENV=development
> flask run
 * Serving Flask app "hello"
 * Environment: development
 * Debug mode: on
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
 * Restarting with inotify reloader
 * Debugger is active!
 * Debugger PIN: 223-456-919
```

### 用重启器监视额外文件

当使用开发模式时，您的 Python 代码或者导入模块发生变动时会触发重启器。 如果使用 --extra-files 参数或者设置 FLASK_RUN_EXTRA_FILES 环境变量，那么重启器可以监视额外的文件。多重路径使用 : 分隔， Windows 下使用 ; 分隔。

```CMD
> flask run --extra-files file1:dirA/file2:dirB/
# or
> set FLASK_RUN_EXTRA_FILES=file1:dirA/file2:dirB/
> flask run
 * Running on http://127.0.0.1:8000/
 * Detected change in '/path/to/file1', reloading
```

### 让重启器忽略文件
重启器可以忽略文件，方法是通过 --exclude-patterns 参数使用 fnmatch 模式。也可以使用 FLASK_RUN_EXCLUDE_PATTERNS 环境变量。 多模式使用 : 分隔， Windows 系统下使用 ; 分隔。

### 调试模式

如前文所述，当 FLASK_ENV 是 development 时会开启调试模式。 如果想要单独控制调试模式，要使用 FLASK_DEBUG 。值为 1 表示开启， 0 表示关闭。

### 通过 dotenv 设置环境变量

与其每次打开新的终端都要设置 FLASK_APP ，不如使用 Flask 的 dotenv 支持 功能自动设置环境变量。

如果 python-dotenv 已安装，那么运行 flask 会根据 .env 和 .flaskenv 中配置来设置环境变量。这样可以在每次打开 终端后，避免手动设置 FLASK_APP 和其他类似使用环境变量进行配置的服务部署 工作。

命令行设置的变量会重载 .env 中的变量， .env 中的变量会重载 .flaskenv 中的变量。 .flaskenv 应当用于公共变量，如 FLASK_APP 而 .env 则应用用于私有变量，并且不提交到储存库。

为了找到定位文件，将会从运行 flask 的文件夹向上扫描文件夹。 当前工作目录将被设置为文件的位置，假定这是最高级别的项目文件夹。

这些文件只能由``flask``命令或调用 run() 加载。如果想在生产运 行时加载这些文件，你应该手动调用 load_dotenv() 。


### 插件

Flask 会自动载入在 flask.commands entry point 定义的命令。这样有助 于扩展在安装时添加命令。入口点在 setup.py 中定义:
一旦该软件包与 Flask 项目安装在相同的 virtualenv 中，你可以运行 flask my-command 来调用该命令。
```Python
from setuptools import setup

setup(
    name='flask-my-extension',
    ...,
    entry_points={
        'flask.commands': [
            'my-command=flask_my_extension.commands:cli'
        ],
    },
)
在 flask_my_extension/commands.py 内可以导出一个 Click 对象:

import click

@click.command()
def cli():
    ...
```

在 shell 中创建一个正确的请求情境的最简便的方法是使用 test_request_context 方法。这个方法会创建一个 RequestContext ：
```
ctx = app.test_request_context()
```
通常你会使用 with 语句来激活请求对象，但是在 shell 中，可以简便地手动使用 push() 和 pop() 方法：
ctx.push(),从这里开始，直到调用 pop 之前，你可以使用请求对象：ctx.pop()

仅仅创建一个请求情境还是不够的，需要在请求前运行的代码还是没有运行。比如， 在请求前可以会需要转接数据库，或者把用户信息储存在 g 对象中。

### 视图装饰器
Python 有一个非常有趣的功能：函数装饰器。这个功能可以使网络应用干净整洁。 Flask 中的每个视图都是一个装饰器，它可以被注入额外的功能。你可能已经用过了 route() 装饰器。但是，你有可能需要使用你自己的装饰器。 假设有一个视图，只有已经登录的用户才能使用。如果用户访问时没有登录，则会被 重定向到登录页面。这种情况下就是使用装饰器的绝佳机会。

下面是检查登录装饰器的例子。假设登录页面为 'login' ，当前用户被储存在 g.user 中，如果还没有登录，其值为 None:

```Python
from functools import wraps
from flask import g, request, redirect, url_for

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None:
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function


# 为了使用这个装饰器呢，需要把这个装饰器放在最靠近函数的地方。当使用更进一步 的装饰器时，请记住要把 route() 装饰器放在最外面:

@app.route('/secret_page')
@login_required
def secret_page():
    pass
```


### 缓存装饰器

假设有一个视图函数需要消耗昂贵的计算成本，因此你需要在一定时间内缓存这 个视图的计算结果。这种情况下装饰器是一个好的选择。我们假设你像 缓存 方案中一样设置了缓存。

下面是一个示例缓存函数。它根据一个特定的前缀（实际上是一个格式字符串） 和请求的当前路径生成缓存键。注意，我们先使用了一个函数来创建装饰器，这 个装饰器用于装饰函数。听起来拗口吧，确实有一点复杂，但是下面的示例代码 还是很容易读懂的。

被装饰代码按如下步骤工作

* 基于当前路径获得当前请求的唯一缓存键。

* 从缓存中获取键值。如果获取成功则返回获取到的值。

* 否则调用原来的函数，并把返回值存放在缓存中，直至过期（缺省值为五分钟）。

代码:

```Python
from functools import wraps
from flask import request

def cached(timeout=5 * 60, key='view/{}'):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            cache_key = key.format(request.path)
            rv = cache.get(cache_key)
            if rv is not None:
                return rv
            rv = f(*args, **kwargs)
            cache.set(cache_key, rv, timeout=timeout)
            return rv
        return decorated_function
    return decorator
```


### 惰性载入视图


Flask 通常使用装饰器。装饰器简单易用，只要把 URL 放在相应的函数的前面就 可以了。但是这种方式有一个缺点：使用装饰器的代码必须预先导入，否则 Flask 就无法真正找到你的函数。

当你必须快速导入应用时，这就会成为一个问题。在 Google App Engine 或其他 系统中，必须快速导入应用。因此，如果你的应用存在这个问题，那么必须使用 集中 URL 映射。

add_url_rule() 函数用于集中 URL 映射，与使用装饰器不 同的是你需要一个设置应用所有 URL 的专门文件。


转换为集中 URL 映射，假设有如下应用:

```Python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def index():
    pass

@app.route('/user/<username>')
def user(username):
    pass
```

为了集中映射，我们创建一个不使用装饰器的文件（ views.py ）:


```Python
def index():
    pass

def user(username):
    pass
```
在另一个文件中集中映射函数与 URL:

```Python
from flask import Flask
from yourapplication import views
app = Flask(__name__)
app.add_url_rule('/', view_func=views.index)
app.add_url_rule('/user/<username>', view_func=views.user)
```


### 延迟载入

至此，我们只是把视图与路由分离，但是模块还是预先载入了。理想的方式是按 需载入视图。下面我们使用一个类似函数的辅助类来实现按需载入:


```Python
from werkzeug.utils import import_string, cached_property

class LazyView(object):

    def __init__(self, import_name):
        self.__module__, self.__name__ = import_name.rsplit('.', 1)
        self.import_name = import_name

    @cached_property
    def view(self):
        return import_string(self.import_name)

    def __call__(self, *args, **kwargs):
        return self.view(*args, **kwargs)
```

上例中最重要的是正确设置 __module__ 和 __name__ ，它被用于在不提供 URL 规则的情况下正确命名 URL 规则。

然后可以这样集中定义 URL 规则:


```Python
from flask import Flask
from yourapplication.helpers import LazyView
app = Flask(__name__)
app.add_url_rule('/',
                 view_func=LazyView('yourapplication.views.index'))
app.add_url_rule('/user/<username>',
                 view_func=LazyView('yourapplication.views.user'))
```    

还可以进一步优化代码：写一个函数调用 add_url_rule() ， 加上应用前缀和点符号。:

```Python
def url(import_name, url_rules=[], **options):
    view = LazyView(f"yourapplication.{import_name}")
    for url_rule in url_rules:
        app.add_url_rule(url_rule, view_func=view, **options)

# add a single route to the index view
url('views.index', ['/'])

# add two routes to a single function endpoint
url_rules = ['/user/','/user/<username>']
url('views.user', url_rules)
```


* 在Python Flask中，请求缓存和视图缓存是两种不同的缓存机制，它们具有以下区别：

  * 请求缓存
  请求缓存指的是在一个请求期间缓存某些数据，以便在该请求的后续阶段使用这些数据，从而避免重复计算。例如，您可以使用@flask.request_cache装饰器来将函数标记为需要请求缓存，从而启用请求缓存。

  * 请求缓存的主要特点如下：
  请求缓存只在当前请求的上下文中有效，不会跨请求共享。
  请求缓存中的数据只在同一请求期间保持有效，一旦请求结束，缓存数据也会被清空。
  请求缓存非常适合临时保存计算结果，避免重复计算。

  * 视图缓存
  视图缓存是指将Flask应用程序视图函数的响应缓存在内存中，以提高性能并减少响应时间。当访问相同的URL时，直接从缓存中返回响应而不是重新生成响应。

  * 视图缓存的主要特点如下：
  视图缓存适用于频繁访问不变的页面或资源。
  视图缓存将响应缓存在内存中，因此可以大大减少应用程序的响应时间。
  视图缓存可以通过配置选项来启用或禁用，也可以使用Flask-Caching等扩展包进行更高级的控制。
  综上所述，请求缓存和视图缓存是两种不同的缓存机制，它们具有不同的作用和特点。您可以根据应用程序的需要选择相应的缓存机制来提高性能和响应速度。



### 全局缓存配置和局部缓存配置

全局配置于局部配置的区别在于cache.init_app(app)

```Python
from flask import Flask
from flask_caching import Cache

app = Flask(__name__)
cache = Cache(config={'CACHE_TYPE': 'simple'})
cache.init_app(app)

@app.route('/')
@cache.cached(timeout=300)  # 缓存5分钟
def index():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run()

```
对于局部缓存配置，您可以手动创建一个名为 cache 的缓存实例，并使用 cached 方法来装饰需要缓存的视图函数，不需要调用 cache.init_app(app) 方法。如以下示例所示：

```Python
from flask import Blueprint
from flask_caching import Cache

bp = Blueprint('auth', __name__)
cache = Cache(config={'CACHE_TYPE': 'simple'})

@bp.route('/login')
@cache.cached(timeout=300)  # 缓存5分钟
def login():
    # ...
    pass
```
需要注意的是，如果使用全局缓存配置，则在视图函数中必须使用 cache 对象的 cached 方法来指定需要缓存的函数及其缓存时间。而在局部缓存配置中，则可以直接使用 cache.cached() 装饰器来实现同样的功能。

另外，请根据您的需求选择适合的缓存类型和其他配置选项。您可以参考 Flask-Caching 文档：https://flask-caching.readthedocs.io/en/latest/



流文件下载指的是将文件分块传输而非一次性传输完整文件。在 Flask 中，可以使用 send_file 函数实现流文件下载。

以下是一个例子：

```python
from flask import Flask, send_file

app = Flask(__name__)

@app.route('/download')
def download_file():
    # 以 stream 方式读取文件
    path = 'path/to/file'
    return send_file(path, as_attachment=True, attachment_filename='filename.ext', mimetype='application/octet-stream', conditional=True)

if __name__ == '__main__':
    app.run()
```

具体解释如下：

as_attachment=True 表示强制附件下载；
attachment_filename 参数表示下载时显示的文件名；
mimetype 参数表示文件类型；
conditional=True 表示启用条件请求，即只有当客户端缓存中没有该文件或文件已经更新时才发送文件。
使用这个函数时，Flask会自动将文件以流形式返回给客户端，客户端则会根据每次接收到的数据块大小逐步组合成完整文件。

注意：由于是分块传输，所以响应头部的 Content-Length 字段不再表示总文件大小；同时，如果要支持断点续传等功能，需要在响应头部加入相关信息。