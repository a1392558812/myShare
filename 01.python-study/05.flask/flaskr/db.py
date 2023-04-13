import sqlite3

import click
from flask import current_app, g

# g 是一个特殊对象，独立于每一个请求。在处理请求过程中，它可以用于储存 可能多个函数都会用到的数据。
# 把连接储存于其中，可以多次使用，而不用在同一个 请求中每次调用 get_db 时都创建一个新的连接。

# current_app 是另一个特殊对象，该对象指向处理请求的 Flask 应用。这里 使用了应用工厂，那么在其余的代码中就不会出现应用对象。
# 当应用创建后，在处理 一个请求时， get_db 会被调用。这样就需要使用 current_app 。

# sqlite3.connect() 建立一个数据库连接，该连接指向配置中的 DATABASE 指定的文件。这个文件现在还没有建立，后面会在初始化数据库的时候建立该文件。

# sqlite3.Row 告诉连接返回类似于字典的行，这样可以通过列名称来操作 数据。

# close_db 通过检查 g.db 来确定连接是否已经建立。如果连接已建立，那么 就关闭连接。以后会在应用工厂中告诉应用 close_db 函数，这样每次请求后就会 调用它。
from flask.cli import with_appcontext


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db


def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()


def init_db():
    db = get_db()

    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))


# open_resource() 打开一个文件，该文件名是 相对于 flaskr 包的。这样就不需要考虑以后应用具体部署在哪个位置。 get_db 返回一个数据库连接，用于执行文件中的命令。
# click.command() 定义一个名为 init-db 命令行，它调用 init_db 函数，并为用户显示一个成功的消息。 

@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')

# close_db 和 init_db_command 函数需要在应用实例中注册，否则无法使用。 然而，既然我们使用了工厂函数，
# 那么在写函数的时候应用实例还无法使用。代替地， 我们写一个函数，把应用作为参数，在函数中进行注册。
def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)