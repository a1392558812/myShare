```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>less的混合</title>
		<link rel="stylesheet" type="text/css" href="css/less的混合.css"/>
	</head>
	<body>
		<div id="warp">
			<div class="inner1">s</div>
			<div class="inner2">s</div>
		</div>
	</body>
</html>

```

* 这里是css/less的混合.less
```css
.hunhe(@width:50px,@height:400px,@color:orange){
  //其中@width，@height，@color为参数
  //而且，形参可以传默认参数
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: @width;
  height: @height;
  border: 2px solid black;
  background-color: @color;
  margin: auto;
}
*{
  padding: 0;
  margin: 0;
}
#warp{
  position: relative;
  width: 600px;
  height: 400px;
  border: 2px solid black;
  margin: 0 auto;
  .inner1{
    .hunhe(100px,200px,red);
  }
  .inner2{
    .hunhe(@color:green);
  }
}

```