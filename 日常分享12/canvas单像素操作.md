```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>单像素操作</title>
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
					ctx.save()
					ctx.fillStyle = "pink"
					ctx.strokeStyle = "red"
					ctx.beginPath()
					ctx.fillRect(100,100,100,100)
					ctx.restore()
					var imageData1 = ctx.getImageData(0,0,canvas.width,canvas.height)
					var color1 = getPxInfo(imageData1,100,100)
					
					
					
					for(var i=0;i<canvas.width;i++){
						setPxInfo(imageData1,99,i,[0,0,0,255])
						ctx.putImageData(imageData1,0,0)
					}
						
					
					
				//定义一个方法，获得单个位置的单个像素点
				function getPxInfo(imageData,x,y){
					var color = []
					var data = imageData.data
					var w = imageData.width
					color[0] = data[(y*w+x)*4]
					color[1] = data[(y*w+x)*4+1]
					color[2] = data[(y*w+x)*4+2]
					color[3] = data[(y*w+x)*4+3]
					console.log(color)
					return color
				}
				
				
				
				
				//定义一个方法，设置单个位置的单个像素点
				function setPxInfo(imageData,x,y,color){
					var newColor = color
					var data = imageData.data
					var w = imageData.width
					data[(y*w+x)*4] = newColor[0]
					data[(y*w+x)*4+1] = newColor[1]
					data[(y*w+x)*4+2] = newColor[2]
					data[(y*w+x)*4+3] = newColor[3]
					console.log(imageData)
					console.log("已完成颜色设置")
				}
				
				
				
				
				
				
				
				
				
				}
			}
		</script>
	</body>
</html>
```