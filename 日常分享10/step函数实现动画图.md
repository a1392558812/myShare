```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>step函数实现动画图</title>
	<style type="text/css">
		*{
			padding: 0;
			margin: 0;
		}
		/*1472x325-8帧 184px*/
		html,body{
			width: 100%;
			height: 100%;
			overflow: hidden;
		}
		#test{
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate3d(-50%,-50%,0);
			width: 184px;
			height: 325px;
			background-image: url(img/02.jpg);
			animation: move 1s steps(8,end)  infinite;
		}
		@keyframes move{
			from{
				background-position: 0px 0px;
			}
			to{
				background-position: -1472px 0px;
			}
		}

	</style>
</head>
<body>
<div id="test"></div>
</body>
</html>

```