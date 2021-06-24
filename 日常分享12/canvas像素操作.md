```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>像素操作</title>
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
			<!--
				1.var imageData = ctx.getImageData(x,y,width,height)提取自(x,y)点开始，宽width,高height的矩形内的图像像素数据
						返回值imageData包含的信息
							-width：横向上像素点个数
							-height：纵向上像素点个数
							-data：数组类型的数据，存放每一个像素点的rgba(x1,x2,x3,x4)信息    x4的值不同于css中的rgb()格式，x4的取值范围为0~255，代表透明度
				2.ctx.putImageData(imageData,x,y)     在自(x,y)起始场景中写入imageData像素数据
				3.var newImageData1 = ctx.createImageData(x,y)  创建一个新的imageData数据,宽为x,高为y,不设置颜色参数，默认rgba(0,0,0,0)
			-->
		</canvas>
		<script type="text/javascript">
			window.onload = function(){
				var canvas = document.querySelector("#test")
				if(canvas.getContext){
					var ctx = canvas.getContext("2d")
					ctx.fillStyle = "rgba(255,192,203,0.5)"
					ctx.fillRect(0,0,100,100)
					//获得到150*150个像素点
					var imageData = ctx.getImageData(0,0,100,100)
					console.log(imageData)
					for(var i=0;i<imageData.data.length;i++){
						imageData.data[i*4+3] = 255//修改每一个像素点的透明度
					}
					ctx.putImageData(imageData,0,0)
					
					
					
					//创建一个新的imageData
					var newImageData1 = ctx.createImageData(100,100)
					for(var i=0;i<newImageData1.data.length;i++){
						newImageData1.data[i*4+3] = 255//修改每一个像素点的透明度
					}
					ctx.putImageData(newImageData1,100,100)
					
				}
			}
		</script>
	</body>
</html>
```