```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>canvas文本相关</title>
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
				1.canvas提供俩种方式来绘制文本
					-ctx.fillText(text,x,y)-----》在指定的(x,y)处绘制指定的文本
					-ctx.strokeText(text,x,y)-----》在指定的(x,y)处绘制文本边框
				2.ctx.font = "30px sans-serif"来设置字体
					-设置字体的大小(默认是10px)同时必须指定字体的格式，且字体只有一种格式sans-serif
				3.ctx.textAlign = value  文本对齐方式
					-value的3个可选值：left/right/center    (区别去普通的css居中，ctx.textAlign是以他的起始点为对齐位置)
				4.ctx.textBaseline = value
					-value的3个可选值：   top     文本基线在文本的顶部
									bottom   文本基线在文本的底部
									middle    文本基线在文本的中间
				5.var obj = ctx.measureText()返回一个measureText对象，包含有关文本尺寸的信息
						console.log(obj)
				6.文本阴影
					-ctx.shadowOffsetX = 10              水平10px的阴影
					-ctx.shadowOffsetY = 10               垂直10px的阴影
					-ctx.shadowColor = "red"//必须填写，不写使用默认值透明色
					-ctx.shadowBlur = 10        模糊程度
			-->
		</canvas>
		<script type="text/javascript">
			window.onload = function(){
				var canvas = document.querySelector("#test")
				if(canvas.getContext){
					var ctx = canvas.getContext("2d")
					ctx.fillStyle = "pink"
					ctx.font = "30px sans-serif"
					
					ctx.textAlign = "center"
					ctx.shadowOffsetX = 10
					ctx.shadowColor = "red"
					ctx.shadowBlur = 10
					ctx.fillText("喜羊羊",100,150)
					ctx.textBaseline = top
					ctx.strokeText("喜羊羊",100,100)
					var obj = ctx.measureText("喜羊羊")
					console.log(obj)
				}
			}
		</script>
	</body>
</html>

```