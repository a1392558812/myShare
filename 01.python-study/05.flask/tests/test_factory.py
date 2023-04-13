'''
工厂本身没有什么好测试的，其大部分代码会被每个测试用到。因此如果工厂代码 有问题，那么在进行其他测试时会被发现。

唯一可以改变的行为是传递测试配置。如果没传递配置，那么会有一些缺省配置可 用，否则配置会被重载。
'''

from flaskr import create_app


def test_config():
    assert not create_app().testing
    assert create_app({'TESTING': True}).testing


def test_hello(client):
    response = client.get('/hello')
    assert response.data == b'Hello, World!'