// node: 版本 18.17.0    npm：版本 6.14.18
const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

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
  "netlify.toml",
  "vercel.json",
  "workbox-*.js",
  "workbox-*.js.gz",
];

/**
 * 删除文件夹功能
 * @param  {String} url  文件路径，绝对路径
 * @return {Null}
 */
function deleteDir(url) {
  if (fs.existsSync(url)) {
    //判断给定的路径是否存在
    fs.rmSync(url, { recursive: true });
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

fileList.forEach(async (pathItem) => {
  if (pathItem.split("*").length > 1) {
    let distBaseFilePath = path.join(distBasePath, pathItem);
    distBaseFilePath = distBaseFilePath.replaceAll("\\", "/");
    console.log("distBaseFilePath", distBaseFilePath);
    const distBaseFileList = await glob(distBaseFilePath);
    if (distBaseFileList.length > 0) {
      let targetBaseFilePath = path.join(targetBasePath, pathItem);
      targetBaseFilePath = targetBaseFilePath.replaceAll("\\", "/");
      console.log("targetBaseFilePath", targetBaseFilePath);
      const targetBaseFileList = await glob(targetBaseFilePath);
      targetBaseFileList.forEach((item) => {
        fs.unlinkSync(item);
      });
      distBaseFileList.forEach(async (item) => {
        fs.copyFileSync(
          item,
          path.join(targetBasePath, item.split("\\").pop())
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
      }
    );
  }
});
