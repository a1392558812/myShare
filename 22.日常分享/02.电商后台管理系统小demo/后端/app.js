var createError = require('http-errors');
var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const JwtUtil = require('./utils/jwt')
var indexRouter = require('./routes/index');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  // 我这里知识把登陆和注册请求去掉了，其他的多有请求都需要进行token校验
  if (req.url !== '/login' && req.url != '/menus') {
    const token = req.headers.authorization;
    const _id = req.headers._id
    let jwt = new JwtUtil(token);
    let result = jwt.verifyToken();
    if (result == 'err') {
      res.send({code: 5, message: '登录已过期,请重新登录'});
    } else {
      console.log('通过验证')
      next();
    }
  } else {
    console.log('该请求无需验证')
    next();
  }
})
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
