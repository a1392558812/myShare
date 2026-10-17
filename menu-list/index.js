import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

// 当前脚本文件的绝对路径（ESM 下没有 __dirname，用 import.meta.url 反解）
const currentFilePath = fileURLToPath(import.meta.url);
// 项目根目录 = 脚本所在目录(menu-list)的上一级，即 myShare/
const basePath = path.dirname(path.dirname(currentFilePath));

// 最终产物：整棵目录树，结构为 { name, children? }[]，最后写入 menu-list.json
const list = [];

/**
 * 按「文件夹名」过滤：任意层级只要名字命中就跳过（不递归进去）
 */
const filterDirName = [
  "node_modules",
  ".workbuddy",
  ".codebuddy",
  ".trae",
  ".git",
  ".tmp",
];

/**
 * 按「完整路径」过滤：只对根目录下这些固定目录生效，是上面按名过滤的补充
 * （这些目录不在根目录时也能精确排除，或反之只排除根目录下特定位置的那一个）
 */
const filterDirPath = [
  path.join(basePath, ".git"),
  path.join(basePath, ".vscode"),
  path.join(basePath, "bat"),
  path.join(basePath, "demo-static"),
  path.join(basePath, "menu-list"),
  path.join(basePath, "static"),
  path.join(basePath, "image"),
  path.join(basePath, "screenshots"),
  path.join(basePath, "node_modules"),
  path.join(basePath, "route-list"),
  path.join(basePath, "async-demo"),
  path.join(basePath, "changed"),
  path.join(basePath, "git-push"),
  path.join(basePath, ".trae"),
  path.join(basePath, ".workbuddy"),
  path.join(basePath, ".codebuddy"),
  path.join(basePath, ".tmp"),
];
/**
 * 过滤的文件（根目录下的散落文件）：构建产物 / PWA 相关 / 站点入口，不属于「分享内容」
 * 支持 `*` 通配符（如 workbox-*.js），会在下面展开成真实路径
 */
const filterFilePath = [
  path.join(basePath, ".gitignore"),
  path.join(basePath, ".nojekyll"),
  path.join(basePath, "apple-touch-icon-180x180.png"),
  path.join(basePath, "bookmarks.html"),
  path.join(basePath, "favicon.ico"),
  path.join(basePath, "favicon.svg"),
  path.join(basePath, "index.bat"),
  path.join(basePath, "index.html"),
  path.join(basePath, "index.html.gz"),
  path.join(basePath, "main.js"),
  path.join(basePath, "manifest.webmanifest"),
  path.join(basePath, "maskable-icon-512x512.png"),
  path.join(basePath, "netlify.toml"),
  path.join(basePath, "pwa-64x64.png"),
  path.join(basePath, "pwa-192x192.png"),
  path.join(basePath, "pwa-512x512.png"),
  path.join(basePath, "README.md"),
  path.join(basePath, "AGENTS.md"),
  path.join(basePath, "sw.js"),
  path.join(basePath, "sw.js.gz"),
  path.join(basePath, "vercel.json"),
  path.join(basePath, "workbox-*.js"),
  path.join(basePath, "workbox-*.js.gz"),
];

// filterFilePath 展开后的最终版本：含通配符的会被替换成 glob 命中的真实路径列表
let computedFilterFilePath = [];

// 将通配符匹配的文件转换为路径列表
filterFilePath.forEach((item) => {
  if (item.split("*").length > 1) {
    // fs.globSync 只认正斜杠，Windows 下要先替换掉反斜杠
    const searchPath = item.replaceAll("\\", "/");
    const searchPathList = fs.globSync(searchPath);
    computedFilterFilePath = computedFilterFilePath.concat(searchPathList);
  } else {
    computedFilterFilePath.push(item);
  }
});

/**
 * 外链白名单：这些本地目录不再往下递归展开成树，
 * 而是渲染成一个跳转到 GitHub 仓库对应目录的链接节点 { name, link }
 * （一般是因为本地只有部分文件，完整内容在 GitHub 上）
 */
const linkListPath = [
  {
    path: path.join(basePath, "01.杂项整理", "01.treejs瞎玩"),
    link: "https://github.com/a1392558812/myShare/tree/master/01.%E6%9D%82%E9%A1%B9%E6%95%B4%E7%90%86/01.treejs%E7%9E%8E%E7%8E%A9",
    name: "01.treejs瞎玩",
  },
  {
    path: path.join(basePath, "01.杂项整理", "02.商品轮播小卡片"),
    link: "https://github.com/a1392558812/myShare/tree/master/01.%E6%9D%82%E9%A1%B9%E6%95%B4%E7%90%86/02.%E5%95%86%E5%93%81%E8%BD%AE%E6%92%AD%E5%B0%8F%E5%8D%A1%E7%89%87",
    name: "02.商品轮播小卡片",
  },
  {
    path: path.join(basePath, "01.杂项整理", "03.h5调用浏览器摄像头扫码"),
    link: "https://github.com/a1392558812/myShare/tree/master/01.%E6%9D%82%E9%A1%B9%E6%95%B4%E7%90%86/03.h5%E8%B0%83%E7%94%A8%E6%B5%8F%E8%A7%88%E5%99%A8%E6%91%84%E5%83%8F%E5%A4%B4%E6%89%AB%E7%A0%81",
    name: "03.h5调用浏览器摄像头扫码",
  },
];

