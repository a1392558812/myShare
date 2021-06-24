```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>小练习</title>
		<script type="text/javascript">
			//处理多个按钮绑定事件，减少重复代码，当需要为其他按钮绑定单击事件时候，只需要调用函数即可
			window.onload = function(){
				//定义一个函数，专门为了指定元素绑定单击响应函数
				function myClick(idStr,fun){
					//为id为btn0x的按钮绑定一个单击响应函数
					//定义fun事件的回调函数，当单击元素时，该函数会被触发
					var btn = document.getElementById(idStr);
					btn.onclick = fun;
				}
				//调用函数
				myClick("btn1",function(){
					alert("渣渣辉掉装备，古天乐绿了！！！！！！！！！");
				})
				myClick("btn11",function(){
					alert("吃奥利给的雅间请")
				})
			}
			/*
	DOM查询
　　- 通过具体的元素节点来查询
　　- 元素.getElementsByTagName()
　　- 通过标签名查询当前元素的指定后代元素，返回数组

　　- 元素.childNodes
　　- 获取当前元素的所有子节点
　　- 会获取到空白的文本子节点

　　- 元素.children
　　- 获取当前元素的所有子元素

　　- 元素.firstChild
　　- 获取当前元素的第一个子节点

　　- 元素.lastChild
　　- 获取当前元素的最后一个子节点

　　- 元素.parentNode
　　- 获取当前元素的父元素

　　- 元素.previousSibling
　　- 获取当前元素的前一个兄弟节点

　　- 元素.nextSibling
　　- 获取当前元素的后一个兄弟节点

innerHTML和innerText
　　- 这两个属性并没有在DOM标准定义，但是大部分浏览器都支持这两个属性
　　- 两个属性作用类似，都可以获取到标签内部的内容，
　　不同是innerHTML会获取到html标签，而innerText会自动去除标签
　　- 如果使用这两个属性来设置标签内部的内容时，没有任何区别的

读取标签内部的文本内容
　　<h1>h1中的文本内容</h1>
　　元素.firstChild.nodeValue

　　- document对象的其他的属性和方法
　　document.all
　　- 获取页面中的所有元素，相当于document.getElementsByTagName("*");

　　document.documentElement
　　- 获取页面中html根元素

　　document.body
　　- 获取页面中的body元素
*/


		</script>


	</head>
	<body>
		<button id="btn1">我是渣渣辉</button><br />
		<button id="btn2">我是古天乐</button><br />
		<button id="btn3">点一下，玩一年</button><br />
		<button id="btn4">666</button><br />
		<button id="btn5">古天乐绿了！！</button><br />
		<button id="btn6">emmmmmmmmmm</button><br />
		<button id="btn7">不知道写啥</button><br />
		<button id="btn8">瞎写</button><br />
		<button id="btn9">QAQ</button><br />
		<button id="btn10">~~~~~~~~~</button><br />
		<button id="btn11">一刀999</button><br />
		<button id="btn12">卫龙</button><br />
		<button id="btn13">ABC</button><br />

	</body>
</html>

```