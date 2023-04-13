'''
Python 数字运算
Python 解释器可以作为一个简单的计算器，您可以在解释器里输入一个表达式，它将输出表达式的值。

表达式的语法很直白： +, -, * 和 /, 和其它语言（如Pascal或C）里一样。例如：

>>> 2 + 2
4
>>> 50 - 5*6
20
>>> (50 - 5*6) / 4
5.0
>>> 8 / 5  # 总是返回一个浮点数
1.6
注意：在不同的机器上浮点运算的结果可能会不一样。

在整数除法中，除法 / 总是返回一个浮点数，如果只想得到整数的结果，丢弃可能的分数部分，可以使用运算符 // ：

>>> 17 / 3  # 整数除法返回浮点型
5.666666666666667
>>>
>>> 17 // 3  # 整数除法返回向下取整后的结果
5
>>> 17 % 3  # ％操作符返回除法的余数
2
>>> 5 * 3 + 2 
17
注意：// 得到的并不一定是整数类型的数，它与分母分子的数据类型有关系。

>>> 7//2
3
>>> 7.0//2
3.0
>>> 7//2.0
3.0
>>> 
'''

'''
Python列表脚本操作符
列表对 + 和 * 的操作符与字符串相似。+ 号用于组合列表，* 号用于重复列表。

如下所示：

Python 表达式	结果	描述
len([1, 2, 3])	3	长度
[1, 2, 3] + [4, 5, 6]	[1, 2, 3, 4, 5, 6]	组合
['Hi!'] * 4	['Hi!', 'Hi!', 'Hi!', 'Hi!']	重复
3 in [1, 2, 3]	True	元素是否存在于列表中
for x in [1, 2, 3]: print(x, end=" ")	1 2 3	迭代
'''

'''
列表比较
列表比较需要引入 operator 模块的 eq 方法（详见：Python operator 模块）：

实例
# 导入 operator 模块
import operator

a = [1, 2]
b = [2, 3]
c = [2, 3]
print("operator.eq(a,b): ", operator.eq(a,b))
print("operator.eq(c,b): ", operator.eq(c,b))
以上代码输出结果为：

operator.eq(a,b):  False
operator.eq(c,b):  True
'''

'''
Python列表函数&方法
Python包含以下函数:

序号	函数
1	len(list)
列表元素个数
2	max(list)
返回列表元素最大值
3	min(list)
返回列表元素最小值
4	list(seq)
将元组转换为列表
'''

'''
Python 的元组与列表类似，不同之处在于元组的元素不能修改。

元组使用小括号 ( )，列表使用方括号 [ ]。

元组创建很简单，只需要在括号中添加元素，并使用逗号隔开即可。

>>> tup1 = ('Google', 'Runoob', 1997, 2000)
>>> tup2 = (1, 2, 3, 4, 5 )
>>> tup3 = "a", "b", "c", "d"   #  不需要括号也可以
>>> type(tup3)
<class 'tuple'>


元组中只包含一个元素时，需要在元素后面添加逗号 , ，否则括号会被当作运算符使用：

实例(Python 3.0+)
>>> tup1 = (50)
>>> type(tup1)     # 不加逗号，类型为整型
<class 'int'>

>>> tup1 = (50,)
>>> type(tup1)     # 加上逗号，类型为元组
<class 'tuple'>
'''

'''
元组中的元素值是不允许修改的，但我们可以对元组进行连接组合，如下实例:

实例(Python 3.0+)
#!/usr/bin/python3
 
tup1 = (12, 34.56)
tup2 = ('abc', 'xyz')
 
# 以下修改元组元素操作是非法的。
# tup1[0] = 100
 
# 创建一个新的元组
tup3 = tup1 + tup2
print (tup3)
以上实例输出结果：

(12, 34.56, 'abc', 'xyz')
'''

