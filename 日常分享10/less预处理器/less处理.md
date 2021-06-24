* 新建一个html页面

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>less预处理器</title>
		<link rel="stylesheet" type="text/css" href="02.css"/>
	</head>
	<body>
		<div id="warp">
			<div class="inner">s</div>
		</div>
	</body>
</html>

```


* 这是02.less文件

```less
//这是1号被处理的注释
/*这是2号被处理的注释*/
//只有
@color:deeppink;
//less中的变量，使用color来代替pink，提高值的复用
@m:margin;
//将属性名作为变量，
@selector:#warp;
//将选择器作为变量，
*{
  padding: 0;
    @{m}: 0;
}
@{selector}{
  position: relative;
  width: 600px;
  height: 400px;
  border: 2px solid black;
  margin: 0 auto;
  .inner{
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 400px;
    height: 200px;
    border: 2px solid black;
    background-color: @color;
      @{m}: auto;
    &:hover{
      //&符号在编译时，会把(.inner)与(:hover)之间的空格给去掉,&代表上一层选择器
      background-color: red;
    }
  }
}

```

* 这是03.css
```css
/*这是2号被处理的注释*/

* {
  padding: 0;
  margin: 0;
}
#wrap {
  width: 600px;
  height: 400px;
  border: 2px solid black;
  margin: 0 auto;
}
#wrap .inner {
  width: 400px;
  height: 200px;
  border: 2px solid black;
  background-color: #ff1493;
}

```

* 这是04.less
```less
.border(@a,@b,@c){
    border: @arguments;
}
#warp .sjx{
    .border(1px,solid,black);
}

```