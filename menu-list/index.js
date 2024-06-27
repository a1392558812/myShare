import fs from 'fs'
import path from 'path'

const basePath = 'D:/Awen/blog'

const list = []
// 过滤的文件夹
const filterDirPath = [
    path.join(basePath, '.git'),
    path.join(basePath, '.vscode'),
    path.join(basePath, 'bat'),
    path.join(basePath, 'demo-static'),
    path.join(basePath, 'menu-list'),
    path.join(basePath, 'static'),
    path.join(basePath, 'image'),
]
// 过滤的文件
const filterFilePath = [
    path.join(basePath, 'bookmarks.html'),
    path.join(basePath, 'favicon.ico'),
    path.join(basePath, 'index.bat'),
    path.join(basePath, 'index.html'),
    path.join(basePath, 'main.js'),
    path.join(basePath, 'README.md'),
]
const linkListPath = [
    {
        path: path.join(basePath, '01.杂项整理', '01.treejs瞎玩'),
        link: 'https://github.com/a1392558812/myShare/tree/master/01.%E6%9D%82%E9%A1%B9%E6%95%B4%E7%90%86/01.treejs%E7%9E%8E%E7%8E%A9',
        name: '01.treejs瞎玩'
    },
    {
        path: path.join(basePath, '01.杂项整理', '02.商品轮播小卡片'),
        link: 'https://github.com/a1392558812/myShare/tree/master/01.%E6%9D%82%E9%A1%B9%E6%95%B4%E7%90%86/02.%E5%95%86%E5%93%81%E8%BD%AE%E6%92%AD%E5%B0%8F%E5%8D%A1%E7%89%87',
        name: '02.商品轮播小卡片'
    },
    {
        path: path.join(basePath, '01.杂项整理', '03.h5调用浏览器摄像头扫码'),
        link: 'https://github.com/a1392558812/myShare/tree/master/01.%E6%9D%82%E9%A1%B9%E6%95%B4%E7%90%86/03.h5%E8%B0%83%E7%94%A8%E6%B5%8F%E8%A7%88%E5%99%A8%E6%91%84%E5%83%8F%E5%A4%B4%E6%89%AB%E7%A0%81',
        name: '03.h5调用浏览器摄像头扫码'
    },
]
const menuListSort = [
    { name: '03.杂项整理' },
    { name: '02.杂项整理' },
    { name: '01.杂项整理' },
    { name: '01.前端圣经' },
    { name: '01.杂项算法补漏' },
    { name: '01.python-study' },
]

/**
 * 
 * @param {Array} array 
 * @param {Number} from 
 * @param {Number} to 
 * @returns {Array} array 
 */
const moveItem = (array, from, to) => {
    // 检查索引是否在有效范围内
    if (from < 0 || from >= array.length || to < 0 || to > array.length) {
        throw new Error('Indices are out of bounds');
    }

    // 使用splice移除第from项
    const item = array.splice(from, 1)[0];

    // 如果to大于from，因为已经移除了一个元素，所以插入位置需要减1
    const insertIndex = to > from ? to - 1 : to;

    // 使用splice在第to项（或to-1）的位置插入item
    array.splice(insertIndex, 0, item);

    return array; // 返回修改后的数组（原数组已经被修改）
}

const traverseDirectory = (directoryPath, list = []) => {
    try {
        const files = fs.readdirSync(directoryPath)
        files.forEach((file, index) => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                // 递归遍历子文件夹
                const children = []
                if (filterDirPath.findIndex(item => item === filePath) === -1) {
                    const index = linkListPath.findIndex(item => item.path === filePath)
                    if (index === -1) {
                        list.push({ name: file, children })
                        traverseDirectory(filePath, children);
                    } else {
                        list.push({ name: linkListPath[index].name, link: linkListPath[index].link })
                    }
                }
            } else {
                if (filterFilePath.findIndex(item => item === filePath) === -1) {
                    // 处理文件
                    list.push({ name: file })
                }
            }
        });
        list.sort((pre, next) => ((pre.name > next.name) - 1) < 0 ? 1 : -1)
    } catch(e) {
        console.error('err', e);
    }
}
 
traverseDirectory(basePath, list);
menuListSort.forEach((_, index) => {
    const targetIndex = list.findIndex(item => item.name === menuListSort[index].name)
    moveItem(list, targetIndex, index)
})
list[0].topping = true

fs.writeFile(path.join(basePath, 'menu-list','menu-list.json'), JSON.stringify(list), 'utf8', (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('文件写入成功');
});