'''
# 使用大括号 {} 来创建空字典
emptyDict = {}
 
# 打印字典
print(emptyDict)
 
# 查看字典的数量
print("Length:", len(emptyDict))
 
# 查看类型
print(type(emptyDict))
以上实例输出结果：

{}
Length: 0
<class 'dict'>
使用内建函数 dict() 创建字典：

实例
emptyDict = dict()
 
# 打印字典
print(emptyDict)
 
# 查看字典的数量
print("Length:",len(emptyDict))
 
# 查看类型
print(type(emptyDict))
以上实例输出结果：

{}
Length: 0
<class 'dict'>
'''

'''
访问字典里的值
把相应的键放入到方括号中，如下实例:

实例
#!/usr/bin/python3
 
tinydict = {'Name': 'Runoob', 'Age': 7, 'Class': 'First'}
 
print ("tinydict['Name']: ", tinydict['Name'])
print ("tinydict['Age']: ", tinydict['Age'])
以上实例输出结果：

tinydict['Name']:  Runoob
tinydict['Age']:  7
如果用字典里没有的键访问数据，会输出错误如下：

实例
#!/usr/bin/python3
 
tinydict = {'Name': 'Runoob', 'Age': 7, 'Class': 'First'}
 
print ("tinydict['Alice']: ", tinydict['Alice'])
以上实例输出结果：

Traceback (most recent call last):
  File "test.py", line 5, in <module>
    print ("tinydict['Alice']: ", tinydict['Alice'])
KeyError: 'Alice'
'''

'''
向字典添加新内容的方法是增加新的键/值对，修改或删除已有键/值对如下实例:

实例
#!/usr/bin/python3
 
tinydict = {'Name': 'Runoob', 'Age': 7, 'Class': 'First'}
 
tinydict['Age'] = 8               # 更新 Age
tinydict['School'] = "菜鸟教程"  # 添加信息
 
 
print ("tinydict['Age']: ", tinydict['Age'])
print ("tinydict['School']: ", tinydict['School'])
以上实例输出结果：
tinydict['Age']:  8
tinydict['School']:  菜鸟教程
删除字典元素
能删单一的元素也能清空字典，清空只需一项操作。

显式删除一个字典用del命令，如下实例：

实例
#!/usr/bin/python3
 
tinydict = {'Name': 'Runoob', 'Age': 7, 'Class': 'First'}
 
del tinydict['Name'] # 删除键 'Name'
tinydict.clear()     # 清空字典
del tinydict         # 删除字典
 
print ("tinydict['Age']: ", tinydict['Age'])
print ("tinydict['School']: ", tinydict['School'])
但这会引发一个异常，因为用执行 del 操作后字典不再存在：

Traceback (most recent call last):
  File "/runoob-test/test.py", line 9, in <module>
    print ("tinydict['Age']: ", tinydict['Age'])
NameError: name 'tinydict' is not defined
'''

'''
字典键的特性
字典值可以是任何的 python 对象，既可以是标准的对象，也可以是用户定义的，但键不行。

两个重要的点需要记住：

1）不允许同一个键出现两次。创建时如果同一个键被赋值两次，后一个值会被记住，如下实例：

实例
#!/usr/bin/python3
 
tinydict = {'Name': 'Runoob', 'Age': 7, 'Name': '小菜鸟'}
 
print ("tinydict['Name']: ", tinydict['Name'])
以上实例输出结果：

tinydict['Name']:  小菜鸟
2）键必须不可变，所以可以用数字，字符串或元组充当，而用列表就不行，如下实例：

实例
#!/usr/bin/python3
 
tinydict = {['Name']: 'Runoob', 'Age': 7}
 
print ("tinydict['Name']: ", tinydict['Name'])
以上实例输出结果：

Traceback (most recent call last):
  File "test.py", line 3, in <module>
    tinydict = {['Name']: 'Runoob', 'Age': 7}
TypeError: unhashable type: 'list'
'''

