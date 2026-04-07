import { execSync } from "child_process";

const getCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

const executeCommand = (command, description) => {
  try {
    console.log(`执行: ${description}`);
    execSync(command, { stdio: "inherit" });
    console.log(`✓ ${description} 成功\n`);
    return true;
  } catch (error) {
    console.error(`✗ ${description} 失败`);
    return false;
  }
};

const executeWithRetry = (command, description) => {
  let attempt = 0;

  while (true) {
    attempt++;
    console.log(`\n${description} - 第 ${attempt} 次尝试`);

    if (executeCommand(command, description)) {
      return true;
    }

    console.log(`5 秒后重试...`);
    const startTime = Date.now();
    while (Date.now() - startTime < 5000) {
      // 阻塞等待
    }
  }
};

// 主函数
const main = () => {
  console.log("=== Git 自动提交脚本 ===\n");

  if (!executeCommand("git add ./", "git add ./")) {
    console.error("添加文件失败，脚本终止");
    process.exit(1);
  }

  const commitMessage = getCurrentTime();
  if (
    !executeCommand(
      `git commit -m "${commitMessage}"`,
      `git commit -m "${commitMessage}"`,
    )
  ) {
    console.error("提交失败，脚本终止");
    process.exit(1);
  }

  const giteeUrl = "https://gitee.com/a1392558812/miscellaneous.git";
  if (!executeWithRetry(`git push ${giteeUrl}`, `推送到 Gitee (${giteeUrl})`)) {
    console.error("推送到 Gitee 失败，脚本终止");
    process.exit(1);
  }

  if (!executeWithRetry("git push origin master", "推送到 origin master")) {
    console.error("推送到 origin master 失败，脚本终止");
    process.exit(1);
  }

  console.log("\n=== 所有操作完成 ===");
};

main();
