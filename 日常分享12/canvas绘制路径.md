```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>绘制路径</title>
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
			/*不要在css中指定canvas高宽
			width: 600px;
			height: 400px;*/
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
					
					//给定一个颜色
					ctx.strokeStyle = "red"
					ctx.lineWidth = 4
					ctx.fillStyle= "green"
					
					
					//画笔起始落点为(50,50)
					ctx.moveTo(50,50)
					//画笔第一次落点为(50,50)
					ctx.lineTo(50,100)
					//画笔第二次落点为(50,50)
					ctx.lineTo(100,100)
					
					
					
					//画笔第三次落点为(50,50)
					/*ctx.lineTo(50,50)*/
					//自己封闭路径，即完成一个封闭的图形，回到起始点
					ctx.closePath()
					//俩种方法都可以完成封闭的图形
					//将三个点从(50，50)(50，100)(100，100)连接起来,
					ctx.stroke();
					/*	ctx.stroke()方法会实际地绘制出通过 moveTo() 和 lineTo() 方法定义的路径。默认颜色是黑色。
						ctx.closePath()与ctx.stroke()的顺序很重要;
					 	不会自动调用
					*/
					
					
					
					
					
					//将三个点的区域填充
					ctx.fill()
					/*	.fill()方法会自动封闭路径
						自动形成闭合
							
					*/
					
					
					
					
					//重新绘制一个新的封闭图形，防止上下api干扰
					ctx.beginPath()
					ctx.moveTo(100,100)
					ctx.lineTo(100,150)
					ctx.lineTo(150,150)
					ctx.closePath()
					ctx.stroke();
					ctx.fill()
				}
			}
		</script>
	</body>
</html>

```