const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

try {
  execSync("git config --global core.quotepath off");
  const output = execSync(
    "git ls-files --modified --others --exclude-standard",
    { encoding: "utf-8" },
  );

  const files = output.split("\n").filter((item) => {
    const isEmpty = !item;

    const isStatic = item.startsWith("static/");
    const isDemoStatic = item.startsWith("demo-static/");
    const isMenuList = item.startsWith("menu-list/");
    const isRouteList = item.startsWith("route-list/");
    const isCurrentDir = item.startsWith("changed/");

    const isRootFile = item.split("/").length === 1;
    console.log(item, {
      isEmpty,
      isStatic,
      isDemoStatic,
      isMenuList,
      isRouteList,
      isRootFile,
      isCurrentDir,
    });
    return (
      !isEmpty &&
      !isStatic &&
      !isDemoStatic &&
      !isMenuList &&
      !isRouteList &&
      !isCurrentDir &&
      !isRootFile
    );
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
