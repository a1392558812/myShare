换行 = '\n -----下一话题--------------------------------------------------------------------------------------------------------------------------------------- \n'

'''
list.append(x)	把一个元素添加到列表的结尾，相当于 a[len(a):] = [x]。
list.extend(L)	通过添加指定列表的所有元素来扩充列表，相当于 a[len(a):] = L。
list.insert(i, x)	在指定位置插入一个元素。第一个参数是准备插入到其前面的那个元素的索引，例如 a.insert(0, x) 会插入到整个列表之前，而 a.insert(len(a), x) 相当于 a.append(x) 。
list.remove(x)	删除列表中值为 x 的第一个元素。如果没有这样的元素，就会返回一个错误。
list.pop([i])	从列表的指定位置移除元素，并将其返回。如果没有指定索引，a.pop()返回最后一个元素。元素随即从列表中被移除。（方法中 i 两边的方括号表示这个参数是可选的，而不是要求你输入一对方括号，你会经常在 Python 库参考手册中遇到这样的标记。）
list.clear()	移除列表中的所有项，等于del a[:]。
list.index(x)	返回列表中第一个值为 x 的元素的索引。如果没有匹配的元素就会返回一个错误。
list.count(x)	返回 x 在列表中出现的次数。
list.sort()	对列表中的元素进行排序。
list.reverse()	倒排列表中的元素。
list.copy()	返回列表的浅复制，等于a[:]。
'''

a = [66.25, 333, 333, 1, 1234.5]
print(a.count(333), a.count(66.25), a.count('x'))
a.append(333)
print(a)

a.insert(2, -1)
a.append(333)
print(a)

print(a.index(333))

print(a)
a.remove(333)
print(a)
a.reverse()
print(a)
a.sort()
print(a)

print(换行)

'''
列表方法使得列表可以很方便的作为一个堆栈来使用，堆栈作为特定的数据结构，最先进入的元素最后一个被释放（后进先出）。
用 append() 方法可以把一个元素添加到堆栈顶。用不指定索引的 pop() 方法可以把一个元素从堆栈顶释放出来。

>>> stack = [3, 4, 5]
>>> stack.append(6)
>>> stack.append(7)
>>> stack
[3, 4, 5, 6, 7]
>>> stack.pop()
7
>>> stack
[3, 4, 5, 6]
>>> stack.pop()
6
>>> stack.pop()
5
>>> stack
[3, 4]
'''

'''
栈和队列不要混淆，栈结构是一端封口，特点是"先进后出"；而队列的两端全是开口，特点是"先进先出"。


一个队列长度为4,里面为【a,b,c,d】

--->e 进队列最左端，则最右端的d需要出队列，【a,b,c,d】
>>> 队列为【e,a,b,c】


'''


'''
列表推导式提供了从序列创建列表的简单途径。通常应用程序将一些操作应用于某个序列的每个元素，用其获得的结果作为生成新列表的元素，或者根据确定的判定条件创建子序列。
每个列表推导式都在 for 之后跟一个表达式，然后有零到多个 for 或 if 子句。
返回结果是一个根据表达从其后的 for 和 if 上下文环境中生成出来的列表。如果希望表达式推导出一个元组，就必须使用括号。
'''



vec = [2, 4, 6]
print([3*x for x in vec])
print( [[x, x**2] for x in vec])
freshfruit = ['  banana', '  loganberry ', 'passion fruit  ']

def stripItem(weapon):
    str = weapon.strip()
    print(str, end = ' ')
    return str

list = [stripItem(weapon) for weapon in freshfruit]

print('\n', freshfruit)

print(换行)

vec1 = [2, 4, 6]
vec2 = [4, 3, -9]
print([x*y for x in vec1 for y in vec2])
print([x+y for x in vec1 for y in vec2])
print([vec1[i]*vec2[i] for i in range(len(vec1))])
print([str(round(355/113, i)) for i in range(1, 6)])

print(换行)

# 将3X4的矩阵列表转换为4X3列表

matrix = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
]

print([[row[i] for row in matrix] for i in range(4)])

print(换行)

'''
使用 del 语句可以从一个列表中根据索引来删除一个元素，而不是值来删除元素。这与使用 pop() 返回一个值不同。
可以用 del 语句从列表中删除一个切割，或清空整个列表（我们以前介绍的方法是给该切割赋一个空列表）。

>>> a = [-1, 1, 66.25, 333, 333, 1234.5]
>>> del a[0]
>>> a
[1, 66.25, 333, 333, 1234.5]
>>> del a[2:4]
>>> a
[1, 66.25, 1234.5]
>>> del a[:]
>>> a
[]
'''

'''
集合是一个无序不重复元素的集。基本功能包括关系测试和消除重复元素。

可以用大括号({})创建集合。注意：如果要创建一个空集合，你必须用 set() 而不是 {} ；后者创建一个空的字典，下一节我们会介绍这个数据结构。

>>> basket = {'apple', 'orange', 'apple', 'pear', 'orange', 'banana'}
>>> print(basket)                      # 删除重复的
{'orange', 'banana', 'pear', 'apple'}
>>> 'orange' in basket                 # 检测成员
True
>>> 'crabgrass' in basket
False

>>> # 以下演示了两个集合的操作
...
>>> a = set('abracadabra')
>>> b = set('alacazam')
>>> a                                  # a 中唯一的字母
{'a', 'r', 'b', 'c', 'd'}
>>> a - b                              # 在 a 中的字母，但不在 b 中
{'r', 'd', 'b'}
>>> a | b                              # 在 a 或 b 中的字母
{'a', 'c', 'r', 'd', 'b', 'm', 'z', 'l'}
>>> a & b                              # 在 a 和 b 中都有的字母
{'a', 'c'}
>>> a ^ b                              # 在 a 或 b 中的字母，但不同时在 a 和 b 中
{'r', 'd', 'b', 'm', 'z', 'l'}
'''

