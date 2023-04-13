from flask import (Blueprint, flash, g, redirect, render_template, request, url_for)
from werkzeug.exceptions import abort

from flaskr.auth import login_required
from flaskr.db import get_db

bp = Blueprint('blog', __name__)


@bp.route('/')
def index():
    db = get_db()
    posts = db.execute(
        'SELECT p.id, title, body, created, author_id, username'
        ' FROM post p JOIN user u ON p.author_id = u.id'
        ' ORDER BY created DESC'
    ).fetchall()
    return render_template('blog/index.html', posts=posts)



@bp.route('/create', methods=('GET', 'POST'))
@login_required
def create():
    if request.method == 'POST':
        title = request.form['title']
        body = request.form['body']
        error = None

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'INSERT INTO post (title, body, author_id)'
                ' VALUES (?, ?, ?)',
                (title, body, g.user['id'])
            )
            db.commit()
            return redirect(url_for('blog.index'))

    return render_template('blog/create.html')



'''
update 和 delete 视图都需要通过 id 来获取一个 poster ，并且 检查作者与登录用户是否一致。为避免重复代码，可以写一个函数来获取 poster ， 并在每个视图中调用它。
'''

def get_post(id, check_author=True):
    post = get_db().execute(
        'SELECT p.id, title, body, created, author_id, username'
        ' FROM post p JOIN user u ON p.author_id = u.id'
        ' WHERE p.id = ?',
        (id,)
    ).fetchone()

    if post is None:
        abort(404, f"Post id {id} doesn't exist.")

    if check_author and post['author_id'] != g.user['id']:
        abort(403)

    return post





'''
和所有以前的视图不同， update 函数有一个 id 参数。该参数对应路由中 的 <int:id> 。

一个真正的 URL 类似 /1/update 。 Flask 会捕捉到 URL 中的 1 ，确保其为一个 int ，并将其作为 id 参数传递给视图。 

如果没有指定 int: 而是仅仅写了 <id> ，那么将会传递一个字符串。 要生成一个指向更新页面的 URL ，

需要传递 id 参数给 url_for() ： url_for('blog.update', id=post['id']) 。前文的 index.html 文件中 同样如此。

create 和 update 视图看上去是相似的。 主要的不同之处在于 update 视图使用了一个 post 对象和一个 UPDATE 查询代替了一个 INSERT 查询。

作为一个明智的重构者，可以使用 一个视图和一个模板来同时完成这两项工作。但是作为一个初学者，把它们分别处理 要清晰一些。
'''

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    post = get_post(id)

    if request.method == 'POST':
        title = request.form['title']
        body = request.form['body']
        error = None

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'UPDATE post SET title = ?, body = ?'
                ' WHERE id = ?',
                (title, body, id)
            )
            db.commit()
            return redirect(url_for('blog.index'))

    return render_template('blog/update.html', post=post)


'''
删除视图没有自己的模板。删除按钮已包含于 update.html 之中，该按钮指向 /<id>/delete URL 。既然没有模板，该视图只处理 POST 方法并重定向到 index 视图。
'''

@bp.route('/<int:id>/delete', methods=('POST',))
@login_required
def delete(id):
    get_post(id)
    db = get_db()
    db.execute('DELETE FROM post WHERE id = ?', (id,))
    db.commit()
    return redirect(url_for('blog.index'))


'''
可自定义异常错误处理

@blog.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

# or with register_error_handler
blog.register_error_handler(500, internal_server_error)
'''