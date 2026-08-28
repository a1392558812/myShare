export const buildPathTree = (list) => {
  const root = {
    type: "folder",
    name: "",
    children: []
  };

  for (const item of list) {
    const segments = item.path.replace('../', '').replace('./', '').split("/").filter(s => s.trim());
    console.log('segments', segments)
    if (!segments.length) continue;

    let currentDir = root;
    // 逐层创建目录
    for (let i = 0; i < segments.length - 1; i++) {
      const dirName = segments[i];
      let folder = currentDir.children.find(
        n => n.type === "folder" && n.name === dirName
      );
      if (!folder) {
        folder = { type: "folder", name: dirName, children: [] };
        currentDir.children.push(folder);
      }
      currentDir = folder;
    }
    // 添加文件节点
    const fileName = segments[segments.length - 1];
    currentDir.children.push({
      type: "file",
      name: fileName,
      raw: item
    });
  }

  const sortTree = (nodes) => {
    nodes.sort((a, b) => {
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    nodes.forEach(node => {
      if (node.type === "folder" && node.children) {
        sortTree(node.children);
      }
    });
  }

  sortTree(root.children);

  return root.children;
}

export const downloadFile = (node) => {
  const { path, content } = node.raw
  const fileName = path.split('/').pop();
  const blob = new Blob([content], { type: 'text/plain' });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}