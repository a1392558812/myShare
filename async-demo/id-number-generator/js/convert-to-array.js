const fs = require("fs");
const path = require("path");

// 读取原始文件
const inputPath = path.join(__dirname, "index.js");
const outputPath = path.join(__dirname, "index-array.js");

const { citys } = require(inputPath);
const map = {};

const getType = (obj) => Object.prototype.toString.call(obj).slice(8, -1);
const recordType = (obj) => {
  const type = getType(obj);
  map[type] = (map[type] || 0) + 1;
};

// 解析城市数据
function parseCityData(obj, level = 0) {
  const resList = [];
  Object.keys(obj).forEach((key) => {
    const item = obj[key];
    if (item && item[0]) {
      if (typeof item === "object" && item.length) {
        const children = [];
        const targetItem = item.length === 1 ? item : item.slice(1);
        targetItem.forEach((childItem) => {
          const result = parseCityData(childItem, level + 1);
          children.push(getType(result) === "Array" ? result[0] : result);
        });
        const target = {
          label: item[0].cityname,
          value: item[0].cityid,
          children,
        };
        resList.push(target);
      }
    } else {
      console.log("2222222");
    }
  });

  return resList.length
    ? resList
    : {
        label: obj.cityname,
        value: obj.cityid,
        children: [],
      };
}

const res = parseCityData(citys);
console.log(map);

// 生成新的文件内容
const newContent = `export const citys = ${JSON.stringify(res)};`;

// 写入文件
fs.writeFileSync(outputPath, newContent, "utf8");
