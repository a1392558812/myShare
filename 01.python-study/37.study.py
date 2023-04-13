# 牛客网摘抄，https://www.nowcoder.com/tutorial/10005/325b06e25453400d89e247e705baba3f

'''
Python complex() 函数
描述
complex() 函数用于创建一个值为 real + imag * j 的复数或者转化一个字符串或数为复数。如果第一个参数为字符串，则不需要指定第二个参数。。

语法
complex 语法：

1
class complex([real[, imag]])
参数说明：

real -- int, long, float或字符串；
imag -- int, long, float；
返回值
返回一个复数。

>>>complex(1, 2)
(1 + 2j)

>>> complex(1)    # 数字
(1 + 0j)

>>> complex("1")  # 当做字符串处理
(1 + 0j)

# 注意：这个地方在"+"号两边不能有空格，也就是不能写成"1 + 2j"，应该是"1+2j"，否则会报错
>>> complex("1+2j")
(1 + 2j)
'''


'''
Python3 tuple 函数
描述
tuple 函数将列表转换为元组。

语法
以下是 tuple 的语法:

1
tuple( seq )
参数
seq -- 要转换为元组的序列。
返回值
返回元组。

>>>list1= ['Google', 'Taobao', 'Nowcoder', 'Baidu']
>>> tuple1=tuple(list1)
>>> tuple1
('Google', 'Taobao', 'Nowcoder', 'Baidu')
'''


'''
Python3 List list()方法
描述
list() 方法用于将元组或字符串转换为列表。

注：元组与列表是非常类似的，区别在于元组的元素值不能修改，元组是放在括号中，列表是放于方括号中。

语法
list()方法语法：

1
list( seq )
参数
seq -- 要转换为列表的元组或字符串。
返回值
返回列表。


#!/usr/bin/python3

aTuple = (123, 'Google', 'Nowcoder', 'Taobao')
list1 = list(aTuple)
print ("列表元素 : ", list1)

str="Hello World"
list2=list(str)
print ("列表元素 : ", list2)
'''


'''
Python set() 函数
描述
set() 函数创建一个无序不重复元素集，可进行关系测试，删除重复数据，还可以计算交集、差集、并集等。

语法
set 语法：

1
class set([iterable])
参数说明：

iterable -- 可迭代对象对象；
返回值
返回新的集合对象。


>>>x = set('nowcoder')
>>> y = set('google')
>>> x, y
({'o', 'c', 'n', 'w', 'e', 'r', 'd'}, {'g', 'l', 'o', 'e'})   # 重复的被删除
>>> x & y         # 交集
{'o', 'e'}
>>> x | y         # 并集
{'o', 'c', 'g', 'l', 'n', 'w', 'e', 'r', 'd'}
>>> x - y         # 差集
{'c', 'n', 'w', 'r', 'd'}
>>>
'''


'''
Python dict() 函数
描述
dict() 函数用于创建一个字典。

语法
dict 语法：

1
2
3
class dict(**kwarg)
class dict(mapping, **kwarg)
class dict(iterable, **kwarg)
参数说明：

**kwargs -- 关键字
mapping -- 元素的容器。
iterable -- 可迭代对象。
返回值
返回一个字典。


>>>dict()                        # 创建空字典
{}
>>> dict(a='a', b='b', t='t')     # 传入关键字
{'a': 'a', 'b': 'b', 't': 't'}
>>> dict(zip(['one', 'two', 'three'], [1, 2, 3]))   # 映射函数方式来构造字典
{'three': 3, 'two': 2, 'one': 1} 
>>> dict([('one', 1), ('two', 2), ('three', 3)])    # 可迭代对象方式来构造字典
{'three': 3, 'two': 2, 'one': 1}
>>>Python frozenset() 函数
描述
frozenset() 返回一个冻结的集合，冻结后集合不能再添加或删除任何元素。

语法
frozenset() 函数语法：

1
class frozenset([iterable])
参数
iterable -- 可迭代的对象，比如列表、字典、元组等等。
返回值
返回新的 frozenset 对象，如果不提供任何参数，默认会生成空集合。


>>>a = frozenset(range(10))     # 生成一个新的不可变集合
>>> a
frozenset([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
>>> b = frozenset('nowcoder') 
>>> b
frozenset({'o', 'c', 'n', 'w', 'e', 'r', 'd'})   # 创建不可变集合
>>>
'''


