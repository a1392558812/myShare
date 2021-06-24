```html

<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>时钟</title>
	</head>
	<style type="text/css">
		*{
			padding: 0;
			margin: 0;
		}
		html,body{
			height: 100%;
			/*overflow: hidden;*/
		}
		body{
			overflow: auto;
		}
		#clock{
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
		<canvas id="clock" width="800" height="800">
			<span>您的浏览器不支持画布元素，请下载最新的浏览器</span>
		</canvas>
		<script type="text/javascript">
			window.onload = function(){
				var canvas = document.querySelector("#clock")
				if(canvas.getContext){
					var ctx = canvas.getContext("2d")
					setInterval(function(){
						ctx.clearRect(0,0,800,800)
						move()
					},1000)
					function move(){
						//初始化工作与全局样式统一
						ctx.save()
						ctx.lineWidth = 15
						ctx.strokeStyle = "black"
						ctx.lineCap = "round"
						ctx.translate(400,400)
						ctx.rotate(-90*(Math.PI/180))
						ctx.beginPath()
						//此处完成初始化工作
						
						
						
						
						
						
						//开始绘制外层表盘
						ctx.save()
						ctx.strokeStyle = "pink"
						ctx.lineWidth = 18
						ctx.beginPath()
						ctx.arc(0,0,200,0,360*(Math.PI/180))
						ctx.stroke()
						ctx.restore()
						//外层表盘绘制完成
						
						
						
						
						
						
						//绘制时针刻度
						ctx.save()
						ctx.lineWidth = 9
						for(var i=0;i<12;i++){
							ctx.beginPath()
							ctx.rotate(30*(Math.PI/180))
							ctx.moveTo(146,0)
							ctx.lineTo(166,0)
							ctx.stroke()
						}
						ctx.restore()
						//绘制时针刻度完成
						
						
						
						
						//绘制秒针刻度
						ctx.save()
						ctx.lineWidth = 5
						ctx.beginPath()
						for(var i=0;i<60;i++){
							ctx.rotate(6*(Math.PI/180))
							if((i+1)%5!==0){
								ctx.moveTo(160,0)
								ctx.lineTo(166,0)
								ctx.stroke()
							}
						}
						ctx.restore()
						//绘制秒针刻度完成
						
						
						
						//计算当前时间
						var data = new Date()
						var s = data.getSeconds()
						var m = data.getMinutes()+s/60
						var h = data.getHours()+m/60
						h = h>12?h-12:h//使得当前为12小时制
						//时间获得完毕
						
						
						//绘制分针
						ctx.save()
						ctx.lineWidth = 10
						
						ctx.beginPath()
						ctx.rotate(m*6*(Math.PI/180))
						ctx.moveTo(-30,0)
						ctx.lineTo(150,0)
						ctx.stroke()
						ctx.restore()
						//绘制分针完成
						
						
						
						
						
						
						//绘制时针
						ctx.save()
						ctx.lineWidth = 14
						ctx.rotate(h*30*(Math.PI/180))
						ctx.beginPath()
						ctx.moveTo(-15,0)
						ctx.lineTo(65,0)
						ctx.stroke()
						ctx.restore()
						//绘制时针完成
						
						
						
						//绘制秒针
						ctx.save()
						ctx.lineWidth = 6
						ctx.rotate(s*6*(Math.PI/180))
						ctx.lineCap = "round"
						ctx.strokeStyle = "red"
						ctx.beginPath()
						ctx.moveTo(-32,0)
						ctx.lineTo(152,0)
						ctx.stroke()
							//开始绘制秒针尾部
							ctx.save()
							ctx.beginPath()
							ctx.arc(163,0,10,0,360*(Math.PI/180))
							ctx.stroke()
							ctx.restore()
							//秒针尾部绘制完成
						ctx.restore()
						//绘制秒针完成
						
						
						//绘制底座
						ctx.save()
						ctx.fillStyle = "red"
						ctx.beginPath()
						ctx.arc(0,0,15,0,360*(Math.PI/180))
						ctx.fill()
						ctx.restore()
						//绘制底座完成
						
						
						
						
						
						
						ctx.restore()
					}
				}
			}
		</script>
	</body>
</html>
```