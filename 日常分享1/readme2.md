```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>事件测试</title>
		<script type="text/javascript">
			  //onload事件会在整个页面加载完成后才触发
			  //为window绑定一个onload事件
			  window.onload = function(){
			  	var btn2 = document.getElementById("btn2");
			    btn2.onclick = function(){
				alert("测试按钮2");
			}
			  };
		</script>
	</head>
	<body>
		<button id="btn">我是一个按钮</button>
		<br />
		<script type="text/javascript">
			//获取button对象、
			var btn = document.getElementById("btn");
			console.log(typeof btn);
			//修改按钮的文字
			console.log(btn.innerHTML);//检查是否能获取到btn中的内容
			btn.innerHTML = "老八的奥利给按钮";
			console.log(btn.innerHTML);
			console.log("*********************************************************************************************");	
 
</script>


            <button id="btn1" ondblclick="alert('测试结束')">测试按钮</button><br />
            <script type="text/javascript">
            //为我们的测试按钮绑定事件	
            //W3C school参考DOM EVENT，获取相应的事件类型
            </script>
        <!--由于行为和表现耦合，我们不推荐使用上面的代码，我们需要将行为和表现分离-->
        
        <button id="btn2">测试按钮2</button>

	</body>
</html>

```