'''
Python chr() 函数
描述
chr() 用一个范围在 range（256）内的（就是0～255）整数作参数，返回一个对应的字符。

语法
以下是 chr() 方法的语法:

1
chr(i)
参数
i -- 可以是10进制也可以是16进制的形式的数字。
返回值
返回值是当前整数对应的 ASCII 字符。




>>>print chr(0x30), chr(0x31), chr(0x61)   # 十六进制
0 1 a
>>> print chr(48), chr(49), chr(97)         # 十进制
0 1 a
'''


'''
Python ord() 函数
描述
ord() 函数是 chr() 函数（对于8位的ASCII字符串）或 unichr() 函数（对于Unicode对象）的配对函数，它以一个字符（长度为1的字符串）作为参数，返回对应的 ASCII 数值，或者 Unicode 数值，如果所给的 Unicode 字符超出了你的 Python 定义范围，则会引发一个 TypeError 的异常。

语法
以下是 ord() 方法的语法:

1
ord(c)
参数
c -- 字符。
返回值
返回值是对应的十进制整数。


>>>ord('a')
97
>>> ord('b')
98
>>> ord('c')
99
'''


'''
Python hex() 函数
描述
hex() 函数用于将10进制整数转换成16进制，以字符串形式表示。

语法
hex 语法：

1
hex(x)
参数说明：

x -- 10进制整数
返回值
返回16进制数，以字符串形式表示。


>>>hex(255)
'0xff'
>>> hex(-42)
'-0x2a'
>>> hex(1L)
'0x1L'
>>> hex(12)
'0xc'
>>> type(hex(12))
<class 'str'>      # 字符串
'''

'''
Python oct() 函数
描述
oct() 函数将一个整数转换成8进制字符串。

语法
oct 语法：

1
oct(x)
参数说明：

x -- 整数。
返回值
返回8进制字符串。


>>>oct(10)
'012'
>>> oct(20)
'024'
>>> oct(15)
'017'
>>>
'''


'''
描述
ceil(x) 函数返回一个大于或等于 x 的的最小整数。

语法
以下是 ceil() 方法的语法:

1
2
3
import math
 
math.ceil( x )
注意：ceil()是不能直接访问的，需要导入 math 模块，通过静态对象调用该方法。

参数
x -- 数值表达式。

返回值
函数返回返回一个大于或等于 x 的的最小整数。


#!/usr/bin/python3
import math   # 导入 math 模块

print ("math.ceil(-45.17) : ", math.ceil(-45.17))
print ("math.ceil(100.12) : ", math.ceil(100.12))
print ("math.ceil(100.72) : ", math.ceil(100.72))
print ("math.ceil(math.pi) : ", math.ceil(math.pi))
'''


'''
Python3 floor() 函数
描述
floor(x) 返回数字的下舍整数，小于或等于 x。

语法
以下是 floor() 方法的语法:

1
2
3
import math
 
math.floor( x )
注意：floor()是不能直接访问的，需要导入 math 模块，通过静态对象调用该方法。

参数
x -- 数值表达式。
返回值
返回小于或等于 x 的整数。


#!/usr/bin/python
import math   # 导入 math 模块

print ("math.floor(-45.17) : ", math.floor(-45.17))
print ("math.floor(100.12) : ", math.floor(100.12))
print ("math.floor(100.72) : ", math.floor(100.72))
print ("math.floor(math.pi) : ", math.floor(math.pi))
'''


'''
Python3 count()方法
描述
count() 方法用于统计字符串里某个字符出现的次数。可选参数为在字符串搜索的开始与结束位置。

语法
count()方法语法：

1
str.count(sub, start= 0,end=len(string))
参数
sub -- 搜索的子字符串
start -- 字符串开始搜索的位置。默认为第一个字符,第一个字符索引值为0。
end -- 字符串中结束搜索的位置。字符中第一个字符的索引为 0。默认为字符串的最后一个位置。
返回值
该方法返回子字符串在字符串中出现的次数。


#!/usr/bin/python3

str="www.nowcoder.com"
sub='o'
print ("str.count('o') : ", str.count(sub))

sub='now'
print ("str.count('now', 0, 10) : ", str.count(sub,0,10))
'''


