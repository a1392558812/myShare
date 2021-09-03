(function(){
	//拓展jquery库，自定义四个方法，扩展$的方法
	$.extend({
		//比大小
		min:function(a,b){return a<b?a:b},
		//比大小
		max:function(a,b){return a>b?a:b},
		//去除字符串左边的空格
		leftTrim:function(str){
			return str.replace(/^\s+/,"")
		},
		//去除字符串右边的空格
		rightTrim:function(str){
			return str.replace(/\s+$/,"")
		}
	})
	/*扩展jquery对象的方法
		-插入点击全选功能
		-插入点击全不选功能
		-插入点击反选功能
		
	*/
	$.fn.extend({
		//this是jquery对象
		//全选
		checkAll:function(){
			this.prop("checked",true)
		},
		//全不选
		unCheckAll:function(){
			this.prop("checked",false)
		},
		//反选
		reverseCheck:function(){
			this.each(function(){
				//this是DOM元素
				this.checked = !this.checked
			})
		}
	})
	
	
	
	
	
})()
