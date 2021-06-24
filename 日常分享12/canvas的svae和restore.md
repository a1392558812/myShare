```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>svae和restore</title>
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
					ctx.save()//样式压栈，黑色压栈，使得下一条样式应用黑色
					ctx.fillStyle = "orange"
					ctx.save()//样式压栈,orange压栈，使得下一条样式应用orange
					ctx.fillStyle = "yello"
					ctx.fillStyle = "green"//yellow被覆盖为green
					ctx.save()//样式压栈,green压栈，使得下一条样式应用green
					ctx.fillStyle = "blue"
					ctx.save()//样式压栈,blue压栈，使得下一条样式应用blue
					ctx.fillStyle = "deeppink"
					ctx.save()//样式压栈,deeppink压栈，使得下一条样式应用deeppink
					ctx.beginPath()//清理路径容器
					ctx.restore()//deeppink出栈，替换掉当前应用deeppink，使得下一条样式应用deeppink
					ctx.restore()//blue出栈，替换掉当前应用deeppink，使得下一条样式应用blue
					ctx.restore()//green出栈，替换掉当前应用blue，使得下一条样式应用green
					ctx.restore()//orange出栈，替换掉当前应用green，使得下一条样式应用orange
					ctx.fillRect(100,100,100,100)
					ctx.restore()//黑色出栈，替换掉当前应用orange，使得下一条样式应用黑色
					
					
					
					
					//重新绘制一个正方形
					ctx.beginPath()
					ctx.fillRect(50,50,100,100)//填充为黑色
				}
			}
		</script>
	</body>
</html>

```