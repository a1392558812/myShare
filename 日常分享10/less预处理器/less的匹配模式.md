```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>less的匹配模式</title>
		<link rel="stylesheet" type="text/css" href="css/less的匹配模式.css"/>
	</head>
	<body>
		<div id="warp">
			<div id="sjx"></div>
		</div>
	</body>
</html>

```

* 这里是 css/less的匹配模式.less文件


```css
@import "./Triangle.less";//引入一个外部的less文件
#warp>#sjx{
  .triangle(TO,yellow,40px);
}
```


* 这里是 css/Triangle.less文件
```css
.triangle(@_,@width,@color){
    width:0px;
    height:0px;
    overflow: hidden;//为了兼容ie6
}
/*通用匹配@_
    -即调用以下的less方法也会带上上面这个通用的样式 
*/
.triangle(RI,@color,@width){
    border-width:@width;
    border-style:dashed dashed dashed solid;
    border-color:transparent  transparent transparent @color;
}
.triangle(TO,@color,@width){
   border-width:@width;
    border-style:dashed dashed  solid dashed;
    border-color:transparent  transparent @color transparent ;
 }
.triangle(LE,@color,@width){
    border-width:@width;
    border-style:dashed  solid dashed dashed;
    border-color:transparent @color  transparent transparent ;
}
.triangle(BO,@color,@width){
    border-width:@width;
    border-style: solid dashed dashed dashed;
    border-color:@color transparent  transparent transparent ;
}
```
