!(function (w) {
	w.$ = {}
	//添加一个类的功能
	w.$.addClass = function (obj, cn) {
		/*参数：obj- 要添加class属性的元素
		cn- 要添加class的值*/
		/*判断obj中是否含有cn这个class属性*/
		if (w.$.hasClass(obj, cn)) {
			obj.className = obj.className;
		} else {
			obj.className += " " + cn;
		};
	}
	//判断一个元素是否含有指定的类
	w.$.hasClass = function (obj, cn) {
		/*参数：obj- 要添加class属性的元素
		cn- 要添加class的值*/
		/*创建一个正则表达式*/
		var reg = new RegExp("\\b" + cn + "\\b");
		return reg.test(obj.className);
	}
	//获得一个元素的指定正在生效样式值
	w.$.getStyle = function (obj, styleName) {
		return getComputedStyle(obj, null)[styleName];
		/*这个方法接受两个参数：要取得计算样式的元素和一个伪元素字符串（例如“:after”）。
		 * 如果不需要伪元素信息，第二个参数可以是null。
		 * getComputerStyle()方法返回一个CSSStyleDeclaration对象，
		 * 其中包含当前元素的所有计算的样式*/
	}; //该构造函数为了方便方便获取多组样式
	/*定义一个函数，用来删除一个元素中指定的class属性*/
	w.$.removeClass = function (obj, cn) {
		/*创建一个正则表达式*/
		var reg = new RegExp("\\b" + cn + "\\b");
		/*删除class*/
		obj.className = obj.className.replace(reg, "");
	}
	/*定义一个函数，用来切换一个类
	如果元素中有该类，则删除
	如果元素中没有该类，则添加*/
	w.$.toggleClass = function (obj, cn) {
		/*判断obj中是否含有该类*/
		if (w.$.hasClass(obj, cn)) {
			w.$.removeClass(obj, cn);
		} else {
			w.$.addClass(obj, cn);
		}

	}
	/*拖拽(方向控制)+九宫格检测 
	 * 			参数说明：    obj(必须)-要拖拽的元素
	 * 					flag(必须)  	 -"row"只允许横向拖拽
	 * 					 	 		 -"col"只允许纵向拖拽
	 * 						  		 -"auto"横向纵向都允许
	 * 					limit(必须)	 -拖拽是否有边界限制(参数值：true/false)
	 * 					callback(可传可不传)-回调函数(用于拖拽完成的操作)
	 * 				    obj2(可传可不传)-九宫格中间检测碰撞的元素
	 */
	w.$.drag = function (obj, flag, limit, callback, obj2) {
		//初始化元素数据
		var elementPoint = {
			x: 0,
			y: 0
		}
		//初始化鼠标数据
		var startPoint = {
			x: 0,
			y: 0
		}
		obj.onmousedown = function (ev) {
			console.log("鼠标被按下")
			var ev = ev || window.event
			/*确定坐标 */
			elementPoint.x = this.offsetLeft //参照于父元素的x轴偏移
			elementPoint.y = this.offsetTop //参照于父元素的y轴偏移
			startPoint.x = ev.clientX //鼠标参照于视口的x轴位置
			startPoint.y = ev.clientY //鼠标参照于视口的y轴位置
			if (obj.setCapture) { //全局捕获只适用于IE
				obj.setCapture()
			}
			document.onmousemove = function (ev) {
				console.log("鼠标在移动")
				var nowPoint = {
					x: 0,
					y: 0
				}
				nowPoint.x = ev.clientX
				nowPoint.y = ev.clientY
				var moveLeft = elementPoint.x + nowPoint.x - startPoint.x
				var moveTop = elementPoint.y + nowPoint.y - startPoint.y
				if (limit) {
					if (moveLeft <= 0) {
						moveLeft = 0
					}
					if (moveLeft >= (obj.parentNode.clientWidth - obj.offsetWidth)) {
						moveLeft = (obj.parentNode.clientWidth - obj.offsetWidth)
					}
					if (moveTop <= 0) {
						moveTop = 0
					}
					if (moveTop >= (obj.parentNode.clientHeight - obj.offsetHeight)) {
						moveTop = (obj.parentNode.clientHeight - obj.offsetHeight)
					}
				}
				if (flag === "row") {
					obj.style.left = moveLeft + "px"
				}
				if (flag === "col") {
					obj.style.top = moveTop + "px"
				}
				if (flag === "auto") {
					obj.style.left = moveLeft + "px"
					obj.style.top = moveTop + "px"
				}
				if (obj2) { //碰撞检测   要检测的元素的四条边
					var T1 = obj.offsetTop
					var L1 = obj.offsetLeft
					var B1 = obj.offsetTop + obj.offsetHeight
					var R1 = obj.offsetLeft + obj.offsetWidth
					var T2 = obj2.offsetTop
					var L2 = obj2.offsetLeft
					var B2 = obj2.offsetTop + obj.offsetHeight
					var R2 = obj2.offsetTop + obj.offsetWidth
					if (R1 < L2 || B1 < T2 || L1 > R2 || T1 > B2) {
						//此时没有撞到	
					} else {
						onsole.log(T1, R1, B1, L1)
						alert("已碰撞")
					}
				}
				callback && callback()

			}
			document.onmouseup = function () {
				console.log("鼠标松开了")
				document.onmousemove = null;
				document.onmouseup = null;
				if (document.releaseCapture) { //释放鼠标的贪婪捕获
					document.releaseCapture
				}
			}
			return false; //禁止不了IE8下浏览器默认行为
		}
	}
	/*创建一个简单的动画函数*/
	w.$.move = function (obj, targetNum, speed, attr, callback) {
		/* obj:要执行动画的对象
		 * targetNum：执行对象的目标位置
		 * speed：动画移动速度
		 * attr:动画要改变的样式（字符串格式）
		 */
		//获取元素目前的位置
		nowVlaue = parseInt(getStyle(obj, attr));
		if (nowVlaue < targetNum) { //如果目标位置比当前位置数值大，则向右移动，speed为正值
			speed = speed;
		} else if (nowVlaue > targetNum) { //如果目标位置比当前位置数值小，则向左移动，speed为负值
			speed = -speed;
		}
		clearInterval(obj.timer); //关闭上一个定时器
		/*向执行动画的对象中添加一个timer属性，用来保存它自己的定时器标识*/
		obj.timer = setInterval(function () {
			oldVlaue = parseInt(getStyle(obj, attr));
			/*parseInt()强制转换， 函数可解析一个字符串，并返回一个整数。*/
			obj.style[attr] = oldVlaue + speed + "px";
			/*当速度小于0时，向左移动，当移动到当前位置比目标位置数值还要小时，关闭定时器*/
			if ((speed < 0) && (parseInt(obj.style[attr]) < targetNum)) {
				obj.style[attr] = targetNum + "px";
				clearInterval(obj.timer);
				if (callback) { //如果传递了回调函数就调用，没有传就不调用回调函数
					callback();
				}
				/*当速度大于0时，向右移动，当移动到当前位置比目标位置数值还要大时，关闭定时器*/
			} else if (speed > 0 && parseInt(obj.style[attr]) > targetNum) {
				obj.style[attr] = targetNum + "px";
				clearInterval(obj.timer);
				callback && callback();
			}
			/*动画执行完毕，执行回调函数*/

		}, 100);
	}
	/*改变时间格式函数*/
	w.$.changeTime = function (time) {

		var h = w.$.addZero(Math.floor(time / 3600))
		var m = w.$.addZero(Math.floor(time % 3600 / 60))
		var s = w.$.addZero(Math.round(time % 3600 % 60))
		return h + ":" + m + ":" + s
	}
	w.$.addZero = function (num) {
		var val = ""
		if (num < 10) {
			val = "0" + num
		} else {
			val = val + num
		}
		return val
	}
	//兼容性绑定事件监听
	/*参数说明：
	 		-obj事件对象
	 		-type事件类型
	 		-callback回调函数，执行事件的代码
	 * */
	w.$.addEvent = function (obj, type, callback) {
		if (obj.addEventListener) {
			obj.addEventListener(type, callback, false);
		} else if (obj.attachEvent) {
			obj.attachEvent('on' + type, function () {
				callback.call(obj); //通过.call方法，把指向改成obj
				//然后再在外部的callback函数中执行,这样this就绝对指向obj了。
			})
		} else {
			obj['on' + type] = callback;
		}
	}
	//绑定鼠标滚轮上下滚动动事件
	/*参数：obj(必填):绑定滚轮事件的对象
	 	  callback1(必填):向上滚动回调函数
	 	  callback2(必填):向下滚动回调函数*/
	w.$.scrollDir = function (obj, callback1, callback2) {
		var fn
		//火狐浏览器
		if (obj.addEventListener) {
			obj.addEventListener("DOMMouseScroll", fn)
		}
		//非火狐浏览器兼容
		obj.onmousewheel = fn

		function fn(ev) {
			ev = ev || event
			var dir = 2
			if (ev.wheelDelta) {
				dir = ev.wheelDelta > 0 ? 1 : 0

			} else if (ev.detail) {
				dir = ev.detail < 0 ? 1 : 0

			} else {
				dir = dir
			}
			switch (dir) {
				case 1:
					callback1 && callback1()
					break;
				case 0:
					callback2 && callback2()
					break;
				case 2:
					alert("滚轮事件有误")
					break;
			}
			//禁止默认行为dom2
			if (ev.preventDefault) {
				ev.preventDefault()
			}
			return false //禁止滚轮的默认行为dom0
		}
	}
	/*ajax封装
    	参数为optionObj对象，属性值为下
       {type(必传):递交的类型
       url(必传)：目标的url地址
       obj(可传可不传):get/post方法传递所需拼接url
       timeout(可传可不传):设置延时中断请求，在timeout秒后中断请求
       succback(必传)：回调函数,执行成功返回数据执行的结果
       errback(必传)：回调函数，执行不成功返回数据执行的结果}
       myJS.ajax({
			type:"",
			url:"",
			data:{},
			timeout:"",
			succback:function(xmlhttp){

			},
			errback:function(xmlhttp){
			}
	})
   */
	w.$.ajax = function (optionObj) {
		var xmlhttp
		var timer

		function objstr(data) {
			/*
			{key1:val1,
			    key2:val2,
			    key3:val3,
			    key4:val4,
			    ... ...
			    被添加的t
			    t:new Date().getDate()}
			*/
			var res = []
			data.t = new Date().getDate()
			for (var key in data) {
				//encodeURIComponent()确保提交的中文转码为字符串
				/*在url中，不可以出现中文，如果出现中文需要转码*/
				res.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
			}
			return res.join("&")
		}
		var str = objstr(optionObj.data)
		if (window.XMLHttpRequest) {
			//  IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
			//1.创建一个异步对象
			xmlhttp = new XMLHttpRequest();
		} else {
			// IE6, IE5 浏览器执行代码
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		if (optionObj.type.toLowerCase() === "get") {
			//2.设置请求方式和地址
			/*在IE浏览器中如果通过ajax发送get请求，IE浏览器认为同一个url只有一个结果  */
			xmlhttp.open("GET", optionObj.url + "?" + str, true)
			//3.发送请求
			xmlhttp.send()
		} else if (optionObj.type.toLowerCase() === "post") {
			//2.设置请求方式和地址
			/*在IE浏览器中如果通过ajax发送get请求，IE浏览器认为同一个url只有一个结果  */
			xmlhttp.open("POST", optionObj.url, true)
			//如果需要像 HTML 表单那样 POST 数据，请使用 setRequestHeader() 来添加 HTTP 头。然后在 send() 方法中规定您希望发送的数据
			xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			//3.发送请求
			xmlhttp.send(str)
		}

		//4.监听状态的变化
		xmlhttp.onreadystatechange = function (data) {
			if (xmlhttp.readyState === 4) {
				clearInterval(timer)
				//5.处理返回结果
				if (xmlhttp.status >= 200 && xmlhttp.status < 300 || xmlhttp.status === 304) {
					optionObj.succback(xmlhttp)
				} else {
					optionObj.errback(xmlhttp)
				}
			}
		}
		if (optionObj.timeout) {
			timer = setInterval(function () {
				alert("请求超时，已中断")
				xmlhttp.abort() // 取消前一次的ajax请求
				clearInterval(timer)
			}, optionObj.timeout)
		}
	}
	//定义一个检测数据类型的功能函数
	w.$.checkTypeof = function (data) {
		return Object.prototype.toString.call(data).slice(8, -1)
	}
	//实现深度克隆函数
	w.$.clone = function (data) {
		//判断拷贝的数据类型
		let result
		let targetType = w.$.checkTypeof(data)
		if (targetType === "Object") {
			result = {}
		} else if (targetType === "Array") {
			result = []
		} else {
			return data
		}
		//遍历目标数据
		for (let i in data) {
			//获取数据解构的每一项值
			let value = data[i]
			//判断value是否存在对象或者数组
			if (w.$.checkTypeof(value) === "Object" || w.$.checkTypeof(value) === "Array") { //此时说明"对象/数组"中嵌套了"对象/数组"
				//继续遍历获取到的value值
				result[i] = w.$.clone(value)
			} else {
				result[i] = value
			}
		}
		return result
	}
	// 安卓移动端适配机型,rem适配
	w.$.androidRem = function () {
		const styleNode = document.createElement('style')
		const size = document.documentElement.clientWidth / 16
		styleNode.innerHTML = 'html{font-size:' + size + 'px!important;}'
		document.head.appendChild(styleNode)
	}
	// 安卓等比适配 viewport适配
	// 参数targetW:设计图的尺寸
	w.$.androidViewport = function (targetW) {
		const targetWidth = targetW
		const scale = document.documentElement.clientWidth / targetWidth
		let meta = document.querySelector('meta[name="viewport"]')
		meta.content = `initial-scale=${scale},minimum-scale=${scale},maximum-scale=${scale},user-scalable=no`
	}
	/*
	  参数：window, window['lib'] || (window['lib'] = {})
	* */
	w.$.androidCompatible = function (win, lib) {
		var doc = win.document; //当前文档对象
		var docEl = doc.documentElement; //文档对象根元素的只读属性
		var metaEl = doc.querySelector('meta[name="viewport"]');
		var flexibleEl = doc.querySelector('meta[name="flexible"]');
		var dpr = 0;
		var scale = 0;
		var tid;
		var flexible = lib.flexible || (lib.flexible = {});
		if (metaEl) {
			//当meta中viewport的标签设置了scale时，将根据scale手动设置dpr
			console.warn('将根据已有的meta标签来设置缩放比例');
			var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
			if (match) {
				scale = parseFloat(match[1]);
				dpr = parseInt(1 / scale);
			}
		} else if (flexibleEl) {
			//当meta中flexible的标签存在时，据此设置dpr
			var content = flexibleEl.getAttribute('content');
			if (content) {
				var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
				var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
				if (initialDpr) {
					dpr = parseFloat(initialDpr[1]);
					scale = parseFloat((1 / dpr).toFixed(2));
				}
				if (maximumDpr) {
					dpr = parseFloat(maximumDpr[1]);
					scale = parseFloat((1 / dpr).toFixed(2));
				}
			}
		}

		if (!dpr && !scale) {
			//根据js获取到的devicePixelRatio设置dpr及scale，scale是dpr的倒数
			var isAndroid = win.navigator.appVersion.match(/android/gi);
			var isIPhone = win.navigator.appVersion.match(/iphone/gi);
			var devicePixelRatio = win.devicePixelRatio;
			if (isIPhone) {
				// iOS下，对于2和3的屏，分别用2和3倍方案
				if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
					dpr = 3;
				} else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
					dpr = 2;
				} else {
					dpr = 1;
				}
			} else {
				// 其他设备下，仍旧使用1倍的方案
				dpr = 1;
			}
			scale = 1 / dpr;
		}

		docEl.setAttribute('data-dpr', dpr);
		//文本字号不建议使用rem，flexible适配方案中，文本使用px作为单位，使用[data-dpr]属性来区分不同dpr下的文本字号

		if (!metaEl) {
			//添加meta标签，设置name为viewport，content根据scale设置缩放比(默认、最大、最小缩放比)
			metaEl = doc.createElement('meta');
			metaEl.setAttribute('name', 'viewport');
			metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
			if (docEl.firstElementChild) {
				docEl.firstElementChild.appendChild(metaEl);
			} else {
				var wrap = doc.createElement('div');
				wrap.appendChild(metaEl);
				doc.write(wrap.innerHTML);
			}
		}

		function refreshRem() {
			//更新rem值
			var width = docEl.getBoundingClientRect().width;
			console.log(width, dpr, width / dpr)
			if (width / dpr > 540) {
				width = 540 * dpr;
			}
			var rem = width / 10; //1rem = viewWidth / 10
			docEl.style.fontSize = rem + 'px';
			flexible.rem = win.rem = rem;
		}

		//resize与pageshow延时300ms触发refreshRem(),使用防抖函数，防止事件被高频触发可能引起性能问题
		win.addEventListener('resize', function () {
			clearTimeout(tid);
			tid = setTimeout(refreshRem, 300);
		}, false);
		win.addEventListener('pageshow', function (e) {
			//当一条会话历史纪录被执行的时候触发事件，包括后退/前进按钮，同时会在onload页面触发后初始化页面时触发
			if (e.persisted) { //表示网页是否来自缓存
				clearTimeout(tid);
				tid = setTimeout(refreshRem, 300);
			}
		}, false);

		//在html文档加载和解析完成后设置body元素字体大小
		if (doc.readyState === 'complete') {
			doc.body.style.fontSize = 12 * dpr + 'px';
		} else {
			doc.addEventListener('DOMContentLoaded', function (e) {
				doc.body.style.fontSize = 12 * dpr + 'px';
			}, false);
		}
		//浏览器有最小字体限制，css在pc上font-size是12px(移动端最小是8px), 也就是css像素是12，其DPR为1，在移动端dpr有可能为2和3，为了保证字体不变小，需要用12*dpr进行换算。

		refreshRem();

		//实现rem与px相互转换
		flexible.dpr = win.dpr = dpr;
		flexible.refreshRem = refreshRem;
		flexible.rem2px = function (d) {
			var val = parseFloat(d) * this.rem;
			if (typeof d === 'string' && d.match(/rem$/)) {
				val += 'px';
			}
			return val;
		}
		flexible.px2rem = function (d) {
			var val = parseFloat(d) / this.rem;
			if (typeof d === 'string' && d.match(/px$/)) {
				val += 'rem';
			}
			return val;
		}
	}
	/* transtion 函数
	    要求： 1.css(node,type) 读操作
	         2.css(node,type,value) 写操作
	         3.规避transtion覆盖的坑
	  ｛
	    translateX:val,
	    translateY:val,
	    scale:val,
	    rotate:val,
	  ｝
	 */
	w.$.transtionCss = function (node, type, value) {
		if (typeof node === 'object' && typeof node['transform'] === 'undefined') {
			node['transform'] = {}
		}
		if (arguments.length >= 3) { // transtion 写操作
			var text = ''
			node['transform'][type] = value
			for (item in node['transform']) {
				if (node['transform'].hasOwnProperty(item)) {
					switch (item) {
						case "translateX":
						case "translateY":
						case "translateZ":
							text += `${item}(${node['transform'][item]}px)`
							break;
						case "scale":
							text += `${item}(${node['transform'][item]})`
							break;
						case "rotate":
							text += `${item}(${node['transform'][item]}deg)`
							break;
					}
				}
			}
			node.style.transform = node.style.webkitTransform = text
		} else if (arguments.length == 2) { // transtion 读操作
			value = node['transform'][type]
			if (typeof value === 'undefined') {
				switch (type) {
					case "translateX":
					case "translateY":
					case "translateZ":
					case "rotate":
						value = 0
						break;
					case "scale":
						value = 1
						break;
				}
			}
			return value
		}
	}
	/* 实现组件化的轮播图:轮播结构
		1.<div id="wrapper">
			 <div class="carousel-wrapper" data-needcarousel='true' data-needauto='true'>
				<div class="points-wrapper"></div>
			 </div>
		  </div>	
		2.指令标签:data-needcarousel ='true'为无缝滑屏
				  data-needauto='true'且data-needcarousel ='true'为无缝轮播
				  <div class="points-wrapper"></div>为是否生成小圆点
		3.参数:arr为需要轮播的图片数组		
	 */
	w.$.carousel = function (arr) {
		const carouselWrap = document.querySelector('.carousel-wrapper')
		// 布局相关
		if (carouselWrap) {
			const pointsLength = arr.length
			const ifNeedCarousel = carouselWrap.getAttribute('data-needcarousel')
			const ifNeedAuto = carouselWrap.getAttribute('data-needauto')
			if (ifNeedCarousel === 'true') {
				arr = [...arr, ...arr]
			}
			let styleNode = document.createElement('style')
			let ulNode = document.createElement('ul')
			$.transtionCss(ulNode, 'translateZ', 0) // 开启3D加速渲染
			w.$.addClass(ulNode, 'list')
			// ulNode.classList.add('list')
			let textNode = ''
			for (let i = 0; i < arr.length; i++) { // 动态生成轮播图
				textNode += `<li><a href='javascript:;'><img src=${arr[i]}></li>`
			}
			ulNode.innerHTML = textNode
			carouselWrap.appendChild(ulNode)
			styleNode.innerHTML = `
					#wrapper{
						overflow: hidden;
					}
					#wrapper>.carousel-wrapper{
						position: relative;
					}
					#wrapper>.carousel-wrapper>.list{
						list-style: none;
						overflow: hidden;
						position: absolute;
					}
					#wrapper>.carousel-wrapper>.list>li>a,#wrapper>.carousel-wrapper>.list>li>a>img{
							display: block;
					}
					#wrapper>.carousel-wrapper>.list>li>a>img{
							width: 100%;
					}
					#wrapper>.carousel-wrapper>.list>li{
						float: left;
					}
					#wrapper>.carousel-wrapper>.list{
						width: ${(arr.length)*100}%;
					}
					#wrapper>.carousel-wrapper>.list>li{
						width: ${1/(arr.length)*100}%;
					}
					`
			document.head.appendChild(styleNode)
			const imgNode = document.querySelector('#wrapper>.carousel-wrapper>.list>li>a>img')
			setTimeout(() => {
				carouselWrap.style.height = imgNode.offsetHeight + "px"
			}, 100)
			// 	滑屏
			/* 
				1.获取元素一开始的位置
				2.获取手指一开始的位置
				3.动态获取手指move的距离
				4.将手指移动的距离动态计算给元素
			 */
			let pointsWrap = document.querySelector('#wrapper>.carousel-wrapper>.points-wrapper')
			if (pointsWrap) { // 动态生成小圆点
				for (let i = 0; i < pointsLength; i++) { // 动态生成轮播图
					if (i == 0) {
						pointsWrap.innerHTML += `<span class = 'active'></span>`
					} else {
						pointsWrap.innerHTML += `<span></span>`
					}
				}
				var spans = document.querySelectorAll('#wrapper>.carousel-wrapper>.points-wrapper>span')
				let spanStyleNode = document.createElement('style')
				spanStyleNode.innerHTML = `
						#wrapper>.carousel-wrapper>.points-wrapper{
							position:absolute;
							bottom:0;
							width:100%;
							text-align:center;
							margin:auto;
							z-index:2;
						}
						#wrapper>.carousel-wrapper>.points-wrapper>span{
							display:inline-block;
							margin:3px;
							width:10px;
							height:10px;
							background:skyblue;
							z-index:2;
							border-radius: 50%;
						}
						#wrapper>.carousel-wrapper>.points-wrapper>span:active{
							background:pink;
						}#wrapper>.carousel-wrapper>.points-wrapper>.active{
							background:pink
						}
					`
				document.head.appendChild(spanStyleNode)
			}
			let startX = 0 // 初始化手指的位置
			let startY = 0
			let elementX = 0 // 初始化元素的位置
			let elementY = 0
			let viewWidth = document.documentElement.clientWidth
			let nowIndex = 0
			/* 防抖动
					1.首次滑动是x轴,就默认用户是在x轴滑动,不触发y轴逻辑
					2.首次滑动是y轴,就默认用户是在y轴滑动,不触发x轴逻辑
			 */
			let ifX = true // 初始化当前手指滑动的方向,
			let ifFirst = true // 是否是第一次滑动
			carouselWrap.addEventListener('touchstart', function (event) {
				event = event || window.event
				ulNode.style.transition = ''
				clearInterval(ulNode.timer)
				let TouchC = event.changedTouches[0]
				/* 无缝滑屏逻辑
						1.点击第一组第一张的时候跳转到第二组的第一张
						2.点击第二组最后一张的时候跳转到第一组的最后一张
				*/
				if (ifNeedCarousel === 'true') {
					let nowIndex = w.$.transtionCss(ulNode, 'translateX') / viewWidth // 抽象index为ul的位置
					if (nowIndex === 0) {
						nowIndex = -pointsLength
					} else if (nowIndex <= -(arr.length - 1)) {
						nowIndex = -(pointsLength - 1)
					}
					w.$.transtionCss(ulNode, 'translateX', nowIndex * viewWidth)
				}
				startX = TouchC.clientX
				startY = TouchC.clientY
				// elementX = ulNode.offsetLeft
				elementX = w.$.transtionCss(ulNode, 'translateX')
				elementY = w.$.transtionCss(ulNode, 'translateY')
				ifX = true
				ifFirst = true
			})
			carouselWrap.addEventListener('touchmove', function (event) {
				event = event || window.event
				let TouchC = event.changedTouches[0]
				if (!ifX) {
					return
				}
				let nowX = TouchC.clientX //初始化当前位置
				let nowY = TouchC.clientY
				let disX = nowX - startX
				let disY = nowY - startY
				if (ifFirst) {
					ifFirst = false
					if (Math.abs(disY) > Math.abs(disX)) {
						ifX = false // 在Y轴滑动
						return // 首次防抖动效果
					}
				}

				// ulNode.style.left = elementX+disX+'px'
				w.$.transtionCss(ulNode, 'translateX', elementX + disX)

			})
			carouselWrap.addEventListener('touchend', function (event) {
				event = event || window.event
				// let nowOffset = ulNode.offsetLeft
				let nowIndex = pointsSynchronize()
				ulNode.style.transition = '0.5s transform'
				// ulNode.style.left = nowIndex*viewWidth+'px'
				// moveX = nowIndex*viewWidth
				// ulNode.style.transform = `translateX(w.$.{nowIndex*viewWidth}px)`
				let distance = nowIndex * viewWidth
				w.$.transtionCss(ulNode, 'translateX', distance)
				if (ifNeedAuto === 'true' && ifNeedCarousel === 'true') {
					auto()
				}
			})

			// 自动轮播
			function auto() {
				clearInterval(ulNode.timer)
				ulNode.timer = setInterval(() => {
					nowIndex = nowIndex - 1
					ulNode.style.transition = '0.5s transform'
					w.$.transtionCss(ulNode, 'translateX', nowIndex * viewWidth)
					ulNode.addEventListener("transitionend", endFn)
					ulNode.addEventListener("webkitTransitionEnd", endFn)

					function endFn() {
						ulNode.removeEventListener('transitionend', endFn)
						ulNode.removeEventListener('webkitTransitionEnd', endFn)
						ulNode.style.transition = 'none'
						if (nowIndex == 1 - arr.length) {
							nowIndex = 1 - arr.length / 2
							w.$.transtionCss(ulNode, 'translateX', nowIndex * viewWidth)
						}
					}
					pointsSynchronize()
				}, 2000)
			}

			function pointsSynchronize() {
				nowIndex = w.$.transtionCss(ulNode, 'translateX') / viewWidth // 抽象index为ul的位置
				nowIndex = Math.round(nowIndex)
				if (nowIndex > 0) {
					nowIndex = 0
				} else if (nowIndex < 1 - arr.length) {
					nowIndex = 1 - arr.length
				}
				if (pointsWrap) {
					for (let i = 0; i < pointsLength; i++) {
						w.$.removeClass(spans[i], 'active')
						// spans[i].classList.remove('active')
					}
					// spans[-nowIndex%pointsLength].classList.add('active')
					w.$.addClass(spans[-nowIndex % pointsLength], 'active')
				}
				return nowIndex
			}
			if (ifNeedAuto === 'true' && ifNeedCarousel === 'true') {
				auto()
			}

		}
	}
	/* 可以拖拽的导航条
		结构<div id = "dragNav">
						<ul class="list">
							<li class="active">
								<a href="javascript:void(0);">首页</a>
							</li>
							<li>
								<a href="javascript:void(0);">n个li</a> 自行指定li的个数
							</li>
						</ul>
					</div>
	 */
	w.$.dragNavigation = function () {
		let styleNode = document.createElement('style')
		styleNode.innerHTML = `
		#dragNav {
		  position: relative;
		  box-sizing: border-box;
		  width: 100%;
		  height: 1.48148148rem;
		  padding: 0.1037037rem 0 0.1037037rem 0;
		  background-color: #eee;
		}
		#dragNav::before {
		  position: absolute;
		  content: "";
		  display: block;
		  bottom: 0;
		  width: 100%;
		  background-color: #000000;
		  height: 1px;
		}
		@media only screen and (-webkit-device-pixel-ratio: 2) {
		  #dragNav::before {
		    transform: scaleY(0.5);
		  }
		}
		@media only screen and (-webkit-device-pixel-ratio: 3) {
		  #dragNav::before {
		    transform: scaleY(0.33333333);
		  }
		}
		#dragNav .list {
		  white-space: nowrap;
		  float: left;
		  font-size: 0;
		}
		#dragNav .list > li {
		  display: inline-block;
		  height: 1.27407407rem;
		}
		#dragNav .list > li a {
		  display: block;
		  height: 100%;
		  font-family: 'Helvetica';
		  font-size: 0.59259259rem;
		  padding: 0 0.56296296rem;
		  line-height: 1.25925926rem;
		  color: #020202;
		  border-radius: 0.2962963rem;
		}
		#dragNav .list > li a.active {
		  background-color: #27D5BF;
		  color: white;
		}`
		document.head.appendChild(styleNode)
		let dragNav = document.querySelector('#dragNav') // 滑屏区域
		let dragList = document.querySelector('#dragNav .list') // 滑屏的元素
		let elementX = 0 // 元素一开始的位置 
		let touchX = 0 // 手指一开始的位置
		let scale = 0
		// 快速滑屏的必要参数
		let lastTime = 0
		let nowTime = 0
		let lastPoint = 0
		let nowPoint = 0
		let timeDis = 1
		let moveDis = 0
		let viewportWidth = document.documentElement.clientWidth
		let minX = dragNav.clientWidth - dragList.offsetWidth
		dragNav.addEventListener('touchstart', function (event) {
			event = event || window.event
			clearInterval(dragList.timer)
			let touchC = event.changedTouches[0]
			touchX = touchC.clientX
			elementX = $.transtionCss(dragList, 'translateX')
			dragList.style.transition = ''
			lastTime = new Date().getTime()
			lastPoint = touchC.clientX
			dragList.ifHandMove = false
			moveDis = 0
		})
		dragNav.addEventListener('touchmove', function (event) {
			event = event || window.event
			let touchC = event.changedTouches[0]
			let nowX = touchC.clientX
			let willMove = nowX - touchX + elementX
			nowTime = new Date().getTime()
			nowPoint = touchC.clientX
			timeDis = nowTime - lastTime
			moveDis = nowPoint - lastPoint
			if (willMove > 0) { // 橡皮筋效果
				dragList.ifHandMove = true // 手动橡皮筋效果开启
				scale = viewportWidth / ((viewportWidth + willMove)) * 0.5
				// willMove = elementX+(nowX-touchX)*scale
				willMove = $.transtionCss(dragList, 'translateX') + moveDis * scale
			} else if (willMove < minX) {
				dragList.ifHandMove = true
				let over = minX - willMove
				scale = viewportWidth / ((viewportWidth + over)) * 0.5
				// willMove = elementX+(nowX-touchX)*scale
				willMove = $.transtionCss(dragList, 'translateX') + moveDis * scale
			}
			$.transtionCss(dragList, 'translateX', willMove)
			lastTime = nowTime
			lastPoint = nowPoint
		})
		dragNav.addEventListener('touchend', function (event) {
			event = event || window.event
			let targetX = 0
			let time = 0
			if (!dragList.ifHandMove) {
				let speed = moveDis / timeDis
				if (Math.abs(speed) < 0.5) {
					speed = 0
				}
				targetX = $.transtionCss(dragList, 'translateX') + speed * 200
				let touchC = event.changedTouches[0]
				let bsr = '' // 定义一个贝塞尔曲线运动
				time = Math.abs(speed) * 0.15
				time = time < 0.3 ? 0.3 : time
				time = time > 0.8 ? 0.8 : time
			} else {
				time = 0.5
				targetX = $.transtionCss(dragList, 'translateX')
			}
			if (targetX > 0) {
				targetX = 0
				bsr = (dragList.ifHandMove) ? "" : 'cubic-bezier(.26,1.72,1,1.49)'
			} else if (targetX < minX) {
				targetX = minX
				bsr = (dragList.ifHandMove) ? "" : 'cubic-bezier(.26,1.72,1,1.49)'
			} else {
				bsr = ""
			}
			dragList.style.transition = `${time}s ${bsr} transform`
			$.transtionCss(dragList, 'translateX', targetX)
			dragList.addEventListener('transitionend', endFn)
			dragList.addEventListener('webkitTransitionEnd', endFn)

			function endFn() {
				dragList.removeEventListener('transitionend', endFn)
				dragList.removeEventListener('webkitTransitionEnd', endFn)
				dragList.style.transition = ''
			}
		})
		let allA = document.querySelectorAll('#dragNav .list li a')
		dragList.addEventListener('touchstart', function (event) {
			event = event || window.event
			dragList.ifMoveing = false
		})
		dragList.addEventListener('touchmove', function (event) {
			event = event || window.event
			dragList.ifMoveing = true
		})
		dragList.addEventListener('touchend', function (event) {
			if (!dragList.ifMoveing) {
				event = event || window.event
				let touchC = event.changedTouches[0]
				for (let i = 0; i < allA.length; i++) {
					$.removeClass(allA[i], 'active')
				}
				$.addClass(touchC.target, 'active')
			} else {
				return
			}
		})


	}
	/* 移动端可拖拽的滚动条,
		-1.防抖动
		-2.3D硬件加速
		-3.即点即停*/
	/* 参数wrap 滑屏区域 
	   参数callback,一个可传可不传的回调函数参数,用来实现滚动条
		callback= { // 滚动条
			start:function(){
				代码逻辑...
			},
			move:function(){
				代码逻辑...
			},
			end:function(){
				代码逻辑...
			}
		}
	*/
	w.$.dragY = function (dragNav, callback) { //移动端自定义滚动条
		let dragList = dragNav.children[0] // 滑屏的元素
		$.transtionCss(dragList, 'translateZ', 0.1) // 开启3D加速
		let element = {
			x: 0,
			y: 0
		} // 元素一开始的位置 
		let touch = {} // 手指一开始的位置
		let scale = 0
		// 快速滑屏的必要参数
		let lastTime = 0
		let nowTime = 0
		let lastPoint = 0
		let nowPoint = 0
		let timeDis = 1
		let moveDis = 0
		let viewportHeight = document.documentElement.clientHeight
		let minY = dragNav.clientHeight - dragList.offsetHeight
		let ifY = true
		let ifFirst = true
		let Tween = { // 定义Tween算法
			Linear: function (t, b, c, d) {
				return c * ((t = t / d - 1) * t * t + 1) + b;
			},
			Back: function (t, b, c, d, s) {
				if (s == undefined) s = 1.70158;
				return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
			},

		}
		setTimeout(() => { // 重置minY,防止js执行过快而页面却没有渲染完成
			minY = dragNav.clientHeight - dragList.offsetHeight
		}, 400)
		dragNav.addEventListener('touchstart', function (event) {
			event = event || window.event
			clearInterval(dragList.timer)
			ifFirst = true
			ifY = true
			if (!ifY) {
				return
			}
			let touchC = event.changedTouches[0]
			touch = {
				clientX: touchC.clientX,
				clientY: touchC.clientY
			}
			element.y = $.transtionCss(dragList, 'translateY')
			element.x = $.transtionCss(dragList, 'translateX')
			dragList.style.transition = ''
			lastTime = new Date().getTime()
			lastPoint = touchC.clientY
			dragList.ifHandMove = false
			moveDis = 0
			if (callback && typeof callback['start'] === 'function') {
				callback['start']()
			}
		})
		dragNav.addEventListener('touchmove', function (event) {
			event = event || window.event
			if (!ifY) {
				return
			}
			let touchC = event.changedTouches[0]
			let now = touchC
			let dis = {}
			dis.y = now.clientY - touch.clientY
			dis.x = now.clientX - touch.clientX
			if (ifFirst) {
				ifFirst = false
				if (Math.abs(dis.x) > Math.abs(dis.y)) {
					ifY = false
					return
				}
			}
			willMove = dis.y + element.y
			nowTime = new Date().getTime()
			nowPoint = touchC.clientY
			timeDis = nowTime - lastTime
			moveDis = nowPoint - lastPoint
			if (willMove > 0) { // 橡皮筋效果
				dragList.ifHandMove = true // 手动橡皮筋效果开启
				scale = viewportHeight / ((viewportHeight + willMove)) * 0.5
				// willMove = elementY+(nowY-touchY)*scale
				willMove = $.transtionCss(dragList, 'translateY') + moveDis * scale
			} else if (willMove < minY) {
				dragList.ifHandMove = true
				let over = minY - willMove
				scale = viewportHeight / ((viewportHeight + over)) * 0.5
				// willMove = elementY+(nowY-touchY)*scale
				willMove = $.transtionCss(dragList, 'translateY') + moveDis * scale
			}
			$.transtionCss(dragList, 'translateY', willMove)
			lastTime = nowTime
			lastPoint = nowPoint
			if (callback && typeof callback['move'] === 'function') {
				callback['move'].call(dragList)
			}
		})
		dragNav.addEventListener('touchend', function (event) {
			event = event || window.event
			let targetY = 0
			let time = 0
			if (!dragList.ifHandMove) {
				let speed = moveDis / timeDis
				if (Math.abs(speed) < 0.5) {
					speed = 0
				}
				targetY = $.transtionCss(dragList, 'translateY') + speed * 200
				let touchC = event.changedTouches[0]
				// let bsr = '' // 定义一个贝塞尔曲线运动
				time = Math.abs(speed) * 0.15
				time = time < 0.3 ? 0.3 : time
				time = time > 0.8 ? 0.8 : time
			} else {
				time = 0.5
				targetY = $.transtionCss(dragList, 'translateY')
			}
			let type = 'Linear'
			if (targetY > 0) {
				targetY = 0
				// bsr = (dragList.ifHandMove)?"":'cubic-bezier(.26,1.72,1,1.49)'
				type = 'Back'
			} else if (targetY < minY) {
				targetY = minY
				// bsr = (dragList.ifHandMove)?"":'cubic-bezier(.26,1.72,1,1.49)'
				type = 'Back'
			} else {
				// bsr = ""
				type = 'Linear'
			}
			bsr(type, targetY, time)
			// dragList.style.transition = `${time}s ${bsr} transform`
			// $.transtionCss(dragList,'translateY',targetY)
			dragList.addEventListener('transitionend', endFn)
			dragList.addEventListener('webkitTransitionEnd', endFn)

			function endFn() {
				dragList.removeEventListener('transitionend', endFn)
				dragList.removeEventListener('webkitTransitionEnd', endFn)
				dragList.style.transition = ''
			}
		})
		/* 定义一个tween算法的贝塞尔曲线
			t:当前是哪一次
			b:初始位置
			c:最终位置与初始位置的差值
			d:总次数
			s:回弹距离
		 */
		function bsr(type, targetY, time) {
			clearInterval(dragList.timer)
			let s = 1.7
			let t = 0
			let b = $.transtionCss(dragList, 'translateY')
			let c = targetY - b
			let d = time * 60

			dragList.timer = setInterval(() => {
				t++
				if (callback && typeof callback['move'] === 'function') {
					callback['move'].call(dragList)
				}
				if (t > d) {
					if (callback && typeof callback['end'] === 'function') {
						callback['end'].call(dragList)
					}
					clearInterval(dragList.timer)
				}
				let point = Tween[type](t, b, c, d, s)
				$.transtionCss(dragList, 'translateY', point)
			}, 1000 / 60)
		}
	}

	/* 用promise改造构造函数 */
	w.$.promiseFunOfCallback = function (callback) {
		return new Promise(function (resolve, reject) {
			callback()
		})
	}
	/* 节流函数，一个需要频繁触发的函数，在一定的周期内只允许运行第一次，且在该周期内调用一次
		参数：func:需要被节流的函数
					delay: 延迟执行时间

	*/
	w.$.throttle = (func, delay) => {
		var lastTime = 0
		return () => {
			var nowTime = Data.now()
			if (nowTime - lastTime > delay) {
				func()
				/* 同步时间 */
				lastTime = nowTime
			}
		}
	}
	/* 防抖函数，一个需要频繁触发的函数，在一定的周期内只允许运行最后一次，且在该周期内调用一次 */
	w.$.debonce = function (func, delay) {
		var timer = null
		return () => {
			clearTimeout(timer)
			timer = setTimeout(() => {
				func()
			}, delay)
		}
	}



})(window)
