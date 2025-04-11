// node: 版本 18.17.0    npm：版本 6.14.18
const fs = require("fs");
const path = require("path");

const parentDirectory = path.dirname(__dirname);

const targetBasePath = path.join(parentDirectory, "myShare");
const distBasePath = path.join(parentDirectory, "vue-blog", "dist");

const dirFileList = ["demo-static", "static"];
const fileList = ["favicon.ico", "index.html", "index.html.gz"];

/**
 * 删除文件夹功能
 * @param  {String} url  文件路径，绝对路径
 * @return {Null}
 */
function deleteDir(url) {
  var files = [];

  if (fs.existsSync(url)) {
    //判断给定的路径是否存在

    files = fs.readdirSync(url); //返回文件和子目录的数组
    files.forEach(function (file, index) {
      var curPath = path.join(url, file);

      if (fs.statSync(curPath).isDirectory()) {
        //同步读取文件夹文件，如果是文件夹，则函数回调
        deleteDir(curPath);
      } else {
        fs.unlinkSync(curPath); //是指定文件，则删除
      }
    });

    fs.rmdirSync(url); //清除文件夹
  } else {
    fs.mkdir(url, { recursive: true }, (err) => {
      if (err) {
        throw err;
      } else {
        deleteDir(url);
      }
    });
  }
}

dirFileList.forEach((pathItem) => {
  deleteDir(path.join(targetBasePath, pathItem));
  fs.cp(
    path.join(distBasePath, pathItem),
    path.join(targetBasePath, pathItem),
    { recursive: true },
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
});
fileList.forEach((pathItem) => {
  fs.copyFile(
    path.join(distBasePath, pathItem),
    path.join(targetBasePath, pathItem),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
});
