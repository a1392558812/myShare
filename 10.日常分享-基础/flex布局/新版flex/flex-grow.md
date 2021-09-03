```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>flex-grow</title>
	<style type="text/css">
		*{
			padding: 0;
			margin: 0;
		}
		#warp{
			width: 400px;
			height: 400px;
			border: 1px solid black;
			margin: 0 auto;
			display: flex;
			flex-direction: row;
			justify-content:flex-start  ;
			align-items: stretch;
		}
		#warp>.item{
			width: 50px;
			height: 50px;
			background-color: pink;
			text-align: center;
			line-height: 50px;
			/*flex-grow: 1;*/
			/*flex-grow: 1;弹性空间管理，将主轴上的富裕空间按照比例分配到各个项目上的width或者height上(与主轴为哪一根有关)
           默认值为1，不可继承*/
		}
		#warp>.item:nth-child(2){
			/*flex-grow: 5;*/
		}
	</style>
</head>
<body>
<div id="warp">
	<div class="item">1</div>
	<div class="item">2</div>
	<div class="item">3</div>
	<div class="item">4</div>
	<div class="item">5</div>
</div>
</body>
</html>

```