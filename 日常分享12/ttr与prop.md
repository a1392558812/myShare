```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>attr与prop</title>
		<style type="text/css">
			*{
				padding: 0;
				margin: 0;
			}
			#box1,#box2{
				border: 2px solid black;
				margin-bottom: 30px;
			}
		</style>
	</head>
	<body>
		<div id="box1">
			checked="checked"：<input type="checkbox" name="checkbox" checked="checked"/><br />
			checked=checked：<input type="checkbox" name="checkbox" checked=checked/><br />
			checked="true"：<input type="checkbox" name="checkbox" checked="true"/><br />
			checked=true：<input type="checkbox" name="checkbox" checked=true/><br />
			checked="false"：<input type="checkbox" name="checkbox" checked="false"/><br />
			checked=false：<input type="checkbox" name="checkbox" checked=false/><br />
			checked=""：<input type="checkbox" name="checkbox" checked=""/><br />
			checked=null：<input type="checkbox" name="checkbox" checked=null/><br />
			checked="null"：<input type="checkbox" name="checkbox" checked="null"/><br />
			checked=undefined：<input type="checkbox" name="checkbox" checked=undefined/><br />
			checked="undefined"：<input type="checkbox" name="checkbox" checked="undefined"/><br />
			checked="0"：<input type="checkbox" name="checkbox" checked="0"/><br />
			checked=0：<input type="checkbox" name="checkbox" checked=0/><br />
			checked="1"：<input type="checkbox" name="checkbox" checked="1"/><br />
			checked=1：<input type="checkbox" name="checkbox" checked=1/><br />
			checked：<input type="checkbox" name="checkbox" checked/><br />
			checked=：<input type="checkbox" name="checkbox" checked=/><br />
			不写checked：<input type="checkbox" name="checkbox"/><br />
		</div>
		<div id="box2">
			<input type="checkbox" name="checkbox" id="checkbox" checked="checked" selectIt = "已点击"/>
			<!--
				checked="checked"即是html文本的attribute
				也是DOM节点的property
				
			-->
		</div>
	</body>
	<script src="js/jquery.min.js" type="text/javascript" charset="utf-8"></script>
	<script type="text/javascript">
		var input = document.querySelector("input[selectIt = '已点击']")
		console.log(input)
		console.log($("input[selectIt = '已点击']"))
		/*
			property:js原生对象的属性
			attribute：文本属性(html的直接预定义与自定义属性)
		 	每一个预定义的attribute(比如我们自定义的：selectIt = "已点击")都会有一个property与之对应
		
		*/
		var obj = {
			name:"sunLi",
			height:180
		}
		//操作input的attribute
		input.setAttribute("checked","checked1")
		//操作input的property
		input.checked = "checked2"
		console.log($("input[selectIt = '已点击']"))
		/*
			在非布尔值情况下 attribute与property同步更新
			在布尔值情况下 attribute与property不会同步更新
				在改变property时永远不会更新attribute
					在没有操作过property时，attribute会同步更新property，但是一旦property更新后，就不会随着attribute同步了
		*/
		
		/*
			浏览器只认(操作的是)property
			用户操作的是property
			
		*/
	</script>
</html>

```