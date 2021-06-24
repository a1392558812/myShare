```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>BOM浏览器对象模型</title>
	<script type="text/javascript">
		/*BOM可以通过js操作操作浏览器
     BOM对象
         window
           -代表的是浏览器的整个窗口，同时window也是网页的全局对象
         Navigator
           -代表浏览器当前的信息，通过该对象可以来识别不同的浏览器
         Location
           -代表当前浏览器的地址栏信息，可以通过Location来获取地址栏信息，或者
           操作浏览器跳转页面
         History
           -代表浏览器的历史记录，可以通过该对象操作浏览器的历史记录
           由于隐私问题，该对象不能获取具体的历史记录，只能操作浏览器向前或向后翻页
           而且该操作只在当次访问时有效
         Screen
           -代表用户屏幕信息，通过该对象可以获取用户的显示器的相关信息*/
		/*这些BOM对象在浏览器中都是作为window对象属性保存的，可以通过window对象
     来使用，也可以直接使用*/
		console.log(window.navigator);
		console.log(navigator);
		console.log(location);
		console.log(history);
		console.log(screen);
		window.onload = function(){
			console.log(navigator.appName);
			/*navigator对象的中的属性由于某些原因，已经不能帮助我们识别浏览器了
       * 一般我们只会使用userAgent来判断浏览器信息
       * userAgent是一个字符串，字符串中包含有用来描述浏览器信息的内容
       * 不同的浏览器会有不同的userAgent
       * 火狐：Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:71.0) 					    				       Gecko/20100101 Firefox/71.0
       * Chrome：Mozilla/5.0 (Windows NT 6.1; Win64; x64) 						  			               AppleWebKit/537.36 (KHTML, like Gecko) 						 	                       Chrome/75.0.3770.142 Safari/537.36
       * IE8: Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; 				     	                   Win64; x64; Trident/4.0; .NET CLR 2.0.50727; SLCC2;			  					   .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C; 		    	                   .NET4.0E)
       * IE11:
       * 		在IE11中我们已经不能通过navigator.userAgent来判断浏览器是否 	 		                                          是IE11了
       * 如果不能通过navigator.userAgent来判断浏览器信息，我们可以通过一些特有的
       * 对象来判断浏览器信息
       * 我们可以通过ActiveXObject该IE独有对象来判断浏览器是否是IE
       */
			console.log(navigator.userAgent);
			var ua = navigator.userAgent;
			/*判断浏览器是什么浏览器*/
			if(/Firefox/i.test(ua)){
				alert("火狐浏览器");
			}else if(/Chrome/i.test(ua)){
				alert("Chrome浏览器");
			}else if(/msie/i.test(ua)){
				alert("IE浏览器");
			}else if("ActiveXObject" in window){
				alert("IE11浏览器");
			}
		}
	</script>
</head>
<body>

</body>
</html>

```