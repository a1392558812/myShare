const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const isNumDotPrefix = (str) => {
  const reg = /^\d+.+.+/;
  return reg.test(str);
};

try {
  execSync("git config --global core.quotepath off");
  const output = execSync(
    "git ls-files --modified --others --exclude-standard",
    { encoding: "utf-8" },
  );

  const files = output.split("\n").filter((item) => {
    if (!item) return false;

    const isRootFile = item.split("/").length === 1;
    if (isRootFile) return false;

    const isFilterFileFolder = ["async-demo/"].includes((folder) =>
      item.startsWith(folder),
    );

    return isFilterFileFolder || isNumDotPrefix(item);
  });

  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  const second = `${date.getSeconds()}`.padStart(2, "0");

  const result = {
    count: files.length,
    currentDate: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
    changedFiles: files,
  };

  const outputPath = path.resolve(__dirname, "changed-files.json");
  fs.writeFileSync(outputPath, JSON.stringify(result), "utf-8");

  console.log(`生成成功：changed-files.json，共${files.length} 个未提交文件`);
} catch (err) {
  console.error("生成失败：", err);
}
