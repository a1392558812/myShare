'''
然而，当项目越来越大的时候，把所有代码放在单个文件中就有点不堪重负了。 Python 项目使用 包 来管理代码，把代码分为不同的模块，然后在需要的地方导入 模块。本教程也会按这一方式管理代码。

教程项目包含如下内容:

flaskr/ ，一个包含应用代码和文件的 Python 包。

tests/ ，一个包含测试模块的文件夹。

venv/ ，一个 Python 虚拟环境，用于安装 Flask 和其他依赖的包。

告诉 Python 如何安装项目的安装文件。

版本控制配置，如 git 。不管项目大小，应当养成使用版本控制的习惯。

项目需要的其他文件。

最后，项目布局如下：

/home/user/Projects/flask-tutorial
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
如果使用了版本控制，那么应当忽略运行项目时产生的临时文件以及编辑代码时编辑 器产生的临时文件。忽略文件的基本原则是：不是你自己写的文件就可以忽略。举例 来说，假设使用 git 来进行版本控制，那么使用 .gitignore 来设置应当忽略 的文件， .gitignore 文件应当与下面类似:

.gitignore
venv/

*.pyc
__pycache__/

instance/

.pytest_cache/
.coverage
htmlcov/

dist/
build/
*.egg-info/
'''
