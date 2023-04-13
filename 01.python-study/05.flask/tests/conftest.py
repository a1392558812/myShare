import os
import tempfile

import pytest
from flaskr import create_app
from flaskr.db import get_db, init_db



with open(os.path.join(os.path.dirname(__file__), 'data.sql'), 'rb') as f:
    _data_sql = f.read().decode('utf8')



'''
简单粗鄙的理解pytest.fixture，相当于自执行函数，
在其他函数中，传入该函数名，则会子执行性调用执行
'''
@pytest.fixture
def app():
    
    '''
    tempfile.mkstemp() 创建并打开一个临时文件，返回该文件描述符和路径。 
    
    DATABASE 路径被重载，这样它会指向临时路径，而不是实例文件夹。设置好 路径之后，数据库表被创建，然后插入数据。测试结束后，临时文件会被关闭并 删除。
    '''
    db_fd, db_path = tempfile.mkstemp()

    app = create_app({
        'TESTING': True,   # TESTING 告诉 Flask 应用处在测试模式下。 Flask 会改变一些内部行为 以方便测试。其他的扩展也可以使用这个标志方便测试。
        'DATABASE': db_path,
    })
    '''
      app.app_context,
    '''
    with app.app_context():
        init_db()
        get_db().executescript(_data_sql)

    yield app

    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    return app.test_client() # client 固件调用 app.test_client() 由 app 固件创建的应用 对象。测试会使用客户端来向应用发送请求，而不用启动服务器。


@pytest.fixture
def runner(app):
    return app.test_cli_runner() # runner 固件类似于 client 。 app.test_cli_runner() 创建一个运行器， 可以调用应用注册的 Click 命令。


'''
Pytest 通过匹配固件函数名称和测试函数的参数名称来使用固件。例如 下面要写 test_hello 函数有一个 client 参数。 Pytest 会匹配 client 固件函数，调用该函数，把返回值传递给测试函数。
'''




# 对于大多数视图，用户需要登录。在测试中最方便的方法是使用客户端制作一个 POST 请求发送给 login 视图。
# 
# 与其每次都写一遍，不如写一个类，用 类的方法来做这件事，并使用一个固件把它传递给每个测试的客户端。
# 
# 通过 auth 固件，可以在调试中调用 auth.login() 登录为 test 用户。这个用户的数据已经在 app 固件中写入了数据。


class AuthActions(object):
    def __init__(self, client):
        self._client = client

    def login(self, username='test', password='test'):
        return self._client.post(
            '/auth/login',
            data={'username': username, 'password': password}
        )

    def logout(self):
        return self._client.get('/auth/logout')


@pytest.fixture
def auth(client):
    return AuthActions(client)