'''
>>> basket = {'apple', 'orange', 'apple', 'pear', 'orange', 'banana'}
>>> print(basket)                      # 这里演示的是去重功能
{'orange', 'banana', 'pear', 'apple'}
>>> 'orange' in basket                 # 快速判断元素是否在集合内
True
>>> 'crabgrass' in basket
False

>>> # 下面展示两个集合间的运算.
...
>>> a = set('abracadabra')
>>> b = set('alacazam')
>>> a                                  
{'a', 'r', 'b', 'c', 'd'}
>>> a - b                              # 集合a中包含而集合b中不包含的元素
{'r', 'd', 'b'}
>>> a | b                              # 集合a或b中包含的所有元素
{'a', 'c', 'r', 'd', 'b', 'm', 'z', 'l'}
>>> a & b                              # 集合a和b中都包含了的元素
{'a', 'c'}
>>> a ^ b                              # 不同时包含于a和b的元素
{'r', 'd', 'b', 'm', 'z', 'l'}
'''

'''
>>> a = {x for x in 'abracadabra' if x not in 'abc'}
>>> a
{'r', 'd'}
'''

'''
1、添加元素
语法格式如下：

s.add( x )
将元素 x 添加到集合 s 中，如果元素已存在，则不进行任何操作。

实例(Python 3.0+)
>>> thisset = set(("Google", "Runoob", "Taobao"))
>>> thisset.add("Facebook")
>>> print(thisset)
{'Taobao', 'Facebook', 'Google', 'Runoob'}
还有一个方法，也可以添加元素，且参数可以是列表，元组，字典等，语法格式如下：

s.update( x )
x 可以有多个，用逗号分开。

实例(Python 3.0+)
>>> thisset = set(("Google", "Runoob", "Taobao"))
>>> thisset.update({1,3})
>>> print(thisset)
{1, 3, 'Google', 'Taobao', 'Runoob'}
>>> thisset.update([1,4],[5,6])  
>>> print(thisset)
{1, 3, 4, 5, 6, 'Google', 'Taobao', 'Runoob'}
>>>
2、移除元素
语法格式如下：

s.remove( x )
将元素 x 从集合 s 中移除，如果元素不存在，则会发生错误。

实例(Python 3.0+)
>>> thisset = set(("Google", "Runoob", "Taobao"))
>>> thisset.remove("Taobao")
>>> print(thisset)
{'Google', 'Runoob'}
>>> thisset.remove("Facebook")   # 不存在会发生错误
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
KeyError: 'Facebook'
>>>
此外还有一个方法也是移除集合中的元素，且如果元素不存在，不会发生错误。格式如下所示：

s.discard( x )
实例(Python 3.0+)
>>> thisset = set(("Google", "Runoob", "Taobao"))
>>> thisset.discard("Facebook")  # 不存在不会发生错误
>>> print(thisset)
{'Taobao', 'Google', 'Runoob'}
我们也可以设置随机删除集合中的一个元素，语法格式如下：

s.pop() 
脚本模式实例(Python 3.0+)
thisset = set(("Google", "Runoob", "Taobao", "Facebook"))
x = thisset.pop()

print(x)
输出结果：

$ python3 test.py 
Runoob
多次执行测试结果都不一样。

set 集合的 pop 方法会对集合进行无序的排列，然后将这个无序排列集合的左面第一个元素进行删除。

3、计算集合元素个数
语法格式如下：

len(s)
计算集合 s 元素个数。

实例(Python 3.0+)
>>> thisset = set(("Google", "Runoob", "Taobao"))
>>> len(thisset)
3
4、清空集合
语法格式如下：

s.clear()
清空集合 s。

实例(Python 3.0+)
>>> thisset = set(("Google", "Runoob", "Taobao"))
>>> thisset.clear()
>>> print(thisset)
set()
5、判断元素是否在集合中存在
语法格式如下：

x in s
判断元素 x 是否在集合 s 中，存在返回 True，不存在返回 False。

实例(Python 3.0+)
>>> thisset = set(("Google", "Runoob", "Taobao"))
>>> "Runoob" in thisset
True
>>> "Facebook" in thisset
False
>>>
'''