/**
 * 置顶排序表：数组下标 = 该目录要被挪到的最终位置（0 为最前）
 * 排在这里面的目录会按此顺序固定在列表顶部，其余目录保持默认排序跟在后面
 */
const menuListSort = [
  { name: "04.杂项整理" },
  { name: "03.杂项整理" },
  { name: "02.杂项整理" },
  { name: "01.杂项整理" },
  { name: "01.前端圣经" },
  { name: "01.自定义chrome插件" },
  { name: "01.杂项算法补漏" },
  { name: "01.python-study" },
];

/**
 * 把数组里第 from 项移动到第 to 项的位置（原地修改）
 * @param {Array} array
 * @param {Number} from 源下标
 * @param {Number} to 目标下标（移动后的最终位置）
 * @returns {Array} array
 */
const moveItem = (array, from, to) => {
  // 检查索引是否在有效范围内
  if (from < 0 || from >= array.length || to < 0 || to > array.length) {
    throw new Error("Indices are out of bounds");
  }

  // 使用splice移除第from项
  const item = array.splice(from, 1)[0];

  // 如果to大于from，因为已经移除了一个元素，所以插入位置需要减1
  const insertIndex = to > from ? to - 1 : to;

  // 使用splice在第to项（或to-1）的位置插入item
  array.splice(insertIndex, 0, item);

  return array; // 返回修改后的数组（原数组已经被修改）
};

/**
 * 递归遍历目录，把结果塞进 list（每一层都是一个 children 数组）
 * 目录 → { name, children }；文件 → { name }
 * @param {String} directoryPath 当前要遍历的目录
 * @param {Array} list 当前层级的容器，默认新建
 */
const traverseDirectory = (directoryPath, list = []) => {
  try {
    const files = fs.readdirSync(directoryPath);
    files.forEach((file, index) => {
      const filePath = path.join(directoryPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        // 递归遍历子文件夹
        const children = [];
        // 命中路径黑名单
        const isFilterPath =
          filterDirPath.findIndex((item) => item === filePath) !== -1;
        // 命中目录名黑名单
        const isFilterDir =
          filterDirName.findIndex((item) => item === file) !== -1;
        if (!isFilterPath && !isFilterDir) {
          // 是否属于「外链目录」
          const index = linkListPath.findIndex(
            (item) => item.path === filePath,
          );
          if (index === -1) {
            // 普通目录：入树 + 继续递归，children 引用会被递归填满
            list.push({ name: file, children });
            traverseDirectory(filePath, children);
          } else {
            // 外链目录：不递归，记成叶子节点并带上 GitHub 链接
            list.push({
              name: linkListPath[index].name,
              link: linkListPath[index].link,
            });
          }
        }
      } else {
        // 文件：不在过滤名单里就作为叶子节点入树
        if (
          computedFilterFilePath.findIndex((item) => {
            return item === filePath;
          }) === -1
        ) {
          // 处理文件
          list.push({ name: file });
        }
      }
    });
    // 按名称「降序」排列（04 会排在 01 前面）
    // 注意：这个比较器不会返回 0，相等时也会交换，依赖引擎稳定排序才能保持原有相对顺序
    list.sort((pre, next) => ((pre.name > next.name) - 1 < 0 ? 1 : -1));
  } catch (e) {
    console.error("err", e);
  }
};

// 从根目录开始建树，结果直接写进外层 list
traverseDirectory(basePath, list);

// 按 menuListSort 把指定目录依次搬到列表最前面
// 注意：若 menuListSort 里的名字在 list 中找不到，findIndex 返回 -1，moveItem 会抛越界错误
menuListSort.forEach((_, index) => {
  const targetIndex = list.findIndex(
    (item) => item.name === menuListSort[index].name,
  );
  moveItem(list, targetIndex, index);
});

// 给排好序后的第一项打「置顶」标记（前端据此渲染「置顶」角标）
list[0].topping = true;

// 输出菜单树，供侧边栏读取
fs.writeFile(
  path.join(basePath, "menu-list", "menu-list.json"),
  JSON.stringify(list),
  "utf8",
  (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("文件写入成功");
  },
);
