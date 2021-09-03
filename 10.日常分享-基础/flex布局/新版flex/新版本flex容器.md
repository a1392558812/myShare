```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>新版本flex容器</title>
	<style type="text/css">
		/*flex容器
      !!!!!!!!flex项目：项目永远在主轴的正方向上排列*/
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
			/*display: -webkit-box;*/
			display: flex;
			/*flex不等同于浮动，
       老版本的flex(-webkit-box)与新版本的flex(flex)不同*/
			flex-direction: row;
			/*(容器的布局方向+排列方向)
       * flex-direction: row;来控制主轴和侧轴分别是哪一根
       * 					row  默认值，         		从左往右/沿着x轴排列
       * 					column        		从上往下/沿着Y轴排列
       * 					column-reverse 		从下往上/沿着Y轴排列，方向为Y轴反方向
       * 					row-reverse 		从右往左/沿着X轴排列，方向为X轴反方向
       */
			justify-content:space-around ;
			/*justify-content: ;主轴上富裕空间的管理
                 flex-start         富裕空间在主轴的正方向
                 flex-end           富裕空间在主轴的反方向
                 center 			        富裕空间在俩测
                 space-between      富裕空间在项目中间
                 space-around       富裕空间在项目的俩测
      */
			align-items: stretch;
			/*align-items: ;侧轴上富裕空间的额管理，每一个项目各自为一个整体
                 flex-start         富裕空间在侧轴的正方向
                 flex-end           富裕空间在侧轴的反方向
                 center 			        富裕空间在侧轴的俩边
                 baseline       	        富裕空间按基线对齐处理
                 stretch（默认值）              拉伸（没有高度的时候实现等高布局）*/

		}
		#warp>.item{
			width: 50px;
			height: 50px;
			background-color: pink;
			text-align: center;
			line-height: 50px;
			/*float: left;*/
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