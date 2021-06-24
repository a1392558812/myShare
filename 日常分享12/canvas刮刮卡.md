```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no" />
		<title>canvas刮刮卡</title>
	</head>
	<style type="text/css">
		*{
			padding: 0;
			margin: 0;
		}
		html,body{
			height: 100%;
			width: 100%;
			overflow: hidden;
		}
		#wrap,ul,ul>li{
			height: 100%;
		}
		ul>li:nth-child(1){
			background-image: url(img/08.jpg);
			background-size: auto 100%;
			background-position: -600px 0;
		}
		#test{
			position: absolute;
			top: 0;
			left: 0;
			/*background-color: pink;*/
			transition: 2s;
		}
	</style>
	<body>
		<div id="wrap">
			<canvas id="test"></canvas>
			<ul>
				<li></li>
				<li></li>
				<li></li>
				<li></li>
			</ul>
		</div>
		<script type="text/javascript">
			window.onload = function(){
				var canvas = document.querySelector("#test")
				canvas.width = document.documentElement.clientWidth
				canvas.height = document.documentElement.clientHeight
				if(canvas.getContext){
					var ctx = canvas.getContext("2d")
					var img = new Image()
					img.src = "img/10.jpg"
					img.onload = function(){
						draw(img)
					}
					function draw(){
						var flag = 0//初始化透明色的数量
						ctx.drawImage(img,0,0,canvas.width,canvas.height)
						canvas.addEventListener("touchstart",function(ev){//绑定手指触屏事件
							ev = ev||event
							var touchNum = ev.changedTouches[0]//获得触摸屏幕的第一根手指，changedTouches[]代表手指列表数组
							var x = touchNum.clientX - canvas.offsetLeft
							var y = touchNum.clientY - canvas.offsetTop
							ctx.globalCompositeOperation = "destination-out"
							ctx.lineWidth = 50
							ctx.lineCap = "round"
							ctx.lineJoin = "round"
							ctx.save()
							ctx.beginPath()
							ctx.moveTo(x,y)
							ctx.lineTo(x+1,y+1)
							ctx.stroke()
							ctx.restore()
						})
						canvas.addEventListener("touchmove",function(ev){//绑定手指滑屏事件
							ev = ev||event
							var touchNum = ev.changedTouches[0]//获得触摸屏幕的第一根手指，changedTouches[]代表手指列表数组
							var x = touchNum.clientX - canvas.offsetLeft
							var y = touchNum.clientY - canvas.offsetTop
							ctx.save()
							ctx.lineTo(x,y)
							ctx.stroke()
							ctx.restore()						
						})
						canvas.addEventListener("touchend",function(){
							var imgData = ctx.getImageData(0,0,canvas.width,canvas.height)
							var allPx = canvas.width*canvas.height
							for(var i=0;i<allPx;i++){
								if(imgData.data[4*i+3] ===0){
									flag++
								}
								if(flag>=allPx*1.5){
									canvas.style.opacity = 0
								}
							}
						})
						canvas.addEventListener("transitionend",function(){
							this.remove()
						})
						
						
						
					}
				
					 
					
				
				
				}
			}
		</script>
	</body>
</html>

```