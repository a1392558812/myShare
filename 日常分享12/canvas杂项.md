```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>canvas杂项</title>
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
		<canvas id="test" width="300" height="300">
			<span>您的浏览器不支持画布元素，请下载最新的浏览器</span>
		</canvas>
		<!--
			1.将画布导出为图像
				-toDataURL(为canvas元素接口上的元素)
			2.事件操作，判断在当前路径是否包含检测点
				ctx.isPointInPath(x,y)
					x-检测点的x坐标， y-检测点的y坐标
					该属性作用于最新的路径上，当有了ctx.beginPath()时，上一个图形路径触发不了函数
		-->
		<script type="text/javascript">
			window.onload = function(){
				var canvas = document.querySelector("#test")
				if(canvas.getContext){
					var ctx = canvas.getContext("2d")
					ctx.fillStyle = "pink"
					ctx.save()
					ctx.beginPath()
					ctx.arc(100,50,50,0,360*Math.PI/180)
					ctx.fill()
					var result = canvas.toDataURL()
					console.log(result)
					ctx.restore()
					
					
					ctx.save()
					ctx.beginPath()
					ctx.arc(0,0,50,0,360*Math.PI/180)
					ctx.fill()
					ctx.restore()
					
					
					
					
					
					
					
					
					canvas.onclick = function(ev){
						ev = ev||event
						var x = ev.clientX - canvas.offsetLeft
						var y = ev.clientY - canvas.offsetTop
						if(ctx.isPointInPath(x,y)){
							alert("图像被点击")
						}
					}
				}
			}
		</script>
	</body>
</html>

```