# 基本数据类型
换行 = '\n -----下一话题--------------------------------------------------------------------------------------------------------------------------------------- \n'

'''
Python 中的变量不需要声明。每个变量在使用前都必须赋值，变量赋值以后该变量才会被创建。

在 Python 中，变量就是变量，它没有类型，我们所说的"类型"是变量所指的内存中对象的类型。

等号（=）用来给变量赋值。

等号（=）运算符左边是一个变量名,等号（=）运算符右边是存储在变量中的值。例如：
'''

counter = 100          # 整型变量
miles   = 1000.0       # 浮点型变量
name    = "runoob"     # 字符串

print (counter)
print (miles)
print (name)

'''
执行以上程序会输出如下结果：

100
1000.0
runoob
'''

print(换行)

'''
多个变量赋值
Python允许你同时为多个变量赋值。例如：

a = b = c = 1
以上实例，创建一个整型对象，值为 1，从后向前赋值，三个变量被赋予相同的数值。

您也可以为多个对象指定多个变量。例如：

d, e, f = 1, 2, "runoob"
以上实例，两个整型对象 1 和 2 的分配给变量 d 和 e，字符串对象 "runoob" 分配给变量 f。
'''

a = b = c = 1; d, e, f = 1, 2, "runoob"
print (a,b,c,d,e,f)

print(换行)

'''
Python3 中常见的数据类型有：

Number（数字）
String（字符串）
bool（布尔类型）
List（列表）
Tuple（元组）
Set（集合）
Dictionary（字典）
Python3 的六个标准数据类型中：

不可变数据（3 个）：Number（数字）、String（字符串）、Tuple（元组）；
可变数据（3 个）：List（列表）、Dictionary（字典）、Set（集合）。
此外还有一些高级的数据类型，如: 字节数组类型(bytes)。
'''

'''
Python3 支持 int、float、bool、complex（复数）。

在Python 3里，只有一种整数类型 int，表示为长整型，没有 python2 中的 Long。

像大多数语言一样，数值类型的赋值和计算都是很直观的。

内置的 type() 函数可以用来查询变量所指的对象类型。

>>> a, b, c, d = 20, 5.5, True, 4+3j
>>> print(type(a), type(b), type(c), type(d))
<class 'int'> <class 'float'> <class 'bool'> <class 'complex'>
'''

a, b, c, d = 20, 5.5, True, 4+3j
print(type(a), type(b), type(c), type(d))

'''
此外还可以用 isinstance 来判断
'''

a = 111; print(isinstance(a, int)) # True

'''
isinstance 和 type 的区别在于：

type()不会认为子类是一种父类类型。
isinstance()会认为子类是一种父类类型。

>>> class A:
...     pass
... 
>>> class B(A):
...     pass
... 
>>> isinstance(A(), A)
True
>>> type(A()) == A 
True
>>> isinstance(B(), A)
True
>>> type(B()) == A
False



Python3 中，bool 是 int 的子类，True 和 False 可以和数字相加， True==1、False==0 会返回 True，但可以通过 is 来判断类型。

>>> issubclass(bool, int) 
True
>>> True==1
True
>>> False==0
True
>>> True+1
2
>>> False+1
1
>>> 1 is True
False
>>> 0 is False
False

在 Python2 中是没有布尔型的，它用数字 0 表示 False，用 1 表示 True。
'''

'''
>>> 5 + 4  # 加法
9
>>> 4.3 - 2 # 减法
2.3
>>> 3 * 7  # 乘法
21
>>> 2 / 4  # 除法，得到一个浮点数
0.5
>>> 2 // 4 # 除法，得到一个整数
0
>>> 17 % 3 # 取余
2
>>> 2 ** 5 # 乘方
32
'''

print(换行)


'''
布尔类型即 True 或 False。

在 Python 中，True 和 False 都是关键字，表示布尔值。

布尔类型可以用来控制程序的流程，比如判断某个条件是否成立，或者在某个条件满足时执行某段代码。

布尔类型特点：

布尔类型只有两个值：True 和 False。

布尔类型可以和其他数据类型进行比较，比如数字、字符串等。在比较时，Python 会将 True 视为 1，False 视为 0。

布尔类型可以和逻辑运算符一起使用，包括 and、or 和 not。这些运算符可以用来组合多个布尔表达式，生成一个新的布尔值。

布尔类型也可以被转换成其他数据类型，比如整数、浮点数和字符串。在转换时，True 会被转换成 1，False 会被转换成 0。
'''

