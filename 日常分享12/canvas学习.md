```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>canvas学习</title>
	</head>
	<style type="text/css">
		*{
			padding: 0;
			margin: 0;
		}
		#test{
			background-color: red;
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
			canvas基本用法
				-1.canvas，可以通过js脚本来绘制图形
				-2.canvas默认属性：width:300px,height:150px
				-3.默认背景色为父标签颜色
				-4.在一些上古的浏览器中(比如IE9以下)，其不支持<canvas></canvas>标签
						但是在这些浏览器上要展现给用户提示信息
							<canvas  id="test" width="" height="">
								<span>您的浏览器不支持画布元素，请下载最新的浏览器</span>
							</canvas>
						支持	<canvas></canvas>的浏览器将会自动忽略掉在容器内包含的内容，正常渲染<canvas></canvas>
						不支持的浏览器会显示代替内容
				-5.不要用css指定高宽，
				-6.canvas有一个getContext()方法，这个方法是用来获得渲染上下文和他的绘画功能，其只有一个参数，上下文的格式
						在使用时需要检查其支持性
							if(canvas.getContext){
								var ctx = canvas.getContext("2d")
							}
				-7.
		-->
		<canvas id="test" width="300" height="300">
			<span>您的浏览器不支持画布元素，请下载最新的浏览器</span>
		</canvas>
		<script type="text/javascript">
			window.onload = function(){
				//查看querySelector()API
				//获取canvas画布
				var canvas = document.querySelector("#test")
				if(canvas.getContext){
					var ctx = canvas.getContext("2d")
					//test.getContext()传递一个参数，为画布的模式
				}
			}
		</script>
	</body>
</html>

```