'''
序列是以连续的整数为索引，与此不同的是，字典以关键字为索引，关键字可以是任意不可变类型，通常用字符串或数值。

理解字典的最佳方式是把它看做无序的键=>值对集合。在同一个字典之内，关键字必须是互不相同。

一对大括号创建一个空的字典：{}。

>>> tel = {'jack': 4098, 'sape': 4139}
>>> tel['guido'] = 4127
>>> tel
{'sape': 4139, 'guido': 4127, 'jack': 4098}
>>> tel['jack']
4098
>>> del tel['sape']
>>> tel['irv'] = 4127
>>> tel
{'guido': 4127, 'irv': 4127, 'jack': 4098}
>>> list(tel.keys())
['irv', 'guido', 'jack']
>>> sorted(tel.keys())
['guido', 'irv', 'jack']
>>> 'guido' in tel
True
>>> 'jack' not in tel
False
'''

print(dict([('sape', 4139), ('guido', 4127), ('jack', 4098)])) # 列表腿短
print(dict((('sape', 4139), ('guido', 4127), ('jack', 4098)))) # 元组推断

print(换行)

'''
在字典中遍历时，关键字和对应的值可以使用 items() 方法同时解读出来：
'''

knights = {'name': '法外张三', 'age': '24岁'}
for k, v in knights.items():
    print('键值，value值为：',k, v)

print(换行)

'''
在序列中遍历时，索引位置和对应值可以使用 enumerate() 函数同时得到
'''

for i, v in enumerate(['tic', 'tac', 'toe']):
  print('index值，value值为：', i, v)

print(换行)



# fotmat作为Python的的格式字符串函数，主要通过字符串中的花括号{}，来识别替换字段，从而完成字符串的格式化。
print("名字{},家住{}".format("橙留香","水果村"))
print("名字{0},家住{1},花括号所传的字符串为：{0},{1}".format("橙留香","水果村"))
# 用关键字传递
print("我今年{age}岁,我在读{college}".format(age = 18, college = "大学"))
# 关键字和数字的混合使用
'''
数字和关键字段可以混合使用传递参数
关键字参数必须位于位置参数之后。
混合使用时，可以省略数字
省略字段名{}不能和数字形式的字段名同时使用
'''
print("我是要当{0},他是要当{1}，这个世界只有一个{truth}".format("海贼王","火影",truth="真理"))
print("我是要当{},他是要当{}，这个世界只有一个{truth}".format("海贼王","火影",truth="真理"))
'''
关键字指定不可被简写
print("我是要当{0},他是要当{1}，这个世界只有一个{2}".format("海贼王","火影",truth="真理"))
会报错
'''

# 使用元组和字典传参
'''
format可以使用元组和字典传参，俩者可以混合使用
多种混合使用的时候。位置参数要在关键字参数前面，元组要在字典前面

a=["鸣人","火影"，"雏田"]
print("我是{},我是要当{}的男人".format(*a))
"""
我是鸣人，我是要当火影的男人
"""
print("我是{1},我是要当{2}的男人".format(*a))

#使用字典传参
v={"name":"孙悟空","skill":"龟派气功"}
print("我是{name}，我的绝招是{skill}".format(**v))
"""
我是孙悟空，我的绝招是龟派气功
"""
#同时使用元组和字典传参
name=["卡卡罗特","界王拳"]
names={"nickname":"孙君","skill":"元气弹"}
print("我是{0},我的绝招是{skill}".format(*name,**names))
print("我是{nickname},我的绝招是{1}".format(*name,**names))

#同时使用位置参数，元组，关键字参数，字典传参。
#注意位置参数要在关键数参数前面
a=["卡卡罗特"]
dic={"name":"超级赛亚人"}
print("我是{0}，我也是{0},因为我是正义的战士，所以我变成了{name}".
format("卡卡罗特"，*a,**dic))
"""
我是卡卡罗特，是孙悟空，但不可改变的是我是正义的战士。
"""

复合字段名的使用
format使用数字和变量名俩种形式，这就是复合字段
复合字段名支持两种操作符
[] 方括号
. 点号


class Person:
	def __int__(self,name,addr):
		self.name=name
		self.addr=addr
p=Person("孙悟空","包子山")
#点号用法。传递位置参数。
print("我是{0.name},家在{0.addr}".format(p))
#当只有一个字段的时候，就可以省略数字
print("我是{.name}}".format(p))
#试一下传递文件对象的属性
f=open("out.txt","w")
print("文件名为:"{.name}.format(f))


#传递关键字
print("我是{p.name},家在{p.addr}".format(p=p))
print("我是{girl.name},家在{girl.addr}".format(girl=p))
"""
我是孙悟空，家在包子山。
我是孙悟空，家在包子山。
"""

#方括号的用法
mylist=["陈道明","www.chendaoming.cc"]
print("网站名:{0[0]},地址{0[1]}".format(mylist))

详情更细解释
https://blog.csdn.net/weixin_37988176/article/details/109376909
https://blog.csdn.net/qq_45726327/article/details/115042863
'''

print(换行)


questions = ['name', 'quest', 'favorite color']
answers = ['lancelot', 'the holy grail', 'blue']

for q, a in zip(questions, answers):
    
    print('What is your {0}?  It is {1}.'.format(q, a))