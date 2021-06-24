```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Location对象</title>
	<script type="text/javascript">
		window.onload = function(){
			/*Location
         封装了浏览器的地址栏信息*/
			var btn01 = document.getElementById("btn01");
			btn01.onclick = function(){
				/*如果直接打印location，则可以获取地址栏信息（完整的路径）*/
				console.log(location);
				/*可以修改location*/
				//location = "https://www.bilibili.com";
				/*如果直接修改location属性为一个完整的路径，则我们的页面会跳转到该页面
         并且会生成相应的历史记录*/
				/*location的对象方法
             assign()-用来跳转到其他页面，作用和修改location一样*/
				location.assign("https://www.bilibili.com");
				/*reload()重新加载页面，刷新功能，其有一个参数
               true：作为参数，则会强制清空缓存刷新*/
				//location.reload();
				/*replace()可以使用一个新的页面
                 他不会生成历史记录*/
			}
		}
	</script>
</head>
<body>
<button id="btn01">点击测试</button>
</body>
</html>

```