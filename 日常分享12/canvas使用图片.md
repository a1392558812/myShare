```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>canvas使用图片</title>
	</head>
	<style type="text/css">
		*{
			padding: 0;
			margin: 0;
		}
		html,body{
			height: 100%;
			width: 100%;
		}
		#test{
			background-color:white;
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
					var img1 = new Image()
					var img2 = new Image()
					img2.src = "img/s5.jpg"
					img2.onload = function(){
						bg3()
						img1.src = "img/s5.jpg"
						/*img1.onload = function(){
						draw()
						}*/
					}
					
					//引入图片
					function draw(){
						ctx.drawImage(img1,100,100,img1.width,img1.height)
						/*
						 * ctx.drawImage(img,x,y,width,height)
						 	-其中img是image或者canvas对象，x与y是图像在canvas中的起始坐标
						 	-width,height为canvas画入时的缩放大小
						*/
					}
					//设置背景
					function bg1(){
						/*
						 * ctx.createPattern(image,repetition)
						 		-img图像源
						 		-epetition:   "repeat"  /   "repeat-x"   /   "repeat-y"   /   "no-repeat"
						 	一般情况下，我们都会将createpattern(image,repetition)返回的对象作为fillStyle的值
						 */
						var bgPattern = ctx.createPattern(img2,"no-repeat")
						ctx.fillStyle = bgPattern
						ctx.fillRect(0,0,500,500)
					}
					//设置背景线性渐变
					function bg2(){
						/*ctx.createLinearGradient(x1,y1,x2,y2)
						 	-设置背景渐变色渐变起点为(x1,y1),渐变的终点为(x2,y2)
						 	-1.一般情况下，我们都会将ctx.createLinearGradient(x1,y1,x2,y2)返回的对象作为fillStyle的值      
						 			var gradient = ctx.createLinearGradient(0,0,800,800)
						 	-2.gradient.addColorStop(position,color)
						 			-gradient为createLinearGradient返回值
						 			-gradient.addColorStop()俩参数
						 					position必须为0~1之间的数，表示渐变色所在的相对位置，例如0.5为正中间
						 					color：css颜色值
						*/
						var gradient = ctx.createLinearGradient(0,0,800,800)
						gradient.addColorStop(0,"red")
						gradient.addColorStop(0.5,"orange")
						gradient.addColorStop(1,"yellow")
						ctx.fillStyle = gradient
						ctx.fillRect(0,0,800,800)
					}
					//设置背景径向渐变
					function bg3(){
						/*ctx.createRadialGradient(x1,y1,r1,x2,y2,r2)
						 		-前三个参数定义了一个以(x1,y1)半径为r1的圆
						 		-后三个参数定义了一个以(x2,y2)半径为r2的圆
						 		
						 		
						 */
						var gradient = ctx.createRadialGradient(400,400,100,400,400,400)
						gradient.addColorStop(0,"red")
						gradient.addColorStop(0.25,"pink")
						gradient.addColorStop(0.5,"orange")
						gradient.addColorStop(0.75,"yellow")
						gradient.addColorStop(1,"green")
						ctx.fillStyle = gradient
						ctx.fillRect(0,0,800,800)
					}
				}
			}
		</script>
	</body>
</html>

```