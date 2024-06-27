import menuList from './list/index.js'
import fs from 'fs'

fs.writeFile('D:/Awen/blog/menu-list/menu-list.json', JSON.stringify(menuList), 'utf8', (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('文件写入成功');
});