'''
Python3 bytes.decode()方法
描述
decode() 方法以指定的编码格式解码 bytes 对象。默认编码为 'utf-8'。

语法
decode()方法语法：

1
bytes.decode(encoding="utf-8", errors="strict")
参数
encoding -- 要使用的编码，如"UTF-8"。
errors -- 设置不同错误的处理方案。默认为 'strict',意为编码错误引起一个UnicodeError。 其他可能得值有 'ignore', 'replace', 'xmlcharrefreplace', 'backslashreplace' 以及通过 codecs.register_error() 注册的任何值。
返回值
该方法返回解码后的字符串。


#!/usr/bin/python3

str = "牛客教程";
str_utf8 = str.encode("UTF-8")
str_gbk = str.encode("GBK")

print(str)

print("UTF-8 编码：", str_utf8)
print("GBK 编码：", str_gbk)

print("UTF-8 解码：", str_utf8.decode('UTF-8','strict'))
print("GBK 解码：", str_gbk.decode('GBK','strict'))
'''


'''
Python3 join()方法
描述
Python join() 方法用于将序列中的元素以指定的字符连接生成一个新的字符串。

语法
join()方法语法：

1
str.join(sequence)
参数
sequence -- 要连接的元素序列。
返回值
返回通过指定字符连接序列中元素后生成的新字符串。


#!/usr/bin/python3

s1 = "-"
s2 = ""
seq = ("n", "o", "w", "c", "o", "d", "e", "r") # 字符串序列
print (s1.join( seq ))
print (s2.join( seq ))

n-o-w-c-o-d-e-r
nowcoder
'''


'''
Python3 List append()方法
描述
append() 方法用于在列表末尾添加新的对象。

语法
append()方法语法：

1
list.append(obj)
参数
obj -- 添加到列表末尾的对象。
返回值
该方法无返回值，但是会修改原来的列表。


#!/usr/bin/python3

list1 = ['Google', 'Nowcoder', 'Taobao']
list1.append('Baidu')
print ("更新后的列表 : ", list1)
'''


'''
Python3 List extend()方法
描述
extend() 函数用于在列表末尾一次性追加另一个序列中的多个值（用新列表扩展原来的列表）。

语法
extend()方法语法：

1
list.extend(seq)
参数
seq -- 元素列表，可以是列表、元组、集合、字典，若为字典,则仅会将键(key)作为元素依次添加至原列表的末尾。
返回值
该方法没有返回值，但会在已存在的列表中添加新的列表内容。


#!/usr/bin/python3

list1 = ['Google', 'Nowcoder', 'Taobao']
list2=list(range(5)) # 创建 0-4 的列表
list1.extend(list2)  # 扩展列表
print ("扩展后的列表：", list1)

#!/usr/bin/python3

# 语言列表
language = ['French', 'English', 'German']

# 元组
language_tuple = ('Spanish', 'Portuguese')

# 集合
language_set = {'Chinese', 'Japanese'}

# 添加元组元素到列表末尾
language.extend(language_tuple)

print('新列表: ', language)

# 添加集合元素到列表末尾
language.extend(language_set)

print('新列表: ', language)
'''


'''
Python3 字典 fromkeys() 方法
描述
Python 字典 fromkeys() 函数用于创建一个新字典，以序列 seq 中元素做字典的键，value 为字典所有键对应的初始值。

语法
fromkeys() 方法语法：

1
dict.fromkeys(seq[, value])
参数
seq -- 字典键值列表。
value -- 可选参数, 设置键序列（seq）对应的值，默认为 None。
返回值
该方法返回一个新字典。



#!/usr/bin/python3

seq = ('name', 'age', 'sex')

dict = dict.fromkeys(seq)
print ("新的字典为 : %s" %  str(dict))

dict = dict.fromkeys(seq, 10)
print ("新的字典为 : %s" %  str(dict))


新的字典为 : {'age': None, 'name': None, 'sex': None}
新的字典为 : {'age': 10, 'name': 10, 'sex': 10}
'''


