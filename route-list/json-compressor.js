const fs = require("fs").promises;
const path = require("path");

/**
 * 压缩JSON字符串
 * @param {string} jsonString - 原始JSON字符串
 * @param {number} space - 可选，压缩级别 0-10，0表示最小体积
 * @returns {string} 压缩后的JSON字符串
 */
function compressJsonString(jsonString, space = 0) {
  try {
    // 解析JSON确保格式正确
    const jsonData = JSON.parse(jsonString);
    // 重新序列化，控制缩进
    return JSON.stringify(jsonData, null, space);
  } catch (error) {
    console.error("JSON格式错误:", error.message);
    throw error;
  }
}

/**
 * 压缩JSON文件
 * @param {string} inputPath - 输入JSON文件路径
 * @param {string} outputPath - 输出压缩后的文件路径
 * @param {number} space - 压缩级别 0-10
 */
async function compressJsonFile(inputPath, outputPath, space = 0) {
  try {
    // 读取文件
    const rawData = await fs.readFile(inputPath, "utf8");
    console.log("compressJsonFile:", inputPath, outputPath, space);

    // 压缩处理
    const compressedData = compressJsonString(rawData, space);

    // 确保输出目录存在
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // 写入压缩后的文件
    await fs.writeFile(outputPath, compressedData, "utf8");

    // 计算压缩率
    const originalSize = Buffer.byteLength(rawData, "utf8");
    const compressedSize = Buffer.byteLength(compressedData, "utf8");
    const compressionRatio = (
      (1 - compressedSize / originalSize) *
      100
    ).toFixed(2);

    console.log(`压缩完成: ${inputPath}`);
    console.log(`原始大小: ${originalSize} 字节`);
    console.log(`压缩后大小: ${compressedSize} 字节`);
    console.log(`压缩率: ${compressionRatio}%`);

    return {
      originalSize,
      compressedSize,
      compressionRatio,
    };
  } catch (error) {
    console.error("压缩文件失败:", error.message);
    throw error;
  }
}

/**
 * 批量压缩目录中的JSON文件
 * @param {string} dirPath - 目录路径
 * @param {number} space - 压缩级别
 */
async function compressJsonInDirectory(dirPath, space = 0) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // 递归处理子目录
        await compressJsonInDirectory(fullPath, space);
      } else if (entry.isFile() && path.extname(entry.name) === ".json") {
        // 处理JSON文件，输出到原文件（覆盖）
        await compressJsonFile(fullPath, fullPath, space);
      }
    }
  } catch (error) {
    console.error("批量压缩失败:", error.message);
  }
}

module.exports = {
  compressJsonString,
  compressJsonFile,
  compressJsonInDirectory,
};
