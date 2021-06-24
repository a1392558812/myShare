```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>div跟随按键移动</title>
</head>
<script type="text/javascript">
	window.onload = function(){
		var box1 = document.getElementById("box1");
		/*console.log(box1.style.left);*/
		var timer;
		var speed=10;
		var fx;
		document.onkeydown = function(event){
			fx = event.keyCode;
			console.log(fx);
			if(event.ctrlKey){
				speed = 40;
			}else{
				speed = 10;
			}
			clearInterval(timer);
			timer = setInterval(function(){
				if(fx==37){
					box1.style.left = box1.offsetLeft-speed+"px";
				}
				if(fx==38){
					box1.style.top = box1.offsetTop-speed+"px";
				}
				if(fx==39){
					box1.style.left = box1.offsetLeft+speed+"px";
				}
				if(fx==40){
					box1.style.top = box1.offsetTop+speed+"px";
				}
			},10);
		};
		document.onkeyup = function(){
			clearInterval(timer);
		}
		/*开启一个定时器，来控制div的移动速度*/
		/*document.onkeydown = function(event){
    console.log(event.keyCode);*/
		/*box1.offsetLeft-
              获取box1的左偏移量
    box1.offsetTop-
            获取box1的上偏移量*/
		/*var speed = 10;*/
		/*实现功能，如果用户按下Ctrl，则速度加快*/
		/*	if(event.ctrlKey){
        speed = 40;
      }
      if(event.keyCode==37){

        box1.style.left = box1.offsetLeft-speed+"px";

      }
      if(event.keyCode==38){
        box1.style.top = box1.offsetTop-speed+"px";
      }
      if(event.keyCode==39){
        box1.style.left = box1.offsetLeft+speed+"px";
      }
      if(event.keyCode==40){
        box1.style.top = box1.offsetTop+speed+"px";
      }

  }*/

	}

</script>
<style type="text/css">
	*{
		padding: 0;
		margin: 0;
	}
	#box1{
		width: 200px;
		height: 200px;
		background-color: red;
		position: absolute;

	}
</style>
<body>
<div id="box1">

</div>
</body>
</html>

```