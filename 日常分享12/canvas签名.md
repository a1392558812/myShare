```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>canvas签名</title>
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
				if(canvas.getContext){//如果浏览器支持canva绘画，则使用一下代码
					var ctx = canvas.getContext("2d")//实现一个2d画笔
					canvas.onmousedown = function(event){//触发画布的鼠标按下事件
						console.log("鼠标被点击")
						var coOrdinate = event||window.event//兼容IE
						if(canvas.setCapture){
							canvas.setCapture()//鼠标事件的贪婪捕获。
							/*该函数在属于当前线程的指定窗口里设置鼠标捕获。一旦窗口捕获了鼠标，所有鼠标输入都针对该窗口，
							无论光标是否在窗口的边界内。同一时刻只能有一个窗口捕获鼠标。如果鼠标光标在另一个线程创建的窗口上，
							只有当鼠标键按下时系统才将鼠标输入指向指定的窗口。*/
							ctx.beginPath()//初始化路径
							ctx.moveTo(event.clientX - canvas.offsetLeft,event.clientY - canvas.offsetTop)
							//当鼠标被按下，获取到起始位置
						}
						console.log("开始绘画,初始化路径")
						 document.onmousemove = function(event){
						 	coOrdinate = event||window.event
						 	ctx.save()
							ctx.strokeStyle= "red"
							ctx.lineTo(event.clientX - canvas.offsetLeft,event.clientY - canvas.offsetTop)
						 	ctx.stroke()
						 	console.log("绘画完成")
						 }
						 document.onmouseup = function(){
						 	console.log("鼠标抬起")
						 	ctx.beginPath()//初始化路径
						 	ctx.restore()
						 	console.log("执行了ctx.beginPath()与ctx.restore()")
						 	document.onmousemove =null
						 	document.onmouseup=null//释放鼠标事件
						 	if(document.releaseCapture){//释放鼠标的贪婪捕获
						 		document.releaseCapture
						 	}
						 }
						 return false//阻止浏览器的默认鼠标点击与鼠标滑动行为
					}	 
				}
			}
		</script>
	</body>
</html>

```