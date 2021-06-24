```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>canvas合成</title>
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
					ctx.fillStyle = "pink"
					/*ctx.globalAlpha = 0.5*/
					/*设置全局样式透明度
					 	-取值范围0~1，
					 * */
					ctx.fillRect(0,0,100,100)
					ctx.globalCompositeOperation = "source-out"	
					/*ctx.globalCompositeOperation = "source-over"
					 	覆盖合成
					 		source:新的图像(源)
					 		destination:已经绘制过的图形(目标)
					 		取值：1.source-over(默认值)，源在上层，新的图像层级比较高
					 			2.source-in，只保留源与目标重叠的部分(源的那部分)
					 			3.source-out：只留下源超出目标的部分
					 			4.source-atop:砍掉源溢出的部分
					 			
					 			1.destination-over:目标在上面，旧的图像层级比较高
					 			2.destination-in:只保留源与目标重叠的部分(目标的那部分)
					 			3.destination-out:只留下目标超出源的部分
					 			4.destination-atop:砍掉目标溢出的部分
					 
					 
					 
					 */
					ctx.fillStyle = "orange"
					ctx.fillRect(50,50,100,100)
				}
			}
		</script>
	</body>
</html>

```