'''
Python Set difference() 方法
描述
difference() 方法用于返回集合的差集，即返回的集合元素包含在第一个集合中，但不包含在第二个集合(方法的参数)中。

语法
difference() 方法语法：

1
set.difference(set)
参数
set -- 必需，用于计算差集的集合
返回值
返回一个新的集合。


x = {"apple", "banana", "cherry"}
y = {"google", "microsoft", "apple"}

z = x.difference(y) 

print(z)
'''


'''
Python Set discard() 方法
描述
discard() 方法用于移除指定的集合元素。

该方法不同于 remove() 方法，因为 remove() 方法在移除一个不存在的元素时会发生错误，而 discard() 方法不会。

语法
discard() 方法语法：

1
set.discard(value)
参数
value -- 必需，要移除的元素
返回值
无。


fruits = {"apple", "banana", "cherry"}

fruits.discard("banana") 

print(fruits)
'''

'''
Python3 File writelines() 方法
概述
writelines() 方法用于向文件中写入一序列的字符串。

这一序列字符串可以是由迭代对象产生的，如一个字符串列表。

换行需要制定换行符 \n。

语法
writelines() 方法语法如下：

1
fileObject.writelines( [ str ])
参数
str -- 要写入文件的字符串序列。
返回值
该方法没有返回值。


#!/usr/bin/python3

# 打开文件
fo = open("test.txt", "w")
print ("文件名为: ", fo.name)
seq = ["牛客教程 1\n", "牛客教程 2"]
fo.writelines( seq )

# 关闭文件
fo.close()
'''



'''
Python3 os.access() 方法
概述
os.access() 方法使用当前的uid/gid尝试访问路径。大部分操作使用有效的 uid/gid, 因此运行环境可以在 suid/sgid 环境尝试。

语法
access()方法语法格式如下：

1
os.access(path, mode);
参数
path -- 要用来检测是否有访问权限的路径。
mode -- mode为F_OK，测试存在的路径，或者它可以是包含R_OK, W_OK和X_OK或者R_OK, W_OK和X_OK其中之一或者更多。
os.F_OK: 作为access()的mode参数，测试path是否存在。
os.R_OK: 包含在access()的mode参数中 ， 测试path是否可读。
os.W_OK 包含在access()的mode参数中 ， 测试path是否可写。
os.X_OK 包含在access()的mode参数中 ，测试path是否可执行。
返回值
如果允许访问返回 True , 否则返回False。


#!/usr/bin/python3

import os, sys

# 假定 /tmp/foo.txt 文件存在，并有读写权限

ret = os.access("/tmp/foo.txt", os.F_OK)
print ("F_OK - 返回值 %s"% ret)

ret = os.access("/tmp/foo.txt", os.R_OK)
print ("R_OK - 返回值 %s"% ret)

ret = os.access("/tmp/foo.txt", os.W_OK)
print ("W_OK - 返回值 %s"% ret)

ret = os.access("/tmp/foo.txt", os.X_OK)
print ("X_OK - 返回值 %s"% ret)
'''



'''
Python3 os.close() 方法
概述
os.close() 方法用于关闭指定的文件描述符 fd。

语法
close()方法语法格式如下：

1
os.close(fd);
参数
fd -- 文件描述符。
返回值
该方法没有返回值。



#!/usr/bin/python3

import os, sys

# 打开文件
fd = os.open( "foo.txt", os.O_RDWR|os.O_CREAT )

#  写入字符串
os.write(fd, "This is test")

# 关闭文件
os.close( fd )

print ("关闭文件成功!!")
'''


'''
Python3 os.getcwd() 方法
概述
os.getcwd() 方法用于返回当前工作目录。

语法
getcwd()方法语法格式如下：

1
os.getcwd()
参数
无
返回值
返回当前进程的工作目录。



#!/usr/bin/python3

import os, sys

# 切换到 "/var/www/html" 目录
os.chdir("/var/www/html" )

# 打印当前目录
print ("当前工作目录 : %s" % os.getcwd())

# 打开 "/tmp"
fd = os.open( "/tmp", os.O_RDONLY )

# 使用 os.fchdir() 方法修改目录
os.fchdir(fd)

# 打印当前目录
print ("当前工作目录 : %s" % os.getcwd())

# 关闭文件
os.close( fd )
'''


