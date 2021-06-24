<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>小练习</title>
	<style type="text/css">
		*{
			padding: 0;
			margin: 0;
		}
		#outer{
			padding: 30px;
			width: 450px;
			height: 320px;
			margin-left: -225px;
			margin-top: -160px;
			text-align: center;
			background-color:#bfa ;
			position: absolute;
			left: 50%;
			top: 50%;
		}
		#conect{
			height: 290px;
		}
	</style>
	<script type="text/javascript">
		window.onload=function(){
			var prev = document.getElementById("prev");
			var next = document.getElementById("next");
			var photo = document.getElementById("photo");
			var indexNumber = ["img/01.jpg","img/02.jpg","img/03.jpg","img/04.jpg","img/05.jpg","img/06.jpg"];
			var nowIndex = 0;
			var info = document.getElementById("info");
			info.innerHTML = "一共"+indexNumber.length+"张图片，当前是第"+(nowIndex+1)+"张"
			prev.onclick = function(){
				nowIndex = nowIndex-1;
				if(nowIndex<0){
					alert("已经是第一张图片了");
					nowIndex = 0;
				}else{photo.src = indexNumber[nowIndex];}
				info.innerHTML = "一共"+indexNumber.length+"张图片，当前是第"+(nowIndex+1)+"张"
			}
			next.onclick = function(){
				nowIndex = nowIndex+1;
				if(nowIndex>indexNumber.length-1){
					alert("已经是最后一张图片了");
					nowIndex = indexNumber.length-1;
				}else{photo.src = indexNumber[nowIndex];}
				info.innerHTML = "一共"+indexNumber.length+"张图片，当前是第"+(nowIndex+1)+"张"
			}
		}
	</script>
</head>
<body>
<div id="outer">
	<div id="conect">
		<img id="photo" src="img/01.jpg" alt="一张图片"/>
	</div>

	<div id="bottom">
		<p id="info">一共6张图片，当前是第1张 </p>
		<button  id="prev">上一张</button>
		<button  id="next">下一张</button>
	</div>

</div>
</body>
</html>
