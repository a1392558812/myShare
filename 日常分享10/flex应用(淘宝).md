```html
<!DOCTYPE html>
<html>
<head>
	<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no" />
	<meta charset="UTF-8">
	<title>flex应用(淘宝)</title>
	<style type="text/css">
		*{
			padding: 0;
			margin: 0;
		}
		a{
			text-decoration: none;
			color: gray;
			display: block;
		}
		#nav>.row{
			display: flex;
			text-align: center;
		}
		#nav>.row>.item{
			flex: 1;
			text-align: center;
		}
		#nav>.row>.item>a::before{
			content: "";
			display: block;
			width: 85px;
			height: 85px;
			margin: 0 auto;
			background-image: url(img/timg.jpg);
			background-size: 235px;
			background-repeat: no-repeat;
		}
		#nav>.row:nth-child(1)>.item:nth-child(1)>a::before{
			background-position: 0 0;
		}
		#nav>.row:nth-child(1)>.item:nth-child(2)>a::before{
			background-position: -76px 0;
		}
		#nav>.row:nth-child(1)>.item:nth-child(3)>a::before{
			background-position: -152px 0;
		}
		#nav>.row:nth-child(1)>.item:nth-child(4)>a::before{
			background-position: 0px -82px;
		}
		#nav>.row:nth-child(1)>.item:nth-child(5)>a::before{
			background-position: -76px -82px;
		}
		#nav>.row:nth-child(2)>.item:nth-child(1)>a::before{
			background-position: -152px -82px;
		}
		#nav>.row:nth-child(2)>.item:nth-child(2)>a::before{
			background-position: 0 -164px;
		}
		#nav>.row:nth-child(2)>.item:nth-child(3)>a::before{
			background-position: -76px -164px;
		}
		#nav>.row:nth-child(2)>.item:nth-child(4)>a::before{
			background-position: -152px -164px;
		}
		#nav>.row:nth-child(1)>.item:nth-child(1)>a::before{
			background-position: 0 0;
		}
	</style>
</head>
<body>
<div id="nav">
	<div class="row">
		<div class="item">
			<a href="javascript:;">大娃</a>
		</div>
		<div class="item">
			<a href="javascript:;">二娃</a>
		</div>
		<div class="item">
			<a href="javascript:;">三娃</a>
		</div>
		<div class="item">
			<a href="javascript:;">四娃</a>
		</div>
		<div class="item">
			<a href="javascript:;">五娃</a>
		</div>
	</div>
	<div class="row">
		<div class="item">
			<a href="javascript:;">充值中心</a>
		</div>
		<div class="item">
			<a href="javascript:;">旅行攻略</a>
		</div>
		<div class="item">
			<a href="javascript:;">领取金币</a>
		</div>
		<div class="item">
			<a href="javascript:;">拍卖玩</a>
		</div>
		<div class="item">
			<a href="javascript:;">分类</a>
		</div>
	</div>
</div>
</body>
</html>

```