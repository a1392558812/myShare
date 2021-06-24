```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>全选练习</title>
	<script type="text/javascript">
		window.onload = function(){
			var checkallbtn = document.getElementById("checkallbtn");//获取全选按钮对象
			var allcheck = document.getElementById("allcheck");//获取全选或全不选按钮对象
			var nocheckallbtn = document.getElementById("nocheckallbtn");//获取全不选按钮对象
			var revcheckallbtn = document.getElementById("revcheckallbtn");//获取反选按钮对象
			var items = document.getElementsByName("items");//获取爱好勾选框对象
			var send = document.getElementById("send");//获取提交按钮对象
			//全选功能
			checkallbtn.onclick = function(){
				//设置四个多选框成为选中状态
				//console.log(items.length);输出4，表示获取到4个按钮对象
				//遍历数组items
				for(var i=0;i<items.length;i++){
					items[i].checked = true;
				}
				allcheck.checked = true;
			}
			//全不选按钮
			nocheckallbtn.onclick = function(){
				for(var i=0;i<items.length;i++){
					items[i].checked = false;
				}
				allcheck.checked = false;
			}
			//反选按钮
			revcheckallbtn.onclick = function(){
				var s = 0;
				allcheck.checked = true;
				for(var i=0;i<items.length;i++){
					/*if(items[i].checked ==true){
						items[i].checked = false;
					}else{
						items[i].checked = true;
					} */
					items[i].checked = !items[i].checked;//直接取反即可，判断太过于麻烦
					/*if(items[i].checked){
						s=s+1;
					}
				}
				if(s==0){
					allcheck.checked = false;
				}else{
					if(s==items.length){
						allcheck.checked = true;
					}
				}*/

					if(items[i].checked==false){
						allcheck.checked = false;

					}

				}
			}
			//全选与全不选
			allcheck.onclick = function(){
				console.log(this);//在事件响应函数中，响应函数给谁绑定的，this就是谁
				for(var i=0;i<items.length;i++){
					items[i].checked =this.checked;
				}

			}
			//提交按钮
			send.onclick = function(){
				var message = "爱好有：";
				var pd=0;
				for(var i=0;i<items.length;i++){
					if(items[i].checked == true){
						message = message+(items[i].value)+"、";
						pd = pd+1;//记录没有勾选的选项数量
					}
				}
				//当没有勾选任何爱好选项，提示用户没有勾选爱好
				if(pd==0){
					alert("您还没有填写爱好");
				}
				//提示用户勾选的爱好
				else{
					alert(message);
				}
			}
			//当四个爱好勾选框全为选中状态，将全选/全不选勾选框选中，反之，为不勾中
			/*for(var i = 0;i<items.length;i++){
  items[i].onclick = function(){
      var snum=0;
         for(var q=0;q<items.length;q++){
              if(items[q].checked==true){
                snum=snum+1;
                if(snum==4){
          allcheck.checked = true;
                }else{
                  allcheck.checked = false;
                }

              }

         }
    }

  }*/
			for(var i = 0;i<items.length;i++){
				items[i].onclick = function(){
					allcheck.checked = true;
					for(var q=0;q<items.length;q++){
						if(items[q].checked==false){
							allcheck.checked = false;
							break;
						}
					}
				}

			}
		}
	</script>
</head>
<body>
<form method="post" action="">
	你爱好的运动是？<input type="checkbox" id="allcheck" />全选/全不选
	<br />
	<input type="checkbox" name="items" value="足球" />足球
	<input type="checkbox" name="items" value="篮球" />篮球
	<input type="checkbox" name="items" value="毽球" />毽球
	<input type="checkbox" name="items" value="滚球" />滚球
	<br />
	<input type="button"  id="checkallbtn" value="全选" />
	<input type="button"  id="nocheckallbtn" value="全不选" />
	<input type="button"  id="revcheckallbtn" value="反选" />
	<input type="button"  id="send" value="提交" />
</form>
</body>
</html>

```