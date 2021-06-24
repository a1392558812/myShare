```html

<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>canvas曲线</title>
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
				角度转弧度   弧度 = 角度*(Math.PI/180)
				1.canvas绘制圆
					-acr(x,y,半径，起始角度(弧度)，终点角度(弧度)，逆时针/顺时针)
						值      true顺时针，false逆时针
				2.anvas绘制圆弧（三个点控制一段圆弧）
					-acrTo(x1,y1,x2,y2,半径),需要三个控制点
						-起始点:moveTo(x,y)
						-圆弧起点:(x1,x2)
						-圆弧终点:(x2,y2)
						-圆弧半径:半径
				3.二次贝塞尔曲线(三个点控制)
					-ctx.quadraticCurveTo(cp1x,cp1y,x,y)
						ctx.moverTo()指定起点
				4.三次贝塞尔曲线(四个点控制)
					-ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y)
			-->
			
		</canvas>
		<script type="text/javascript">
			window.onload = function(){
				var canvas = document.querySelector("#test")
				if(canvas.getContext){
					var ctx = canvas.getContext("2d")
					//画个圆
					ctx.beginPath()
					ctx.moveTo(200,200)
					ctx.arc(200,200,50,0,270*(Math.PI/180))
					ctx.closePath()
					ctx.stroke()
					//画个弧
					ctx.beginPath()
					ctx.moveTo(50,50)
					ctx.arcTo(300,0,200,200,100)
					ctx.stroke()
					//画个二次贝塞尔
					ctx.beginPath()
					ctx.moveTo(50,50)
					ctx.quadraticCurveTo(300,0,200,200)
					ctx.stroke()
					
					//画个三次贝塞尔
					ctx.beginPath()
					ctx.moveTo(50,50)
					ctx.bezierCurveTo(300,0,200,200,0,300)
					ctx.stroke()
				}
			}
		</script>
	</body>
</html>
```