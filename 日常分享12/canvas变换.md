```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>canvas变换</title>
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
					ctx.translate(50,50)
					/*ctx.translate(x,y)
					 	1.用来移动canvas原点到一个不同的位置，
					 		-接受俩个参数     x,y    {x表示向左偏移，y表示向右偏移}
					 	2.ctx.translate(x,y)属性是累加的，如果定义俩次
					 			比如: ctx.translate(50,50)
					 				 ctx.translate(30,50)
					 				 ... ...
					 				 
					 								相当于=> ctx.translate(80,100)
					 */
					ctx.beginPath()
					ctx.fillRect(0,0,100,100)//此时原点已经变为(50，50)
					
					
					
					
					
					
					ctx.beginPath()
					/*ctx.rotate()用于旋转，旋转中心始终是canvas原点
							-接受一个参数(弧度)，以顺时针为方向
					 		-ctx.rotate()属性也是累加的
					 */
					ctx.translate(200,200)
					ctx.rotate(45*(Math.PI/180))//坐标轴旋转45°
					ctx.fillRect(50,50,100,100)
					
					
					
					ctx.beginPath()
					ctx.scale(.5,.5)
					/*ctx.scale()缩放
						1.接受俩个参数x,y分别为x轴与y轴的缩放因子，必须为正值
						2.放大的是css像素的面积，区域内css像素变小
							-简单理解，我们定义的画布大小为800x800，即800x800个像素点，当ctx.scale(2,2)时，
							  画布的尺寸大小没有变，还是800x800，但是区域内像素点变为400x400
							-缩小同理
					 */
					
					ctx.fillRect(600,600,100,100)
				}
			}
		</script>
	</body>
</html>
```