'''
Python3 os.listdir() 方法
概述
os.listdir() 方法用于返回指定的文件夹包含的文件或文件夹的名字的列表。这个列表以字母顺序。 它不包括 '.' 和'..' 即使它在文件夹中。

只支持在 Unix, Windows 下使用。

语法
listdir()方法语法格式如下：

1
os.listdir(path)
参数
path -- 需要列出的目录路径
返回值
返回指定路径下的文件和文件夹列表。



#!/usr/bin/python3

import os, sys

# 打开文件
path = "/var/www/html/"
dirs = os.listdir( path )

# 输出所有文件和文件夹
for file in dirs:
    print (file)
'''



'''
Python3 os.pipe() 方法
概述
os.pipe() 方法用于创建一个管道, 返回一对文件描述符(r, w) 分别为读和写。

语法
pipe()方法语法格式如下：

1
os.pipe()
参数
无
返回值
返回文件描述符对。


#!/usr/bin/python3

import os, sys

print ("The child will write text to a pipe and ")
print ("the parent will read the text written by child...")

# 文件描述符 r, w 用于读、写
r, w = os.pipe() 

processid = os.fork()
if processid:
    # 父进程
    # 关闭文件描述符 w
    os.close(w)
    r = os.fdopen(r)
    print ("Parent reading")
    str = r.read()
    print ("text =", str)
    sys.exit(0)
else:
    # 子进程
    os.close(r)
    w = os.fdopen(w, 'w')
    print ("Child writing")
    w.write("Text written by child...")
    w.close()
    print ("Child closing")
    sys.exit(0)
'''


'''
Python all() 函数
描述
all() 函数用于判断给定的可迭代参数 iterable 中的所有元素是否都为 TRUE，如果是返回 True，否则返回 False。

元素除了是 0、空、None、False 外都算 True。

函数等价于：

1
2
3
4
5
def all(iterable):
    for element in iterable:
        if not element:
            return False
    return True
Python 2.5 以上版本可用。

语法
以下是 all() 方法的语法:

1
all(iterable)
参数
iterable -- 元组或列表。
返回值
如果iterable的所有元素不为0、''、False或者iterable为空，all(iterable)返回True，否则返回False；

注意：空元组、空列表返回值为True，这里要特别注意。


>>> all(['a', 'b', 'c', 'd'])  # 列表list，元素都不为空或0
True
>>> all(['a', 'b', '', 'd'])   # 列表list，存在一个为空的元素
False
>>> all([0, 1，2, 3])          # 列表list，存在一个为0的元素
False

>>> all(('a', 'b', 'c', 'd'))  # 元组tuple，元素都不为空或0
True
>>> all(('a', 'b', '', 'd'))   # 元组tuple，存在一个为空的元素
False
>>> all((0, 1, 2, 3))          # 元组tuple，存在一个为0的元素
False

>>> all([])             # 空列表
True
>>> all(())             # 空元组
True
'''



'''
Python any() 函数
描述
any() 函数用于判断给定的可迭代参数 iterable 是否全部为 False，则返回 False，如果有一个为 True，则返回 True。

元素除了是 0、空、FALSE 外都算 TRUE。

函数等价于：

1
2
3
4
5
def any(iterable):
    for element in iterable:
        if element:
            return True
    return False
Python 2.5 以上版本可用。

语法
以下是 any() 方法的语法:

1
any(iterable)
参数
iterable -- 元组或列表。
返回值
如果都为空、0、false，则返回false，如果不都为空、0、false，则返回true。



>>>any(['a', 'b', 'c', 'd'])  # 列表list，元素都不为空或0
True

>>> any(['a', 'b', '', 'd'])   # 列表list，存在一个为空的元素
True

>>> any([0, '', False])        # 列表list,元素全为0,'',false
False

>>> any(('a', 'b', 'c', 'd'))  # 元组tuple，元素都不为空或0
True

>>> any(('a', 'b', '', 'd'))   # 元组tuple，存在一个为空的元素
True

>>> any((0, '', False))        # 元组tuple，元素全为0,'',false
False

>>> any([]) # 空列表
False

>>> any(()) # 空元组
False
'''