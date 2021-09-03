```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>变换</title>
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
		<canvas id="test" width="800" height="800">
			<span>您的浏览器不支持画布元素，请下载最新的浏览器</span>
		</canvas>
		<script type="text/javascript">
			window.onload = function(){
				var canvas = document.querySelector("#test")
				if(canvas.getContext){
					var flag = 0
					var condition  = 0
					var variate = 0
					var ctx = canvas.getContext("2d")
					ctx.save()
					ctx.translate(400,400)
					ctx.beginPath()
					ctx.fillRect(-50,-50,100,100)
					ctx.restore()
					setInterval(function(){
						flag++
						ctx.clearRect(0,0,canvas.width,canvas.height)
						ctx.save()
						ctx.translate(400,400)
						ctx.beginPath()
						ctx.rotate(flag*(Math.PI/180))
						if(condition==100){
							variate = -1
						}else if(condition==0){
							variate = 1
						}
						condition = condition + variate
						ctx.scale((condition/20),(condition/20))
						ctx.fillRect(-50,-50,100,100)
						ctx.restore()
					},1000/60)
				}
			}
		</script>
	</body>
</html>
```