```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>飞鸟动画</title>
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
		<canvas id="test" width="100%" height="100%">
			<span>您的浏览器不支持画布元素，请下载最新的浏览器</span>
		</canvas>
		<script type="text/javascript">
			window.onload = function(){
				var canvas = document.querySelector("#test")
				canvas.width = document.documentElement.clientWidth
				canvas.height = document.documentElement.clientHeight
				if(canvas.getContext){
					var ctx = canvas.getContext("2d")
					var flag = 0
					var speed = 0
					setInterval(function(){
						ctx.clearRect(0,0,canvas.width,canvas.height)
						flag++
						speed = speed+10
						if(flag==9){
							flag=1
						}
						var img = new Image()
						img.src = "img/fn0"+flag+".jpg"
						img.onload = function(){
							draw(this,speed)
						}
						
					},100)
					function draw(img,speed){
						ctx.drawImage(img,speed,0)
					}
				}
			}
		</script>
	</body>
</html>

```