```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>绘制矩形</title>
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
		<!--
			1.绘制矩形的方法(x,y不加单位)
				-1.绘制一个填充的矩形(填充色默认为黑色)
					ctx.fillRect(x,y,width,height)
				-2.绘制一个矩形边框(默认边框为1px的实心黑色)
					ctx.strokeRect(x,y,width,height)
				-3..x与y指定了canvas画布上的绘制矩形的左上角（相对于圆点）的坐标，width,height设置矩形的尺寸
				       ctx.fillStyle = "pink"	    	ctx.lineWidth = 20	            ctx.strokeStyle = "red"
				必须在ctx.fillRect(x,y,width,height) ctx.strokeRect(x,y,width,height) ctx.clearRect(x,y,width,height)之前设置好
				画笔绘画的矩形覆盖渲染，即先绘画的先渲染
				
				
				
			2.清除指定的矩形区域，让清除部分完全透明
					ctx.clearRect(x,y,width,height)从(x,y)点开始清除画布，清除x~width与y~height区域的画布
				
				
		-->
		<canvas id="test" width="300" height="300">
			<span>您的浏览器不支持画布元素，请下载最新的浏览器</span>
		</canvas>
		<script type="text/javascript">
			window.onload = function(){
				var canvas = document.querySelector("#test")
				if(canvas.getContext){
					var ctx = canvas.getContext("2d")
					//路径与路径连接处的样式
					/*ctx.lineJoin = ""设置切角
					 		bevel:斜角
					 		round:圆角
					 		miter（默认值）:直角
					*/
					ctx.lineJoin = "round"
					
					
					
					
					
					
					//设置画笔的填充颜色
					ctx.fillStyle = "pink"
					//填充的矩形
					ctx.fillRect(0,0,100,100)
					
					
					
					
					
					//设置绘画边框的颜色
					ctx.strokeStyle = "red"
					//设置绘画边框的宽度,值必须为正数
					ctx.lineWidth = 20
					/*带边框的矩形，x,y参数为x=100,y=100的时候，
						矩形是从99.5到100.5开始绘制的，由于css不支持小数，所以绘制即从x=99,y=101开始绘制
						如果我们需要1px的边框
							即从	x=100.5,y=100.5开始绘制
					 
					*/
					ctx.strokeRect(100,100,100,100)
					
					
					/*填充的是底色*/
					ctx.clearRect(100,100,100,100)
				}
			}
		</script>
	</body>
</html>

```