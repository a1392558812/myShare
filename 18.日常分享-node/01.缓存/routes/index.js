var express = require('express');
var router = express.Router();

const fs = require('fs')

/* GET home page. */
router.get('/', function(req, res, next) {
  
  res.render('index', { title: 'Express' });
});

router.get('/download', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
module.exports = router;
