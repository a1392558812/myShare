```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>canvas文本对齐</title>
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
					var ctx = canvas.getContext("2d")
					var canvasWidth = canvas.width
					var canvasHeight = canvas.height
					ctx.fillStyle = "pink"
					ctx.font = "100px sans-serif"
					ctx.textBaseline = "middle"
					var obj = ctx.measureText("喜羊羊")
					var canvasTextWidth = obj.width
					ctx.fillText("喜羊羊",(canvasWidth-canvasTextWidth)/2,(canvasHeight-100)/2)
					console.log(obj)
					console.log("canvas.width:"+canvas.height)
					console.log("canvas.height:"+canvas.height)
					console.log("canvasTextWidth:"+canvasTextWidth)
				}
			}
		</script>
	</body>
</html>

```