```js
			/*（1）函数是一个特殊的对象*/
			/*（2）for ....in 循环可以遍历对象
			 
			 * 格式    for（var 变量 in 对象）｛
			 *       语句1
			 *       语句2
			 *       语句3
			 *       语句4
			 *       语句5
			 * ｝；
			 * 
			 * 
			 * */
			var obj1 ={
				name:"孟恭文",
				age:"22",
				sex:"男",
				address:"老八饭店"
			};
			
			for(var n in obj1){ 
				console.log("属性名："+n);
				console.log("属性值："+obj1[n]);
			}
			/*自定义函数
			 function fun1(形参1，形参2，形参3...形参n){ 
			 	               语句1；
			 	               语句2 ；
			 	    return 函数返回值；
			 }；
			 在函数中，如果需要找全局变量，需要加“window.”
			 
			 
			 例：   var a = "hello";//全局声明变量
			     function fun(){
			 	    var a = 1;
			 	    var b = 2;
			 	    function fun2(){
			 	    	console.log("a="+a)
			 	    }
			 }
			 fun();//此时调用fun函数，fun函数中的fun2中a取值为1，如果需要fun2函数中的a取值为全局变量
			 中的“hello”，则需要修改function fun2(){console.log("a="+window.a)}
			 
			 
			 */
			
			
			
			
			//this：谁调用函数，this指向谁（函数是window调用）
// 原型prototype
//我们创建的每一个对象都有prototype属性，这就是我门所谓的原型对象

			
function MyClass(){
//向MyClass的原型中添加一个name属性
    MyClass.prototype.name = "我是原型中的名字";
}
var mc = new MyClass();
console.log(mc.name);
//使用in检查对象中是否含有某个属性值时，如果对象中没有但是原型中有，也会返回true
console.log( "name" in mc);// 会返回true
//可以使用对象的hasOwnProperty()来检查对象自身中是否含有该属性
//使用该方法只有对象自身中含有该属性时，才会返回true
console.log(mc.hasOwnProperty( "name" ));//会返回false
function Person1(name ,age ,gender){
this.name = name;
this.age = age;
this.gender = gender;
}


//创建一个Person实例
var per = new Person1("孙悟空", 18, "男" );
console.log(per);
/*
会输出[object Object]，应为当我们直接在页面中打印一个对象时，实际上输出对象的toString()方
法的返回值
所以console.log(per);等价于console.log(per.toString());
*/
//我们可以检查对象的原型中是否含有toString()方法
//__proto__是原型
console.log(per.__proto__.hasOwnProperty("toString"));//返回false
console.log(per.__proto__.__proto__.hasOwnProperty("toString"));//返回true













//如果我们不想对象输出[object Object],可以为对象添加一个toString()方法
//代码改良







function Person(name ,age ,gender){
this.name = name;
this.age = age;
this.gender = gender;
}
//修改Person原型的toString
Person.prototype.toString = function(){
return "Person[name = "+this.name+",age ="+this.age+",gender = "+this.gender+"]"
};
//创建一个Person实例
var per = new Person1("孙悟空" ,18 , "男" );
var per2 = new Person1("秃驴" , 58 ,"男" );
console.log(per);//会输出   Person[name = 孙悟空 ， age = 18 ， gender = 男]
/*
 * 程序在运行时会产生，我们的浏览器也会自动清除垃圾，但是他并不是很智能，所以有些情况我们需要自己手动的清理垃圾此
 * 比如var a = new Object();  当我们需要销毁这个对象的时候只需将对象设置为null即可（a = null;）
 */










//数组（Array）
/*
 
 * 数组也是一个对象，普通对象使用字符串作为属性名的，数组使用数字作为索引操作元素的
 * 
 * 
 * var obj = new Object();
 * obj.name = "孙悟空";
 * 
 * 
 * 
 * */


//创建数组对象
var arr = new Array();
//使用typeof检查一个数组时，会返回一个对象 Object
console.log(typeof arr);

//向数组中添加值
arr[0] = 10; 
arr[1] = 50;
arr[2] = "好朋友";
arr[7] = "老八";
//我们可以使用length函数获取连续的数组的长度,对于非连续的数组不适用，但我们也不推荐创建不连续的数组
console.log(arr.length);
//同样，我们可以修改length来修改数组长度
// arr.length = 10;大于我们的原来的长度，多出来的部分会空出来，并不符值
//我们也可以通过arr.length来给数组最后一位添加数值
arr[arr.length] = "赵嘉鹏";
arr[arr.length] = "奥利给";
console.log(arr);
console.log(arr.length);
//数组中也可以存函数和对象
arr1 = [{name:"赵嘉鹏"},{name:"奥利给"}];
console.log(arr1);
arr2 = [function(){alert("奥利给，干了兄弟们")},function(){alert("好兄弟，吃了吗？")}];
console.log(arr2[0]);
//调用数组中的函数
//arr2[0](); 










//push()方法可以向数组末尾添加多个属性,同时该方法会将新数组的长度作为返回值返回
//unshift()方法可以向数组开头添加多个属性,同时该方法会将新数组的长度作为返回值返回
//pop()删除数组中最后一个属性，并将删除的属性作为返回值返回
//shift()删除数组中第一个属性，并将删除的属性作为返回值返回
arr1.push("巧克力","老干妈","奥利给");
var result = arr1.push("巧克力","老干妈","奥利给");
console.log(arr1);
console.log("result = "+result);






/*遍历数组*/
console.log("***********************************************************************");




var length1 = arr.length
	for(var i =0;i<10;i++){
		console.log(arr[i]);
	}









```