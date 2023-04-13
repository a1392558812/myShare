import pytest
from flask import g, session
from flaskr.db import get_db


'''
register 视图应当在 GET 请求时渲染成功。 在 POST 请求中，表单数据合法时，该视图应当重定向到登录 URL ，并且用户 的数据已在数据库中保存好。数据非法时，应当显示出错信息。


client.get() 制作一个 GET 请求并 由 Flask 返回 Response 对象。类似的 client.post() 制作一个 POST 请求， 转换 data 字典为表单数据。

为了测试页面是否渲染成功，制作一个简单的请求，并检查是否返回 一个 200 OK status_code 。如果渲染失败， Flask 会返回一个 500 Internal Server Error 代码。

当注册视图重定向到登录视图时， headers 会有一个包含登 录 URL 的 Location 头部。

data 以字节方式包含响应体。如果想要检测渲染页面中 的某个值，请在 data 中检测。字节值只能与字节值作比较，如果想比较文 本，请使用 get_data(as_text=True) 。

pytest.mark.parametrize 告诉 Pytest 以不同的参数运行同一个测试。 这里用于测试不同的非法输入和出错信息，避免重复写三次相同的代码。



@pytest.mark.parametrize()基本用法
数据驱动 ：其实就是把我们测试用例的数据放到excel，yaml，csv，mysql，然后通过去改变数据达到改变测试用例的执行结果 。
@pytest.mark.parametrize(args_name,args_value)
args_name：参数名，字符串，多个参数中间用逗号隔开
args_value：参数值（列表，元组，字典列表，字典元组），有多个值用例就会执行多少次，是list,多组数据用元祖类型;传三个或更多参数也是这样传。list的每个元素都是一个元组，元组里的每个元素和按参数顺序一一对应

例如：
1、传一个参数 @pytest.mark.parametrize('参数名'，list) 进行参数化
2、传两个参数@pytest.mark.parametrize('参数名1，参数名2'，[(参数1_data[0], 参数2_data[0]),(参数1_data[1], 参数2_data[1])]) 进行参数化

'''

def test_register(client, app):
    # 断言get请求一定是200渲染页面，然后去执行注册，'username': 'a', 'password': 'a'
    assert client.get('/auth/register').status_code == 200
    response = client.post(
        '/auth/register', data={'username': 'a', 'password': 'a'}
    )
    assert response.headers["Location"] == "/auth/login"

    with app.app_context():
        # 完成注册断言一定能够查询出唯一一条用户记录
        assert get_db().execute(
            "SELECT * FROM user WHERE username = 'a'",
        ).fetchone() is not None


@pytest.mark.parametrize(('username', 'password', 'message'), (
    ('', '', b'Username is required.'),
    ('a', '', b'Password is required.'),
    ('test', 'test', b'already registered'),
))
def test_register_validate_input(client, username, password, message):
    response = client.post(
        '/auth/register',
        data={'username': username, 'password': password}
    )
    assert message in response.data

'''
在 with 块中使用 client ，可以在响应返回之后操作环境变量，比如 session 。 通常，在请求之外操作 session 会引发一个异常。
'''

def test_login(client, auth):
    assert client.get('/auth/login').status_code == 200
    response = auth.login()
    assert response.headers["Location"] == "/"

    with client:
        client.get('/')
        assert session['user_id'] == 1
        assert g.user['username'] == 'test'


@pytest.mark.parametrize(('username', 'password', 'message'), (
    ('a', 'test', b'Incorrect username.'),
    ('test', 'a', b'Incorrect password.'),
))
def test_login_validate_input(auth, username, password, message):
    response = auth.login(username, password)
    assert message in response.data


# logout 测试与 login 相反。注销之后， session 应当不包含 user_id 。

def test_logout(client, auth):
    auth.login()

    with client:
        auth.logout()
        assert 'user_id' not in session


'''
所有博客视图使用之前所写的 auth 固件。调用 auth.login() ，并且客户端的后继请求会登录为 test 用户。

index 索引视图应当显示已添加的测试帖子数据。作为作者登录之后，应当有 编辑博客的连接。

当测试 index 视图时，还可以测试更多验证行为。当没有登录时，每个页面 显示登录或注册连接。当登录之后，应当有一个注销连接。
'''