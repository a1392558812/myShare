```js
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
		var per1 = new Person("孙悟空" ,18 , "男" );
		var per2 = new Person("秃驴" , 58 ,"男" );
		var per3 = new Person("李老八" , 50 ,"男" );
		var per4 = new Person("郭乐乐" , 8 ,"男" );
		var per5 = new Person("精神小妹" , 12 ,"女" );
		var per6 = new Person("林黛玉" , 16 ,"女" );
		var per7 = new Person("老方丈" , 88 ,"男" );
		//将这些对象放到一个数组中
		var perArr = [per1,per2,per3,per4,per5,per6,per7,];
//创建一个函数，将Person中大于18的Person提取出来
        function getAdult(arr){
        	//创建一个新的数组
        	var newArr = [];
        	//遍历数组，获取其中的Person对象
        	for(var i= 0;i<arr.length;i++){
        		//判断age是否大于等于18
        	    if(arr[i].age>=18){
        	    	//大于18，添加到新的数组中
        	    	newArr[newArr.length]=arr[i];
        	    }
        	}
         	return newArr;
        }       
        var result = getAdult(perArr);
        console.log(result);
```