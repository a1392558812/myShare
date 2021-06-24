```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>DOM对css的操作</title>
	<script type="text/javascript">
		window.onload = function(){
			//点击按钮，修改box1大小
			var box1 = document.getElementById("box1");
			var btn01 = document.getElementById("btn01");
			//为我们按钮绑定单击响应函数
			btn01.onclick = function(){
				/*通过js来修改元素样式
             语法：元素.style.样式名 = "样式值(字符串类型)"*/
				box1.style.width = "400px";
				box1.style.height = "400px";
				/*但是如果css样式名中含有"-"号，这种名称在js中是不合法的
           比如background-color，我们在使用时，需要使用驼峰命名法
           ，将"-"后的首个字母大写*/
				box1.style.backgroundColor = "#BBFFAA";
				/*通过style属性获取或者设置的样式，都是内联样式*/
			}
			//点击按钮2，获取元素样式信息
			var but02 = document.getElementById("btn02");
			but02.onclick = function(){
				/*读取box1的样式
             语法：box1.style.width*/
				alert(box1.style.width+"，"+
					box1.style.height+"，"+
					box1.style.backgroundColor);
				//通过style属性获取或者设置的样式，都是内联样式
			}
		}
	</script>
	<style type="text/css">
		#box1{
			width: 200px;
			height: 200px;
			background-color: red;
		}
	</style>
</head>
<body>
<button id="btn01">div变大按钮</button>
<br /><br />
<button id="btn02">获取样式按钮</button>
<br /><br />
<div id="box1"></div>
</body>
</html>

```