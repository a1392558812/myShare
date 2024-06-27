export default {
  name: '01.python-study',
  children: [
    { name: '38.study.py' },
    { name: '37.study.py' },
    { name: '36.study.py' },
    { name: '35.元类.py' },
    { name: '34.study.py' },
    { name: '33.study.py' },
    { name: '32.study.py' },
    { name: '31.study.py' },
    { name: '30.study.py' },
    { name: '29.study.py' },
    { name: '28.study.py' },
    { name: '27.study.py' },
    { name: '26.study.py' },
    { name: '25.study.py' },
    { name: '24.study.py' },
    { name: '23.study.py' },
    { name: '22.study.py' },
    { name: '21.study.py' },
    { name: '20.study.py' },
    { name: '19.study.py' },
    { name: '18.study.py' },
    { name: '17.study.py' },
    { name: '16.study.py' },
    { name: '15.study.py' },
    { name: '14.study.py' },
    { name: '13.星号与双星号.py' },
    { name: '12.study.py' },
    { name: '11.study.py' },
    { name: '10.study.py' },
    { name: '09.study.py' },
    { name: '08.study.py' },
    { name: '07.study.py' },
    { name: '06.study.py' },
    { name: '05.study.py' },
    { name: '04.study.py' },
    { name: '03.study.py' },
    { name: '02.study.py' },
    { name: '01.study.py' },
    {
      name: 'www',
      children: [
        {
          name: 'cgi-bin',
          children: [
            { name: 'hello.py' },
            { name: 'hello1.py' },
            { name: 'hello2-get.py' },
            { name: 'hello2-post.py' }
          ]
        }
      ]
    },
    { name: '06.虚拟环境', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/06.%E8%99%9A%E6%8B%9F%E7%8E%AF%E5%A2%83' },
    {
      name: '05.flask',
      children: [
        { name: '.pytest_cache', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/.pytest_cache' },
        { name: 'build', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/build' },
        { name: 'dist', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/dist' },
        { name: 'flaskr.egg-info', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/flaskr.egg-info' },
        { name: 'instance', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/instance' },
        { name: '.coverage', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/.coverage' },
        { name: 'flask.log', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/flask.log' },
        { name: 'MANIFEST.in', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/MANIFEST.in' },
        { name: 'setup.cfg', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/setup.cfg' },
        { name: 'setup.py' },
        { name: 'readme.md' },
        { name: '补充说明.md' },
        {
          name: 'flaskr',
          children: [
            { name: '__pycache__', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/flaskr/__pycache__' },
            { name: 'schema.sql', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/flaskr/schema.sql' },
            { name: 'static', children: [{ name: 'style.css' }] },
            {
              name: 'templates',
              children: [
                {
                  name: 'auth',
                  children: [
                    { name: 'login.html' },
                    { name: 'register.html' }
                  ]
                },
                {
                  name: 'blog',
                  children: [
                    { name: 'create.html' },
                    { name: 'index.html' },
                    { name: 'update.html' }
                  ]
                },
                { name: '404.html' },
                { name: '500.html' },
                { name: 'base.html' }
              ]
            },
            { name: '__init__.py' },
            { name: 'auth.py' },
            { name: 'blog.py' },
            { name: 'db.py' },
            { name: 'error.py' }
          ]
        },
        {
          name: 'tests',
          children: [
            { name: '__pycache__', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/tests/__pycache__' },
            { name: 'data.sql', link: 'https://github.com/a1392558812/myShare/tree/master/01.python-study/05.flask/tests/data.sql' },
            { name: 'conftest.py' },
            { name: 'test_auth.py' },
            { name: 'test_blog.py' },
            { name: 'test_db.py' },
            { name: 'test_factory.py' },
            { name: 'readme.md' }
          ]
        }

      ]
    },
    {
      name: '04.flask',
      children: [
        {
          name: '__pycache__',
          children: [{ name: 'app.cpython-311.pyc' }]
        },
        {
          name: 'static',
          children: [{ name: 'style.css' }]
        },
        {
          name: 'templates',
          children: [
            { name: 'hello.html' },
            { name: 'index.html' },
            { name: 'login.html' },
            { name: 'page_not_found.html' }
          ]
        },
        { name: 'app.py' }
      ]
    },
    {
      name: '03.socket',
      children: [
        { name: 'index1.py' },
        { name: 'index2.py' }
      ]
    },
    {
      name: '02.文件读写',
      children: [
        { name: 'data.pkl' },
        { name: 'index.py' },
        { name: 'text.txt' }
      ]
    },
    {
      name: '01.模块',
      children: [
        {
          name: '__pycache__',
          children: [
            { name: 'fibo.cpython-311.pyc' }
          ]
        },
        { name: 'fibo.py' },
        { name: 'module.py' }
      ]
    }
  ]
}
