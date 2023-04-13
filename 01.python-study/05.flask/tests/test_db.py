# 在一个应用环境中，每次调用 get_db 都应当返回相同的连接。退出环境后， 连接应当已关闭。
import sqlite3

import pytest
from flaskr.db import get_db


def test_get_close_db(app):
    with app.app_context():
        db = get_db()
        assert db is get_db()

    with pytest.raises(sqlite3.ProgrammingError) as e:
        db.execute('SELECT 1')

    assert 'closed' in str(e.value)


# init-db 命令应当调用 init_db 函数并输出一个信息。

# 这个测试使用 Pytest’s monkeypatch 固件来替换 init_db 函数。 runner 固件用于通过名称调用 init-db 命令。
def test_init_db_command(runner, monkeypatch):
    class Recorder(object):
        called = False

    def fake_init_db():
        Recorder.called = True

    monkeypatch.setattr('flaskr.db.init_db', fake_init_db)
    result = runner.invoke(args=['init-db'])
    assert 'Initialized' in result.output
    assert Recorder.called

