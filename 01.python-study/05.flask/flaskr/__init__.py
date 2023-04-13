import os

from flask import Flask
import logging
from logging.handlers import TimedRotatingFileHandler

def create_app(test_config=None):
    # create and configure the app
    # app = Flask(__name__, instance_relative_config=True) 创建 Flask 实例。
    # __name__ 是当前 Python 模块的名称。应用需要知道在哪里设置路 径，使用 __name__ 是一个方便的方法。
    # instance_relative_config=True 告诉应用配置文件是相对于 instance folder 的相对路径。实例文件 夹在 flaskr 包的外面，
    # 用于存放本地数据（例如配置密钥和数据 库），不应当提交到版本控制系统。


    # app.config.from_mapping() 设置一个应 用的缺省配置：
    # SECRET_KEY 是被 Flask 和扩展用于保证数据安全的。在开发 过程中，为了方便可以设置为 'dev' ，但是在发布的时候应当使用 一个随机值来重载它。
    # DATABASE SQLite 数据库文件存放在路径。它位于 Flask 用于存放 实例的 app.instance_path 之内。


    # app.config.from_pyfile() 使用 config.py 中的值来重载缺省配置，如果 config.py 存在的话。 例如，当正式部署的时候，用于设置一个正式的 SECRET_KEY 。
    # test_config 也会被传递给工厂，并且会替代实例配置。这样可以 实现测试和开发的配置分离，相互独立。

    # os.makedirs() 可以确保 app.instance_path 存在。 Flask 不会自 动创建实例文件夹，但是必须确保创建这个文件夹，因为 SQLite 数据库文 件会被保存在里面。

    # @app.route() 创建一个简单的路由，这样在继续教 程下面的内容前你可以先看看应用如何运行的。它创建了 URL /hello 和一个函数之间的关联。
    # 这个函数会返回一个响应，即一个 'Hello, World!' 字符串。

    app = Flask(__name__, instance_relative_config=True)

    formatter = logging.Formatter(
 
        "[%(asctime)s][%(filename)s:%(lineno)d][%(levelname)s][%(thread)d] - %(message)s")
 
    handler = TimedRotatingFileHandler(
 
        "flask.log", when="D", interval=1, backupCount=15,
 
        encoding="UTF-8", delay=False, utc=True)
 
    app.logger.addHandler(handler)
 
    handler.setFormatter(formatter)


    app.config.from_mapping(SECRET_KEY='dev',DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),)
    app.debug = True


    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, World!'
    

    # 在工厂中导入并调用这个db函数。在工厂函数中把新的代码放到 函数的尾部，返回应用代码的前面。
    from . import db
    db.init_app(app)


    # 认证蓝图将包括注册新用户、登录和注销视图。
    from . import auth
    app.register_blueprint(auth.bp)


    from . import blog
    app.register_blueprint(blog.bp)
    app.add_url_rule('/', endpoint='index')


    from . import error
    app.register_blueprint(error.bp)
    app.register_error_handler(404, error.page_not_found)
    app.register_error_handler(500, error.internal_server_error)

    '''
    与验证蓝图不同，博客蓝图没有 url_prefix 。因此 index 视图会用于 / ， create 会用于 /create ，以此类推。
    
    博客是 Flaskr 的主要 功能，因此把博客索引作为主索引是合理的。

    但是，下文的 index 视图的端点会被定义为 blog.index 。一些验证视图 会指定向普通的 index 端点。 我们使用 app.add_url_rule() 关联端点名称 'index' 和 / URL ，这样 url_for('index') 或 url_for('blog.index') 都会有效，会生成同样的 / URL 。

    在其他应用中，可能会在工厂中给博客蓝图一个 url_prefix 并定义一个独立的 index 视图，类似前文中的 hello 视图。在这种情况下 index 和 blog.index 的端点和 URL 会有所不同。
    '''


    '''
    现在 init-db 已经在应用中注册好了，可以与 flask 命令一起使用了。 使用的方式与前一页的 run 命令类似。

    Note
    如果你还在运行着前一页的服务器，那么现在要么停止该服务器，要么在新 的终端中运行这个命令。如果是新的终端请记住在进行项目文件夹并激活环 境，
    参见 安装 。同时还要像前一页所述设置 FLASK_APP 和 FLASK_ENV 。

    运行 init-db 命令：

    $ flask init-db
    Initialized the database.
    现在会有一个 flaskr.sqlite 文件出现在项目所在文件夹的 instance 文件夹中。
    '''

    '''
    视图是一个应用对请求进行响应的函数。 Flask 通过模型把进来的请求 URL 匹配到 对应的处理视图。视图返回数据， Flask 把数据变成出去的响应。 Flask 也可以反 过来，根据视图的名称和参数生成 URL 。
    '''
    return app