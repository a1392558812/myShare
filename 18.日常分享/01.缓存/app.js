var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require('fs')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use('/', (req, res, next) => {
  console.log(666)
  next()
});
const options = {
  mergeParams: true,
  setHeaders: async function (res, Path, stat) {
    /* console.log(res)
    console.log(Path)
    console.log(stat) */
    res.set('x-timestamp', Date.now())
    //1. res.set('Expires', new Date(Date.now()+200000).toUTCString()) // 强缓存
    //2. res.set('Cache-Control', 'max-age=5') // 强缓存
    //3. res.set('Cache-Control', 'no-cache') // 使用缓存前必须确认其有效性
    //4. res.set('Cache-Control', 'nostore') // 不缓存3
    // 协商缓存
    let time = stat.mtime.toUTCString()
    res.set('Cache-Control', 'max-age=5')
    res.set('Expires', new Date(Date.now() + 200000).toUTCString())
    res.set('Last-Modified', time)
  }
}
app.use(express.static(path.join(__dirname, 'public'), options));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;