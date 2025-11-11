const { compressJsonInDirectory } = require("./json-compressor.js");
const path = require("path");
const fs = require("fs").promises;

const checkPath = async () => {
  const rawData = await fs.readFile(path.join(__dirname, "demo.json"), "utf8");
  const targetCheckPath = path.join(__dirname, "../async-demo");
  const entries = await fs.readdir(targetCheckPath, {
    withFileTypes: true,
  });
  const jsonData = JSON.parse(rawData);
  let flag = true;
  for (let i = 0; i < entries.length; i++) {
    const target = jsonData.find((item) => {
      if (item.fileType === "vue") {
        return item.path === entries[i].name;
      }
      return false;
    });
    if (!target) {
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

checkPath().then((res) => {
  if (res) {
    console.log("所有路由项都匹配成功");
    compressJsonInDirectory(path.join(__dirname), 0);
  }
});
