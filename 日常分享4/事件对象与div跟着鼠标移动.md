```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>事件对象与div跟着鼠标移动</title>
	<script type="text/javascript">
		window.onload = function(){
			/*我们需要实现的功能
             （1）当我们鼠标在box1中移动时，在box2中显示鼠标坐标*/
			var box1 = document.getElementById("box1");
			var box2 = document.getElementById("box2");
			var box3 = document.getElementById("box3");
			/*onmousemove
             该事件将会在鼠标移入元素时候触发*/
			box1.onmousemove = function(event){//此处的event是一个形参，即使我们并不设置，
				//我们的浏览器仍然会给我们传递一个参数
				//所以我们传递一个形参来获取浏览器传递的参数
				/*事件对象
             （1）当事件的响应函数被触发时，浏览器每次都会将一个事件对象作为实参传递进响应函数
             （2）事件对象中封装了当前事件相关的一切信息，比如：鼠标的坐标，键盘按下哪个键，鼠标滚轮的滚动等等*/
				//console.log(event);
				/*clientX可以获取鼠标的水平指针坐标
         *clientY可以获取鼠标的垂直指针坐标
         * clientX和clientY用于获取鼠标在当前可见窗口的坐标
         */
				var x = event.clientX;
				var y = event.clientY;
				/*pageX和pageY
         * 			可以获取鼠标相对于当前页面的坐标
         */
				box2.innerHTML = "div2"+"<br />"+"div1中当前鼠标指针x坐标为："+x+"<br />"
					+"div1中当前鼠标指针y坐标为："+y;
			}
			/*div可以跟着鼠标移动*/
			//给我们整个页面绑定鼠标移动事件
			document.onmousemove = function(event){
				box3.style.left = (event.pageX)+"px";
				box3.style.top = (event.pageY)+st+"px";
			}
			//我们浏览器认为当body的高度过高而出现的滚动条是属于html的，应为body的父元素html不足以容纳下body的
			//高度从而出现滚动条
			var st = document.body.scrollTop||document.documentElement.scrollTop;


		}
	</script>
	<style type="text/css">
		*{
			padding: 0;
			margin: 0;
		}
		#box1{
			width: 1000px;
			height: 300px;
			background-color: #bfa;
		}
		#box2{
			width: 1000px;
			height: 100px;
			background-color: skyblue;
		}
		#box3{
			width: 20px;
			height: 20px;
			background-color: yellow;
			position: absolute;
		}
	</style>
</head>
<body style="height: 3000px;">
<div id="box1">
	div1
	<div id="box3">

	</div>
</div>
<div id="box2">
	div2
</div>

</body>
</html>

```