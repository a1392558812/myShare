```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title></title>
		<script>
			//函数对象的方法
			function fun(a,b){
				console.log("a = "+a);
				console.log("b = "+b);
				console.log(this.name);
			}
			//call和apply方法
			/*在调用call()和apply()可以将一个对象指定为第一个参数，
			 * 此时这个对象将会成为函数执行时的this，可以用来修改函数调用时候的this*/
			var obj1 ={name:"我是obj1"};
			var obj2 ={name:"我是obj2"};
			fun.call(obj1,2,5);//返回"a = 2""b = 5""我是obj1"。此时this是obj对象,如果需要实参，实参依次跟在对象后面
			fun.apply(obj2,[2,6]);//返回"a = 2""b = 6""我是obj2"。此时this是obj对象，需要将实参封装到一个数组中统一传递
			fun(); //此时对象是window
			/*
			 * this的情况
			 * 1.以函数的形式调用时，this是window
			 * 2.以方法的形式调用，this是调用方法的对象
			 * 3.以构造函数的方法调用时，this时新创建的那个对象
			 * 4.使用call()和appl()调用时，this指的是那个对象
			 * */
console.log("********************************************************************************")









	//在调用函数时，浏览器会传递俩个默认得参数
	//this和arguments(封装实参得对象)
	//arguments是一个类数组对象
	function fun3(){
		console.log(Array.isArray(arguments));//返回false表示其不是数组
		console.log(arguments[0]);//表示其可以像数组一样使用索引
	}
	fun3("hello","老八",4);

console.log("********************************************************************************")

	//Math方法
	//Math.random()-可以生成一个0到1之间得一个随机数
	console.log(Math.random());
	//生成一个x-y的随机数
	//console.log(Math.round(Math.random()*(y-x)+x));
	//生成一个5-100的随机数
	function maxMinRandom(){
				var s=[];
				 s[0] = Math.round((Math.random()*95)+5);
				 s[1] = Math.round((Math.random()*95)+5);
				var mathMax = Math.max(s[0],s[1]);
				var mathMin = Math.min(s[0],s[1]);


			for(i=0;i<100;i++){
				s[i] = Math.round(Math.random()*(100-5)+5);
				mathMax = Math.max(s[i],mathMax);
				mathMin = Math.min(s[i],mathMin);
			}
			console.log("最大值是："+mathMax);
			console.log("最小值是："+mathMin);
	}

	maxMinRandom();

		      /*var q = Math.random()*10-Math.random()*5;
		      console.log(q);*/




console.log("********************************************************************************")






/*包装类（字符串的方法）*/
//创建一个字符串   参考w3cschool手册
var str = "奥利给，干了兄弟们";
console.log(str.length);//底层的字符串是以字符数组保存的
console.log(str[2]);





console.log("********************************************************************************")



//电子邮件的正则
//green1392558812@qq.com
//任意字母数字下划线开头
//任意可有可无的字母数字下划线和.
//@
//域名(任意字母数字)
//.(2-5位字母)
//.(2-5位字母)
var emailTest = /^\w{3,}(\.\w+)*@[A-z0-9]+(\.[A-z]{2,5}){1,2}$/
var email = ["abc@abc.com",
   			 "abcabc.com",
   			 "123@abc.com",
   			 "abc@aasdagdytgfdssad1111111111bc.com",
   			 "abc@abc.co2222222222m",
   			 "abc@abc.com.com.cn.cn",
             "!@#$asdafgasdfa@asdas.com"];
for(var i=0;i<email.length;i++){
	console.log(emailTest.test(email[i]));
}


		</script>
	</head>
	<body>
	</body>
</html>

```