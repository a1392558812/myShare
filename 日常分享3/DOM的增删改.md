```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>DOM的增删改</title>
		<script type="text/javascript">
			window.onload = function(){							
			function myClick(idStr,fun){
				var btn = document.getElementById(idStr);
				btn.onclick = fun;
			}
			//为btn01绑定单击响应函数
			myClick("btn01",function(){
				//创建广州节点，<li>广州</li>----->先创建<li>节点，再创建“广州”文本节点
			var li = document.createElement("li");/*创建li元素节点，document.createElement()方法
				需要一个字符串类型的标签名作为参数，并根据该标签名来创建元素节点对象，并将创建好的对象作为
				返回值返回*/
				//创建广州文本节点
			var gzText  =	document.createTextNode("广州");/*document.createTextNode();可以用来创建一个文本节点对象
				需要一个字符串类型的文本数据内容作为参数，将会根据该内容创建的文本节点，并将新节点返回*/				
			/*将gzText设置为我们新添加的li的子节点*/
			/*appendChild()向一个父节点中添加一个新的子节点
			 用法：父节点.appendChild(子节点)*/
			li.appendChild(gzText);
			//获取id为city的节点
			var city = document.getElementById("city");
			//将广州节点添加到id为city节点下
			city.appendChild(li);
			})
			//将广州节点插入到#bj前面
			myClick("btn02",function(){
				var li = document.createElement("li");
				var gzText = document.createTextNode("广州");
				li.appendChild(gzText);
				//创建一个id为北京的节点
				var bj = document.getElementById("bj");
				//获取city对象节点
				var city = document.getElementById("city");
				city.insertBefore(li,bj);/*insertBefore(新子节点,旧子节点);
				语法：
								父节点.insertBefore(新子节点,旧子节点)*/
			})
			//使用“广州”节点替换id为bj的节点
			myClick("btn03",function(){
				var li = document.createElement("li");
				var gzText = document.createTextNode("广州");
				var bj = document.getElementById("bj");
				var city = document.getElementById("city");
				li.appendChild(gzText);
				city.replaceChild(li,bj);/*可以使用指定的子节点替换已有的子节点
							语法：父节点.replaceChild(要替换的新的子节点,旧的子节点);*/
			})
			//删除#bj的子节点
			myClick("btn04",function(){
				var bj = document.getElementById("bj");
				var city = document.getElementById("city");
				//city.removeChild(bj);
						/*删除指定的子节点
						语法：父节点.removeChild(指定的子节点)*/
				bj.parentNode.removeChild(bj);//子节点.parentNode()可以获取字节的父节点
			})
			//读取id为city的内html代码
			myClick("btn05",function(){
				var city = document.getElementById("city");
				console.log(city.innerHTML);
				alert(city.innerHTML);
			}) 
			//设置id为bj的html代码
			myClick("btn06",function(){
				var bj = document.getElementById("bj");
				bj.innerHTML = "新北京";
			})
			myClick("btn07",function(){
				//向city中添加广州
				var city = document.getElementById("city");
				//方法一：city.innerHTML = city.innerHTML+"<li>广州</li>";（不推荐）
				//方法二：
				var li = document.createElement("li");
				li.innerHTML = "广州";
				city.appendChild(li);
			})
	}; 
		</script>
		<style type="text/css">
			*{ 
				padding: 0;
				margin: 0;
			}
			#total{
				width: 500px;
				border: 5px solid #000;
				float: left;
				margin: 50px 300px;
			}
			#total p{
				margin: 30px 10px 50px 30px;
			}
			#total li{
				float: left;
				background-color: #bfa;
				list-style-type: none;
				margin: 5px;
				border: 2px solid #000000;
			}		
			#total #city{
				padding: 0 0 90px 25px;
			}
		    #btnlist{
		    	float: right;
		    	clear: both;		    	
				position: absolute;
				left: 840px;
				top: 50px;
		    }
		    #btnlist button{
		    	height: 30px;
		    	margin: 0 0 10px 0;
		    	padding: 1px 5px;
		    	line-height: 30px;
		    	text-align: center;
		    	
		    }
		</style>
	</head>
	<body>
		<div id="total">
			<div class="inner">
				<p>你喜欢哪个城市？</p>
				<ul id="city">
					<li id="bj">北京</li>
					<li>上海</li>
					<li>东京</li>
					<li>首尔</li>
				</ul>
				
			</div>
		</div>
		<div id="btnlist">
			<div><button id="btn01">创建一个"广州"节点，添加到"#city"下</button></div>
			<div><button id="btn02">将“广州”节点插入到“bj”前面</button></div>
			<div><button id="btn03">使用“广州”节点替换#bj节点</button></div>
			<div><button id="btn04">删除#bj节点</button></div>
			<div><button id="btn05">读取#city内的HTML代码</button></div>
			<div><button id="btn06">设置#bj内的html代码</button></div>
			<div><button id="btn07">使用新方法创建一个"广州"节点，添加到"#city"下</button></div>
		</div>
	</body>
</html>

```