```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>马赛克操作</title>
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
		<canvas id="test" width="" height="">
			<span>您的浏览器不支持画布元素，请下载最新的浏览器</span>
		</canvas>
		<script type="text/javascript">
			window.onload = function(){
				var oc = document.querySelector("#test")
				if(oc.getContext){
					var ctx = oc.getContext("2d")
					var img = new Image()
					img.src = "img/xx.jpg"
					img.onload = function(){
						oc.width = img.width*2
						oc.height = img.height
						draw(img)
					}
				//
				function draw(img){
					ctx.drawImage(img,0,0)
					
					
					
					var oldImgData = ctx.getImageData(0,0,img.width,img.height)
					var newImgData = ctx.createImageData(img.width,img.height)
					//开始制作马赛克
					/*
						1.选取一个马赛克矩形
						2.从马赛克矩形中随机抽取一个像素点信息代替其他的像素点信息
						
					*/
					var size = 4
					for(var i=0;i<oldImgData.width/size;i++){
						for(var j=0;j<oldImgData.height/size;j++){
							//(i,j)马赛克矩形的坐标
							/*
							 		马赛克矩形坐标                                                               画布对应的坐标区域
							 		(0,0)							  (0,0)~(4,4)
							 		(0,1)							  (0,4)~(4,8)
							 		(0,2)                             (0,8)~(4,12)
							 					...			...
							 		(1,0)							  (4,0)~(4,4)
							 		(2,0)							  (8,0)~(12,0)
							 					...  		...
							 		(1,1)							  (4,4)~(8,8)
							 		(2,2) 							  (8,8)~(12,12)
							 
							*/
							//Math.random()   [0~1)
							//Math.random()*(size +1)      [0~5)
							//parseInt(Math.random()*(size +1))      [0~4]
							var Scolor = getPxInfo(oldImgData,i*size+Math.floor(Math.random()*size),j*size+Math.floor(Math.random()*size))
							//已选取一个随机颜色
							//将马赛克矩形中的其他颜色替换
							for(var k=0;k<size;k++){
								for(var m=0;m<size;m++){
									setPxInfo(newImgData,k+i*size,m+j*size,Scolor)
								}
							}
						}
					}
					ctx.putImageData(newImgData,img.width,0)
				}
				
					
					
				//定义一个方法，获得单个位置的单个像素点
				function getPxInfo(imageData,x,y){
					var color = []
					var data = imageData.data
					var w = imageData.width
					color[0] = data[(y*w+x)*4]
					color[1] = data[(y*w+x)*4+1]
					color[2] = data[(y*w+x)*4+2]
					color[3] = data[(y*w+x)*4+3]
					return color
				}
				//定义一个方法，设置单个位置的单个像素点
				function setPxInfo(imageData,x,y,color){
					var newColor = color
					var data = imageData.data
					var w = imageData.width
					data[(y*w+x)*4] = newColor[0]
					data[(y*w+x)*4+1] = newColor[1]
					data[(y*w+x)*4+2] = newColor[2]
					data[(y*w+x)*4+3] = newColor[3]
				}
				}
			}
		</script>
	</body>
</html>
```