a = True
b = False

# 比较运算符
print(2 < 3)   # True
print(2 == 3)  # False

# 逻辑运算符
print(a and b)  # False
print(a or b)   # True
print(not a)    # False

# 类型转换
print(int(a))   # 1
print(float(b)) # 0.0
print(str(a))   # "True"

print(换行)

'''
      t = ['a',   'b',   'c',   'd',   'e',   'f']
  索引      0      1      2      3      4      5
           -6     -5     -4     -3     -2     -1
'''
list = [ 'abcd', 786 , 2.23, 'runoob', 70.2 ]
tinylist = [123, 'runoob']

print ('第1输出:', list)            # 输出完整列表
print ('第2输出:', list[0])         # 输出列表第一个元素
print ('第3输出:', list[1:3])       # 从第二个开始输出到第三个元素
print ('第4输出:', list[2:-1])  
print ('第5输出:', list[2:])        # 输出从第三个元素开始的所有元素
print ('第6输出:', tinylist * 2)    # 输出两次列表
print ('第7输出:', list + tinylist) # 连接列表

print(换行)

# 列表(List)

'''
与Python字符串不一样的是，列表中的元素是可以改变的：
'''
a = [1,2,3,4,5,6]
print(a)
a[0] = '🥵'
print(a)
a[2:5] = [13, 14, 15]
print(a)
a[2:5] = []
print(a)

'''
Python 列表截取可以接收第三个参数，参数作用是截取的步长，

list = [0,1,2,3,4,5]
print(list[1:4:2])
'''

list = [0,1,2,3,4,5]
print(list[1:4:2]) # [1,3] 

'''
# 翻转字符串
# 假设列表 list = [1,2,3,4],  
# list[0]=1, list[1]=2 ，而 -1 表示最后一个元素 list[-1]=4 ( 与 list[3]=4 一样)
# inputWords[-1::-1] 有三个参数
# 第一个参数 -1 表示最后一个元素
# 第二个参数为空，表示移动到列表末尾
# 第三个参数为步长，-1 表示逆向
'''

print(换行)

# 元组(Tuple)

'''
元组（tuple）与列表类似，不同之处在于元组的元素不能修改。元组写在小括号 () 里，元素之间用逗号隔开。

元组中的元素类型也可以不相同：
'''

tuple = ( 'abcd', 786 , 2.23, 'runoob', 70.2  )
tinytuple = (123, 'runoob')

print (tuple)             # 输出完整元组
print (tuple[0])          # 输出元组的第一个元素
print (tuple[1:3])        # 输出从第二个元素开始到第三个元素
print (tuple[2:])         # 输出从第三个元素开始的所有元素
print (tinytuple * 2)     # 输出两次元组
print (tuple + tinytuple) # 连接元组

'''
元组与字符串类似，可以被索引且下标索引从0开始，-1 为从末尾开始的位置。也可以进行截取（看上面，这里不再赘述）。

其实，可以把字符串看作一种特殊的元组。

实例
>>> tup = (1, 2, 3, 4, 5, 6)
>>> print(tup[0])
1
>>> print(tup[1:5])
(2, 3, 4, 5)
>>> tup[0] = 11  # 修改元组元素的操作是非法的
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: 'tuple' object does not support item assignment
>>>
'''

'''
虽然tuple的元素不可改变，但它可以包含可变的对象，比如list列表。

构造包含 0 个或 1 个元素的元组比较特殊，所以有一些额外的语法规则：

tup1 = ()    # 空元组
tup2 = (20,) # 一个元素，需要在元素后添加逗号
string、list 和 tuple 都属于 sequence（序列）。

注意：

1、与字符串一样，元组的元素不能修改。
2、元组也可以被索引和切片，方法一样。
3、注意构造包含 0 或 1 个元素的元组的特殊语法规则。
4、元组也可以使用+操作符进行拼接。
'''

