var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
const compression = require('compression')
const {
  createProxyMiddleware
} = require('http-proxy-middleware');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
/*
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
配置代理踩坑：
在 nodejs 服务上引用了 http-proxy-middleware 做代理转发。get 请求的时候没什么问题，但是 post 请求会报 ECONNRESET 错误。
是因为使用了 bodyParser 导致的代理转发带有 body 数据的 post 请求会失败。
注释掉以下代码
// app.use(express.urlencoded({
//   extended: true
// }));
// app.use(express.json());
*/
app.use(cookieParser());
// gzip压缩页面
app.use(compression())
app.use(express.static(path.join(__dirname, 'public')));
// 配置代理服务器
const proxyOption = {
  target: " http://localhost:5000",
  ws: true,
  pathRewrite: {
    "^/api/": "/" // 重写请求，api/解析为/
  },
  changeOrigoin: true
};
app.use('/api/*', createProxyMiddleware(proxyOption));

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
