// node: 版本 23.11.0
const fs = require("fs");
const path = require("path");
require("./route-list/index.js");
require("./menu-list/index.js");

const parentDirectory = path.dirname(__dirname);
const targetBasePath = path.join(parentDirectory, "myShare");
const distBasePath = path.join(parentDirectory, "vue-blog", "dist");

const dirFileList = ["demo-static", "static", "screenshots"];
const fileList = [
  "favicon.ico",
  "favicon.svg",
  "index.html",
  "index.html.gz",
  "manifest.webmanifest",
  "maskable-icon-512x512.png",
  "apple-touch-icon-180x180.png",
  "pwa-64x64.png",
  "pwa-192x192.png",
  "pwa-512x512.png",
  "sw.js",
  "sw.js.gz",
  "workbox-*.js",
  "workbox-*.js.gz",
];

/**
 * @param  {String} url  文件路径，绝对路径
 * @return {Null}
 * @description 删除文件夹功能, 递归删除文件夹下的所有文件和子文件夹
 */
const deleteDir = (url) => {
  if (fs.existsSync(url)) {
    //判断给定的路径是否存在,
    fs.rmSync(url, { recursive: true });
  }
};

// 复制目录夹，先删除targetBasePath目录下的文件（文件夹里文件 / 子文件夹一并删掉），再从distBasePath目录复制到targetBasePath目录
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
    },
  );
});

// 复制文件
fileList.forEach(async (pathItem) => {
  if (pathItem.split("*").length > 1) {
    let distBaseFilePath = path.join(distBasePath, pathItem);
    distBaseFilePath = distBaseFilePath.replaceAll("\\", "/");
    console.log("distBaseFilePath", distBaseFilePath);
    const distBaseFileList = fs.globSync(distBaseFilePath);
    if (distBaseFileList.length > 0) {
      let targetBaseFilePath = path.join(targetBasePath, pathItem);
      targetBaseFilePath = targetBaseFilePath.replaceAll("\\", "/");
      console.log("targetBaseFilePath", targetBaseFilePath);
      const targetBaseFileList = fs.globSync(targetBaseFilePath);
      targetBaseFileList.forEach((item) => {
        fs.unlinkSync(item);
      });
      distBaseFileList.forEach(async (item) => {
        fs.copyFileSync(
          item,
          path.join(targetBasePath, item.split("\\").pop()),
        );
      });
    }
  } else {
    fs.copyFile(
      path.join(distBasePath, pathItem),
      path.join(targetBasePath, pathItem),
      (err) => {
        if (err) {
          console.error(err);
        }
      },
    );
  }
});

// 统计变更文件
require("./changed/index.js");
