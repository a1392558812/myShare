const { compressJsonInDirectory } = require("./json-compressor.js");
const path = require("path");
const fs = require("fs").promises;

/**
 * 路由登记表体检：确认 async-demo/ 下的每个 demo 目录
 * 都在 demo.json 里有一条对应记录，否则说明新 demo 忘了登记（路由会找不到入口）
 * @returns {Promise<Boolean>} 是否全部匹配
 */
const checkPath = async () => {
  // 路由登记表原文：{ path, component, name, fileType, meta:{ demoName, ifShowHeaderComponent } }[]
  const rawData = await fs.readFile(path.join(__dirname, "demo.json"), "utf8");
  // 被检查的目录：async-demo/
  const targetCheckPath = path.join(__dirname, "../async-demo");
  // withFileTypes 拿到 Dirent，可以用 isDirectory() 区分文件/目录
  const entries = await fs.readdir(targetCheckPath, {
    withFileTypes: true,
  });
  const jsonData = JSON.parse(rawData);
  // 体检结果：只要有一项没匹配上就置 false
  let flag = true;
  for (let i = 0; i < entries.length; i++) {
    // 目录名要能在登记表里找到同名的 vue 条目
    const target = jsonData.find((item) => {
      if (item.fileType === "vue") {
        return item.path === entries[i].name;
      }
      return false;
    });
    if (!target) {
      // 这两个是公共目录（共享组件 / 静态资源），不是 demo，豁免
      if (!["components", "static"].includes(entries[i].name)) {
        console.log(
          `${targetCheckPath}: 未找到匹配的路由项: ${entries[i].name}`
        );
        flag = false;
      }
    }
  }
  return flag;
};

// 体检通过才压缩：把 route-list/ 下所有 json 压成单行（space=0 即无缩进），覆盖原文件
checkPath().then((res) => {
  if (res) {
    console.log("所有路由项都匹配成功");
    compressJsonInDirectory(path.join(__dirname), 0);
  }
});