print(换行)

'''
集合（set）是由一个或数个形态各异的大小整体组成的，构成集合的事物或对象称作元素或是成员。

基本功能是进行成员关系测试和删除重复元素。

可以使用大括号 { } 或者 set() 函数创建集合，注意：创建一个空集合必须用 set() 而不是 { }，因为 { } 是用来创建一个空字典。

创建格式：

parame = {value01,value02,...}
或者
set(value)
'''

sites = {'Google', 'Google', 'Taobao', 'Taobao', 'Runoob', 'Runoob', 'Facebook', 'Zhihu', 'Baidu'}

print(sites)   # 输出集合，重复的元素被自动去掉

# 成员测试
if 'Runoob' in sites :
    print('Runoob 在集合中')
else :
    print('Runoob 不在集合中')


# set可以进行集合运算
a = set('abracadabra')
b = set('alacazam')

print('a:', a)

print('a - b:', a - b)     # a 和 b 的差集

print('a | b:', a | b)     # a 和 b 的并集

print('a & b:', a & b)     # a 和 b 的交集

print('a ^ b:', a ^ b)     # a 和 b 中不同时存在的元素

print(换行)

'''
字典（dictionary）是Python中另一个非常有用的内置数据类型。

列表是有序的对象集合，字典是无序的对象集合。两者之间的区别在于：字典当中的元素是通过键来存取的，而不是通过偏移存取。

字典是一种映射类型，字典用 { } 标识，它是一个无序的 键(key) : 值(value) 的集合。

键(key)必须使用不可变类型。

在同一个字典中，键(key)必须是唯一的。
'''

dictD = {}
dictD['one'] = "1 - 菜鸟教程"
dictD[2]     = "2 - 菜鸟工具"

tinydict = {'name': 'runoob','code':1, 'site': 'www.runoob.com'}


print (dictD['one'])       # 输出键为 'one' 的值
print (dictD[2])           # 输出键为 2 的值
print (tinydict)          # 输出完整的字典
print (tinydict.keys())   # 输出所有键
print (tinydict.values()) # 输出所有值

'''
1 - 菜鸟教程
2 - 菜鸟工具
{'name': 'runoob', 'code': 1, 'site': 'www.runoob.com'}
dict_keys(['name', 'code', 'site'])
dict_values(['runoob', 1, 'www.runoob.com'])
'''

# 构造函数 dict() 可以直接从键值对序列中构建字典如下：

print(dict([('Runoob', 1), ('Google', 2), ('Taobao', 3)]))
print({x: x**2 for x in (2, 4, 6)})
print(dict(Runoob=1, Google=2, Taobao=3))

'''
1、字典是一种映射类型，它的元素是键值对。
2、字典的关键字必须为不可变类型，且不能重复。
3、创建空字典使用 { }。
'''

print(换行)

'''
在 Python3 中，bytes 类型表示的是不可变的二进制序列（byte sequence）。

与字符串类型不同的是，bytes 类型中的元素是整数值（0 到 255 之间的整数），而不是 Unicode 字符。

bytes 类型通常用于处理二进制数据，比如图像文件、音频文件、视频文件等等。在网络编程中，也经常使用 bytes 类型来传输二进制数据。

创建 bytes 对象的方式有多种，最常见的方式是使用 b 前缀：

此外，也可以使用 bytes() 函数将其他类型的对象转换为 bytes 类型。bytes() 函数的第一个参数是要转换的对象，第二个参数是编码方式，如果省略第二个参数，则默认使用 UTF-8 编码：
'''

x = bytes("hello", encoding="utf-8")
print(x)
# 与字符串类型类似，bytes 类型也支持许多操作和方法，如切片、拼接、查找、替换等等。同时，由于 bytes 类型是不可变的，因此在进行修改操作时需要创建一个新的 bytes 对象。例如：
x = b"hello"
y = x[1:3]  # 切片操作，得到 b"el"
z = x + b"world"  # 拼接操作，得到 b"helloworld"

print('x, y, z', x, y, z)