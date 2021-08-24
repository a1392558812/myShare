$(function(){
	//点击向左向右按钮，平滑的翻到此页
	var $warp = $("#warp")//外层包裹器
	var $inner = $("#warp>#inner")//图片包裹器
	var $points = $("#warp>#pointDiv>span")//所有的链接圆点
	var $prev = $("#prev")//上一张按钮
	var $next = $("#next")//下一张按钮
	var pageLeft = 1000//一页的宽度
	var speed = 10 //速度
	var clickTime = 10
	var imgCount = $("#warp>#inner>img").length
	var indexSpan = 0 //当前下标
	var targetIndex = 0
	$next.click(function(){
	//平滑翻到下一页
		if($inner.position().left%1000==0){
			nextPage(true)
		}
	})
	$prev.click(function(){
	//平滑翻到上一页
		if($inner.position().left%1000==0){
			nextPage(false)
		}
	})
	//flag=true下一页          flag=false上一页
	function nextPage(flag,strTime){
			clearInterval(this.setTime)
			if(typeof flag=== "boolean"){
				//总的偏移量：移动的left值
				var offset = flag ? -pageLeft:pageLeft
			}else{
				//总的偏移量：移动的left值
				var offset = -((flag - indexSpan)*pageLeft)
			}
			//当前的left值
			var nowLeft = $inner.position().left
			if(offset>0){
				var direction =false
			}else{
				var direction =true
			}
			//定义速度
			var speed_now =direction ? -speed:speed
			//目标位置
			var targetNum = nowLeft+offset
			this.setTime = setInterval(function(){
				nowLeft = $inner.position().left
				$inner.css("left",nowLeft+speed_now)
				if(direction){
					if(nowLeft<=targetNum){
						$inner.css("left",targetNum)
						clearInterval(this.setTime) 
					}
					if(nowLeft==-(imgCount-1)*1000){//如果到达了最右边的图片，跳转到最左边的第二张，
						$inner.css("left",-1000)
					}
				}else{
					if(nowLeft>=targetNum){
						$inner.css("left",targetNum)
						clearInterval(this.setTime)
					}
					if(nowLeft==0){//如果到达了最左边的图片，跳转到最右边的第二张，
						$inner.css("left",-(imgCount-2)*1000)
					}
				}
			},strTime)
			//更新圆点
			updateSpan(flag)
	}
	//自动轮播
	var lunset = setInterval(function(){
		nextPage(true)
	},3000)
	//当鼠标移入图片区域时候，自动切换停止，移出后，继续切换
	$("#warp").hover(function(){
		//清除定时器
		console.log("移入")
		clearInterval(lunset)
	},function(){
		console.log("移出")
		 lunset = setInterval(function(){
			nextPage(true)
		},3000)
	})
	//更新圆点
	function updateSpan(flag){
		//将当前indexSpan的<span>移出class=on，
		//将新的indexSpan的<span>添加class=on
		//更新indexSpan
		if(typeof flag==="boolean"){
			if(flag){//为正值当前向右点击移动
				targetIndex = indexSpan+1
				console.log("targetIndex："+targetIndex)
				if(targetIndex===imgCount-2){
					targetIndex = 0
				}
			}else{
				targetIndex = indexSpan-1
				console.log("targetIndex："+targetIndex)
				if(targetIndex===-1){
					targetIndex = imgCount-3
				}
			}
			}else{
				targetIndex = flag//目标索引为flag
				
		}
		$points.eq(indexSpan).removeClass("on")
		$points.eq(targetIndex).addClass("on")
		indexSpan = targetIndex//当前圆点索引为目标索引
	}
	//点击圆点图标，切换对应的页
	$points.click(function(){
	//计算目标页的下标
	var targetIndex = $(this).index()
	console.log(targetIndex)
	//点击的不是当前页的下标的圆点的时候，才翻页，
	if(targetIndex!=indexSpan){
		nextPage(targetIndex)
	}
	})
})
