```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>基本模板</title>
	</head>
	<style type="text/css">
		*{
			padding: 0;
			margin: 0;
		}
		#test{
			background-color: yellow;
			position: absolute;
			left: 0;
			top: 0;
			right: 0;
			bottom: 0;
			margin: auto;
		}
	</style>
	<body>
		<canvas id="test" width="600" height="400">
			<span>您的浏览器不支持画布元素，请下载最新的浏览器</span>
		</canvas>
		<script type="text/javascript">
			window.onload = function(){
				var canvas = document.querySelector("#test")
				if(canvas.getContext){
					var ctx = canvas.getContext("2d")
					ctx.save()
					/*关于样式的设置与变换设置，写在ctx.save()与ctx.beginPath()之间*/
					ctx.beginPath()
					/*关于路径的设置，写在ctx.beginPath()与ctx.restore()之间*/
					ctx.restore()//一定要一个ctx.save()对应一个ctx.restore()，成对出现
					
					/*
					 1.路径容器
					 	-每次调用API时，都会往路径容器中登记
					 	-调用ctx.beginPath()，清空路径容器
					 2.样式容器
					 	-每次调用样式api时，都会往样式容器中登记
					 	-调用ctx.save()，将样式容器中的状态压入样式栈
					 	-ctx.restore()，将样式栈的栈顶状态弹出，弹到样式容器中，并进行覆盖
					 3.样式栈
					 	-调用ctx.save()将样式容器中的状态压入样式栈
					 	-ctx.restore()，将样式栈的栈顶状态弹出，弹到样式容器中，并进行覆盖
					 
					 
					 
					*/
				}
			}
		</script>
	</body>
</html>

```