**官网 https://threejs.org/**
## 安装
`npm install --save three`
```js
// 方式 1: 导入整个 three.js核心库
import * as THREE from 'three';
const scene = new THREE.Scene();
// 方式 2: 仅导入你所需要的部分
import { Scene } from 'three';
const scene = new Scene();
```
## 从CDN或静态主机安装
```html
<script type="module">
  // 通过访问 https://cdn.skypack.dev/three 来查找最新版本。
  import * as THREE from 'https://cdn.skypack.dev/three@<version>';
  const scene = new THREE.Scene();
</script>
```

