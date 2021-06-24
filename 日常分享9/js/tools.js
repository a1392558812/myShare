				function getStyle(obj,styleName){    
					return getComputedStyle(obj,null)[styleName];
					
					/*这个方法接受两个参数：要取得计算样式的元素和一个伪元素字符串（例如“:after”）。
					 * 如果不需要伪元素信息，第二个参数可以是null。
					 * getComputerStyle()方法返回一个CSSStyleDeclaration对象，
					 * 其中包含当前元素的所有计算的样式*/
					};//该构造函数为了方便方便获取多组样式
				/*创建一个简单的动画函数*/ 
				function move(obj,targetNum,speed,attr,callback){
					/* obj:要执行动画的对象
					 * targetNum：执行对象的目标位置 
					 * speed：动画移动速度
					 * attr:动画要改变的样式（字符串格式）
					 */
					//获取元素目前的位置
					nowVlaue = parseInt(getStyle(obj,attr));
					if(nowVlaue<targetNum){//如果目标位置比当前位置数值大，则向右移动，speed为正值
						speed = speed;
					}else if(nowVlaue>targetNum){//如果目标位置比当前位置数值小，则向左移动，speed为负值
						speed = -speed;
					}
					clearInterval(obj.timer); //关闭上一个定时器
					/*向执行动画的对象中添加一个timer属性，用来保存它自己的定时器标识*/
					obj.timer = setInterval(function(){
						oldVlaue = parseInt(getStyle(obj,attr));
						/*parseInt()强制转换， 函数可解析一个字符串，并返回一个整数。*/
						obj.style[attr] = oldVlaue+speed+"px";
						/*当速度小于0时，向左移动，当移动到当前位置比目标位置数值还要小时，关闭定时器*/
						if((speed<0) && (parseInt(obj.style[attr])<targetNum)){
							obj.style[attr] = targetNum+"px";
							clearInterval(obj.timer); 
							if(callback){//如果传递了回调函数就调用，没有传就不调用回调函数
								callback();
							}
						/*当速度大于0时，向右移动，当移动到当前位置比目标位置数值还要大时，关闭定时器*/
						}else if(speed>0 && parseInt(obj.style[attr])>targetNum){
							obj.style[attr] = targetNum+"px";
							clearInterval(obj.timer); 
							callback&&callback();
						}
						/*动画执行完毕，执行回调函数*/
						 
					},100);
				} 
				/*btn01.onclick = function(){
					clearInterval(timer); //关闭上一个定时器
					timer = setInterval(function(){
						oldVlaue = parseInt(getStyle(box1,"left"));
						//parseInt()强制转换， 函数可解析一个字符串，并返回一个整数。
						box1.style.left = oldVlaue+17+"px";
						if(parseInt(box1.style.left)>=1000){
							box1.style.left = 1000+"px";
							clearInterval(timer); 
						}
					},100);
					   
				};*/ 
				/*btn02.onclick = function(){
					clearInterval(timer); //关闭上一个定时器
					timer = setInterval(function(){
						if(parseInt(box1.style.left)<0){
							clearInterval(timer); 
						}
						oldVlaue = parseInt(getStyle(box1,"left"));
						//parseInt()强制转换， 函数可解析一个字符串，并返回一个整数。
						box1.style.left = oldVlaue-17+"px";
						console.log(box1.style.left); 
						if(parseInt(box1.style.left)<0){
							box1.style.left = 0+"px";
							clearInterval(timer); 
						}
					},100);
					    
				}; */ 
				/*定义一个函数，用来向一个元素中添加指定的class属性*/
				function addClass(obj,cn){
					/*参数：obj- 要添加class属性的元素
					 	  cn- 要添加class的值*/
					 	 /*判断obj中是否含有cn这个class属性*/
					 if(hasClass(obj,cn)){
					 	obj.className = obj.className;
					 }else{
					 	 obj.className += " "+cn;
					 }
					 	
				};
				/*定义一个函数，判断元素中是否含有指定的class属性值，如果有，返回true，否则返回false*/
				function hasClass(obj,cn){
					/*参数：obj- 要添加class属性的元素
					 	  cn- 要添加class的值*/
					/*创建一个正则表达式*/
					var reg = new RegExp("\\b"+cn+"\\b");
					return reg.test(obj.className);
				};
				/*定义一个函数，用来删除一个元素中指定的class属性*/
				function removeClass(obj,cn){
					/*创建一个正则表达式*/
					var reg = new RegExp("\\b"+cn+"\\b");
					/*删除class*/
					obj.className = obj.className.replace(reg , "");
				};
				/*定义一个函数，用来切换一个类
				 	如果元素中有该类，则删除
				 	如果元素中没有该类，则添加*/
				function toggleClass(obj,cn){
					/*判断obj中是否含有该类*/
					if(hasClass(obj,cn)){
						removeClass(obj,cn);
					}else{
						addClass(obj,cn);
					};
					
				}; 