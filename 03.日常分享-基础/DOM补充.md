```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>DOM补充</title>
	<script type="text/javascript">
		window.onload = function(){
			//获取body元素
			var body = document.body;//document.body保存的是body的属性
			var html = document.documentElement;//documentElement保存的是html根标签
			console.log(body);
			console.log(html);
			var all = document.all;//获取所有标签内容（元素）
			console.log(all.length);
			for(var i = 0;i<all.length;i++){
				console.log(all[i].innerHTML);
			}
			//根据元素的class属性查询一组元素的节点对象
			var box1 = document.getElementsByClassName("box1");
			//获取class为box1中为div的子元素
			var sondiv =  document.querySelector(".box1 div");
			/*document.querySelector需要选择器的字符串作为参数，
      可以根据css选择器来查询一个元素节点,但是该方法只会返回唯一的一个元素，如果满足条件的元素有
      多个，那么他只会返回第一个*/
			console.log(sondiv.innerHTML);//返回的是第一个div中div
			/*该方法会将符合条件的元素封装到一个数组中（即使禿条件的元素只有一个）*/
			var sondiv_1 = document.querySelectorAll(".box1 div");
			console.log(sondiv_1.length);
			for(var i=0;i<sondiv_1.length;i++){
				console.log(sondiv_1[i].innerHTML);
			}
		}


	</script>
	<style type="text/css">
		.box1{
			margin: 20px;
			width: 200px;
			height: 200px;
			background-color: #BBFFAA;
		}
		.box2{
			width: 100px;
			height: 100px;
			background-color: yellow;
		}
	</style>
</head>
<body>
<div class="box1">
	<div class="box2">我是box1中的div</div>
</div>
<div></div>
<div class="box1">
	<div class="box2">我是box2中的div</div>
</div>
<div></div>
<div class="box1">
	<div class="box2">我是box3中的div</div>
</div>
<div></div>
<div class="box1">
	<div class="box2">我是box4中的div</div>
</div>
<div></div>
</body>
</html>

```