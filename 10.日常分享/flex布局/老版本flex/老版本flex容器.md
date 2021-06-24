```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>老版本flex容器</title>
	<style type="text/css">
		/*flex容器
      !!!!!!!flex项目：项目永远在主轴的正方向上排列*/
		*{
			padding: 0;
			margin: 0;
		}
		#warp{
			/*width: 100px;*/
			width: 400px;
			height: 400px;
			border: 1px solid black;
			margin: 0 auto;
			display: -webkit-box;
			/*display: flex;*/
			/*flex不等同于浮动，
       老版本的flex(-webkit-box)与新版本的flex(flex)不同*/
			-webkit-box-orient:horizontal ;
			/*(容器的布局方向)
       * -webkit-box-orient:horizontal;控制主轴和侧轴分别是哪个
                 horizontal 默认值沿着x轴排列
                 vertical Y轴排列*/
			-webkit-box-direction: normal;
			/*(容器的排列方向)
       * -webkit-box-direction: ;决定主轴的方向
       * 					normal默认值,主轴默认的正方向
       * 					reverse 与主轴默认的正方向相反的方向
       */
			-webkit-box-pack:justify;
			/*-webkit-box-pack: ;主轴上富裕空间管理
                 start 富裕空间在(主轴为X轴)右侧，(主轴为Y轴)下侧
                 end 富裕空间在(主轴为X轴)左侧，(主轴为Y轴)上侧
                 center 富裕空间在俩边
                 justify 富裕空间在项目中间*/
			-webkit-box-align: center;
			/*-webkit-box-align: ;侧轴上富裕空间的管理
                 start 富裕空间在(侧轴为X轴)右侧，(侧轴为Y轴)下侧
                 end 富裕空间在(侧轴为X轴)左边，(侧轴为Y轴)上边
                 center 富裕空间在俩边*/
		}
		#warp>.item{
			width: 50px;
			height: 50px;
			background-color: pink;
			text-align: center;
			line-height: 50px;
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