* 新建一个html页面,引入less编译后的文件

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

**less处理过程中会将 “/* */”的注释给处理掉**
